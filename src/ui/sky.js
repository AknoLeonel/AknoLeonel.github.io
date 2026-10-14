import { layoutStars, makeDust, pickStar } from '../lib/sky.js';

/**
 * Céu interativo em <canvas>: cada projeto é uma estrela.
 * Entrada única e orquestrada: as estrelas acendem em sequência na primeira pintura.
 * Com reduced-motion, tudo aparece pronto e o céu não cintila.
 */
export function createSky(canvas, tip, { projects, categories, reducedMotion, onSelect }) {
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dust = [];
  let stars = [];
  let hover = null;
  let active = null;
  let raf = 0;
  const t0 = performance.now();
  const INTRO_MS = 1200;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dust = makeDust(W, H);
    stars = layoutStars(projects, categories, W, H);
    requestDraw();
  }

  // ease-out exponencial para o acender das estrelas
  const easeOut = (x) => 1 - (1 - x) ** 3;

  function draw(now) {
    raf = 0;
    const t = (now - t0) / 1000;
    const intro = reducedMotion ? 1 : Math.min(1, (now - t0) / INTRO_MS);
    ctx.clearRect(0, 0, W, H);

    for (const d of dust) {
      const a = reducedMotion ? d.a : d.a * (0.65 + 0.35 * Math.sin(t * 1.3 + d.p));
      ctx.fillStyle = `rgba(232,236,255,${a * intro})`;
      ctx.fillRect(d.x, d.y, d.s, d.s);
    }

    for (const key of Object.keys(categories)) {
      const group = stars.filter((s) => s.project.cat === key);
      const dim = active && active !== key;
      ctx.strokeStyle = categories[key].color;
      ctx.globalAlpha = (dim ? 0.05 : active === key ? 0.55 : 0.22) * easeOut(intro);
      ctx.lineWidth = 1;
      ctx.beginPath();
      group.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
      ctx.stroke();
    }

    stars.forEach((st, i) => {
      // cada estrela acende com um pequeno atraso (stagger)
      const local = reducedMotion ? 1 : easeOut(Math.max(0, Math.min(1, intro * 1.6 - i * 0.03)));
      const color = categories[st.project.cat].color;
      const dim = active && active !== st.project.cat;
      const isHover = hover === st;
      const twinkle = reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(t * 2 + st.phase);
      const R = (isHover ? st.r * 1.8 : st.r) * twinkle * (0.6 + 0.4 * local);
      ctx.globalAlpha = (dim ? 0.18 : 1) * local;
      const g = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, R * 6);
      g.addColorStop(0, `${color}AA`);
      g.addColorStop(1, `${color}00`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(st.x, st.y, R * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, R * 0.55, 0, Math.PI * 2);
      ctx.fill();
      if (isHover) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(st.x, st.y, R * 2.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // o céu só fica animando enquanto está visível e sem reduced-motion
    if (!reducedMotion && visible) requestDraw();
  }

  function requestDraw() {
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function showTip(st) {
    if (!st) {
      tip.classList.remove('on');
      return;
    }
    tip.replaceChildren();
    const strong = tip.ownerDocument.createElement('strong');
    strong.textContent = st.project.name;
    const small = tip.ownerDocument.createElement('small');
    small.textContent = `${categories[st.project.cat].label}. Clique para ver`;
    tip.append(strong, st.project.what, tip.ownerDocument.createElement('br'), small);
    tip.style.left = `${Math.min(st.x + 18, W - 260)}px`;
    tip.style.top = `${Math.max(st.y - 70, 60)}px`;
    tip.classList.add('on');
  }

  function pointer(e) {
    const r = canvas.getBoundingClientRect();
    return pickStar(stars, e.clientX - r.left, e.clientY - r.top, active);
  }

  canvas.addEventListener('mousemove', (e) => {
    const st = pointer(e);
    if (st === hover) return;
    hover = st;
    showTip(st);
    canvas.style.cursor = st ? 'pointer' : 'crosshair';
    requestDraw();
  });
  canvas.addEventListener('mouseleave', () => {
    hover = null;
    showTip(null);
    requestDraw();
  });
  canvas.addEventListener('click', (e) => {
    const st = pointer(e);
    if (st) onSelect(st.project);
  });

  // lazy: para de desenhar quando o céu sai da tela
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
  }).observe(canvas);

  window.addEventListener('resize', resize);
  resize();

  return {
    setActive(cat) {
      active = cat;
      requestDraw();
    },
  };
}
