/**
 * stock.js — Prize inventory manager
 *
 * Persiste el stock de cada premio en localStorage.
 * La clave usada es: "pepito_stock_v1"
 *
 * Flujo:
 *  1. Al cargar, si no existe la clave → inicializa desde PRIZES[].stock
 *  2. Expone getAvailable()  → devuelve solo premios con stock > 0
 *  3. Expone consume(label)  → descuenta 1 unidad y guarda
 *  4. Expone getStock(label) → stock actual de un premio
 *  5. Expone reset()         → restaura todos los stocks al valor inicial (data.js)
 */

const Stock = (() => {
  const STORAGE_KEY = 'pepito_stock_v1';

  /* ── Helpers de localStorage ── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Stock: no se pudo guardar en localStorage', e);
    }
  }

  /* ── Inicialización ── */
  function init() {
    const existing = load();

    if (!existing) {
      /* Primera vez: cargar stock inicial desde data.js */
      const initial = {};
      PRIZES.forEach(p => { initial[p.label] = p.stock; });
      save(initial);
      return initial;
    }

    /* Si se agregaron premios nuevos en data.js que no están en storage */
    let updated = false;
    PRIZES.forEach(p => {
      if (!(p.label in existing)) {
        existing[p.label] = p.stock;
        updated = true;
      }
    });
    if (updated) save(existing);

    return existing;
  }

  /* ── API pública ── */

  /** Devuelve los premios que aún tienen stock > 0 */
  function getAvailable() {
    const stocks = load() || init();
    return PRIZES.filter(p => (stocks[p.label] ?? 0) > 0);
  }

  /** Stock actual de un premio por label */
  function getStock(label) {
    const stocks = load() || init();
    return stocks[label] ?? 0;
  }

  /** Descuenta 1 unidad. Devuelve el stock restante (-1 si ya estaba en 0). */
  function consume(label) {
    const stocks = load() || init();
    if ((stocks[label] ?? 0) <= 0) return -1;
    stocks[label] -= 1;
    save(stocks);
    return stocks[label];
  }

  /** Restaura todos los stocks al valor definido en data.js */
  function reset() {
    const initial = {};
    PRIZES.forEach(p => { initial[p.label] = p.stock; });
    save(initial);
  }

  /** Devuelve un objeto { label → stock } para mostrar en el panel admin */
  function getAll() {
    return load() || init();
  }

  /* Inicializar al cargar el módulo */
  init();

  return { getAvailable, getStock, consume, reset, getAll };
})();