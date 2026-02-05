import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
import { InitialBalances } from './config/initialBalances.js';
import { ExpenseForm } from './components/expenseForm.js';
import { IncomeForm } from './components/incomeForm.js';
import { HistoryView } from './components/historyView.js';
import { AlertsView } from './components/alertsView.js';

// Caché de movimientos
let cacheMovements = [];

/**
 * 1. ACTUALIZAR SALDOS Y AVISOS
 */
const mostrarSaldosActuales = (movements = []) => {
    cacheMovements = movements; 

    const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
    let sBBVA = parseFloat(InitialBalances.bbva || 0);
    let sING = parseFloat(InitialBalances.ing || 0);
    let sPension = parseFloat(InitialBalances.pension || 0);
    
    // Contadores para alertas
    let pendingCount = 0;

    if (movements && movements.length > 0) {
        movements.forEach(m => {
            const cant = parseFloat(m.amount);
            
            // Si es alerta pendiente, solo contamos
            if (m.type === 'pending') {
                pendingCount++;
            } 
            // Si es movimiento real, calculamos saldo
            else if (m.type === 'expense') {
                if (m.account === 'bbva') sBBVA -= cant; else sING -= cant;
                if (m.category === "Plan de Pensiones") sPension += cant;
            } else if (m.type === 'income' || m.type === 'salary') {
                if (m.account === 'bbva') sBBVA += cant; else sING += cant;
            }
        });
    }

    // Actualizar Textos de Saldos
    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    setTxt('saldo-bbva', f.format(sBBVA));
    setTxt('saldo-ing', f.format(sING));
    setTxt('saldo-pension', f.format(sPension));
    
    // Periodo
    const nominas = movements.filter(m => m.type === 'salary');
    if (nominas.length > 0) {
        setTxt('current-period-display', nominas[0].note || "Periodo Activo");
    }

    // --- NUEVO: AVISO VISUAL DE ALERTAS ---
    const updateAlertBtn = (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (pendingCount > 0) {
                btn.innerHTML = `⚠️ Alertas <b>(${pendingCount})</b>`;
                btn.style.color = "#ffd700"; // Dorado intenso
                btn.style.fontWeight = "bold";
            } else {
                btn.innerHTML = `⚠️ Alertas`;
                btn.style.color = "#ffd700"; // Normal
                btn.style.fontWeight = "normal";
            }
        }
    };

    updateAlertBtn('pc-alerts');
    updateAlertBtn('mob-alerts');
};

/**
 * 2. INICIALIZACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("App iniciada.");

    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    // --- LOGIN / LOGOUT ---
    bindClick('btn-login', () => AuthService.login());
    bindClick('pc-logout', () => AuthService.logout());
    bindClick('mob-logout', () => AuthService.logout());

    // --- MENÚ MÓVIL ---
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = () => sideMenu?.classList.add('hidden');
    bindClick('menu-open', () => sideMenu?.classList.remove('hidden'));
    bindClick('menu-close', closeMenu);

    // --- BOTONES PC ---
    bindClick('pc-add-expense', () => ExpenseForm.render());
    bindClick('pc-add-income', () => IncomeForm.render(false));
    bindClick('pc-add-salary', () => IncomeForm.render(true));
    bindClick('pc-history', () => HistoryView.render(cacheMovements));
    bindClick('pc-alerts', () => AlertsView.render(cacheMovements));

    // --- BOTONES MÓVIL ---
    bindClick('mob-add-expense', () => { ExpenseForm.render(); closeMenu(); });
    bindClick('mob-add-income', () => { IncomeForm.render(false); closeMenu(); });
    bindClick('mob-add-salary', () => { IncomeForm.render(true); closeMenu(); });
    bindClick('mob-history', () => { HistoryView.render(cacheMovements); closeMenu(); });
    bindClick('mob-alerts', () => { AlertsView.render(cacheMovements); closeMenu(); });

    // --- ARRANQUE ---
    try {
        AuthGuard.verifyAccess(mostrarSaldosActuales);
    } catch (e) {
        console.error("Error arranque:", e);
    }
});