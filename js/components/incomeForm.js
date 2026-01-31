/**
 * IncomeForm - Lógica para Ingresos y Nómina
 */
export const IncomeForm = {
    render(isSalary = false) {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        
        dashboard.classList.add('hidden');
        
        container.innerHTML = `
            <div class="form-container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">${isSalary ? '🏦 Registrar Nómina' : '💰 Nuevo Ingreso'}</h3>
                    <button id="btn-close-inc" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
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
                    <label>Concepto</label>
                    <input type="text" id="inc-note" placeholder="${isSalary ? 'Nómina Enero' : 'Ej: Bizum, Devolución...'}">
                </div>

                <button class="btn-save" id="btn-save-income" style="background-color: #27ae60;">
                    ${isSalary ? 'Ingresar Nómina' : 'Guardar Ingreso'}
                </button>
                <p id="cancel-inc" style="text-align:center; margin-top:15px; color:#e74c3c; cursor:pointer; font-weight:600;">Cancelar</p>
            </div>
        `;

        this.setupLogic();
    },

    setupLogic() {
        const btnSave = document.getElementById('btn-save-income');
        const btnClose = document.getElementById('btn-close-inc');
        const cancelLink = document.getElementById('cancel-inc');

        const cerrar = () => {
            document.getElementById('dynamic-content').innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción del menú para empezar.</p>';
            document.querySelector('.dashboard-grid').classList.remove('hidden');
        };

        btnClose.addEventListener('click', cerrar);
        cancelLink.addEventListener('click', cerrar);

        btnSave.addEventListener('click', () => {
            const amount = document.getElementById('inc-amount').value;
            if (!amount) {
                alert("Por favor, introduce el importe.");
                return;
            }
            alert("¡Ingreso capturado! En el próximo paso se sumará al saldo real.");
            cerrar();
        });
    }
};