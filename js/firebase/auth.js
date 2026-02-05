// IMPORTANTE: Ruta ./config.js porque están en la misma carpeta
import { app } from './config.js'; 
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Tu lista blanca de seguridad
const ALLOWED_EMAILS = [
    'rob.dor.80@gmail.com',
    'fati.diez.82@gmail.com'
];

export const AuthService = {
    /**
     * Iniciar sesión con validación de email
     */
    async login() {
        try {
            console.log("Intentando login con Google...");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Verificamos si el email está en la lista permitida
            if (!ALLOWED_EMAILS.includes(user.email)) {
                alert("⛔ Acceso denegado: Tu email no está autorizado.");
                await signOut(auth); 
                return null;
            }

            console.log("Usuario autorizado:", user.email);
            // El AuthGuard detectará el cambio automáticamente, no hace falta reload
            return user;

        } catch (error) {
            console.error("Error en la autenticación:", error);
            alert("Error al conectar con Google. Mira la consola (F12).");
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            await signOut(auth);
            window.location.reload(); 
        } catch (error) {
            console.error("Error al salir:", error);
        }
    }
};