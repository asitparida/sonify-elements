import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          formats: ['es', 'cjs'],
          fileName: (format) => `sonify-elements.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        outDir: 'dist/lib',
        emptyOutDir: true,
      },
    }
  }

  return {
    root: 'docs',
    plugins: [react()],
    resolve: {
      alias: {
        'sonify-elements': resolve(__dirname, 'src/lib/index.ts'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist/app'),
    },
  }
})
