export const HistoryView = {
    // Guardamos el último periodo seleccionado para que no se resetee al actualizarse los datos
    currentPeriod: null,

    render(movements) {
        const container = document.getElementById('dynamic-content');
        const dashboard = document.querySelector('.dashboard-grid');
        dashboard.classList.add('hidden');

        // Extraer periodos únicos de las nóminas
        const periodos = [...new Set(movements.filter(m => m.type === 'salary').map(m => m.note))];
        if (periodos.length === 0) periodos.push("Febrero 2026");

        // Si es la primera vez que abrimos, seleccionamos el último periodo
        if (!this.currentPeriod) this.currentPeriod = periodos[periodos.length - 1];

        container.innerHTML = `
            <div class="form-container" style="max-width: 800px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">📋 Historial de Movimientos</h3>
                    <button id="close-history" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">✕</button>
                </div>

                <div class="form-group">
                    <label>Seleccionar Periodo (Nómina)</label>
                    <select id="select-period">
                        ${periodos.map(p => `<option value="${p}" ${p === this.currentPeriod ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>

                <div id="history-list-container" style="margin-top:20px;">
                    </div>
            </div>
        `;

        const selector = document.getElementById('select-period');
        selector.addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.filterAndShow(movements);
        });

        // Pintar la lista inicialmente
        this.filterAndShow(movements);

        document.getElementById('close-history').onclick = () => {
            this.currentPeriod = null; // Reset al cerrar
            container.innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Selecciona una opción para empezar.</p>';
            dashboard.classList.remove('hidden');
        };
    },

    filterAndShow(movements) {
        const listContainer = document.getElementById('history-list-container');
        if (!listContainer) return; // Si el usuario cerró el historial, no hacemos nada

        const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

        // 1. FILTRADO: Agrupamos los movimientos que pertenecen al periodo seleccionado
        // (Buscamos movimientos cuya fecha coincida o simplemente mostramos todos ordenados)
        const filtered = movements; // De momento mostramos todos para no perder datos

        // 2. ORDENACIÓN: Los más recientes primero (dateCustom desc)
        const sorted = [...filtered].sort((a, b) => {
            return new Date(b.dateCustom) - new Date(a.dateCustom);
        });

        if (sorted.length === 0) {
            listContainer.innerHTML = "<p style='text-align:center; color: #999;'>No hay movimientos registrados.</p>";
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        sorted.forEach(m => {
            const isPos = m.type === 'income' || m.type === 'salary' || (m.category === 'Plan de Pensiones' && m.type === 'expense');
            const color = isPos ? '#27ae60' : '#e74c3c';
            const signo = isPos ? '+' : '-';
            
            // Si es plan de pensiones, visualmente es un "ingreso" a esa hucha aunque salga del BBVA
            const displaySigno = (m.category === 'Plan de Pensiones') ? '🏦 +' : signo;
            const displayColor = (m.category === 'Plan de Pensiones') ? '#2980b9' : color;

            html += `
                <div style="display: flex; justify-content: space-between; padding: 12px; background: #fff; border-radius: 8px; border-left: 5px solid ${displayColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                    <div>
                        <div style="font-weight: bold; font-size: 0.95rem;">${m.category} ${m.subcategory ? '› ' + m.subcategory : ''}</div>
                        <div style="font-size: 0.8rem; color: #666;">${m.dateCustom} | <span style="text-transform: uppercase;">${m.account}</span></div>
                        ${m.note ? `<div style="font-size: 0.75rem; color: #999; margin-top:2px;">💬 ${m.note}</div>` : ''}
                    </div>
                    <div style="font-weight: bold; color: ${displayColor}; font-size: 1rem; align-self: center;">
                        ${displaySigno}${f.format(m.amount)}
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html + '</div>';
    }
};