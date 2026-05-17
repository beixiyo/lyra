import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  resolve: {
    tsconfigPaths: true,
  },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/packages/desktop/**'],
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lyrics: resolve(__dirname, 'lyrics.html'),
      },
    },
  },
})
