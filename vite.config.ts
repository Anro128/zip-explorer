import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    exclude: ['@zip.js/zip.js'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor')) return 'monaco';
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@zip.js')) return 'zip';
            return 'vendor';
          }
        },
      },
    },
  },
})
