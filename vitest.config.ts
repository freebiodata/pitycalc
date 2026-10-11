import { defineConfig } from 'vitest/config';

// Pin resolution to this project: the parent directory (D:\Personal\Astro) is a
// shared workspace with its own vitest.config.ts that vitest would otherwise
// discover and inherit (its include pattern only covers src/).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
