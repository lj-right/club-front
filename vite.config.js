import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { exec } from 'child_process'

function randomizeSetPlugin() {
  return {
    name: 'randomize-set-plugin',
    configureServer(server) {
      server.middlewares.use('/api/custom/randomizeSet', (req, res) => {
        exec('python scratch/random_assemble_sets.py', (err, stdout, stderr) => {
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: err.message }))
          } else {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, message: '套卷考题已随机重组成功！' }))
          }
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), randomizeSetPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
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
      '/api/oss': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/oss/, '')
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
