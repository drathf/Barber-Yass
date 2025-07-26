import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // ✅ Base para Firebase Hosting (rutas relativas)
  base: './',

  build: {
    outDir: 'dist',             // Carpeta de salida
    sourcemap: false,           // 🔒 Oculta el código fuente en producción
    minify: 'esbuild',          // Compilador rápido
    emptyOutDir: true,          // Limpia dist antes de cada build
    chunkSizeWarningLimit: 1000 // Evita warnings de tamaño
  },

  server: {
    port: 5173, // Puerto local de Vite
    open: true  // Abre el navegador automáticamente al hacer npm run dev
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 👈 Permite importar con "@/archivo"
    }
  }
});
