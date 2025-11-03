import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      svgr({
        svgrOptions: {
          exportType: 'default',
        },
      })
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        mode === 'development' ? 'localhost' : env.VITE_API_URL || 'http://localhost:3000'
      ),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true
    }
  }
})

