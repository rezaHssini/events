import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

/** Mobile/Capacitor build — outputs to dist/ with legacy WebView polyfills. */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['Android >= 5.1', 'Chrome >= 49'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
    }),
  ],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
  },
})
