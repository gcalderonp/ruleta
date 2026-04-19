/**
 * confetti.js — Confetti burst animation on win
 */

const Confetti = (() => {
  const COLORS = [
    '#00a3b4', // primary
    '#3dbcca', // light primary
    '#8a8a8d', // gray
    '#1e2a26', // dark
    '#c7d8db', // soft light
    '#6a7d79'  // muted tone
  ];

  function launch() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < 90; i++) {
      const el    = document.createElement('div');
      el.className = 'confetti-piece';

      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size   = Math.random() * 10 + 6;
      const left   = Math.random() * 100;
      const delay  = Math.random() * 1.2;
      const dur    = Math.random() * 2 + 2;
      const radius = Math.random() > 0.5 ? '50%' : '2px';

      el.style.cssText = [
        `left: ${left}vw`,
        `width: ${size}px`,
        `height: ${size}px`,
        `background: ${color}`,
        `animation-duration: ${dur}s`,
        `animation-delay: ${delay}s`,
        `border-radius: ${radius}`,
      ].join('; ');

      container.appendChild(el);
    }

    /* Clean up after animation */
    setTimeout(() => { container.innerHTML = ''; }, 4500);
  }

  return { launch };
})();