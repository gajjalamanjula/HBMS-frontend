import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
 
      tailwindcss(),
    ],
 
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
 
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
 
      watch: {
        usePolling: true,
      },
 
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
        overlay: true,
      },
    },
 
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'lucide-react',
        'framer-motion',
      ],
    },
 
    cacheDir: 'node_modules/.vite',
 
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
 
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('react-dom') || id.includes('/react/')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (
              id.includes('react-hook-form') ||
              id.includes('@hookform/resolvers') ||
              id.includes('zod')
            )
              return 'forms';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('axios')) return 'http';
            return 'vendor';
          },
        },
      },
    },
 
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/tests/setup.js',
      css: true,
    },
  };
});
