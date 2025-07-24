// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',            // Carpeta que Firebase usará como 'public'
    sourcemap: false,          // ⚠️ Desactivado para producción (seguridad)
    minify: 'esbuild',         // Compilador rápido y moderno
    emptyOutDir: true,         // Limpia el dist antes de construir
  },
  server: {
    port: 5173,                // Puerto por defecto de Vite
    open: true,                // Abre el navegador automáticamente
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Puedes importar con "@/archivo"
    },
  },
});
