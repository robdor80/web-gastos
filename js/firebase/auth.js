import { 
    getAuth, 
    signInWithRedirect, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signOut,
    getRedirectResult 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const AuthService = {
    // Cambiamos a Redirect para máxima compatibilidad (Brave, Safari, Chrome móvil)
    login() {
        signInWithRedirect(auth, provider);
    },

    logout() {
        signOut(auth).then(() => {
            window.location.reload();
        });
    },

    initAuthObserver(callback) {
        // Primero verificamos si venimos de un redireccionamiento exitoso
        getRedirectResult(auth)
            .then(() => {
                onAuthStateChanged(auth, (user) => {
                    callback(user);
                });
            })
            .catch((error) => {
                console.error("Error en el redirect de Google:", error);
                // Si falla, intentamos el observador normal por si ya hay sesión
                onAuthStateChanged(auth, (user) => callback(user));
            });
    }
};