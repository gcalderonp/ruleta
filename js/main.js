/**
 * main.js — App entry point
 * Inicializa todos los módulos y conecta la lógica de giro con el stock.
 */

document.addEventListener('DOMContentLoaded', () => {
  Background.start();
  Wheel.init();
  PrizesGrid.build();
  Modal.init();
  Navbar.init();

  const spinBtn = document.getElementById('spinBtn');

  /* Verificar si hay premios disponibles al cargar */
  checkAvailability();

  function handleSpin() {
    const available = Stock.getAvailable();

    /* Caso: todos los premios agotados */
    if (available.length === 0) {
      showEmptyState();
      return;
    }

    spinBtn.disabled = true;

    /* El wheel gira solo con premios disponibles */
    Wheel.spin(available, (prize) => {
      Modal.show(prize, () => {
        /* Al cerrar el modal, re-evaluar disponibilidad */
        const stillAvailable = Stock.getAvailable();

        if (stillAvailable.length === 0) {
          showEmptyState();
        } else {
          spinBtn.disabled = false;

          /* Redibujar rueda con premios actualizados */
          Wheel.updatePrizes(stillAvailable);
        }
      });
    });
  }

  /* Botón normal */
  spinBtn.addEventListener('click', handleSpin);

  /* Click en el centro de la ruleta */
  Wheel.onHubClick(() => {
    if (spinBtn.disabled) return;
    handleSpin();
  });

  function checkAvailability() {
    const available = Stock.getAvailable();

    if (available.length === 0) {
      showEmptyState();
    } else {
      Wheel.updatePrizes(available);
    }
  }

  function showEmptyState() {
    spinBtn.disabled = true;
    spinBtn.textContent = '😢 Premios Agotados';

    const hint = document.querySelector('.spin-hint');
    if (hint) {
      hint.textContent =
        'Todos los premios han sido reclamados. ¡Gracias por participar!';
    }
  }
});