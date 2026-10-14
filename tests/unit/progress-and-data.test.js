import { describe, expect, it } from 'vitest';
import { CATEGORIES, PROJECTS } from '../../src/data/projects.js';
import { trickle } from '../../src/lib/progress.js';

describe('trickle', () => {
  it('sempre avança enquanto está abaixo do teto', () => {
    let v = 0;
    for (let i = 0; i < 50; i++) {
      const next = trickle(v);
      expect(next).toBeGreaterThan(v);
      v = next;
      if (v >= 0.9) break;
    }
  });

  it('nunca passa do teto', () => {
    let v = 0;
    for (let i = 0; i < 2000; i++) v = trickle(v);
    expect(v).toBe(0.9);
    expect(trickle(0.95)).toBe(0.9);
  });

  it('desacelera perto do fim', () => {
    expect(trickle(0) - 0).toBeGreaterThan(trickle(0.8) - 0.8);
  });

  it('respeita teto personalizado', () => {
    expect(trickle(0.5, 0.5)).toBe(0.5);
    expect(trickle(0.49, 0.5)).toBeLessThanOrEqual(0.5);
  });
});

describe('dados do portfólio', () => {
  it('tem 16 projetos com nomes únicos', () => {
    expect(PROJECTS).toHaveLength(16);
    expect(new Set(PROJECTS.map((p) => p.name)).size).toBe(16);
  });

  it('todo projeto tem categoria válida, descrição, stack e URL https', () => {
    for (const p of PROJECTS) {
      expect(CATEGORIES).toHaveProperty(p.cat);
      expect(p.what.length).toBeGreaterThan(5);
      expect(p.stack.length).toBeGreaterThan(1);
      expect(p.url).toMatch(/^https:\/\/[^\s]+$/);
    }
  });

  it('toda categoria tem cor, rótulo, centro e ao menos um projeto', () => {
    for (const [key, c] of Object.entries(CATEGORIES)) {
      expect(c.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(c.label).toBeTruthy();
      expect(c.center).toHaveLength(2);
      expect(PROJECTS.some((p) => p.cat === key)).toBe(true);
    }
  });
});
