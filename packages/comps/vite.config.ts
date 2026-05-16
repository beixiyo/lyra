import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    dts({ tsconfigPath: './tsconfig.json', entryRoot: './src' }),
  ],

  resolve: {
    tsconfigPaths: true,
  },

  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'utils',
        'hooks',
        'motion',
        'motion/react',
        '@jl-org/tool',
        '@jl-org/ts-tool',
        'class-variance-authority',
        'clsx',
        'lucide-react',
      ],
    },
  },
})
