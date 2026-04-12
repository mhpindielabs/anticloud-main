import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
      base: './',
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
});