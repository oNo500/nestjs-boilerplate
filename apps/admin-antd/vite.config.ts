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
    open: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'antd-vendor': ['antd', '@ant-design/pro-components'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
