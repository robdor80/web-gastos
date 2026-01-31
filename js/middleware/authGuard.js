/**
 * AuthGuard - Seguridad Nivel 3 con Bloqueo por Inactividad
 * Tras 3 minutos, devuelve al usuario a la pantalla del PIN.
 */
import { AuthService } from '../firebase/auth.js';
import { PinPad } from '../components/pinPad.js';

export const AuthGuard = {
    timer: null,
    inactivityLimit: 180000, // 3 minutos en milisegundos

    verifyAccess() {
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const pinSection = document.getElementById('pin-section');
            const appSection = document.getElementById('app-section');

            if (user) {
                // Usuario autenticado en Google
                loginSection.classList.add('hidden');
                this.showPinScreen(); // Lanzamos el flujo del PIN
            } else {
                // Sin sesión de Google
                loginSection.classList.remove('hidden');
                pinSection.classList.add('hidden');
                appSection.classList.add('hidden');
                this.stopInactivityTimer();
            }
        });
    },

    showPinScreen() {
        const pinSection = document.getElementById('pin-section');
        const appSection = document.getElementById('app-section');

        pinSection.classList.remove('hidden');
        appSection.classList.add('hidden');

        // Iniciamos el teclado
        PinPad.init(() => {
            // PIN Correcto
            pinSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            // Empezamos a vigilar la inactividad
            this.startInactivityTimer();
        });
    },

    startInactivityTimer() {
        this.stopInactivityTimer();
        this.setupListeners();
        this.resetTimer();
    },

    setupListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(name => {
            // Cada vez que el usuario hace algo, el tiempo vuelve a empezar
            document.addEventListener(name, () => this.resetTimer(), true);
        });
    },

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            console.log("Inactividad detectada: Bloqueando con PIN");
            this.showPinScreen(); // Volver al PIN
        }, this.inactivityLimit);
    },

    stopInactivityTimer() {
        if (this.timer) clearTimeout(this.timer);
    }
};