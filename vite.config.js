import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Importante para Firebase Hosting (rutas relativas)
  build: {
    outDir: 'dist',           // Carpeta de salida
    sourcemap: false,         // 🔒 Oculta el código fuente en producción
    minify: 'esbuild',        // Compilador rápido
    emptyOutDir: true,        // Limpia la carpeta dist antes de cada build
    chunkSizeWarningLimit: 1000 // Evita warnings por chunks grandes
  },
  server: {
    port: 5173,               // Puerto por defecto de Vite
    open: true                // Abre el navegador automáticamente al hacer npm run dev
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 👈 Puedes importar con "@/archivo"
    }
  }
});
