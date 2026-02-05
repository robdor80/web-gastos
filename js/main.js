import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
import { InitialBalances } from './config/initialBalances.js';
import { ExpenseForm } from './components/expenseForm.js';
import { IncomeForm } from './components/incomeForm.js';
import { HistoryView } from './components/historyView.js';
import { AlertsView } from './components/alertsView.js'; // <--- IMPORTANTE

// Caché de movimientos
let cacheMovements = [];

/**
 * 1. ACTUALIZAR SALDOS
 * (Ignoramos los tipo 'pending' para que no afecten a la cuenta)
 */
const mostrarSaldosActuales = (movements = []) => {
    cacheMovements = movements; // Guardamos para usar en Historial y Alertas

    const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
    let sBBVA = parseFloat(InitialBalances.bbva || 0);
    let sING = parseFloat(InitialBalances.ing || 0);
    let sPension = parseFloat(InitialBalances.pension || 0);

    if (movements && movements.length > 0) {
        movements.forEach(m => {
            // Solo procesamos gastos, ingresos y nóminas. IGNORAMOS 'pending'.
            const cant = parseFloat(m.amount);
            if (m.type === 'expense') {
                if (m.account === 'bbva') sBBVA -= cant; else sING -= cant;
                if (m.category === "Plan de Pensiones") sPension += cant;
            } else if (m.type === 'income' || m.type === 'salary') {
                if (m.account === 'bbva') sBBVA += cant; else sING += cant;
            } else if (m.type === 'transfer') {
                if (m.account === 'bbva') { sBBVA -= cant; sING += cant; }
                else { sING -= cant; sBBVA += cant; }
            }
        });
    }

    // Actualizar DOM
    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    setTxt('saldo-bbva', f.format(sBBVA));
    setTxt('saldo-ing', f.format(sING));
    setTxt('saldo-pension', f.format(sPension));
    
    // Periodo (nómina)
    const nominas = movements.filter(m => m.type === 'salary');
    if (nominas.length > 0) {
        setTxt('current-period-display', nominas[nominas.length - 1].note || "Periodo Activo");
    }
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
    bindClick('pc-alerts', () => AlertsView.render(cacheMovements)); // <--- NUEVO

    // --- BOTONES MÓVIL ---
    bindClick('mob-add-expense', () => { ExpenseForm.render(); closeMenu(); });
    bindClick('mob-add-income', () => { IncomeForm.render(false); closeMenu(); });
    bindClick('mob-add-salary', () => { IncomeForm.render(true); closeMenu(); });
    bindClick('mob-history', () => { HistoryView.render(cacheMovements); closeMenu(); });
    bindClick('mob-alerts', () => { AlertsView.render(cacheMovements); closeMenu(); }); // <--- NUEVO

    // --- ARRANQUE ---
    try {
        AuthGuard.verifyAccess(mostrarSaldosActuales);
    } catch (e) {
        console.error("Error arranque:", e);
    }
});