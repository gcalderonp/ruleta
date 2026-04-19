/**
 * wheel.js — Roulette wheel rendering & spin animation
 * Trabaja con los premios que se le pasen (solo los disponibles).
 */

const Wheel = (() => {
  const canvas = document.getElementById('wheelCanvas');
  const ctx    = canvas.getContext('2d');

  let activePrizes = [];
  let currentAngle = 0;
  let spinning     = false;

  /* ── Resize canvas to its wrapper ── */
  function resize() {
    const size    = canvas.parentElement.clientWidth;
    canvas.width  = size;
    canvas.height = size;
    draw(currentAngle);
  }

  /* ── Actualizar premios activos y redibujar ── */
  function updatePrizes(prizes) {
    activePrizes = prizes;
    draw(currentAngle);
  }

  /* ── Draw the full wheel ── */
  function draw(angle) {
    const n    = activePrizes.length;
    if (n === 0) { drawEmpty(); return; }

    const arc  = (2 * Math.PI) / n;
    const size = canvas.width;
    const cx   = size / 2;
    const cy   = size / 2;
    const r    = size / 2 - 2;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < n; i++) {
      const start = angle + i * arc;
      const end   = start + arc;
      const prize = activePrizes[i];

      /* Segment */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle   = prize.color;
      ctx.fill();
      ctx.strokeStyle = prize.border;
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      /* Sheen */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.clip();
      const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
      g.addColorStop(0, 'rgba(255,255,255,0.07)');
      g.addColorStop(1, 'rgba(0,0,0,0.10)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();

      /* Label */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = '#ffffff';
      ctx.shadowColor  = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur   = 5;

      const fontSize = Math.max(10, size * 0.038);
      ctx.font = `bold ${fontSize}px 'DM Sans', sans-serif`;

      const words = prize.label.split(' ');
      const textX = r * 0.62;

      if (words.length === 1) {
        ctx.fillText(prize.label, textX, 0);
      } else if (words.length === 2) {
        ctx.fillText(words[0], textX, -fontSize * 0.6);
        ctx.fillText(words[1], textX,  fontSize * 0.7);
      } else {
        ctx.fillText(words.slice(0, 2).join(' '), textX, -fontSize * 0.6);
        ctx.fillText(words.slice(2).join(' '),    textX,  fontSize * 0.7);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    /* Center hub */
    const hubR = r * 0.12;
    ctx.beginPath();
    ctx.arc(cx, cy, hubR + 4, 0, Math.PI * 2);
    ctx.fillStyle   = '#07090f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,197,24,0.3)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c518';
    ctx.fill();

    ctx.font         = `bold ${hubR * 1.1}px 'Bebas Neue', cursive`;
    ctx.fillStyle    = '#07090f';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, cy + 1);
  }

  function drawEmpty() {
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 2;
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,197,24,0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = `bold ${size * 0.08}px 'DM Sans', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😢', cx, cy - 16);
    ctx.font = `${size * 0.05}px 'DM Sans', sans-serif`;
    ctx.fillText('Agotado', cx, cy + 22);
  }

  /* ── Easing ── */
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function getPrizeUnderPointer(prizes, angle) {
  const n = prizes.length;
  const arc = (2 * Math.PI) / n;

  // Flecha arriba. Si luego ves que sigue corrido,
  // ajusta este valor un poco: -Math.PI / 2 + 0.1, etc.
  const pointerAngle = -Math.PI / 2;

  const relative = normalizeAngle(pointerAngle - angle);
  const index = Math.floor(relative / arc) % n;

  return {
    index,
    prize: prizes[index]
  };
}

  /* ── Spin ── */
function spin(prizes, onComplete) {
  if (spinning || prizes.length === 0) return;
  spinning = true;
  activePrizes = prizes;

  const n = prizes.length;
  const arc = (2 * Math.PI) / n;
  const winIndex = Math.floor(Math.random() * n);
  const spins = 6 + Math.random() * 4;

  const pointerAngle = -Math.PI / 2;
  const targetAngle = winIndex * arc + arc / 2;
  const normalizedCurrent = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  const totalDelta = spins * 2 * Math.PI + (pointerAngle - targetAngle - normalizedCurrent);
  const totalAngle = currentAngle + totalDelta;

  const duration = 4200 + Math.random() * 1200;
  const startAngle = currentAngle;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    currentAngle = startAngle + easeOut(t) * (totalAngle - startAngle);
    draw(currentAngle);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      currentAngle = totalAngle;
      draw(currentAngle);
      spinning = false;

      const landed = getPrizeUnderPointer(prizes, currentAngle);

      console.log('Índice sorteado:', winIndex, prizes[winIndex]?.label);
      console.log('Índice real bajo flecha:', landed.index, landed.prize?.label);

      if (typeof onComplete === 'function') {
        setTimeout(() => onComplete(landed.prize), 450);
      }
    }
  }

  requestAnimationFrame(frame);
}

  function init() {
    activePrizes = Stock.getAvailable();
    resize();
    window.addEventListener('resize', resize);
  }

  return { init, spin, updatePrizes };
})();