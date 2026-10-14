import { describe, expect, it } from 'vitest';
import { CATEGORIES, PROJECTS } from '../../src/data/projects.js';
import { createRng, layoutStars, makeDust, pickStar } from '../../src/lib/sky.js';

describe('createRng', () => {
  it('é determinístico para a mesma semente', () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('sementes diferentes geram sequências diferentes', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it('gera valores entre 0 e 1', () => {
    const r = createRng(123);
    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('aceita semente zero ou negativa', () => {
    const v = createRng(0)();
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(createRng(-5)()).toBeGreaterThan(0);
  });
});

describe('layoutStars', () => {
  it('cria uma estrela por projeto, dentro da tela', () => {
    for (const [w, h] of [
      [1280, 800],
      [390, 844],
    ]) {
      const stars = layoutStars(PROJECTS, CATEGORIES, w, h);
      expect(stars).toHaveLength(PROJECTS.length);
      for (const s of stars) {
        expect(s.x).toBeGreaterThan(0);
        expect(s.x).toBeLessThan(w);
        expect(s.y).toBeGreaterThan(0);
        expect(s.y).toBeLessThan(h);
      }
    }
  });

  it('projetos pessoais têm estrela maior', () => {
    const stars = layoutStars(PROJECTS, CATEGORIES, 1280, 800);
    const pessoal = stars.find((s) => s.project.cat === 'pessoal');
    const outro = stars.find((s) => s.project.cat !== 'pessoal');
    expect(pessoal.r).toBeGreaterThan(outro.r);
  });

  it('no celular mantém as estrelas na metade de cima, acima do título', () => {
    const stars = layoutStars(PROJECTS, CATEGORIES, 390, 844);
    for (const s of stars) expect(s.y / 844).toBeLessThan(0.62);
  });

  it('estrelas da mesma categoria ficam perto do centro da constelação', () => {
    const w = 1280;
    const h = 800;
    for (const s of layoutStars(PROJECTS, CATEGORIES, w, h)) {
      const [cx, cy] = CATEGORIES[s.project.cat].center;
      expect(Math.abs(s.x / w - cx)).toBeLessThan(0.1);
      expect(Math.abs(s.y / h - cy)).toBeLessThan(0.2);
    }
  });
});

describe('makeDust', () => {
  it('quantidade proporcional à área e determinística', () => {
    expect(makeDust(260, 100)).toHaveLength(10);
    expect(makeDust(400, 300)).toEqual(makeDust(400, 300));
  });

  it('partículas dentro da área com opacidade válida', () => {
    for (const d of makeDust(500, 400)) {
      expect(d.x).toBeLessThan(500);
      expect(d.y).toBeLessThan(400);
      expect(d.a).toBeGreaterThanOrEqual(0.15);
      expect(d.a).toBeLessThanOrEqual(0.75);
    }
  });
});

describe('pickStar', () => {
  const stars = [
    { project: { cat: 'a' }, x: 100, y: 100 },
    { project: { cat: 'b' }, x: 110, y: 100 },
    { project: { cat: 'a' }, x: 400, y: 400 },
  ];

  it('escolhe a mais próxima dentro do raio', () => {
    expect(pickStar(stars, 108, 100)).toBe(stars[1]);
    expect(pickStar(stars, 101, 100)).toBe(stars[0]);
  });

  it('não escolhe nada longe de todas', () => {
    expect(pickStar(stars, 250, 250)).toBeNull();
  });

  it('respeita o raio máximo', () => {
    expect(pickStar(stars, 400, 430)).toBeNull();
    expect(pickStar(stars, 400, 430, null, 40)).toBe(stars[2]);
  });

  it('ignora estrelas fora do filtro ativo', () => {
    expect(pickStar(stars, 108, 100, 'a')).toBe(stars[0]);
  });
});
