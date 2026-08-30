import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    pool: 'threads',
    maxWorkers: 2,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
