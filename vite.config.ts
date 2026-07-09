import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/learn-bahasa-indonesia/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Belajar! — Learn Bahasa Indonesia',
        short_name: 'Belajar!',
        description:
          'Learn Bahasa Indonesia through flashcards, quizzes, grammar drills, sentence puzzles, and real Indonesian news.',
        theme_color: '#ce1126',
        background_color: '#faf6f0',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            // live headlines: prefer fresh, fall back to last fetched batch offline
            urlPattern: /^https:\/\/berita-indo-api-next\.vercel\.app\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'news-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // word/sentence translations (localStorage already caches repeats)
            urlPattern: /^https:\/\/translate\.googleapis\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'translate-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // article thumbnails from news CDNs (opaque responses allowed)
            urlPattern: /\.(?:png|jpe?g|webp|gif)(?:\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'news-images',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
})
