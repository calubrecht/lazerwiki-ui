import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "API_HOST");
  const apiServer = env.API_HOST ? env.API_HOST : "app-server";
  console.log("Proxy forwarding to " + apiServer);
  return {
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 3000,
    proxy: {
      '/app':
      {
          target: 'http://' + apiServer + ':8080',
          rewrite: (path) => path.replace(/^\/app/, ''),
      },
      '/_media':
      {
          target: 'http://' + apiServer + ':8080',
      },
      '/_resources':
      {
          target: 'http://' + apiServer + ':8080',
      },
      '/sitemap.xml':
      {
          target: 'http://' + apiServer + ':8080',
      },
    }
  },
  build: {
    outDir: "build"
  }
}})
