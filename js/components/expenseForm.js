/**
 * ExpenseForm - Lógica del Formulario de Gastos
 * Maneja la visualización, carga dinámica de categorías y visibilidad del dashboard.
 */
import { Categories } from '../config/categories.js';

export const ExpenseForm = {
    render() {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        
        // 1. Ocultamos las tarjetas del dashboard
        dashboard.classList.add('hidden');
        
        // 2. Pintamos el formulario con un botón de "Cancelar" para volver
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">✏️ Nuevo Gasto</h3>
                    <button id="btn-close-form" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                
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
                <p id="cancel-link" style="text-align:center; margin-top:15px; color:#e74c3c; cursor:pointer; font-weight:600;">Cancelar y volver</p>
            </div>
        `;

        this.setupLogic();
    },

    setupLogic() {
        const categorySelect = document.getElementById('exp-category');
        const subcategorySelect = document.getElementById('exp-subcategory');
        const btnSave = document.getElementById('btn-save-expense');
        const btnClose = document.getElementById('btn-close-form');
        const cancelLink = document.getElementById('cancel-link');

        // Función para cerrar formulario y mostrar dashboard
        const cerrarFormulario = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción del menú para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        btnClose.addEventListener('click', cerrarFormulario);
        cancelLink.addEventListener('click', cerrarFormulario);

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

        btnSave.addEventListener('click', () => {
            const amount = document.getElementById('exp-amount').value;
            if (!amount || categorySelect.value === "") {
                alert("Por favor, rellena importe y categoría.");
                return;
            }
            
            // Aquí irá la conexión a Firebase en el siguiente paso
            alert("¡Listo! En el siguiente paso este botón restará dinero de tu saldo.");
            cerrarFormulario();
        });
    }
};