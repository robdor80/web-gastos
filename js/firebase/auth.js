import { app } from './config.js'; 
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    onAuthStateChanged // <--- IMPORTANTE: Faltaba esto
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const ALLOWED_EMAILS = [
    'rob.dor.80@gmail.com',
    'fati.diez.82@gmail.com'
];

export const AuthService = {
    /**
     * Iniciar sesión (Acción del botón)
     */
    async login() {
        try {
            console.log("Abriendo popup de Google...");
            await signInWithPopup(auth, provider);
            // No necesitamos hacer nada más aquí, el "Observer" de abajo se encargará del resto
        } catch (error) {
            console.error("Error Auth:", error);
            alert("Error al conectar con Google.");
        }
    },

    /**
     * ESCUCHADOR DE ESTADO (ESTO ES LO QUE FALTABA)
     * Esta función avisa a la app cuando el usuario entra o sale.
     */
    initAuthObserver(callback) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Si hay usuario, comprobamos si está autorizado
                if (ALLOWED_EMAILS.includes(user.email)) {
                    console.log("Usuario detectado y autorizado:", user.email);
                    callback(user); // Avisamos al AuthGuard: "¡Adelante!"
                } else {
                    console.warn("Usuario no autorizado intentó entrar:", user.email);
                    alert("⛔ Tu email no tiene permiso para acceder.");
                    signOut(auth); // Lo echamos fuera
                    callback(null);
                }
            } else {
                console.log("No hay usuario logueado.");
                callback(null); // Avisamos al AuthGuard: "Nadie en casa"
            }
        });
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        await signOut(auth);
        window.location.reload();
    }
};