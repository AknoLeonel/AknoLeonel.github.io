import { describe, expect, it } from 'vitest';
import { buildSpan, buildTracesPayload, msToNanos, randomId, toAttributes, tracesUrl } from '../../src/lib/otlp.js';

describe('randomId', () => {
  it('gera hexadecimal com o tamanho certo', () => {
    expect(randomId(16)).toMatch(/^[0-9a-f]{32}$/);
    expect(randomId(8)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('usa a fonte de aleatoriedade injetada', () => {
    expect(randomId(2, () => 0)).toBe('0000');
    expect(randomId(2, () => 0.99)).toBe('ffff');
  });
});

describe('msToNanos', () => {
  it('converte ms de época em nanossegundos (string)', () => {
    expect(msToNanos(1)).toBe('1000000');
    expect(msToNanos(1700000000000)).toBe('1700000000000000000');
    expect(msToNanos(1.5)).toBe('1500000');
  });
});

describe('toAttributes', () => {
  it('converte cada tipo para o AnyValue do OTLP', () => {
    expect(toAttributes({ s: 'a', i: 3, d: 1.5, b: true })).toEqual([
      { key: 's', value: { stringValue: 'a' } },
      { key: 'i', value: { intValue: '3' } },
      { key: 'd', value: { doubleValue: 1.5 } },
      { key: 'b', value: { boolValue: true } },
    ]);
  });

  it('descarta valores vazios', () => {
    expect(toAttributes({ a: undefined, b: null, c: '', d: 0 })).toEqual([{ key: 'd', value: { intValue: '0' } }]);
    expect(toAttributes()).toEqual([]);
  });
});

describe('buildSpan', () => {
  it('monta um span concluído com ids, tempos e status OK', () => {
    const span = buildSpan({ name: 'preview.load', start: 1000, end: 1250, attributes: { 'project.name': 'X' }, random: () => 0.5 });
    expect(span.name).toBe('preview.load');
    expect(span.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(span.spanId).toMatch(/^[0-9a-f]{16}$/);
    expect(span.startTimeUnixNano).toBe('1000000000');
    expect(span.endTimeUnixNano).toBe('1250000000');
    expect(span.kind).toBe(1);
    expect(span.status).toEqual({ code: 1 });
    expect(span.attributes).toEqual([{ key: 'project.name', value: { stringValue: 'X' } }]);
  });

  it('respeita ids informados e nunca termina antes de começar', () => {
    const span = buildSpan({ name: 'x', start: 2000, end: 1000, traceId: 't', spanId: 's' });
    expect(span.traceId).toBe('t');
    expect(span.spanId).toBe('s');
    expect(span.endTimeUnixNano).toBe(span.startTimeUnixNano);
  });
});

describe('buildTracesPayload', () => {
  it('envolve os spans com resource e scope', () => {
    const spans = [{ name: 'a' }];
    const payload = buildTracesPayload(spans, { 'service.name': 'svc' });
    const rs = payload.resourceSpans[0];
    expect(rs.resource.attributes).toEqual([{ key: 'service.name', value: { stringValue: 'svc' } }]);
    expect(rs.scopeSpans[0].scope.name).toBe('aknoleonel-portfolio');
    expect(rs.scopeSpans[0].spans).toBe(spans);
  });
});

describe('tracesUrl', () => {
  it('acrescenta /v1/traces com ou sem barra final', () => {
    expect(tracesUrl('https://otel.exemplo.com')).toBe('https://otel.exemplo.com/v1/traces');
    expect(tracesUrl('https://otel.exemplo.com//')).toBe('https://otel.exemplo.com/v1/traces');
  });
});
