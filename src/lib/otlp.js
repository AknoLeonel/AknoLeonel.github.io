/**
 * Monta payloads OTLP/HTTP JSON (OpenTelemetry) sem dependências e sem DOM.
 * Datadog, New Relic, Grafana e o OpenTelemetry Collector aceitam este formato.
 */

const HEX = '0123456789abcdef';

/** id hexadecimal aleatório com `bytes` bytes (trace = 16, span = 8). */
export function randomId(bytes, random = Math.random) {
  let out = '';
  for (let i = 0; i < bytes * 2; i++) out += HEX[Math.floor(random() * 16)];
  return out;
}

/** Converte milissegundos de época para nanossegundos em string, como o OTLP exige. */
export function msToNanos(ms) {
  return `${BigInt(Math.round(ms * 1000)) * 1000n}`;
}

function toAnyValue(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
  if (typeof value === 'boolean') return { boolValue: value };
  return { stringValue: String(value) };
}

/** Atributos { chave: valor } no formato de lista do OTLP, ignorando valores vazios. */
export function toAttributes(obj = {}) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([key, value]) => ({ key, value: toAnyValue(value) }));
}

/** Um span concluído. `start` e `end` em ms de época. */
export function buildSpan({ name, start, end, attributes, traceId, spanId, random }) {
  return {
    traceId: traceId || randomId(16, random),
    spanId: spanId || randomId(8, random),
    name,
    kind: 1,
    startTimeUnixNano: msToNanos(start),
    endTimeUnixNano: msToNanos(Math.max(end, start)),
    attributes: toAttributes(attributes),
    status: { code: 1 },
  };
}

/** Envelope `resourceSpans` pronto para POST em `<endpoint>/v1/traces`. */
export function buildTracesPayload(spans, resource) {
  return {
    resourceSpans: [
      {
        resource: { attributes: toAttributes(resource) },
        scopeSpans: [{ scope: { name: 'aknoleonel-portfolio', version: '1.0.0' }, spans }],
      },
    ],
  };
}

/** URL de traces a partir do endpoint base (com ou sem barra final). */
export function tracesUrl(endpoint) {
  return `${endpoint.replace(/\/+$/, '')}/v1/traces`;
}
