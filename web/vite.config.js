import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O site publica pela raiz do repo (GitHub Pages): o build sai em ../
// Em dev, a raiz do repo vira publicDir pra servir inventory.json, fotos e vídeo.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: './',
  publicDir: command === 'serve' ? '..' : false,
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'assets',
  },
}))
