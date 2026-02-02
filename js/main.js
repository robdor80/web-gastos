import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
import { InitialBalances } from './config/initialBalances.js';
import { ExpenseForm } from './components/expenseForm.js';
import { IncomeForm } from './components/incomeForm.js';
import { HistoryView } from './components/historyView.js';
import { DbService } from './firebase/db.js';

const f = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let cacheMovements = [];

// Asignación de eventos de botones
document.getElementById('btn-login').onclick = () => AuthService.login();
document.getElementById('pc-logout').onclick = () => AuthService.logout();
document.getElementById('mob-logout').onclick = () => AuthService.logout();

document.getElementById('pc-add-expense').onclick = () => ExpenseForm.render();
document.getElementById('mob-add-expense').onclick = () => { 
    ExpenseForm.render(); 
    document.getElementById('side-menu').classList.add('hidden'); 
};

document.getElementById('pc-add-income').onclick = () => IncomeForm.render(false);
document.getElementById('mob-add-income').onclick = () => { 
    IncomeForm.render(false); 
    document.getElementById('side-menu').classList.add('hidden'); 
};

document.getElementById('pc-add-salary').onclick = () => IncomeForm.render(true);
document.getElementById('mob-add-salary').onclick = () => { 
    IncomeForm.render(true); 
    document.getElementById('side-menu').classList.add('hidden'); 
};

document.getElementById('pc-history').onclick = () => HistoryView.render(cacheMovements);
document.getElementById('mob-history').onclick = () => { 
    HistoryView.render(cacheMovements); 
    document.getElementById('side-menu').classList.add('hidden'); 
};

// Control del menú lateral (hamburguesa)
const sideMenu = document.getElementById('side-menu');
document.getElementById('menu-open').onclick = () => sideMenu.classList.remove('hidden');
document.getElementById('menu-close').onclick = () => sideMenu.classList.add('hidden');

/**
 * Calcula y muestra los saldos actuales en las tarjetas del dashboard [cite: 41, 44]
 */
const mostrarSaldosActuales = (movements = []) => {
    cacheMovements = movements;
    let sBBVA = parseFloat(InitialBalances.bbva);
    let sING = parseFloat(InitialBalances.ing);
    let sPension = parseFloat(InitialBalances.pension);
    const displayMes = document.getElementById('current-period-display');

    if (movements.length > 0) {
        const nominas = movements.filter(m => m.type === 'salary');
        if (nominas.length > 0) displayMes.innerText = nominas[nominas.length - 1].note || "Periodo Activo";
        
        movements.forEach(m => {
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
    
    document.getElementById('saldo-bbva').innerText = f.format(sBBVA);
    document.getElementById('saldo-ing').innerText = f.format(sING);
    document.getElementById('saldo-pension').innerText = f.format(sPension);
};

// Punto de entrada de la aplicación tras PIN [cite: 28, 39]
try { 
    AuthGuard.verifyAccess(mostrarSaldosActuales); 
} catch (error) { 
    console.error("Error al iniciar Gastos Mes:", error); 
}