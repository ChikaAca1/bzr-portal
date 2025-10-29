import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // TODO: Add vite-plugin-ssr for pre-rendering when landing pages are ready
    // This will generate static HTML for SEO optimization
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting for landing page routes
          'landing-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
