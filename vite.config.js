// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2015',
        assetsDir: 'assets',
        outDir: 'dist',
        emptyOutDir: true
    },
    server: {
        port: 3000, // Change this if you want a different dev server port
      }
});
