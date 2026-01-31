/**
 * AuthGuard - Seguridad Nivel 3
 * Protege las rutas y decide qué mostrar según el estado de autenticación.
 */
import { AuthService } from '../firebase/auth.js';

export const AuthGuard = {
    verifyAccess() {
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const mainAppSection = document.getElementById('app-section');

            if (user) {
                // Usuario autenticado y en lista blanca
                console.log("Acceso concedido a:", user.email);
                
                // Ocultamos login y mostramos la App (o la pantalla de PIN)
                if (loginSection) loginSection.classList.add('hidden');
                if (mainAppSection) mainAppSection.classList.remove('hidden');
                
                // AQUÍ LANZAREMOS EL BLOQUEO POR PIN EN EL SIGUIENTE PASO
            } else {
                // No hay usuario o no está autorizado
                console.warn("Acceso restringido. Redirigiendo a login...");
                
                if (loginSection) loginSection.classList.remove('hidden');
                if (mainAppSection) mainAppSection.classList.add('hidden');
            }
        });
    }
};