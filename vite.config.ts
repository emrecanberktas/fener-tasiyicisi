import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Fener Taşıyıcısı',
        short_name: 'Fener',
        lang: 'tr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#07090a',
        theme_color: '#07090a',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'], maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 },
    }),
  ],
  build: { chunkSizeWarningLimit: 2000 },
  test: { environment: 'happy-dom', globals: true },
});
