import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from './config.js'; 

const db = getFirestore(app);
const auth = getAuth(app);

export const DbService = {
    
    // Guardar
    addMovement: async (movementData) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No user");

        try {
            const docRef = await addDoc(collection(db, "movements"), {
                ...movementData,
                uid: user.uid,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    // Borrar
    deleteMovement: async (id) => {
        try {
            await deleteDoc(doc(db, "movements", id));
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    // Obtener datos (CORREGIDO)
    getMovements: (callback) => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. Pedimos los datos SIN ordenar para evitar error de índice
        const q = query(
            collection(db, "movements"), 
            where("uid", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const movements = [];
            snapshot.forEach((doc) => {
                movements.push({ id: doc.id, ...doc.data() });
            });

            // 2. Ordenamos aquí en JavaScript (más robusto)
            // Orden descendente (más nuevo primero)
            movements.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0);
                const dateB = new Date(b.date || b.createdAt || 0);
                return dateB - dateA;
            });

            callback(movements);
        });

        return unsubscribe;
    }
};