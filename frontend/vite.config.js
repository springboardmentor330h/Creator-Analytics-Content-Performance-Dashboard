import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/docs': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/openapi.json': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/redoc': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/reports': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/content': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/audience': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/revenue': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/growth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/sponsorships': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/notifications': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/analytics': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/social-media': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/youtube': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/users': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
