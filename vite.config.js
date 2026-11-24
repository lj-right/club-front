import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    proxy: {
      '/api/subject/subject': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/subject/, '')
      },
      '/api/practice/practice': {
        target: 'http://localhost:3013',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/practice/, '')
      },
      '/api/circle/circle': {
        target: 'http://localhost:3014',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/circle/, '')
      },
      '/api/interview/interview': {
        target: 'http://localhost:3015',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/interview/, '')
      },
      '/api/ai': {
        target: 'http://localhost:8012',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/oss': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/oss/, '')
      },
      '/api/auth': {
        target: 'http://localhost:3011',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '')
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
