import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Chemins relatifs : le même dist/ marche sur GitHub Pages et sur itch.io.
  base: './',
  test: {
    include: ['src/**/*.test.ts'],
  },
});
