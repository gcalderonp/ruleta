const Modal = (() => {
  const overlay  = document.getElementById('modalOverlay');
  const iconEl   = document.getElementById('modalIcon');
  const prizeEl  = document.getElementById('modalPrize');
  const descEl   = document.getElementById('modalDesc');
  const stockEl  = document.getElementById('modalStock');
  const claimBtn = document.getElementById('modalClaimBtn');
  //const closeBtn = document.getElementById('modalCloseBtn');

  let _currentPrize = null;
  let _onClose = null;

  function show(prize, onClose) {
    _currentPrize = prize;
    _onClose = onClose;

    iconEl.textContent  = prize.icon;
    prizeEl.textContent = prize.label;
    descEl.textContent  = prize.desc;

    const remaining = Stock.getStock(prize.label);
    if (stockEl) {
      stockEl.textContent = remaining <= 5
        ? `¡Solo quedan ${remaining} de este premio!`
        : `${remaining} disponibles`;
      stockEl.className = `modal-stock-info ${remaining <= 5 ? 'modal-stock-low' : ''}`;
    }

    overlay.classList.add('active');
    Confetti.launch();
  }

  function hide() {
    overlay.classList.remove('active');
    if (typeof _onClose === 'function') {
      _onClose();
      _onClose = null;
    }
  }

  function claim() {
    if (_currentPrize) {
      /* Descontar stock */
      const remaining = Stock.consume(_currentPrize.label);
      /* Actualizar la tarjeta en la sección de premios */
      PrizesGrid.updateCard(_currentPrize.label);

      hide();

      /*if (remaining === 0) {
        alert(`¡Premio reclamado! 🎉\n\nMuestra esta pantalla en cualquier sucursal Pepito.\n\n⚠️ Este fue el último "${_currentPrize.label}" disponible.`);
      } else {
        alert(`¡Premio reclamado! 🎉\n\nMuestra esta pantalla en cualquier sucursal Pepito para canjear tu "${_currentPrize.label}".`);
      }*/

      _currentPrize = null;
    }
  }

  function init() {
    //closeBtn.addEventListener('click', hide);
    claimBtn.addEventListener('click', claim);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hide();
    });
  }

  return { init, show };
})();