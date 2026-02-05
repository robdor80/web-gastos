import { AuthService } from '../firebase/auth.js';
import { PinPad } from '../components/pinPad.js';
import { DbService } from '../firebase/db.js';
import { HistoryView } from '../components/historyView.js';

export const AuthGuard = {
    timer: null,
    inactivityLimit: 180000, // 3 minutos

    verifyAccess(onSuccessCallback) {
        // Ahora sí existe esta función en auth.js
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const transitionSection = document.getElementById('transition-section');
            const appSection = document.getElementById('app-section');

            if (user) {
                // 1. Usuario detectado: Ocultar login
                loginSection.classList.add('hidden');
                
                // 2. Mostrar transición
                transitionSection.classList.remove('hidden');
                
                // 3. Esperar un poco y pedir PIN
                setTimeout(() => {
                    transitionSection.classList.add('hidden');
                    this.showPinScreen(onSuccessCallback);
                }, 1500); 

            } else {
                // No hay usuario: Mostrar login
                loginSection.classList.remove('hidden');
                document.getElementById('pin-section').classList.add('hidden');
                appSection.classList.add('hidden');
                transitionSection.classList.add('hidden');
                this.stopInactivityTimer();
            }
        });
    },

    showPinScreen(onSuccessCallback) {
        const pinSection = document.getElementById('pin-section');
        const appSection = document.getElementById('app-section');

        pinSection.classList.remove('hidden');
        appSection.classList.add('hidden');

        PinPad.init(() => {
            // PIN Correcto
            pinSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            // CORRECCIÓN AQUÍ: Usamos getMovements que es lo que tiene tu db.js
            DbService.getMovements((movements) => {
                if (onSuccessCallback) onSuccessCallback(movements);
                
                // Actualizar historial si existe el contenedor
                /* Si tienes el componente HistoryView listo, descomenta esto:
                if (typeof HistoryView !== 'undefined' && HistoryView.filterAndShow) {
                     HistoryView.filterAndShow(movements);
                } */
            });

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
        events.forEach(name => document.addEventListener(name, () => this.resetTimer(), true));
    },

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            console.log("Tiempo de inactividad excedido, bloqueando...");
            window.location.reload(); // Recarga para pedir PIN o Login de nuevo
        }, this.inactivityLimit);
    },

    stopInactivityTimer() {
        if (this.timer) clearTimeout(this.timer);
    }
};