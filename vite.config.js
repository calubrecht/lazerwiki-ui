import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    cors: {
      origin: 'http://merman:3000'},
    proxy: {
      '/app':
      {
          target: 'http://app-server:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app/, ''),
      },
    }
  },
  build: {
    outDir: "build"
  }
})
