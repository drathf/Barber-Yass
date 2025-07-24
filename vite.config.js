// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,        // Útil para debug en producción
    minify: 'esbuild',      // Usa 'esbuild' por velocidad; puedes cambiar a 'terser' si necesitas compresión avanzada
  },
  server: {
    port: 5173,
    open: true,             // Abre automáticamente en el navegador
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Importar desde '@/archivo'
    },
  },
});
