/** Lógica pura do catálogo: sem DOM. */

/** Projetos visíveis para a categoria ativa (null = todas). */
export function filterProjects(projects, category) {
  if (!category) return projects.slice();
  return projects.filter((p) => p.cat === category);
}

/** Quantidade de projetos por categoria, na ordem das categorias. */
export function countByCategory(projects, categories) {
  const counts = {};
  for (const key of Object.keys(categories)) counts[key] = 0;
  for (const p of projects) if (p.cat in counts) counts[p.cat] += 1;
  return counts;
}

/** Alterna o filtro: clicar na categoria ativa volta para "todas". */
export function toggleCategory(active, clicked) {
  return active === clicked ? null : clicked;
}

/** Domínio legível de uma URL, sem protocolo nem barra final. */
export function displayHost(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
