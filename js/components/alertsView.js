import { DbService } from '../firebase/db.js';

export const AlertsView = {
    render(movements = []) {
        // Filtramos solo las alertas (tipo 'pending')
        const pendingItems = movements.filter(m => m.type === 'pending');
        const container = document.getElementById('dynamic-content');

        const html = `
            <div style="max-width: 600px; margin: 0 auto; color: white;">
                <h2 style="text-align: center; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    ⚠️ Alertas y Pendientes
                </h2>

                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; backdrop-filter: blur(10px); margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.2);">
                    <h3 style="margin-bottom: 15px; color: #ffd700;">Nueva Alerta</h3>
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <input type="number" id="alert-amount" placeholder="Cantidad (€)" step="0.01" 
                            style="padding: 12px; border-radius: 8px; border: none; font-size: 1rem;">
                        <input type="text" id="alert-note" placeholder="Nota (ej: Cargo desconocido tarjeta...)" 
                            style="padding: 12px; border-radius: 8px; border: none; font-size: 1rem;">
                        <button id="btn-save-alert" 
                            style="padding: 12px; background: #ffd700; color: #333; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 1rem;">
                            Guardar Recordatorio
                        </button>
                    </div>
                </div>

                <h3 style="margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px;">
                    Pendientes de revisar (${pendingItems.length})
                </h3>
                
                <div id="alerts-list">
                    ${pendingItems.length === 0 
                        ? '<p style="text-align:center; opacity: 0.7; font-style: italic;">¡Genial! No tienes nada pendiente.</p>' 
                        : pendingItems.map(item => `
                            <div style="background: rgba(0, 0, 0, 0.2); border-left: 4px solid #ffd700; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 1.2rem; font-weight: bold; color: #ffd700;">${parseFloat(item.amount).toFixed(2)} €</div>
                                    <div style="font-size: 1rem; color: white;">${item.note || 'Sin nota'}</div>
                                    <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 4px;">📅 ${new Date(item.date).toLocaleDateString()}</div>
                                </div>
                                <button class="btn-delete-alert" data-id="${item.id}" 
                                    style="background: rgba(255, 77, 77, 0.2); border: 1px solid #ff4d4d; color: white; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    🗑️ Borrar
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;

        container.innerHTML = html;

        // LÓGICA: GUARDAR EN FIREBASE
        document.getElementById('btn-save-alert').onclick = async () => {
            const amount = document.getElementById('alert-amount').value;
            const note = document.getElementById('alert-note').value;

            if (!amount) {
                alert("Por favor, indica al menos la cantidad.");
                return;
            }

            // Creamos el objeto con tipo 'pending'
            const newAlert = {
                type: 'pending', 
                amount: amount,
                note: note,
                date: new Date().toISOString(),
                account: 'none', // No vinculamos cuenta para no afectar saldos
                category: 'Alerta'
            };

            try {
                await DbService.addMovement(newAlert);
                alert("✅ Alerta guardada.");
                // No recargamos toda la página, solo pedimos al main que actualice si es necesario,
                // pero por simplicidad haremos un reload para ver los cambios al instante.
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert("Error al guardar.");
            }
        };

        // LÓGICA: BORRAR DE FIREBASE
        document.querySelectorAll('.btn-delete-alert').forEach(btn => {
            btn.onclick = async (e) => {
                // Confirmación para asegurar
                if(confirm("¿Seguro que quieres borrar esta alerta? (Hazlo solo si ya has apuntado el gasto real)")) {
                    const id = e.target.dataset.id;
                    try {
                        await DbService.deleteMovement(id);
                        window.location.reload(); // Recarga para actualizar lista
                    } catch (error) {
                        console.error(error);
                        alert("Error al borrar.");
                    }
                }
            };
        });
    }
};