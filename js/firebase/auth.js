import { app } from './config.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const ALLOWED_EMAILS = [
    'rob.dor.80@gmail.com',
    'fati.diez.82@gmail.com'
];

export const AuthService = {
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