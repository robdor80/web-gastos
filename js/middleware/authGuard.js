/**
 * AuthGuard - Seguridad Nivel 3
 * Este archivo controla el flujo: Login Google -> Teclado PIN -> Dashboard
 */
import { AuthService } from '../firebase/auth.js';
import { PinPad } from '../components/pinPad.js';

export const AuthGuard = {
    verifyAccess() {
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const pinSection = document.getElementById('pin-section');
            const appSection = document.getElementById('app-section');

            if (user) {
                // 1. Google nos ha dado el OK.
                // Ocultamos Login y mostramos el PIN (la App sigue oculta)
                loginSection.classList.add('hidden');
                pinSection.classList.remove('hidden');
                appSection.classList.add('hidden');

                // 2. Activamos el teclado PIN
                // Le decimos que, si el PIN es correcto, ejecute lo que hay dentro
                PinPad.init(() => {
                    // 3. PIN Correcto. Mostramos la App y ocultamos el teclado
                    pinSection.classList.add('hidden');
                    appSection.classList.remove('hidden');
                    console.log("Acceso total concedido tras PIN");
                });
                
            } else {
                // Si no hay usuario logueado en Google, todos a la pantalla de Login
                loginSection.classList.remove('hidden');
                pinSection.classList.add('hidden');
                appSection.classList.add('hidden');
            }
        });
    }
};