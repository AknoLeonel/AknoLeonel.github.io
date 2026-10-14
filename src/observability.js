import { buildSpan, buildTracesPayload, tracesUrl } from './lib/otlp.js';

const SENTRY_BUNDLE = 'https://browser.sentry-cdn.com/11.7.0/bundle.tracing.min.js';

/**
 * Liga Sentry (erros) e OpenTelemetry (traces de carga e Web Vitals) quando
 * configurados. Sem configuração, devolve funções que não fazem nada.
 * Nunca deixa uma falha de observabilidade quebrar o site.
 */
export function initObservability(config, win = window) {
  const doc = win.document;
  const otel = Boolean(config.OTEL_ENDPOINT);
  const resource = {
    'service.name': config.SERVICE_NAME,
    'deployment.environment': config.ENVIRONMENT,
    'browser.language': win.navigator.language,
    'browser.mobile': win.matchMedia('(max-width: 700px)').matches,
  };
  let queue = [];

  if (config.SENTRY_DSN) {
    const s = doc.createElement('script');
    s.src = SENTRY_BUNDLE;
    s.crossOrigin = 'anonymous';
    s.async = true;
    s.onload = () => {
      try {
        win.Sentry?.init({
          dsn: config.SENTRY_DSN,
          environment: config.ENVIRONMENT,
          integrations: win.Sentry.browserTracingIntegration ? [win.Sentry.browserTracingIntegration()] : [],
          tracesSampleRate: config.SENTRY_TRACES_SAMPLE_RATE,
        });
      } catch (err) {
        console.warn('[observabilidade] Sentry não iniciou', err);
      }
    };
    doc.head.appendChild(s);
  }

  function flush() {
    if (!otel || queue.length === 0) return;
    const body = JSON.stringify(buildTracesPayload(queue, resource));
    queue = [];
    try {
      win
        .fetch(tracesUrl(config.OTEL_ENDPOINT), {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json', ...config.OTEL_HEADERS },
          body,
        })
        .catch(() => {});
    } catch {
      // envio é melhor esforço
    }
  }

  function span(name, start, end, attributes) {
    if (!otel) return;
    queue.push(buildSpan({ name, start, end, attributes }));
    if (queue.length >= 10) flush();
  }

  const origin = win.performance.timeOrigin;

  if (otel) {
    // Carga da página a partir da Navigation Timing
    win.addEventListener('load', () => {
      const nav = win.performance.getEntriesByType?.('navigation')?.[0];
      if (nav) {
        span('page.load', origin, origin + nav.loadEventEnd, {
          'page.path': win.location.pathname,
          'timing.ttfb_ms': Math.round(nav.responseStart),
          'timing.dom_interactive_ms': Math.round(nav.domInteractive),
        });
      }
    });

    // Web Vitals: LCP e CLS
    let lcp = 0;
    let cls = 0;
    try {
      new win.PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new win.PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // navegador sem suporte
    }

    doc.addEventListener('visibilitychange', () => {
      if (doc.visibilityState !== 'hidden') return;
      if (lcp) span('web_vitals', origin, origin + lcp, { 'web_vitals.lcp_ms': Math.round(lcp), 'web_vitals.cls': Number(cls.toFixed(4)) });
      flush();
    });
  }

  return {
    /** Prévia aberta: registra quanto o site do cliente levou para carregar. */
    previewLoaded(project, durationMs) {
      const end = Date.now();
      span('preview.load', end - durationMs, end, { 'project.name': project.name, 'project.url': project.url, 'project.category': project.cat });
    },
    /** Erros capturados manualmente vão para o Sentry, se ativo. */
    captureError(err) {
      win.Sentry?.captureException?.(err);
    },
    flush,
  };
}
