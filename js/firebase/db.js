import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from './config.js'; // Importamos la app inicializada

const db = getFirestore(app);
const auth = getAuth(app);

export const DbService = {
    
    /**
     * Guarda movimientos (Gastos, Ingresos, Alertas/Pending)
     */
    addMovement: async (movementData) => {
        const user = auth.currentUser;
        if (!user) {
            alert("Error: No estás logueado en Firebase.");
            throw new Error("Usuario no autenticado");
        }

        try {
            const docRef = await addDoc(collection(db, "movements"), {
                ...movementData,
                uid: user.uid,
                createdAt: new Date().toISOString()
            });
            console.log("Guardado con ID:", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error guardando:", e);
            throw e;
        }
    },

    /**
     * Borra un movimiento
     */
    deleteMovement: async (id) => {
        try {
            await deleteDoc(doc(db, "movements", id));
            console.log("Borrado:", id);
        } catch (e) {
            console.error("Error borrando:", e);
            throw e;
        }
    },

    /**
     * Escucha los movimientos del usuario
     */
    getMovements: (callback) => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "movements"), 
            where("uid", "==", user.uid),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const movements = [];
            snapshot.forEach((doc) => {
                movements.push({ id: doc.id, ...doc.data() });
            });
            callback(movements);
        });

        return unsubscribe;
    }
};