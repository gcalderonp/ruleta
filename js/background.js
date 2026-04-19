/**
 * background.js — Animated particle canvas background
 */

const Background = (() => {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  const dots   = [];

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    dots.length   = 0;

    const count = Math.floor((canvas.width * canvas.height) / 22000);

    for (let i = 0; i < count; i++) {
      dots.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.5,
        vx:    (Math.random() - 0.5) * 0.2,
        vy:    (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0)             d.x = canvas.width;
      if (d.x > canvas.width)  d.x = 0;
      if (d.y < 0)             d.y = canvas.height;
      if (d.y > canvas.height) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,197,24,${d.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  function start() {
    init();
    animate();
    window.addEventListener('resize', init);
  }

  return { start };
})();
