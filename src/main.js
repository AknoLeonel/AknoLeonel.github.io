import { OBSERVABILITY } from './config.js';
import { CATEGORIES, PROJECTS } from './data/projects.js';
import { initObservability } from './observability.js';
import { createCatalog } from './ui/catalog.js';
import { createPanel } from './ui/panel.js';
import { revealOnScroll } from './ui/reveal.js';
import { createSky } from './ui/sky.js';

const doc = document;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const obs = initObservability(OBSERVABILITY);

const panel = createPanel(doc.getElementById('panel'), { onLoaded: obs.previewLoaded });

const sky = createSky(doc.getElementById('sky'), doc.getElementById('tip'), {
  projects: PROJECTS,
  categories: CATEGORIES,
  reducedMotion,
  onSelect: panel.open,
});

createCatalog(
  {
    list: doc.getElementById('catalog'),
    filters: doc.getElementById('filters'),
    legend: doc.getElementById('legend'),
  },
  {
    projects: PROJECTS,
    categories: CATEGORIES,
    onSelect: panel.open,
    onFilter: sky.setActive,
  },
);

revealOnScroll(doc, { reducedMotion });
doc.documentElement.dataset.ready = 'true';
