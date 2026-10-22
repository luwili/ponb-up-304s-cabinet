import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], base: process.env.BASE_PATH || './',
  build:{rollupOptions:{output:{manualChunks(id){
    if(id.includes('node_modules')) {
      if(id.includes('/zod/'))return 'validation';
      return 'vendor';
    }
  }}}}
});
