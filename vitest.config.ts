import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['tests/**/*.spec.ts', 'node_modules/**'],
    testTimeout: 60000,
    fileParallelism: false,
    server: {
      deps: {
        external: ['pyodide'],
      },
    },
  },
});
