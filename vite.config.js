import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- This is the line that was missing!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})