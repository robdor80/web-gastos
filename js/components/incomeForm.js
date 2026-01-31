/**
 * IncomeForm - Lógica para Ingresos y Nómina con conexión a Firebase
 */
import { DbService } from '../firebase/db.js';

export const IncomeForm = {
    render(isSalary = false) {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        
        dashboard.classList.add('hidden');
        
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">${isSalary ? '🏦 Registrar Nómina' : '💰 Ingreso Externo'}</h3>
                    <button id="btn-close-inc" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                
                <p style="font-size: 0.8rem; color: #666; margin-bottom: 15px;">
                    * Usa este formulario para dinero que <b>no</b> viene de tus propias cuentas.
                </p>

                <div class="form-group">
                    <label>Importe (€)</label>
                    <input type="number" id="inc-amount" placeholder="0.00" step="0.01" inputmode="decimal">
                </div>

                <div class="form-group">
                    <label>Cuenta donde se recibe</label>
                    <select id="inc-account">
                        <option value="bbva">BBVA Principal</option>
                        <option value="ing">Ahorro ING</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Concepto / Origen</label>
                    <input type="text" id="inc-note" placeholder="${isSalary ? 'Nómina Enero' : 'Ej: Bizum de Juan'}">
                </div>

                <button class="btn-save" id="btn-save-income" style="background-color: #27ae60;">
                    ${isSalary ? 'Confirmar Nómina' : 'Guardar Ingreso'}
                </button>
                <p id="cancel-inc" style="text-align:center; margin-top:15px; color:#e74c3c; cursor:pointer; font-weight:600;">Cancelar</p>
            </div>
        `;

        this.setupLogic(isSalary);
    },

    setupLogic(isSalary) {
        const btnSave = document.getElementById('btn-save-income');
        const btnClose = document.getElementById('btn-close-inc');
        const cancelLink = document.getElementById('cancel-inc');

        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        btnClose.addEventListener('click', cerrar);
        cancelLink.addEventListener('click', cerrar);

        btnSave.addEventListener('click', async () => {
            const amount = document.getElementById('inc-amount').value;
            const account = document.getElementById('inc-account').value;
            const note = document.getElementById('inc-note').value;

            if (!amount) {
                alert("Por favor, introduce el importe.");
                return;
            }

            const movementData = {
                type: isSalary ? 'salary' : 'income',
                amount: amount,
                account: account,
                category: isSalary ? 'Nómina' : 'Ingreso Extra',
                subcategory: isSalary ? 'Salario Mensual' : 'Varios',
                note: note || (isSalary ? 'Nómina mensual' : 'Ingreso externo'),
                user: "Roberto"
            };

            btnSave.innerText = "Guardando...";
            btnSave.disabled = true;

            const ok = await DbService.saveMovement(movementData);

            if (ok) {
                alert("✅ Ingreso guardado correctamente.");
                cerrar();
            } else {
                alert("❌ Error al guardar en la nube.");
                btnSave.innerText = isSalary ? 'Confirmar Nómina' : 'Guardar Ingreso';
                btnSave.disabled = false;
            }
        });
    }
};