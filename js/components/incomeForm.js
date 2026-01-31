import { DbService } from '../firebase/db.js';

export const IncomeForm = {
    render(isSalary = false) {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        dashboard.classList.add('hidden');
        
        const hoy = new Date().toISOString().split('T')[0];
        
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">${isSalary ? '🏦 Registrar Nómina' : '💰 Ingreso Externo'}</h3>
                    <button id="btn-close-inc" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>
                
                <div class="form-group">
                    <label>Fecha del movimiento</label>
                    <input type="date" id="inc-date" value="${hoy}">
                </div>

                <div class="form-group">
                    <label>Importe (€)</label>
                    <input type="number" id="inc-amount" placeholder="0.00" step="0.01" inputmode="decimal">
                </div>

                <div class="form-group">
                    <label>Cuenta de destino</label>
                    <select id="inc-account">
                        <option value="bbva">BBVA Principal</option>
                        <option value="ing">Ahorro ING</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Concepto / Origen</label>
                    <input type="text" id="inc-note" placeholder="${isSalary ? 'Nómina Febrero' : 'Ej: Bizum de Juan'}">
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
        
        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        btnSave.addEventListener('click', async () => {
            const amount = document.getElementById('inc-amount').value;
            const dateValue = document.getElementById('inc-date').value;

            if (!amount) return alert("Introduce el importe");

            const movementData = {
                type: isSalary ? 'salary' : 'income',
                amount: amount,
                account: document.getElementById('inc-account').value,
                category: isSalary ? 'Nómina' : 'Ingreso Extra',
                note: document.getElementById('inc-note').value || (isSalary ? 'Nómina' : 'Ingreso'),
                dateCustom: dateValue,
                user: "Roberto"
            };

            btnSave.innerText = "Guardando...";
            btnSave.disabled = true;

            try {
                const ok = await DbService.saveMovement(movementData);
                if (ok) {
                    alert("✅ Guardado correctamente");
                    cerrar();
                } else {
                    throw new Error("Error en DbService");
                }
            } catch (err) {
                alert("❌ Error al guardar");
                btnSave.innerText = "Reintentar";
                btnSave.disabled = false;
            }
        });

        document.getElementById('btn-close-inc').onclick = cerrar;
        document.getElementById('cancel-inc').onclick = cerrar;
    }
};