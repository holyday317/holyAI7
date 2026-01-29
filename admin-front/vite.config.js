import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://106.54.34.24:3000',
        changeOrigin: true
      }
    }
  }
})
