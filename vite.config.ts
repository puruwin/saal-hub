import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
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
    // Fallback si los archivos .env no funcionan
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'development' ? 'localhost' : env.VITE_API_URL || 'http://localhost:3000'
    ),
  },
  }
})
