/** Contrato de arquitetura (ver AGENTS.md §2). */
module.exports = {
  forbidden: [
    {
      name: 'sem-ciclos',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'data-e-lib-nao-dependem-de-ui',
      comment: 'src/data e src/lib são puros e não podem importar a camada de interface.',
      severity: 'error',
      from: { path: '^src/(data|lib)/' },
      to: { path: '^src/ui/' },
    },
    {
      name: 'data-nao-depende-de-nada',
      comment: 'src/data contém só dados.',
      severity: 'error',
      from: { path: '^src/data/' },
      to: { path: '^src/' },
    },
    {
      name: 'so-main-usa-observabilidade-e-config',
      comment: 'Observabilidade é injetada pelo main.js, nunca importada pelos módulos.',
      severity: 'error',
      from: { path: '^src/(data|lib|ui)/' },
      to: { path: '^src/(observability|config)\\.js$' },
    },
    {
      name: 'ninguem-importa-o-main',
      severity: 'error',
      from: {},
      to: { path: '^src/main\\.js$' },
    },
    {
      name: 'sem-orfaos',
      severity: 'error',
      from: { orphan: true, path: '^src/' },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
  },
};
