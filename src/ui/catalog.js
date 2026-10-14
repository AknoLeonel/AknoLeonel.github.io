import { countByCategory, filterProjects, toggleCategory } from '../lib/catalog.js';

/**
 * Lista de projetos e filtros.
 * O HTML já traz linhas skeleton; aqui elas são substituídas pelos dados.
 * Filtrar é uma interação frequente, então a troca é instantânea (sem animação).
 */
export function createCatalog({ list, filters, legend }, { projects, categories, onSelect, onFilter }) {
  const doc = list.ownerDocument;
  let active = null;

  const rows = projects.map((p) => {
    const li = doc.createElement('li');
    li.dataset.cat = p.cat;
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.style.setProperty('--c', categories[p.cat].color);
    for (const [cls, text] of [
      ['dot', ''],
      ['name', p.name],
      ['what', p.what],
      ['stack', p.stack],
      ['view', 'Ver prévia'],
    ]) {
      const span = doc.createElement('span');
      span.className = cls;
      span.textContent = text;
      btn.appendChild(span);
    }
    btn.addEventListener('click', () => onSelect(p));
    li.appendChild(btn);
    return li;
  });
  list.replaceChildren(...rows);
  list.removeAttribute('aria-busy');

  const counts = countByCategory(projects, categories);
  const buttons = [];

  function makeButton(container, key, label, count) {
    const b = doc.createElement('button');
    b.type = 'button';
    if (key) b.dataset.cat = key;
    b.setAttribute('aria-pressed', String(key === null));
    b.textContent = label;
    if (count !== undefined) {
      const em = doc.createElement('em');
      em.textContent = String(count);
      b.append(' ', em);
    }
    if (container === legend && key) b.style.setProperty('--c', categories[key].color);
    b.addEventListener('click', () => set(key === null ? null : toggleCategory(active, key)));
    container.appendChild(b);
    buttons.push(b);
  }

  makeButton(filters, null, 'Todos');
  for (const [key, cat] of Object.entries(categories)) {
    makeButton(filters, key, cat.label, counts[key]);
    if (legend) makeButton(legend, key, cat.label);
  }

  function set(category) {
    active = category;
    const visible = new Set(filterProjects(projects, category));
    rows.forEach((li, i) => {
      li.hidden = !visible.has(projects[i]);
    });
    for (const b of buttons) {
      const key = b.dataset.cat || null;
      b.setAttribute('aria-pressed', String(key === category));
    }
    onFilter?.(category);
  }

  return { set, active: () => active };
}
