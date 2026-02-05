import { getFirestore, collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

export const DbService = {
    
    /**
     * Guarda cualquier tipo de movimiento (gasto, ingreso, nómina o alerta/pending)
     */
    addMovement: async (movementData) => {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado");

        try {
            // Añadimos el UID del usuario y la fecha de creación del registro
            const docRef = await addDoc(collection(db, "movements"), {
                ...movementData,
                uid: user.uid,
                createdAt: new Date().toISOString()
            });
            console.log("Movimiento guardado con ID: ", docRef.id);
            return docRef.id;
        } catch (e) {
            console.error("Error añadiendo documento: ", e);
            throw e;
        }
    },

    /**
     * Borra un movimiento por su ID
     */
    deleteMovement: async (id) => {
        try {
            await deleteDoc(doc(db, "movements", id));
            console.log("Documento borrado:", id);
        } catch (e) {
            console.error("Error borrando documento: ", e);
            throw e;
        }
    },

    /**
     * Escucha los movimientos en tiempo real para un mes/año específico
     * (O trae todos si no filtramos por fecha, aquí traemos todos los del usuario)
     */
    getMovements: (callback) => {
        const user = auth.currentUser;
        if (!user) return;

        // Consulta: movimientos del usuario ordenados por fecha
        const q = query(
            collection(db, "movements"), 
            where("uid", "==", user.uid),
            orderBy("date", "desc") // Ordenamos por la fecha del movimiento
        );

        // Escuchador en tiempo real (Snapshot)
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const movements = [];
            querySnapshot.forEach((doc) => {
                movements.push({ id: doc.id, ...doc.data() });
            });
            // Devolvemos los datos al callback (que es quien actualiza la pantalla)
            callback(movements);
        });

        return unsubscribe;
    }
};