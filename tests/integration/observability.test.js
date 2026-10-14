// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OBSERVABILITY } from '../../src/config.js';
import { initObservability } from '../../src/observability.js';

const project = { name: 'Oficina Guará', url: 'https://oficina-guara.vercel.app', cat: 'auto' };
const base = { ...OBSERVABILITY, SENTRY_DSN: '', OTEL_ENDPOINT: '' };

function fakeWindow() {
  const fetch = vi.fn(() => Promise.resolve({ ok: true }));
  const observers = [];
  class PerformanceObserver {
    constructor(cb) {
      this.cb = cb;
      observers.push(this);
    }
    observe(opts) {
      this.type = opts.type;
    }
  }
  window.fetch = fetch;
  window.matchMedia = () => ({ matches: false });
  window.PerformanceObserver = PerformanceObserver;
  return { win: window, fetch, observers };
}

const sentSpans = (fetch) => fetch.mock.calls.flatMap(([, init]) => JSON.parse(init.body).resourceSpans[0].scopeSpans[0].spans);

describe('observabilidade', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    Reflect.deleteProperty(window, 'Sentry');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('o padrão do repositório vem desligado', () => {
    expect(OBSERVABILITY.SENTRY_DSN).toBe('');
    expect(OBSERVABILITY.OTEL_ENDPOINT).toBe('');
  });

  it('desligada: não carrega scripts nem envia nada', () => {
    const { win, fetch } = fakeWindow();
    const obs = initObservability(base, win);
    obs.previewLoaded(project, 300);
    obs.flush();
    expect(document.querySelector('script')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('com DSN: carrega o Sentry e inicia com a configuração', () => {
    const { win } = fakeWindow();
    initObservability({ ...base, SENTRY_DSN: 'https://abc@o1.ingest.sentry.io/1' }, win);
    const script = document.querySelector('script');
    expect(script.src).toMatch(/browser\.sentry-cdn\.com\/[\d.]+\/bundle\.tracing\.min\.js/);
    const init = vi.fn();
    win.Sentry = { init, browserTracingIntegration: () => 'tracing' };
    script.onload();
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ dsn: 'https://abc@o1.ingest.sentry.io/1', environment: 'production', integrations: ['tracing'] }));
  });

  it('falha ao iniciar o Sentry não quebra o site', () => {
    const { win } = fakeWindow();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    initObservability({ ...base, SENTRY_DSN: 'x' }, win);
    win.Sentry = {
      init() {
        throw new Error('boom');
      },
    };
    expect(() => document.querySelector('script').onload()).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it('captureError repassa ao Sentry quando ativo e é seguro sem ele', () => {
    const { win } = fakeWindow();
    const obs = initObservability(base, win);
    expect(() => obs.captureError(new Error('x'))).not.toThrow();
    win.Sentry = { captureException: vi.fn() };
    const err = new Error('y');
    obs.captureError(err);
    expect(win.Sentry.captureException).toHaveBeenCalledWith(err);
  });

  it('com OTLP: envia o span de carga da prévia para /v1/traces', () => {
    const { win, fetch } = fakeWindow();
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com', OTEL_HEADERS: { 'x-key': 'k' } }, win);
    obs.previewLoaded(project, 420);
    obs.flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://otel.exemplo.com/v1/traces');
    expect(init.method).toBe('POST');
    expect(init.keepalive).toBe(true);
    expect(init.headers['x-key']).toBe('k');
    const payload = JSON.parse(init.body);
    const resource = Object.fromEntries(payload.resourceSpans[0].resource.attributes.map((a) => [a.key, a.value.stringValue ?? a.value.boolValue]));
    expect(resource['service.name']).toBe('aknoleonel-portfolio');
    const [span] = sentSpans(fetch);
    expect(span.name).toBe('preview.load');
    expect(BigInt(span.endTimeUnixNano) - BigInt(span.startTimeUnixNano)).toBe(420000000n);
  });

  it('flush sem nada na fila não envia', () => {
    const { win, fetch } = fakeWindow();
    initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win).flush();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('envia em lotes de 10 spans', () => {
    const { win, fetch } = fakeWindow();
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    for (let i = 0; i < 10; i++) obs.previewLoaded(project, 100);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(sentSpans(fetch)).toHaveLength(10);
  });

  it('erro de rede no envio é ignorado', async () => {
    const { win, fetch } = fakeWindow();
    fetch.mockImplementation(() => Promise.reject(new Error('offline')));
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    obs.previewLoaded(project, 100);
    expect(() => obs.flush()).not.toThrow();
    await Promise.resolve();
  });

  it('fetch que lança na hora também é ignorado', () => {
    const { win, fetch } = fakeWindow();
    fetch.mockImplementation(() => {
      throw new Error('sync');
    });
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    obs.previewLoaded(project, 100);
    expect(() => obs.flush()).not.toThrow();
  });

  it('registra Web Vitals (LCP e CLS) e envia ao esconder a página', () => {
    const { win, fetch, observers } = fakeWindow();
    initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    const lcp = observers.find((o) => o.type === 'largest-contentful-paint');
    const cls = observers.find((o) => o.type === 'layout-shift');
    lcp.cb({ getEntries: () => [{ startTime: 900 }, { startTime: 1234 }] });
    cls.cb({
      getEntries: () => [
        { value: 0.05, hadRecentInput: false },
        { value: 0.5, hadRecentInput: true },
      ],
    });
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    const span = sentSpans(fetch).find((s) => s.name === 'web_vitals');
    const attrs = Object.fromEntries(span.attributes.map((a) => [a.key, a.value.intValue ?? a.value.doubleValue]));
    expect(attrs['web_vitals.lcp_ms']).toBe('1234');
    expect(attrs['web_vitals.cls']).toBe(0.05);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('ignora a troca de visibilidade quando a página continua visível', () => {
    const { win, fetch } = fakeWindow();
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    obs.previewLoaded(project, 100);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('registra a carga da página a partir da Navigation Timing', () => {
    const { win, fetch } = fakeWindow();
    win.performance.getEntriesByType = () => [{ loadEventEnd: 800, responseStart: 120, domInteractive: 400 }];
    const obs = initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win);
    win.dispatchEvent(new Event('load'));
    obs.flush();
    const span = sentSpans(fetch).find((s) => s.name === 'page.load');
    expect(span.attributes.find((a) => a.key === 'timing.ttfb_ms').value.intValue).toBe('120');
  });

  it('navegador sem PerformanceObserver não quebra', () => {
    const { win } = fakeWindow();
    win.PerformanceObserver = class {
      observe() {
        throw new Error('sem suporte');
      }
    };
    expect(() => initObservability({ ...base, OTEL_ENDPOINT: 'https://otel.exemplo.com' }, win)).not.toThrow();
  });
});
