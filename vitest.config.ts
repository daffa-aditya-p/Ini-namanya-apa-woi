import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,js}', 'src/**/*.{test,spec}.{ts,js}'],
    testTimeout: 60000,
    fileParallelism: false,
    server: {
      deps: {
        external: ['pyodide'],
      },
    },
  },
});
