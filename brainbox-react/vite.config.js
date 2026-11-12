/* Builds the game into dist/: one self-contained index.html (works when opened as a file, or uploaded
   anywhere), plus the files in public/ (config.js, favicon, the Supabase library, admin page assets). */
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';
export default defineConfig({
  base:'./',
  plugins:[react(),viteSingleFile()],
  build:{outDir:'dist',emptyOutDir:true,target:'es2019'}
});
