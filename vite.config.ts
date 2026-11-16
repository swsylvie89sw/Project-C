import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from https://swsylvie89sw.github.io/Project-C/
  base: '/Project-C/',
  plugins: [react(), tailwindcss()],
  build: {
    // gpt-tokenizer's encoding table (~2 MB) is its own lazy-loaded chunk, fetched only when the guided panel opens.
    chunkSizeWarningLimit: 2500,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
