/**
 * ExpenseForm - Lógica con Transferencias Internas y Conexión a Firebase
 */
import { Categories } from '../config/categories.js';
import { DbService } from '../firebase/db.js';

export const ExpenseForm = {
    render() {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        dashboard.classList.add('hidden');
        
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">✏️ Nuevo Movimiento</h3>
                    <button id="btn-close-form" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                
                <div class="form-group">
                    <label>Importe (€)</label>
                    <input type="number" id="exp-amount" placeholder="0.00" step="0.01" inputmode="decimal">
                </div>

                <div class="form-group">
                    <label>¿De dónde sale el dinero? (Origen)</label>
                    <select id="exp-account">
                        <option value="bbva">BBVA Principal</option>
                        <option value="ing">Ahorro ING</option>
                    </select>
                </div>

                <div class="form-group" id="transfer-logic" style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #d0e3ff;">
                    <label style="display: flex; align-items: center; cursor: pointer; font-weight: bold; color: #004481;">
                        <input type="checkbox" id="is-transfer" style="width: auto; margin-right: 10px;"> 
                        ¿Es un traspaso entre mis cuentas?
                    </label>
                    <small id="transfer-help" style="color: #666; display: block; margin-top: 5px;">
                        (Si marcas esto, el dinero se moverá entre BBVA e ING)
                    </small>
                </div>

                <div id="category-fields">
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="exp-category">
                            <option value="">Selecciona categoría...</option>
                            ${Categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Subcategoría</label>
                        <select id="exp-subcategory" disabled>
                            <option value="">Primero elige categoría</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nota adicional</label>
                    <input type="text" id="exp-note" placeholder="Ej: Compra o ahorro">
                </div>

                <button class="btn-save" id="btn-save-expense">Guardar Movimiento</button>
                <p id="cancel-link" style="text-align:center; margin-top:15px; color:#e74c3c; cursor:pointer; font-weight:600;">Cancelar y volver</p>
            </div>
        `;

        this.setupLogic();
    },

    setupLogic() {
        const categorySelect = document.getElementById('exp-category');
        const subcategorySelect = document.getElementById('exp-subcategory');
        const isTransferCheck = document.getElementById('is-transfer');
        const categoryFields = document.getElementById('category-fields');
        const accountSelect = document.getElementById('exp-account');
        const transferHelp = document.getElementById('transfer-help');
        const btnSave = document.getElementById('btn-save-expense');

        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        const updateHelpText = () => {
            const origen = accountSelect.value;
            const destino = origen === 'bbva' ? 'ING' : 'BBVA';
            transferHelp.innerHTML = isTransferCheck.checked 
                ? `<strong>Movimiento:</strong> Restar de ${origen.toUpperCase()} ➔ Sumar en ${destino}`
                : `(Si marcas esto, el dinero se moverá entre BBVA e ING)`;
        };

        isTransferCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                categoryFields.style.display = "none";
                updateHelpText();
            } else {
                categoryFields.style.display = "block";
                transferHelp.innerText = "(Si marcas esto, el dinero se moverá entre BBVA e ING)";
            }
        });

        accountSelect.addEventListener('change', updateHelpText);

        categorySelect.addEventListener('change', (e) => {
            const selectedCat = Categories.find(cat => cat.id === e.target.value);
            if (selectedCat) {
                subcategorySelect.innerHTML = selectedCat.subcategories.map(sub => `<option value="${sub.toLowerCase()}">${sub}</option>`).join('');
                subcategorySelect.disabled = false;
            }
        });

        btnSave.addEventListener('click', async () => {
            const amount = document.getElementById('exp-amount').value;
            const account = accountSelect.value;
            const isTransfer = isTransferCheck.checked;

            if (!amount) return alert("Por favor, introduce el importe.");
            if (!isTransfer && categorySelect.value === "") return alert("Elige una categoría.");

            // Estructura de datos para Firebase
            const movementData = {
                type: isTransfer ? 'transfer' : 'expense',
                amount: amount,
                account: account,
                category: isTransfer ? 'Traspaso Interno' : categorySelect.value,
                subcategory: isTransfer ? (account === 'bbva' ? 'A ING' : 'A BBVA') : subcategorySelect.value,
                note: document.getElementById('exp-note').value,
                user: "Roberto" // Luego lo haremos dinámico con el login
            };

            btnSave.innerText = "Guardando...";
            btnSave.disabled = true;

            const ok = await DbService.saveMovement(movementData);

            if (ok) {
                alert("✅ Movimiento guardado en la nube.");
                cerrar();
            } else {
                alert("❌ Error al guardar. ¿Has configurado las reglas de Firestore?");
                btnSave.innerText = "Guardar Movimiento";
                btnSave.disabled = false;
            }
        });

        document.getElementById('btn-close-form').addEventListener('click', cerrar);
        document.getElementById('cancel-link').addEventListener('click', cerrar);
    }
};