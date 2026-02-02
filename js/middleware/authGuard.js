/**
 * AuthGuard - Seguridad Nivel 3 con Bloqueo por Inactividad
 * Tras 3 minutos, devuelve al usuario a la pantalla del PIN.
 */
import { AuthService } from '../firebase/auth.js';
import { PinPad } from '../components/pinPad.js';
import { DbService } from '../firebase/db.js';
import { HistoryView } from '../components/historyView.js';

export const AuthGuard = {
    timer: null,
    inactivityLimit: 180000, // 3 minutos en milisegundos

    /**
     * Inicia la vigilancia de la sesión de Google.
     * @param {Function} onSuccessCallback - Función (mostrarSaldosActuales) a ejecutar tras el PIN.
     */
    verifyAccess(onSuccessCallback) {
        AuthService.initAuthObserver((user) => {
            const loginSection = document.getElementById('login-section');
            const pinSection = document.getElementById('pin-section');
            const appSection = document.getElementById('app-section');

            if (user) {
                // Usuario autenticado en Google
                loginSection.classList.add('hidden');
                this.showPinScreen(onSuccessCallback); // Pasamos el callback al flujo del PIN
            } else {
                // Sin sesión de Google: Limpiamos todo y mostramos login
                loginSection.classList.remove('hidden');
                pinSection.classList.add('hidden');
                appSection.classList.add('hidden');
                this.stopInactivityTimer();
            }
        });
    },

    /**
     * Muestra la pantalla del PIN y bloquea la App.
     */
    showPinScreen(onSuccessCallback) {
        const pinSection = document.getElementById('pin-section');
        const appSection = document.getElementById('app-section');

        // Bloqueamos vista de la app y mostramos PIN
        pinSection.classList.remove('hidden');
        appSection.classList.add('hidden');

        // Inicializamos el teclado numérico
        PinPad.init(() => {
            // --- ESTO SE EJECUTA CUANDO EL PIN ES CORRECTO ---
            
            // 1. Cambiamos visibilidad de las secciones
            pinSection.classList.add('hidden');
            appSection.classList.remove('hidden');
            
            // 2. Cargamos los datos de Firebase AHORA que la UI está lista
            // Esto arregla el fallo de saldos a 0 y mes vacío en el inicio
            DbService.subscribeToBalances((movements) => {
                if (onSuccessCallback && typeof onSuccessCallback === 'function') {
                    onSuccessCallback(movements);
                }
                
                // Si el usuario tiene abierto el historial, lo refrescamos también
                const historyContainer = document.getElementById('history-list-container');
                if (historyContainer) {
                    HistoryView.filterAndShow(movements);
                }
            });

            // 3. Iniciamos el contador de inactividad
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
            // Cada vez que el usuario interactúa, reiniciamos el temporizador
            document.addEventListener(name, () => this.resetTimer(), true);
        });
    },

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            console.log("Inactividad detectada: Bloqueando con PIN");
            // Al bloquear por inactividad, no necesitamos pasar el callback de nuevo
            // porque la suscripción de Firebase ya está activa (onSnapshot).
            this.showPinScreen(); 
        }, this.inactivityLimit);
    },

    stopInactivityTimer() {
        if (this.timer) clearTimeout(this.timer);
    }
};