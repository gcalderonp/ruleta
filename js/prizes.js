/**
 * prizes.js — Builds the prizes grid from PRIZES data
 * Shows remaining stock badge on each card.
 * Cards with 0 stock appear greyed-out as "Agotado".
 */

const PrizesGrid = (() => {

  function stockBadge(stock) {
    if (stock <= 0) {
      return `<span class="stock-badge stock-empty">Agotado</span>`;
    }
    if (stock <= 5) {
      return `<span class="stock-badge stock-low">¡Últimos ${stock}!</span>`;
    }
    return `<span class="stock-badge stock-ok">${stock} disponibles</span>`;
  }

  function build() {
    const grid = document.getElementById('prizesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const stocks = Stock.getAll();

    PRIZES.forEach(prize => {
      const remaining = stocks[prize.label] ?? 0;
      const card = document.createElement('div');
      card.className = `prize-card${remaining <= 0 ? ' prize-card--empty' : ''}`;
      card.dataset.label = prize.label;

      card.innerHTML = `
        <div class="prize-icon-wrap"
             style="background:${prize.color}; border: 1px solid ${prize.border};">
          ${prize.icon}
        </div>
        <div class="prize-info">
          <div class="prize-name">${prize.label}</div>
          <div class="prize-desc">${prize.desc}</div>
          ${stockBadge(remaining)}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /** Refresca el badge de stock de una tarjeta específica sin redibujar todo */
  function updateCard(label) {
    const card = document.querySelector(`.prize-card[data-label="${label}"]`);
    if (!card) return;

    const remaining = Stock.getStock(label);
    const badge = card.querySelector('.stock-badge');
    if (badge) badge.outerHTML = stockBadge(remaining);

    if (remaining <= 0) card.classList.add('prize-card--empty');
  }

  return { build, updateCard };
})();