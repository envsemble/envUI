import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  publicDir: '../../assets/brand/envUI',
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: '../../dist/docs',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    // The offline token reference reads the authored HSL channels from CSS.
    cssMinify: false,
  },
});
