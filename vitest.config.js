import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.js'],
      // canvas e ponto de entrada são cobertos pelo e2e (Playwright)
      exclude: ['src/main.js', 'src/ui/sky.js'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
