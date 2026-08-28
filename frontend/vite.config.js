import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server proxy to handle zero-CORS backend API requests
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api-backend': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-backend/, '')
      }
    }
  }
})
