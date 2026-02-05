import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
import { InitialBalances } from './config/initialBalances.js';
import { ExpenseForm } from './components/expenseForm.js';
import { IncomeForm } from './components/incomeForm.js';
import { HistoryView } from './components/historyView.js';

// Variable para guardar los movimientos y no tener que recargarlos al ver el historial
let cacheMovements = [];

/**
 * 1. FUNCIÓN PARA ACTUALIZAR SALDOS
 */
const mostrarSaldosActuales = (movements = []) => {
    // Guardamos los datos en caché para usarlos en el Historial
    cacheMovements = movements;

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
            } else if (m.type === 'transfer') { // Por si implementas transferencias
                if (m.account === 'bbva') { sBBVA -= cant; sING += cant; }
                else { sING -= cant; sBBVA += cant; }
            }
        });
    }

    // Actualizar DOM de forma segura
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    updateText('saldo-bbva', f.format(sBBVA));
    updateText('saldo-ing', f.format(sING));
    updateText('saldo-pension', f.format(sPension));
    
    // Actualizar también el periodo si hay nóminas
    const nominas = movements.filter(m => m.type === 'salary');
    if (nominas.length > 0) {
        updateText('current-period-display', nominas[nominas.length - 1].note || "Periodo Activo");
    }
};

/**
 * 2. INICIALIZACIÓN Y EVENTOS
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Inicializando aplicación...");

    // Función auxiliar para asignar clicks sin errores
    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    // --- LOGIN / LOGOUT ---
    bindClick('btn-login', () => AuthService.login());
    bindClick('pc-logout', () => AuthService.logout());
    bindClick('mob-logout', () => AuthService.logout());

    // --- MENÚ LATERAL (Móvil) ---
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = () => sideMenu?.classList.add('hidden');
    
    bindClick('menu-open', () => sideMenu?.classList.remove('hidden'));
    bindClick('menu-close', closeMenu);

    // --- BOTONES PRINCIPALES (PC) ---
    bindClick('pc-add-expense', () => ExpenseForm.render());
    bindClick('pc-add-income', () => IncomeForm.render(false));
    bindClick('pc-add-salary', () => IncomeForm.render(true));
    bindClick('pc-history', () => HistoryView.render(cacheMovements));

    // --- BOTONES PRINCIPALES (Móvil - cierran el menú al clicar) ---
    bindClick('mob-add-expense', () => { ExpenseForm.render(); closeMenu(); });
    bindClick('mob-add-income', () => { IncomeForm.render(false); closeMenu(); });
    bindClick('mob-add-salary', () => { IncomeForm.render(true); closeMenu(); });
    bindClick('mob-history', () => { HistoryView.render(cacheMovements); closeMenu(); });

    // --- INICIO DE SEGURIDAD ---
    try {
        AuthGuard.verifyAccess(mostrarSaldosActuales);
    } catch (error) {
        console.error("Error crítico en inicio:", error);
    }
});