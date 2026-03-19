import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/renderer',
  base: '/slowest-chess-move-analyzer/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
})
