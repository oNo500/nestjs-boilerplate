import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    open: false,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
          if (id.includes('antd') || id.includes('@ant-design')) return 'antd-vendor'
          if (id.includes('@tanstack/react-query')) return 'query-vendor'
          if (id.includes('recharts')) return 'chart-vendor'
          return
        },
      },
    },
  },
})
