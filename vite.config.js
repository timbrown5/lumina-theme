import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/lumina-theme/' : './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
