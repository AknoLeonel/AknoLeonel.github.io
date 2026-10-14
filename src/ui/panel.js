import { CATEGORIES } from '../data/projects.js';
import { displayHost } from '../lib/catalog.js';
import { trickle } from '../lib/progress.js';

const EXIT_MS = 220;
const SLOW_MS = 9000;

/**
 * Painel de prévia ao vivo.
 * - Lazy: o iframe só é criado ao abrir e é descartado ao fechar.
 * - Skeleton + barra de progresso enquanto o site carrega.
 * - Entrada e saída por `data-state` com transições CSS (interrompíveis).
 */
export function createPanel(root, { onOpen, onLoaded } = {}) {
  const $ = (sel) => root.querySelector(sel);
  const frameBox = $('.frame');
  const bar = $('.progress > i');
  const note = $('.frame-note');
  const closeBtn = $('[data-close]');
  let iframe = null;
  let timer = 0;
  let slowTimer = 0;
  let lastFocus = null;
  let progress = 0;
  let openedAt = 0;

  function setProgress(v) {
    progress = v;
    bar.style.transform = `scaleX(${v})`;
  }

  function stopProgress() {
    clearInterval(timer);
    clearTimeout(slowTimer);
  }

  function open(project) {
    lastFocus = root.ownerDocument.activeElement;
    const cat = CATEGORIES[project.cat];
    root.style.setProperty('--c', cat.color);
    $('[data-name]').textContent = project.name;
    $('[data-what]').textContent = project.what;
    $('[data-go]').href = project.url;
    $('[data-meta]').replaceChildren(
      ...[cat.label, project.stack, displayHost(project.url)].map((t) => {
        const s = root.ownerDocument.createElement('span');
        s.textContent = t;
        return s;
      }),
    );

    if (iframe) iframe.remove();
    frameBox.dataset.state = 'loading';
    note.textContent = '';
    setProgress(0.08);
    stopProgress();
    timer = setInterval(() => setProgress(trickle(progress)), 160);
    slowTimer = setTimeout(() => {
      note.textContent = 'A prévia está demorando. Use “Abrir site” para ver em uma nova aba.';
    }, SLOW_MS);

    iframe = root.ownerDocument.createElement('iframe');
    iframe.title = `Prévia do site ${project.name}`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    // o site externo não pode navegar a página principal nem abrir popups sem ação do usuário
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    openedAt = performance.now();
    iframe.addEventListener('load', () => {
      stopProgress();
      setProgress(1);
      frameBox.dataset.state = 'ready';
      note.textContent = '';
      onLoaded?.(project, performance.now() - openedAt);
    });
    iframe.src = project.url;
    frameBox.appendChild(iframe);

    root.hidden = false;
    // força o estilo inicial antes de entrar, para a transição acontecer
    void root.offsetWidth;
    root.dataset.state = 'open';
    closeBtn.focus({ preventScroll: true });
    onOpen?.(project);
  }

  function finishClose() {
    root.dataset.state = 'closed';
    root.hidden = true;
    iframe?.remove();
    iframe = null;
  }

  /** `instant` fecha sem animação (ações de teclado nunca animam). */
  function close({ instant = false } = {}) {
    if (root.dataset.state !== 'open') return;
    stopProgress();
    if (instant) {
      finishClose();
    } else {
      root.dataset.state = 'closing';
      setTimeout(() => {
        if (root.dataset.state === 'closing') finishClose();
      }, EXIT_MS);
    }
    lastFocus?.focus?.({ preventScroll: true });
  }

  closeBtn.addEventListener('click', () => close());
  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });
  root.ownerDocument.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close({ instant: true });
  });

  return { open, close, isOpen: () => root.dataset.state === 'open' };
}
