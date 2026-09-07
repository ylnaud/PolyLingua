import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60_000,
    // Construye `dist/` una sola vez antes de que arranquen los ficheros en
    // paralelo. Sin esto, los diez tests que leen el build se pisan entre
    // ellos — ver el porqué largo en tests/global-setup.ts.
    globalSetup: ['tests/global-setup.ts'],
  },
});
