/**
 * ExpenseForm - Lógica del Formulario de Gastos
 * Maneja la visualización y la carga dinámica de categorías.
 */
import { Categories } from '../config/categories.js';

export const ExpenseForm = {
    render() {
        const container = document.getElementById('dynamic-content');
        
        container.innerHTML = `
            <div class="form-container">
                <h3 style="margin-bottom: 20px; text-align: center;">✏️ Nuevo Gasto</h3>
                
                <div class="form-group">
                    <label>Importe (€)</label>
                    <input type="number" id="exp-amount" placeholder="0.00" step="0.01" inputmode="decimal">
                </div>

                <div class="form-group">
                    <label>Cuenta de origen</label>
                    <select id="exp-account">
                        <option value="bbva">BBVA Principal</option>
                        <option value="ing">Ahorro ING</option>
                    </select>
                </div>

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

                <div class="form-group">
                    <label>Nota adicional (Opcional)</label>
                    <input type="text" id="exp-note" placeholder="Ej: Compra semanal">
                </div>

                <button class="btn-save" id="btn-save-expense">Guardar Gasto</button>
            </div>
        `;

        this.setupLogic();
    },

    setupLogic() {
        const categorySelect = document.getElementById('exp-category');
        const subcategorySelect = document.getElementById('exp-subcategory');
        const btnSave = document.getElementById('btn-save-expense');

        // Lógica de cascada: Al cambiar categoría, se cargan sus subcategorías
        categorySelect.addEventListener('change', (e) => {
            const selectedCat = Categories.find(cat => cat.id === e.target.value);
            
            if (selectedCat) {
                subcategorySelect.innerHTML = selectedCat.subcategories
                    .map(sub => `<option value="${sub.toLowerCase()}">${sub}</option>`)
                    .join('');
                subcategorySelect.disabled = false;
            } else {
                subcategorySelect.innerHTML = '<option value="">Primero elige categoría</option>';
                subcategorySelect.disabled = true;
            }
        });

        // Evento de guardado (por ahora solo log, luego conectaremos con Firebase)
        btnSave.addEventListener('click', () => {
            const data = {
                amount: document.getElementById('exp-amount').value,
                account: document.getElementById('exp-account').value,
                category: categorySelect.value,
                subcategory: subcategorySelect.value,
                note: document.getElementById('exp-note').value,
                date: new Date().toISOString()
            };

            if (!data.amount || !data.category) {
                alert("Por favor, rellena al menos el importe y la categoría.");
                return;
            }

            console.log("Datos listos para Firebase:", data);
            alert("Gasto capturado (Lógica de guardado en el siguiente paso)");
        });
    }
};