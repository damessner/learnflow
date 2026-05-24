import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/mermaid')) return 'mermaid'
          if (id.includes('node_modules/katex')) return 'katex'
          if (id.includes('node_modules/cytoscape')) return 'cytoscape'
          if (id.includes('node_modules/dagre') || id.includes('node_modules/d3')) return 'layout'
        },
      },
    },
  },
})
