/**
 * wheel.js — Roulette wheel rendering & spin animation
 */

const Wheel = (() => {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');

  let activePrizes = [];
  let currentAngle = 0;
  let spinning = false;
  let hubRadius = 0;
  let hubClickHandler = null;
  let audioUnlocked = false;

  /* 🔊 SONIDO */
  const tickSound = new Audio('./sounds/tick.mp3');
  tickSound.preload = 'auto';
  tickSound.volume = 0.55;

  tickSound.addEventListener('canplaythrough', () => {
    console.log('✅ tick cargado correctamente');
  });

  tickSound.addEventListener('error', (e) => {
    console.log('❌ error cargando tick', e);
  });

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    try {
      tickSound.volume = 0;
      tickSound.currentTime = 0;

      const p = tickSound.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          tickSound.pause();
          tickSound.currentTime = 0;
          tickSound.volume = 0.55;
        }).catch(() => {
          tickSound.volume = 0.55;
        });
      } else {
        tickSound.pause();
        tickSound.currentTime = 0;
        tickSound.volume = 0.55;
      }
    } catch {
      tickSound.volume = 0.55;
    }
  }

  function stopTickSound() {
    try {
      tickSound.pause();
      tickSound.currentTime = 0;
      tickSound.playbackRate = 1;
    } catch {}
  }

  /* ── Resize ── */
  function resize() {
    const size = canvas.parentElement.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    draw(currentAngle);
  }

  function updatePrizes(prizes) {
    activePrizes = prizes;
    draw(currentAngle);
  }

  /* ── Draw ── */
  function draw(angle) {
    const n = activePrizes.length;
    if (n === 0) {
      drawEmpty();
      return;
    }

    const arc = (2 * Math.PI) / n;
    //const size = canvas.clientWidth;
    const size = Math.min(
                  canvas.parentElement.clientWidth,
                  canvas.parentElement.clientHeight
                );
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < n; i++) {
      const start = angle + i * arc;
      const end = start + arc;
      const prize = activePrizes[i];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = prize.border;
      ctx.lineWidth = 2.5;
      ctx.stroke();

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

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 2;

      //const fontSize = Math.max(10, size * 0.038);
      const fontSize = Math.max(12, size * 0.045);
      ctx.font = `bold ${fontSize}px 'DM Sans', sans-serif`;

      const words = prize.label.split(' ');
      const textX = r * 0.62;

      if (words.length === 1) {
        ctx.fillText(prize.label, textX, 0);
      } else if (words.length === 2) {
        ctx.fillText(words[0], textX, -fontSize * 0.6);
        ctx.fillText(words[1], textX, fontSize * 0.7);
      } else {
        ctx.fillText(words.slice(0, 2).join(' '), textX, -fontSize * 0.6);
        ctx.fillText(words.slice(2).join(' '), textX, fontSize * 0.7);
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    const hubR = r * 0.12;
    hubRadius = hubR + 4;

    ctx.beginPath();
    ctx.arc(cx, cy, hubR + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#07090f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,197,24,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = '#f5c518';
    ctx.fill();

    ctx.font = `bold ${hubR * 0.72}px 'Bebas Neue', cursive`;
    ctx.fillStyle = '#07090f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GIRA', cx, cy + 1);
  }

  function drawEmpty() {
    const size = canvas.clientWidth;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 1;

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

  function isClickOnHub(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const size = canvas.clientWidth;
    const cx = size / 2;
    const cy = size / 2;

    const dx = x - cx;
    const dy = y - cy;
    return Math.sqrt(dx * dx + dy * dy) <= hubRadius;
  }

  function onHubClick(callback) {
    hubClickHandler = callback;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function normalizeAngle(angle) {
    const full = Math.PI * 2;
    return ((angle % full) + full) % full;
  }

  function getPrizeUnderPointer(prizes, angle) {
    const n = prizes.length;
    const arc = (2 * Math.PI) / n;
    const pointerAngle = -Math.PI / 2;

    const relative = normalizeAngle(pointerAngle - angle);
    const index = Math.floor(relative / arc) % n;

    return {
      index,
      prize: prizes[index]
    };
  }

  /* 🔊 sonido desacelerado, sin solaparse */
  function playTick(progress) {
    try {
      tickSound.pause();
      tickSound.currentTime = 0;
      tickSound.playbackRate = 1 - progress * 0.15;
      tickSound.volume = 0.55;
      tickSound.play().catch(() => {});
    } catch {}
  }

  /* ── Spin ── */
  function spin(prizes, onComplete) {
    if (spinning || prizes.length === 0) return;

    unlockAudio();
    stopTickSound();

    spinning = true;
    activePrizes = prizes;

    const n = prizes.length;
    const arc = (2 * Math.PI) / n;
    const winIndex = Math.floor(Math.random() * n);
    const spins = 6 + Math.random() * 4;

    const pointerAngle = -Math.PI / 2;
    const targetAngle = winIndex * arc + arc / 2;
    const normalizedCurrent =
      ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    const totalDelta =
      spins * 2 * Math.PI + (pointerAngle - targetAngle - normalizedCurrent);

    const totalAngle = currentAngle + totalDelta;

    const duration = 4200 + Math.random() * 1200;
    const startAngle = currentAngle;
    const startTime = performance.now();

    let lastTickAt = 0;

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      currentAngle = startAngle + easeOut(t) * (totalAngle - startAngle);
      draw(currentAngle);

      const tickInterval = 40 + Math.pow(t, 2.2) * 180;

      if (elapsed - lastTickAt >= tickInterval && t < 1) {
        playTick(t);
        lastTickAt = elapsed;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        currentAngle = totalAngle;
        draw(currentAngle);
        spinning = false;

        stopTickSound();

        const landed = getPrizeUnderPointer(prizes, currentAngle);

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
    tickSound.load();

    window.addEventListener('resize', resize);

    canvas.addEventListener('click', (e) => {
      unlockAudio();

      if (!isClickOnHub(e)) return;
      if (spinning) return;

      if (typeof hubClickHandler === 'function') {
        hubClickHandler();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      canvas.style.cursor = isClickOnHub(e) ? 'pointer' : 'default';
    });
  }

  return { init, spin, updatePrizes, onHubClick };
})();