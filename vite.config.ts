import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ElderMed Application',
        short_name: 'ElderMed',
        description: 'Advanced Elder Care System',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        display: 'standalone',
      }
    })
  ],
  server: {
    host: true, // Exposes the server to local network for mobile viewing
    proxy: {
      '/translate_tts': {
        target: 'https://translate.googleapis.com',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('origin');
          });
        }
      },
      '/api/chat': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Strip Origin and Referer headers so Ollama doesn't block cross-network requests
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('origin');
          });
        }
      }
    }
  }
})
