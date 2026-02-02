import { 
    getAuth, 
    signInWithPopup, 
    signInWithRedirect, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    getRedirectResult 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configuración para Brave y navegadores con bloqueos
provider.setCustomParameters({ prompt: 'select_account' });

export const AuthService = {
    async login() {
        try {
            // Intentamos primero Popup (es mejor UX para Chrome/Desktop)
            await signInWithPopup(auth, provider);
        } catch (error) {
            // Si el navegador bloquea el popup (como Brave o móviles), usamos Redirect
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                console.log("Popup bloqueado, redirigiendo...");
                signInWithRedirect(auth, provider);
            } else {
                console.error("Error en login:", error);
            }
        }
    },

    logout() {
        signOut(auth).then(() => {
            window.location.reload();
        });
    },

    initAuthObserver(callback) {
        // 1. Escuchar el resultado de un posible redirect previo (Caso Brave)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    callback(result.user);
                }
            })
            .catch((error) => console.error("Error en resultado de redirección:", error));

        // 2. Escuchar cambios de estado normales (Caso Chrome / Sesión persistente)
        onAuthStateChanged(auth, (user) => {
            callback(user);
        });
    }
};