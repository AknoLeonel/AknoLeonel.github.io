// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CATEGORIES, PROJECTS } from '../../src/data/projects.js';
import { createCatalog } from '../../src/ui/catalog.js';

function mount() {
  document.body.innerHTML = `
    <nav id="legend"></nav>
    <div id="filters"></div>
    <ul id="catalog" aria-busy="true"><li class="sk-row"></li><li class="sk-row"></li></ul>`;
  const onSelect = vi.fn();
  const onFilter = vi.fn();
  const api = createCatalog(
    {
      list: document.getElementById('catalog'),
      filters: document.getElementById('filters'),
      legend: document.getElementById('legend'),
    },
    { projects: PROJECTS, categories: CATEGORIES, onSelect, onFilter },
  );
  return { api, onSelect, onFilter };
}

const visibleRows = () => [...document.querySelectorAll('#catalog li')].filter((li) => !li.hidden);
const filterBtn = (cat) => document.querySelector(`#filters button[data-cat="${cat}"]`);

describe('catálogo', () => {
  let ctx;
  beforeEach(() => {
    ctx = mount();
  });

  it('troca o skeleton pelas linhas reais e encerra o estado de carregamento', () => {
    expect(document.querySelectorAll('.sk-row')).toHaveLength(0);
    expect(document.querySelectorAll('#catalog li')).toHaveLength(PROJECTS.length);
    expect(document.getElementById('catalog').hasAttribute('aria-busy')).toBe(false);
  });

  it('mostra nome, descrição e stack de cada projeto', () => {
    const first = document.querySelector('#catalog li button');
    expect(first.querySelector('.name').textContent).toBe(PROJECTS[0].name);
    expect(first.querySelector('.what').textContent).toBe(PROJECTS[0].what);
    expect(first.querySelector('.stack').textContent).toBe(PROJECTS[0].stack);
  });

  it('cria o botão Todos e um por categoria, com contagem', () => {
    const buttons = document.querySelectorAll('#filters button');
    expect(buttons).toHaveLength(Object.keys(CATEGORIES).length + 1);
    expect(buttons[0].textContent).toBe('Todos');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(filterBtn('auto').querySelector('em').textContent).toBe('4');
  });

  it('cria a legenda do céu sem contagem', () => {
    const legend = document.querySelectorAll('#legend button');
    expect(legend).toHaveLength(Object.keys(CATEGORIES).length);
    expect(legend[0].querySelector('em')).toBeNull();
  });

  it('filtra ao clicar e marca o botão ativo', () => {
    filterBtn('saude').click();
    expect(visibleRows()).toHaveLength(2);
    expect(filterBtn('saude').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#filters button').getAttribute('aria-pressed')).toBe('false');
    expect(ctx.onFilter).toHaveBeenLastCalledWith('saude');
    expect(ctx.api.active()).toBe('saude');
  });

  it('clicar de novo na mesma categoria volta para todos', () => {
    filterBtn('saude').click();
    filterBtn('saude').click();
    expect(visibleRows()).toHaveLength(PROJECTS.length);
    expect(ctx.onFilter).toHaveBeenLastCalledWith(null);
  });

  it('a legenda e os filtros ficam sincronizados', () => {
    document.querySelector('#legend button[data-cat="esporte"]').click();
    expect(filterBtn('esporte').getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#legend button[data-cat="esporte"]').getAttribute('aria-pressed')).toBe('true');
    document.querySelector('#filters button').click();
    expect(visibleRows()).toHaveLength(PROJECTS.length);
  });

  it('clicar em um projeto chama onSelect com ele', () => {
    document.querySelectorAll('#catalog li button')[3].click();
    expect(ctx.onSelect).toHaveBeenCalledWith(PROJECTS[3]);
  });

  it('set() pode ser chamado direto', () => {
    ctx.api.set('pessoal');
    expect(visibleRows()).toHaveLength(1);
  });
});
