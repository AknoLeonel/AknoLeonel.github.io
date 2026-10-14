import { describe, expect, it } from 'vitest';
import { countByCategory, displayHost, filterProjects, toggleCategory } from '../../src/lib/catalog.js';

const cats = { a: {}, b: {}, c: {} };
const projects = [
  { name: 'Um', cat: 'a' },
  { name: 'Dois', cat: 'b' },
  { name: 'Três', cat: 'a' },
];

describe('filterProjects', () => {
  it('sem categoria devolve todos, em uma cópia', () => {
    const out = filterProjects(projects, null);
    expect(out).toEqual(projects);
    expect(out).not.toBe(projects);
  });

  it('filtra pela categoria', () => {
    expect(filterProjects(projects, 'a').map((p) => p.name)).toEqual(['Um', 'Três']);
  });

  it('categoria sem projetos devolve lista vazia', () => {
    expect(filterProjects(projects, 'c')).toEqual([]);
  });
});

describe('countByCategory', () => {
  it('conta por categoria, incluindo zeros', () => {
    expect(countByCategory(projects, cats)).toEqual({ a: 2, b: 1, c: 0 });
  });

  it('ignora projetos de categoria desconhecida', () => {
    expect(countByCategory([...projects, { cat: 'x' }], cats)).toEqual({ a: 2, b: 1, c: 0 });
  });
});

describe('toggleCategory', () => {
  it('ativa uma categoria nova', () => {
    expect(toggleCategory(null, 'a')).toBe('a');
    expect(toggleCategory('b', 'a')).toBe('a');
  });

  it('clicar na ativa volta para todas', () => {
    expect(toggleCategory('a', 'a')).toBeNull();
  });
});

describe('displayHost', () => {
  it('remove protocolo e barra final', () => {
    expect(displayHost('https://site.vercel.app/')).toBe('site.vercel.app');
    expect(displayHost('http://exemplo.com')).toBe('exemplo.com');
  });

  it('mantém caminhos internos', () => {
    expect(displayHost('https://exemplo.com/a/b')).toBe('exemplo.com/a/b');
  });
});
