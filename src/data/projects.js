/** Categorias (constelações) do portfólio. */
export const CATEGORIES = {
  auto: { label: 'Automotivo', color: '#00F5FF', center: [0.62, 0.22] },
  saude: { label: 'Saúde e bem-estar', color: '#7CFFB2', center: [0.86, 0.3] },
  esporte: { label: 'Esporte e eventos', color: '#FFC24B', center: [0.7, 0.5] },
  negocios: { label: 'Negócios', color: '#FF00E4', center: [0.42, 0.3] },
  pessoal: { label: 'Projetos pessoais', color: '#B69CFF', center: [0.88, 0.62] },
};

/** Sites em produção. Mantenha em sincronia com o README do perfil. */
export const PROJECTS = [
  { name: 'AM Auto Center', what: 'Mecânica em Formosa do Rio Preto - BA', stack: 'TypeScript', cat: 'auto', url: 'https://am-auto-center.vercel.app' },
  { name: 'Auto Socorro DF', what: 'Guincho 24h em Brasília', stack: 'Astro', cat: 'auto', url: 'https://autosocorrodf.vercel.app' },
  { name: 'Guincho Brasília', what: 'Auto socorro 24h no DF', stack: 'Astro', cat: 'auto', url: 'https://guincho-brasilia.vercel.app' },
  { name: 'Oficina Guará', what: 'Especialista em 4x4 e pick-ups', stack: 'JavaScript', cat: 'auto', url: 'https://oficina-guara.vercel.app' },
  { name: 'Instituto Bodylife', what: 'Saúde integrada no Guará-DF', stack: 'React, TypeScript', cat: 'saude', url: 'https://instituto-bodylife-react.vercel.app' },
  { name: 'Reviva Saúde', what: 'Clínica de estética em Vicente Pires-DF', stack: 'TypeScript', cat: 'saude', url: 'https://reviva-saude.vercel.app' },
  { name: 'ABLF', what: 'Associação Brasileira de Ligas de Futsal', stack: 'JavaScript', cat: 'esporte', url: 'https://ablf-2025.vercel.app' },
  { name: 'Nova Geração Futsal', what: 'Futsal de base em Brasília', stack: 'JavaScript', cat: 'esporte', url: 'https://nova-geracao-futsal.vercel.app' },
  { name: 'Monumental', what: 'Palco, LED e som para eventos', stack: 'TypeScript', cat: 'esporte', url: 'https://monumental-site.vercel.app' },
  { name: 'PipiEasy', what: 'Aluguel de banheiro químico em Brasília', stack: 'HTML, CSS', cat: 'esporte', url: 'https://banheiros-pipi-easy.vercel.app' },
  { name: 'REALIZA Agro', what: 'Venda de fazendas e regularização fundiária', stack: 'TypeScript', cat: 'negocios', url: 'https://lp-fazendas-tau.vercel.app' },
  { name: 'AD Veras Advocacia', what: 'Escritório tributário, trabalhista e previdenciário', stack: 'JavaScript', cat: 'negocios', url: 'https://ad-veras.vercel.app' },
  { name: 'Mi Impressoras', what: 'Manutenção de impressoras', stack: 'JavaScript', cat: 'negocios', url: 'https://impressoras-web.vercel.app' },
  { name: 'AHMDF Missionários', what: 'Projeto social de esporte no DF', stack: 'TypeScript', cat: 'negocios', url: 'https://site-missionarios.vercel.app' },
  { name: 'Vanguarda Kids', what: 'Aluguel de brinquedos em Formosa do Rio Preto-BA', stack: 'JavaScript', cat: 'negocios', url: 'https://brinquedos-theta.vercel.app' },
  { name: 'Tabela Periódica JS', what: 'Tabela periódica interativa', stack: 'JavaScript', cat: 'pessoal', url: 'https://tabelajs.vercel.app' },
];
