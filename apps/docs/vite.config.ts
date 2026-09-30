import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    conditions: ['envsemble-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: '../../dist/docs',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
  },
});
