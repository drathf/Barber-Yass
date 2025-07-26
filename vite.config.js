import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ⚡ Configuración de Vite optimizada para Firebase Hosting
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ rutas relativas para que funcione en Firebase Hosting
  build: {
    outDir: 'dist',           // carpeta donde se genera el build
    sourcemap: false,         // no exponer código fuente
    minify: 'esbuild',        // build rápido y optimizado
    emptyOutDir: true,        // limpiar carpeta dist antes del build
    chunkSizeWarningLimit: 1000 // evitar warnings de archivos grandes
  },
  server: {
    port: 5173,               // puerto por defecto en desarrollo
    open: true                // abre el navegador automáticamente
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // ✅ usar imports con "@/..."
    }
  }
});
