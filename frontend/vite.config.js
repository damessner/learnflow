import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    host: true,
    allowedHosts: 'all',
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: process.env.VITE_STANDALONE === 'true' ? '../learnflow_lite' : 'dist',
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) {
              return 'mermaid'
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'chartjs'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
