// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../src/data/projects.js';
import { createPanel } from '../../src/ui/panel.js';
import { revealOnScroll } from '../../src/ui/reveal.js';

const PANEL_HTML = `
  <button id="origem">origem</button>
  <div class="panel" id="panel" data-state="closed" hidden>
    <div class="viewer">
      <header>
        <h3 data-name></h3><p data-what></p>
        <a data-go></a><button data-close>Fechar</button>
      </header>
      <div class="progress"><i></i></div>
      <div class="frame" data-state="loading">
        <div class="frame-skeleton"></div>
        <p class="frame-note"></p>
      </div>
      <footer data-meta></footer>
    </div>
  </div>`;

describe('painel de prévia', () => {
  let root;
  let onOpen;
  let onLoaded;
  let panel;
  const project = PROJECTS[3];

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = PANEL_HTML;
    root = document.getElementById('panel');
    onOpen = vi.fn();
    onLoaded = vi.fn();
    panel = createPanel(root, { onOpen, onLoaded });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa fechado e sem iframe (lazy)', () => {
    expect(root.hidden).toBe(true);
    expect(root.querySelector('iframe')).toBeNull();
    expect(panel.isOpen()).toBe(false);
  });

  it('ao abrir preenche os dados, cria o iframe e mostra o skeleton', () => {
    document.getElementById('origem').focus();
    panel.open(project);
    expect(root.hidden).toBe(false);
    expect(root.dataset.state).toBe('open');
    expect(root.querySelector('[data-name]').textContent).toBe(project.name);
    expect(root.querySelector('[data-what]').textContent).toBe(project.what);
    expect(root.querySelector('[data-go]').getAttribute('href')).toBe(project.url);
    expect([...root.querySelectorAll('[data-meta] span')].map((s) => s.textContent)).toEqual(['Automotivo', project.stack, 'oficina-guara.vercel.app']);
    const iframe = root.querySelector('iframe');
    expect(iframe.getAttribute('src')).toBe(project.url);
    expect(iframe.title).toContain(project.name);
    expect(iframe.getAttribute('sandbox')).not.toMatch(/allow-top-navigation/);
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(root.querySelector('.frame').dataset.state).toBe('loading');
    expect(document.activeElement).toBe(root.querySelector('[data-close]'));
    expect(onOpen).toHaveBeenCalledWith(project);
  });

  it('a barra de progresso avança, mas não completa sozinha', () => {
    panel.open(project);
    const bar = root.querySelector('.progress i');
    const start = Number(bar.style.transform.match(/scaleX\((.*)\)/)[1]);
    vi.advanceTimersByTime(3000);
    const later = Number(bar.style.transform.match(/scaleX\((.*)\)/)[1]);
    expect(later).toBeGreaterThan(start);
    expect(later).toBeLessThanOrEqual(0.9);
  });

  it('quando o site carrega, completa o progresso e troca o skeleton pelo site', () => {
    panel.open(project);
    root.querySelector('iframe').dispatchEvent(new Event('load'));
    expect(root.querySelector('.progress i').style.transform).toBe('scaleX(1)');
    expect(root.querySelector('.frame').dataset.state).toBe('ready');
    expect(onLoaded).toHaveBeenCalledWith(project, expect.any(Number));
  });

  it('avisa quando a prévia demora', () => {
    panel.open(project);
    vi.advanceTimersByTime(9500);
    expect(root.querySelector('.frame-note').textContent).toMatch(/Abrir site/);
  });

  it('fecha com saída animada, descarta o iframe e devolve o foco', () => {
    const origem = document.getElementById('origem');
    origem.focus();
    panel.open(project);
    root.querySelector('[data-close]').click();
    expect(root.dataset.state).toBe('closing');
    expect(document.activeElement).toBe(origem);
    vi.advanceTimersByTime(300);
    expect(root.dataset.state).toBe('closed');
    expect(root.hidden).toBe(true);
    expect(root.querySelector('iframe')).toBeNull();
  });

  it('Esc fecha na hora, sem animação; clicar fora fecha com saída animada', () => {
    panel.open(project);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(root.dataset.state).toBe('closed');
    expect(root.hidden).toBe(true);
    expect(root.querySelector('iframe')).toBeNull();
    panel.open(project);
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(root.dataset.state).toBe('closing');
  });

  it('reabrir durante a saída cancela o fechamento', () => {
    panel.open(project);
    panel.close();
    panel.open(PROJECTS[0]);
    vi.advanceTimersByTime(300);
    expect(root.dataset.state).toBe('open');
    expect(root.hidden).toBe(false);
    expect(root.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('fechar quando já está fechado não faz nada', () => {
    panel.close();
    expect(root.dataset.state).toBe('closed');
  });
});

describe('reveal ao rolar', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section data-reveal></section><section data-reveal></section>';
  });

  it('com reduced-motion mostra tudo na hora', () => {
    revealOnScroll(document, { reducedMotion: true });
    for (const el of document.querySelectorAll('[data-reveal]')) expect(el.dataset.reveal).toBe('in');
  });

  it('sem IntersectionObserver mostra tudo na hora', () => {
    const original = window.IntersectionObserver;
    Reflect.deleteProperty(window, 'IntersectionObserver');
    revealOnScroll(document, { reducedMotion: false });
    for (const el of document.querySelectorAll('[data-reveal]')) expect(el.dataset.reveal).toBe('in');
    window.IntersectionObserver = original;
  });

  it('revela cada seção uma única vez ao entrar na tela', () => {
    let callback;
    const unobserve = vi.fn();
    window.IntersectionObserver = class {
      constructor(cb) {
        callback = cb;
      }
      observe() {}
      unobserve(el) {
        unobserve(el);
      }
    };
    revealOnScroll(document, { reducedMotion: false });
    const [a, b] = document.querySelectorAll('[data-reveal]');
    expect(a.dataset.reveal).toBe('');
    callback([
      { isIntersecting: true, target: a },
      { isIntersecting: false, target: b },
    ]);
    expect(a.dataset.reveal).toBe('in');
    expect(b.dataset.reveal).toBe('');
    expect(unobserve).toHaveBeenCalledWith(a);
    expect(unobserve).not.toHaveBeenCalledWith(b);
  });
});
