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

                <div id="category-logic-section">
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="exp-category">
                            <option value="">Selecciona...</option>
                            ${Categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            <option value="new-cat">+ Crear Nueva Categoría</option>
                        </select>
                        <input type="text" id="new-category-name" class="hidden" placeholder="Nombre de la nueva categoría" style="margin-top:10px;">
                    </div>

                    <div class="form-group" id="sub-group">
                        <label>Subcategoría</label>
                        <select id="exp-subcategory" disabled>
                            <option value="">Elige categoría primero</option>
                        </select>
                        <input type="text" id="new-subcategory-name" class="hidden" placeholder="Nombre de la nueva subcategoría" style="margin-top:10px;">
                    </div>
                </div>

                <div class="form-group">
                    <label>Nota / Comentario</label>
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
        const catSelect = document.getElementById('exp-category');
        const subSelect = document.getElementById('exp-subcategory');
        const newCatInput = document.getElementById('new-category-name');
        const newSubInput = document.getElementById('new-subcategory-name');
        const isTransferCheck = document.getElementById('is-transfer');
        const categoryLogic = document.getElementById('category-logic-section');

        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        isTransferCheck.addEventListener('change', (e) => {
            categoryLogic.style.display = e.target.checked ? 'none' : 'block';
        });

        catSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            newCatInput.classList.add('hidden');
            newSubInput.classList.add('hidden');

            if (val === 'new-cat') {
                newCatInput.classList.remove('hidden');
                subSelect.disabled = true;
                newSubInput.classList.remove('hidden');
            } else if (val !== "") {
                const selectedCat = Categories.find(c => c.id === val);
                subSelect.disabled = false;
                subSelect.innerHTML = selectedCat.subcategories.map(s => `<option value="${s}">${s}</option>`).join('') + '<option value="new-sub">+ Nueva Subcategoría</option>';
            } else {
                subSelect.disabled = true;
                subSelect.innerHTML = '<option value="">Elige categoría primero</option>';
            }
        });

        subSelect.addEventListener('change', (e) => {
            if (e.target.value === 'new-sub') newSubInput.classList.remove('hidden');
            else newSubInput.classList.add('hidden');
        });

        btnSave.addEventListener('click', async () => {
            const amount = document.getElementById('exp-amount').value;
            if (!amount) return alert("Introduce el importe");

            const isTransfer = isTransferCheck.checked;
            let finalCat = catSelect.value === 'new-cat' ? newCatInput.value : catSelect.value;
            let finalSub = subSelect.value === 'new-sub' ? newSubInput.value : subSelect.value;

            if (isTransfer) {
                finalCat = 'Traspaso';
                finalSub = document.getElementById('exp-account').value === 'bbva' ? 'A ING' : 'A BBVA';
            }

            const movementData = {
                type: isTransfer ? 'transfer' : 'expense',
                amount: amount,
                account: document.getElementById('exp-account').value,
                category: finalCat,
                subcategory: finalSub,
                note: document.getElementById('exp-note').value,
                dateCustom: document.getElementById('exp-date').value,
                user: "Roberto"
            };

            btnSave.innerText = "Guardando...";
            btnSave.disabled = true;

            const ok = await DbService.saveMovement(movementData);
            if (ok) { alert("✅ Guardado correctamente"); cerrar(); }
            else { alert("❌ Error"); btnSave.disabled = false; btnSave.innerText = "Guardar"; }
        });

        document.getElementById('btn-close-form').onclick = cerrar;
        document.getElementById('cancel-link').onclick = cerrar;
    }
};