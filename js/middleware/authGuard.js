import { AuthService } from '../firebase/auth.js';
import { PinPad } from '../components/pinPad.js';
import { DbService } from '../firebase/db.js';
import { HistoryView } from '../components/historyView.js';

export const AuthGuard = {
    timer: null,
    inactivityLimit: 180000,

    verifyAccess(onSuccessCallback) {
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const transitionSection = document.getElementById('transition-section');
            const appSection = document.getElementById('app-section');

            if (user) {
                // 1. Ocultar login
                loginSection.classList.add('hidden');
                
                // 2. Mostrar transición (Verificando seguridad)
                transitionSection.classList.remove('hidden');
                
                // 3. Pequeño delay para UX profesional según Roadmap
                setTimeout(() => {
                    transitionSection.classList.add('hidden');
                    this.showPinScreen(onSuccessCallback);
                }, 1500); 

            } else {
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
            pinSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            DbService.subscribeToBalances((movements) => {
                if (onSuccessCallback) onSuccessCallback(movements);
                const historyContainer = document.getElementById('history-list-container');
                if (historyContainer) HistoryView.filterAndShow(movements);
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
        this.timer = setTimeout(() => this.showPinScreen(), this.inactivityLimit);
    },

    stopInactivityTimer() {
        if (this.timer) clearTimeout(this.timer);
    }
};