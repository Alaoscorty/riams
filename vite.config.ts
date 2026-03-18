import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
  server: {
    port: 9002,
    open: true,
  },
  resolve: {
    alias: {
      "@": '/src',
    },
  },
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 9002,
  },
})
