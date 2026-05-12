import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://localhost:7280',
        changeOrigin: true,
        secure: false,
      },
      '/appHub': {
        target: 'https://localhost:7280',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewriteWsOrigin: true,
      },
    }
  }
})
