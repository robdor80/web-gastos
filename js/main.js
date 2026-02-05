import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
import { InitialBalances } from './config/initialBalances.js';

/**
 * 1. DEFINIMOS LA FUNCIÓN PRIMERO
 * Para evitar el error "is not defined", la creamos antes de usarla.
 */
const mostrarSaldosActuales = (movements = []) => {
    console.log("Actualizando saldos..."); // Log para verificar que funciona
    const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
    
    let sBBVA = parseFloat(InitialBalances.bbva || 0);
    let sING = parseFloat(InitialBalances.ing || 0);
    let sPension = parseFloat(InitialBalances.pension || 0);

    if (movements && movements.length > 0) {
        movements.forEach(m => {
            const cant = parseFloat(m.amount);
            if (m.type === 'expense') {
                if (m.account === 'bbva') sBBVA -= cant; else sING -= cant;
                if (m.category === "Plan de Pensiones") sPension += cant;
            } else if (m.type === 'income' || m.type === 'salary') {
                if (m.account === 'bbva') sBBVA += cant; else sING += cant;
            }
        });
    }

    // Actualización segura del DOM (verifica si existen los elementos antes de escribir)
    const elBBVA = document.getElementById('saldo-bbva');
    if (elBBVA) elBBVA.innerText = f.format(sBBVA);
    
    const elING = document.getElementById('saldo-ing');
    if (elING) elING.innerText = f.format(sING);
    
    const elPen = document.getElementById('saldo-pension');
    if (elPen) elPen.innerText = f.format(sPension);
};

/**
 * 2. ESPERAMOS A QUE EL DOM ESTÉ LISTO
 * Esto soluciona el error "Cannot set properties of null"
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando eventos...");

    // Asignación del Login con verificación
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.onclick = () => {
            console.log("Click en Login detectado");
            AuthService.login();
        };
    } else {
        console.error("Error crítico: No se encuentra el botón con ID 'btn-login'");
    }

    // Asignación del Logout (PC)
    const btnLogoutPc = document.getElementById('pc-logout');
    if (btnLogoutPc) {
        btnLogoutPc.onclick = () => AuthService.logout();
    }

    // Asignación del Logout (Móvil)
    const btnLogoutMob = document.getElementById('mob-logout');
    if (btnLogoutMob) {
        btnLogoutMob.onclick = () => AuthService.logout();
    }

    // 3. INICIAR SEGURIDAD
    // Ahora 'mostrarSaldosActuales' ya existe, así que no dará error
    try {
        AuthGuard.verifyAccess(mostrarSaldosActuales);
    } catch (error) {
        console.error("Error al verificar acceso:", error);
    }
});