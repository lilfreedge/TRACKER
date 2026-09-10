import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Video juegos y más',
        short_name: 'VJyM',
        theme_color: '#059669',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: '/app-logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/app-logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: { port: 5173, host: true },
});
