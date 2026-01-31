/**
 * DB Service - Conexión con Firebase Firestore
 * Aquí se graban y leen los movimientos reales.
 */
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from './config.js';

const db = getFirestore(app);

export const DbService = {
    // 1. Guardar un movimiento (Gasto, Ingreso o Traspaso)
    async saveMovement(data) {
        try {
            const docRef = await addDoc(collection(db, "movements"), {
                ...data,
                amount: parseFloat(data.amount),
                timestamp: serverTimestamp()
            });
            console.log("Movimiento guardado con ID: ", docRef.id);
            return true;
        } catch (e) {
            console.error("Error al guardar: ", e);
            return false;
        }
    },

    // 2. Escuchar cambios en tiempo real para actualizar el Dashboard
    subscribeToBalances(callback) {
        const q = query(collection(db, "movements"), orderBy("timestamp", "asc"));
        
        // Esta función se ejecuta CADA VEZ que alguien añade un gasto
        return onSnapshot(q, (snapshot) => {
            const movements = [];
            snapshot.forEach((doc) => {
                movements.push(doc.data());
            });
            callback(movements);
        });
    }
};