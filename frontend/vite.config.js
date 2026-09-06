import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiProxy = {
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  bypass: (req) => {
    const isHtml =
      req.headers['sec-fetch-dest'] === 'document' ||
      req.headers['sec-fetch-mode'] === 'navigate' ||
      (req.headers && req.headers.accept && req.headers.accept.includes('text/html'));
    if (isHtml) {
      return '/index.html';
    }
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/docs': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/openapi.json': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/redoc': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/api': apiProxy,
      '/auth': apiProxy,
      '/reports': apiProxy,
      '/content': apiProxy,
      '/audience': apiProxy,
      '/revenue': apiProxy,
      '/growth': apiProxy,
      '/sponsorships': apiProxy,
      '/notifications': apiProxy,
      '/analytics': apiProxy,
      '/social-media': apiProxy,
      '/social': apiProxy,
      '/youtube': apiProxy,
      '/users': apiProxy,
    },
  },
})
