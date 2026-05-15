import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import rootPkg from '../../package.json' with { type: 'json' }
import localPkg from './package.json' with { type: 'json' }

const allDeps = [
  ...Object.keys(rootPkg.dependencies || {}),
  ...Object.keys(rootPkg.devDependencies || {}),
  ...Object.keys(localPkg.dependencies || {}),
  ...Object.keys(localPkg.devDependencies || {}),
]

export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.json', entryRoot: './src' }),
  ],

  resolve: {
    alias: {
      'utils': fileURLToPath(new URL('../utils/src', import.meta.url)),
    },
  },

  build: {
    outDir: './dist',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: (id: string) =>
        allDeps.some(dep => id === dep || id.startsWith(`${dep}/`)),
    },
  },
})
