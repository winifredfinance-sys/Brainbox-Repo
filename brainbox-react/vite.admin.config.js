/* Builds the owner-only admin dashboard into dist/admin.html (run after the game build; see package.json) */
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
export default defineConfig({
  base:'./',
  plugins:[viteSingleFile()],
  build:{outDir:'dist',emptyOutDir:false,target:'es2022',rollupOptions:{input:'admin.html'}}
});
