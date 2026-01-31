/**
 * PinPad - Seguridad Nivel 3
 * Maneja la lógica de los botones y la validación del código secreto.
 */

export const PinPad = {
    currentPin: '',
    // ↓ AQUÍ: Cambia el '1234' por los 4 números que queráis (manten las comillas)
    secretPin: '6774', 

    init(onSuccess) {
        const buttons = document.querySelectorAll('.pin-btn');
        const dots = document.querySelectorAll('.dot');
        this.currentPin = '';
        this.updateDots(dots);

        buttons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                if (newBtn.classList.contains('del-btn')) {
                    this.currentPin = this.currentPin.slice(0, -1);
                } else if (this.currentPin.length < 4 && newBtn.textContent !== "") {
                    this.currentPin += newBtn.textContent;
                }

                this.updateDots(dots);

                if (this.currentPin.length === 4) {
                    if (this.currentPin === this.secretPin) {
                        onSuccess();
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
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
};