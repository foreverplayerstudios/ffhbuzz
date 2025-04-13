import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'icon-512.svg', 'icon-192.png'],
      injectRegister: 'script',
      manifest: false, // Use our custom manifest.json instead
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png}'],
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/\/api\//],
        navigateFallback: 'index.html',
      }
    }),
    sitemap({
      hostname: 'https://freefilmhub.buzz',
      dynamicRoutes: [
        '/trending',
        '/latest', 
        '/top-rated',
        '/movie/550',
        '/movie/238',
        '/tv/1399',
        '/tv/66732'
      ],
      exclude: [
        '/auth/**',
        '/profile',
        '/watchlist',
        '/history',
        '/**/private',
        '/**/*.html',
        '/**/*.php'
      ],
      outDir: 'dist'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@tailwindcss/typography'],
          'data-vendor': ['react-query', '@supabase/supabase-js']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssMinify: true,
    cssCodeSplit: true,
    modulePreload: true,
    reportCompressedSize: false
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  preview: {
    port: 4173,
    open: true
  }
});
