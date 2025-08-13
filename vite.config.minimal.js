import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
      '@/app': resolve(process.cwd(), './src/app'),
      '@/features': resolve(process.cwd(), './src/features'),
      '@/shared': resolve(process.cwd(), './src/shared'),
      '@/styles': resolve(process.cwd(), './src/styles'),
      '@/assets': resolve(process.cwd(), './src/assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
