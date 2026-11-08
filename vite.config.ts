import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // En producción (Pages) servimos bajo /navidad-sitios-web/
  base: process.env.NODE_ENV === 'production' ? '/navidad-sitios-web/' : '/',
  plugins: [react()],
})
