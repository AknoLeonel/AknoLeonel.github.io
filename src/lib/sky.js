/** Geometria do céu de estrelas: lógica pura, sem DOM. */

/** Gerador pseudoaleatório determinístico (Park–Miller). */
export function createRng(seed = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const MOBILE_BREAKPOINT = 700;

/**
 * Posiciona cada projeto como uma estrela em torno do centro da sua constelação.
 * Retorna [{ project, x, y, r, phase }] em pixels.
 */
export function layoutStars(projects, categories, width, height) {
  const mobile = width < MOBILE_BREAKPOINT;
  const spread = mobile ? 0.16 : 0.085;
  const seen = {};
  return projects.map((project, i) => {
    const [cx0, cy0] = categories[project.cat].center;
    seen[project.cat] = (seen[project.cat] || 0) + 1;
    const k = seen[project.cat];
    const angle = k * 2.4 + i;
    const radius = spread * (0.45 + (k % 3) * 0.35);
    const cx = mobile ? cx0 * 0.8 + 0.1 : cx0;
    const cy = mobile ? cy0 * 0.78 + 0.1 : cy0;
    return {
      project,
      x: (cx + Math.cos(angle) * radius) * width,
      y: (cy + Math.sin(angle) * radius * (width / height) * 0.9) * height,
      r: project.cat === 'pessoal' ? 5 : 4,
      phase: i,
    };
  });
}

/** Poeira estelar de fundo, proporcional à área. */
export function makeDust(width, height, seed = 42) {
  const rand = createRng(seed);
  const n = Math.round((width * height) / 2600);
  return Array.from({ length: n }, () => ({
    x: rand() * width,
    y: rand() * height,
    s: rand() * 1.2 + 0.2,
    a: rand() * 0.6 + 0.15,
    p: rand() * 6.28,
  }));
}

/** Estrela mais próxima do ponteiro dentro do raio, respeitando o filtro ativo. */
export function pickStar(stars, x, y, activeCategory = null, maxDistance = 26) {
  let best = null;
  let bestD = maxDistance;
  for (const st of stars) {
    if (activeCategory && st.project.cat !== activeCategory) continue;
    const d = Math.hypot(st.x - x, st.y - y);
    if (d < bestD) {
      bestD = d;
      best = st;
    }
  }
  return best;
}
