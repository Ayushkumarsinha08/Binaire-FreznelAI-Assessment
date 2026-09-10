/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api/models': {
        target: 'https://binaire.app',
        changeOrigin: true,
        rewrite: () => '/hf-models-api.json',
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
