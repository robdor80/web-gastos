import { firebaseConfig } from './config.js';
// Importamos solo lo necesario de la versión oficial de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Inicializamos la conexión
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// LISTA BLANCA ESTRICTA - Nivel 3
const ALLOWED_EMAILS = [
    'rob.dor.80@gmail.com',
    'fati.diez.82@gmail.com'
];

export const AuthService = {
    // Función para invocar el login de Google
    async login() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (!ALLOWED_EMAILS.includes(user.email)) {
                alert("Acceso denegado: Usuario no autorizado.");
                await signOut(auth);
                return null;
            }
            return user;
        } catch (error) {
            console.error("Error en la autenticación:", error);
            throw error;
        }
    },

    // Observador que vigila si la sesión está activa
    initAuthObserver(callback) {
        onAuthStateChanged(auth, (user) => {
            if (user && ALLOWED_EMAILS.includes(user.email)) {
                callback(user);
            } else {
                callback(null);
            }
        });
    },

    async logout() {
        await signOut(auth);
        window.location.reload();
    }
};