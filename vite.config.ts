import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // relative base ensures GitHub Pages subfolder compatibility
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
