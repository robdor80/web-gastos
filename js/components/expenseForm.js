import { Categories } from '../config/categories.js';
import { DbService } from '../firebase/db.js';

export const ExpenseForm = {
    render() {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        dashboard.classList.add('hidden');
        
        const hoy = new Date().toISOString().split('T')[0];
        
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">✏️ Nuevo Movimiento</h3>
                    <button id="btn-close-form" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                
                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" id="exp-date" value="${hoy}">
                </div>

                <div class="form-group">
                    <label>Importe (€)</label>
                    <input type="number" id="exp-amount" placeholder="0.00" step="0.01" inputmode="decimal">
                </div>

                <div class="form-group">
                    <label>Origen</label>
                    <select id="exp-account">
                        <option value="bbva">BBVA Principal</option>
                        <option value="ing">Ahorro ING</option>
                    </select>
                </div>

                <div class="form-group" style="background: #f0f7ff; padding: 10px; border-radius: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="is-transfer" style="width: auto; margin-right: 10px;"> 
                        ¿Es un traspaso entre cuentas?
                    </label>
                </div>

                <div id="category-section">
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="exp-category">
                            <option value="">Selecciona...</option>
                            ${Categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nota</label>
                    <input type="text" id="exp-note" placeholder="Opcional">
                </div>

                <button class="btn-save" id="btn-save-expense">Guardar Movimiento</button>
                <p id="cancel-link" style="text-align:center; margin-top:15px; color:#e74c3c; cursor:pointer; font-weight:600;">Cancelar</p>
            </div>
        `;

        this.setupLogic();
    },

    setupLogic() {
        const btnSave = document.getElementById('btn-save-expense');
        const isTransferCheck = document.getElementById('is-transfer');
        const categorySection = document.getElementById('category-section');

        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        isTransferCheck.addEventListener('change', (e) => {
            categorySection.style.display = e.target.checked ? 'none' : 'block';
        });

        btnSave.addEventListener('click', async () => {
            const amount = document.getElementById('exp-amount').value;
            if (!amount) return alert("Introduce el importe");

            const isTransfer = isTransferCheck.checked;
            const account = document.getElementById('exp-account').value;

            const movementData = {
                type: isTransfer ? 'transfer' : 'expense',
                amount: amount,
                account: account,
                category: isTransfer ? 'Traspaso' : document.getElementById('exp-category').value,
                subcategory: isTransfer ? (account === 'bbva' ? 'A ING' : 'A BBVA') : '',
                note: document.getElementById('exp-note').value,
                dateCustom: document.getElementById('exp-date').value,
                user: "Roberto"
            };

            btnSave.innerText = "Guardando...";
            btnSave.disabled = true;

            try {
                const ok = await DbService.saveMovement(movementData);
                if (ok) {
                    alert("✅ Registrado con éxito");
                    cerrar();
                } else {
                    throw new Error();
                }
            } catch (e) {
                alert("❌ Error al guardar");
                btnSave.innerText = "Guardar Movimiento";
                btnSave.disabled = false;
            }
        });

        document.getElementById('btn-close-form').onclick = cerrar;
        document.getElementById('cancel-link').onclick = cerrar;
    }
};