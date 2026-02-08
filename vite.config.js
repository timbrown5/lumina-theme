import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Dev-only plugin to save theme files to disk
function themeSavePlugin() {
  return {
    name: 'theme-save',
    configureServer(server) {
      server.middlewares.use('/api/save-theme', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { path: filePath, content } = JSON.parse(body);

            // Validate path is within themes/ directory
            const resolved = path.resolve(filePath);
            const themesDir = path.resolve('themes');
            if (!resolved.startsWith(themesDir)) {
              res.statusCode = 403;
              res.end('Path must be within themes/ directory');
              return;
            }

            // Ensure directory exists
            fs.mkdirSync(path.dirname(resolved), { recursive: true });
            fs.writeFileSync(resolved, content + '\n');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: filePath }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), themeSavePlugin()],
  base: process.env.NODE_ENV === 'production' ? '/lumina-theme/' : './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'syntax-highlighter': ['react-syntax-highlighter'],
        },
      },
    },
  },
});
