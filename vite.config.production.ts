import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  // Cargar variables desde archivos .env
  const envFile = loadEnv(mode, '.', '')
  
  // En producción, priorizar: process.env (Docker) > archivo .env > fallback
  // IMPORTANTE: process.env funciona durante el build de Vite
  const apiUrl = process.env.VITE_API_URL || envFile.VITE_API_URL || 'localhost'
  
  console.log('📦 Build VITE_API_URL:', apiUrl)
  console.log('📦 Fuente: process.env =', process.env.VITE_API_URL, '| envFile =', envFile.VITE_API_URL)
  
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
      // Solo pasamos el hostname/IP, auth.ts y menuService.ts construyen la URL completa
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true
    }
  }
})

