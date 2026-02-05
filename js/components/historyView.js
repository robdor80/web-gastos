export const HistoryView = {
    render(movements = []) {
        const container = document.getElementById('dynamic-content');
        
        // Si no hay movimientos
        if (!movements || movements.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: white; padding: 40px;">
                    <h3>📭 Historial vacío</h3>
                    <p style="opacity: 0.7;">Añade gastos o ingresos para verlos aquí.</p>
                </div>`;
            return;
        }

        let html = `
            <div style="max-width: 800px; margin: 0 auto; color: white;">
                <h2 style="text-align: center; margin-bottom: 20px;">📜 Historial de Movimientos</h2>
                <div class="history-list">
        `;

        movements.forEach(m => {
            // Protección contra datos corruptos o Alertas
            const isExpense = m.type === 'expense';
            const isSalary = m.type === 'salary';
            const isIncome = m.type === 'income';
            
            let amountClass = isExpense ? '#ff6b6b' : '#51cf66'; // Rojo o Verde
            let sign = isExpense ? '-' : '+';
            
            // Icono según tipo
            let icon = '📄';
            if (isSalary) icon = '🏦';
            if (isIncome && !isSalary) icon = '💰';
            if (isExpense) icon = '🛒';

            // Formatear fecha
            const dateObj = new Date(m.date);
            const dateStr = dateObj.toLocaleDateString();

            html += `
                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid ${amountClass};">
                    <div style="flex-grow: 1;">
                        <div style="font-weight: bold; font-size: 1.1rem;">${m.category || 'Varios'}</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">${icon} ${m.note || 'Sin detalles'}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6; margin-top: 4px;">📅 ${dateStr} | ${m.account ? m.account.toUpperCase() : 'General'}</div>
                    </div>
                    <div style="font-weight: bold; font-size: 1.3rem; color: ${amountClass}; white-space: nowrap;">
                        ${sign} ${parseFloat(m.amount).toFixed(2)} €
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
    }
};