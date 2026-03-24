import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 9002,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 9002,
  },
})
