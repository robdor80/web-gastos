export const HistoryView = {
    render(movements) {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        dashboard.classList.add('hidden');

        // Extraer periodos únicos (usando las notas de las nóminas)
        const periodos = [...new Set(movements.filter(m => m.type === 'salary').map(m => m.note))];
        if (periodos.length === 0) periodos.push("Febrero"); // Por defecto si solo hay una

        container.innerHTML = `
            <div class="form-container" style="max-width: 800px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3>📋 Historial de Movimientos</h3>
                    <button id="close-history" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>

                <div class="form-group">
                    <label>Seleccionar Periodo</label>
                    <select id="select-period">
                        ${periodos.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>

                <div id="history-list-container" style="margin-top:20px;">
                    </div>
            </div>
        `;

        const selector = document.getElementById('select-period');
        selector.addEventListener('change', (e) => this.filterAndShow(movements, e.target.value));

        // Mostrar por defecto el último periodo
        this.filterAndShow(movements, selector.value);

        document.getElementById('close-history').onclick = () => {
            container.innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            dashboard.classList.remove('hidden');
        };
    },

    filterAndShow(movements, periodoSelected) {
        const listContainer = document.getElementById('history-list-container');
        const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

        // Intentamos filtrar por la nota que pusimos en la nómina (ej: "Febrero")
        // Como los gastos no tienen mes, asumimos que pertenecen al periodo activo 
        // o al que el usuario decida (esto se puede pulir más adelante por fechas)
        const filtered = movements.filter(m => m.note.includes(periodoSelected) || m.type !== 'salary');

        if (filtered.length === 0) {
            listContainer.innerHTML = "<p>No hay datos para este periodo.</p>";
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        filtered.sort((a,b) => new Date(b.dateCustom) - new Date(a.dateCustom)).forEach(m => {
            const isPos = m.type === 'income' || m.type === 'salary';
            html += `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center;">
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem;">${m.category} - ${m.subcategory || ''}</div>
                        <div style="font-size: 0.8rem; color: #666;">${m.dateCustom} | ${m.account.toUpperCase()}</div>
                        <div style="font-style: italic; font-size: 0.75rem; color: #999;">${m.note || ''}</div>
                    </div>
                    <div style="font-weight: bold; color: ${isPos ? '#27ae60' : '#e74c3c'}">
                        ${isPos ? '+' : '-'}${f.format(m.amount)}
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html + '</div>';
    }
};