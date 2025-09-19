import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
      mode === 'development' ? 'localhost' : '192.168.1.90'
    ),
  },
}))
