/**
 * PinPad - Seguridad Nivel 3
 * Maneja la lógica de los botones y la validación del código secreto.
 */

export const PinPad = {
    currentPin: '',
    secretPin: '1234', // ← AQUÍ pon el PIN que queráis tú y tu esposa

    init(onSuccess) {
        const buttons = document.querySelectorAll('.pin-btn');
        const dots = document.querySelectorAll('.dot');
        this.currentPin = '';
        this.updateDots(dots);

        buttons.forEach(btn => {
            // Limpiamos eventos anteriores para que no se dupliquen los clics
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                if (newBtn.classList.contains('del-btn')) {
                    // Si pulsa borrar
                    this.currentPin = this.currentPin.slice(0, -1);
                } else if (this.currentPin.length < 4 && newBtn.textContent !== "") {
                    // Si pulsa un número y aún no hay 4 cifras
                    this.currentPin += newBtn.textContent;
                }

                this.updateDots(dots);

                // Si ya ha puesto las 4 cifras, comprobamos
                if (this.currentPin.length === 4) {
                    if (this.currentPin === this.secretPin) {
                        onSuccess(); // PIN Correcto -> Entramos
                    } else {
                        alert("PIN Incorrecto");
                        this.currentPin = '';
                        this.updateDots(dots);
                    }
                }
            });
        });
    },

    updateDots(dots) {
        dots.forEach((dot, index) => {
            if (index < this.currentPin.length) {
                dot.classList.add('active'); // Rellena el puntito
            } else {
                dot.classList.remove('active'); // Vacía el puntito
            }
        });
    }
};