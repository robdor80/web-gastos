import { AuthService } from './firebase/auth.js';
import { AuthGuard } from './middleware/authGuard.js';
// ... resto de imports

document.addEventListener('DOMContentLoaded', () => {
    const assignClick = (id, func) => {
        const el = document.getElementById(id);
        if (el) el.onclick = func;
    };

    // Asignación segura de eventos
    assignClick('btn-login', () => AuthService.login());
    assignClick('pc-logout', () => AuthService.logout());
    assignClick('mob-logout', () => AuthService.logout());
    
    // Configuración de formularios
    assignClick('pc-add-expense', () => ExpenseForm.render());
    assignClick('pc-add-income', () => IncomeForm.render(false));
    assignClick('pc-history', () => HistoryView.render(cacheMovements));

    // Menú lateral
    const sideMenu = document.getElementById('side-menu');
    assignClick('menu-open', () => sideMenu?.classList.remove('hidden'));
    assignClick('menu-close', () => sideMenu?.classList.add('hidden'));

    // Inicializar Auth
    try {
        AuthGuard.verifyAccess(mostrarSaldosActuales);
    } catch (e) {
        console.error("Error inicial:", e);
    }
});