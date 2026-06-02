import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'favicon.svg'],
      manifest: {
        name: 'KenyaMotocamp',
        short_name: 'Motocamp',
        description: 'Discover and plan motocamping trips across Kenya',
        theme_color: '#211e17',
        background_color: '#ece5d6',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        categories: ['travel', 'navigation', 'outdoor'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/server\.arcgisonline\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'esri-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 2592000 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'campsite-images', expiration: { maxEntries: 100, maxAgeSeconds: 1209600 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'firebase-storage', expiration: { maxEntries: 100, maxAgeSeconds: 1209600 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
})
