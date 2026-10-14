/**
 * Configuração pública de observabilidade.
 * Vazio = desligado. Preencha e abra um PR (ver AGENTS.md §4).
 *
 * - SENTRY_DSN: Sentry → Settings → Projects → (projeto) → Client Keys (DSN).
 *   A DSN é pública por natureza; não coloque tokens de API aqui.
 * - OTEL_ENDPOINT: coletor OTLP/HTTP que aceite CORS do navegador, por exemplo:
 *   OpenTelemetry Collector próprio, Grafana Cloud OTLP, ou o endpoint OTLP
 *   do Datadog / New Relic atrás de um collector.
 * - OTEL_HEADERS: cabeçalhos públicos de ingestão do coletor, se ele exigir.
 */
export const OBSERVABILITY = {
  SENTRY_DSN: '',
  SENTRY_TRACES_SAMPLE_RATE: 0.2,
  OTEL_ENDPOINT: '',
  OTEL_HEADERS: {},
  SERVICE_NAME: 'aknoleonel-portfolio',
  ENVIRONMENT: 'production',
};
