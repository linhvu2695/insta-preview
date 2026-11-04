import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps the build portable: dist/ works from any sub-path or static host.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  preview: { port: 4173 },
})
