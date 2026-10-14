# AGENTS.md

Instruções obrigatórias para **qualquer agente de IA (de qualquer modelo ou ferramenta) e qualquer pessoa** que trabalhe neste repositório. Leia antes de mudar qualquer coisa.

## 1. Fluxo de trabalho: Issue → Branch → PR → Deploy

1. **Toda tarefa começa com uma Issue.** Antes de escrever código, abra (ou encontre) uma Issue com o tipo no título:
   - `[Correção]` para bug ou informação errada
   - `[Melhoria]` para algo que já existe e vai ficar melhor
   - `[Nova função]` para algo que ainda não existe
   A Issue descreve o problema e o critério de pronto.
2. **Nunca faça commit direto na `main`.** Crie uma branch a partir da `main` atualizada:
   `fix/<assunto>`, `feat/<assunto>`, `chore/<assunto>` ou `docs/<assunto>`.
3. **Todo deploy acontece por Pull Request.** A `main` é publicada automaticamente no GitHub Pages, então fazer merge de um PR é fazer deploy.
4. **A descrição do PR menciona a Issue** com `Closes #N` (ou `Refs #N` se não a encerra). Use o modelo em `.github/pull_request_template.md`.
5. **O CI precisa passar** (lint, contrato de arquitetura, testes, e2e e cobertura) antes do merge.
6. Um PR resolve **uma** Issue. Mudanças não relacionadas viram outra Issue.
7. Mensagens de commit seguem **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`). O commitlint valida.

## 2. Estrutura do projeto

Site estático, sem etapa de build: o GitHub Pages serve a raiz da `main`.

```
index.html              página e estilos
src/
  data/projects.js      dados dos projetos (sem DOM)
  lib/                  lógica pura e testável (sem DOM)
  ui/                   componentes que mexem no DOM
  observability.js      Sentry + OpenTelemetry (opcionais)
  config.js             chaves públicas de observabilidade
  main.js               ponto de entrada
tests/unit              Vitest (lógica pura)
tests/integration       Vitest + jsdom (componentes)
tests/e2e               Playwright (desktop e mobile)
```

**Contrato de arquitetura** (`.dependency-cruiser.cjs`, verificado no CI):
- `src/data` e `src/lib` não importam nada de `src/ui`, nem usam `document` ou `window`.
- `src/ui` pode importar `src/data` e `src/lib`, nunca o contrário.
- Só `src/main.js` junta tudo. Sem dependências circulares.

## 3. Padrão de motion e carregamento

Baseado na skill [design-motion-principles](https://github.com/kylezantos/design-motion-principles). Contexto: **portfólio criativo**, então o peso maior é de Jakub (polimento) e Jhey (personalidade), e Emil vale para interações frequentes.

Toda interface precisa ter:
- **Skeleton** em qualquer conteúdo que carrega (prévias, listas, imagens). Nunca um espaço vazio.
- **Lazy loading** do que não aparece de cara: iframes só carregam ao abrir, seções fora da tela entram ao rolar e imagens usam `loading="lazy"`.
- **Entrada:** opacidade de 0 para 1, `translateY` de 8px para 0 e blur de 4px para 0, entre 350 e 450 ms, com `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`.
- **Saída:** mais sutil que a entrada, entre 180 e 250 ms, com `--ease-in: cubic-bezier(0.4, 0, 1, 1)`.
- **Carregamento e progresso:** barra de progresso ou skeleton com brilho enquanto algo carrega. Use `linear` só em progresso e em loops de carregamento.
- **Feedback de toque:** `:active { transform: scale(0.97) }` em botões.

Nunca:
- Use `ease` ou `ease-in-out` sem curva própria, ou anime a partir de `scale(0)`.
- Coloque loops que chamam atenção (pontos pulsando, botões que "respiram").
- Anime ações feitas pelo teclado ou interações de alta frequência, como os filtros. Essas são instantâneas ou têm no máximo 150 ms.
- Anime `width`, `height`, `top` ou `left`. Use apenas `transform`, `opacity`, `filter` e `clip-path`.
- Entregue animação sem o caminho para **`prefers-reduced-motion: reduce`**. Nele, troque movimento por fade curto ou por mudança instantânea.

## 4. Observabilidade

- **Sentry** captura erros de front-end. É ativado quando `SENTRY_DSN` está preenchido em `src/config.js`.
- **OpenTelemetry** envia traces e métricas (Web Vitals e tempo de carga das prévias) no formato OTLP/HTTP. É ativado quando `OTEL_ENDPOINT` está preenchido. Datadog e New Relic aceitam OTLP: aponte o endpoint para eles.
- Sem as chaves, a observabilidade fica **desligada** e o site funciona normalmente. Nunca coloque segredos no código: só a DSN pública do Sentry e endpoints públicos de coleta.

## 5. Qualidade e testes (todos rodam no CI)

| Ferramenta | Comando | O que garante |
|---|---|---|
| Biome | `npm run lint` | lint e formatação |
| dependency-cruiser | `npm run arch` | o contrato de arquitetura acima |
| Knip | `npm run knip` | nenhum arquivo, export ou dependência sem uso |
| commitlint | (CI) | Conventional Commits |
| Vitest | `npm test` | testes unitários e de integração, com cobertura |
| Playwright | `npm run e2e` | e2e em desktop e mobile, incluindo reduced-motion |
| Stryker | `npm run mutation` | qualidade dos testes por mutação (semanal e manual) |
| Codecov | (CI) | relatório de cobertura no PR |

Para rodar tudo localmente: `npm ci && npm run check`.

Toda nova função vem com teste. Toda correção vem com um teste que falharia sem ela.
