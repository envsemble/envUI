import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { isAbsolute, relative } from 'node:path';
import {
  documentationDirectory,
  generateDocumentation,
} from '../../scripts/GenerateDocumentation.mjs';
// `vite build` makes the offline catalogue, one HTML file with every asset inlined. With
// `--mode site` it makes the hosted catalogue: separate files with content-hashed names that
// browsers keep cached.
export default defineConfig(({ mode }) => {
  const site = mode === 'site';
  return {
    plugins: [
      {
        name: 'envui-documentation',
        buildStart() {
          generateDocumentation();
        },
        configureServer(server) {
          server.watcher.add(documentationDirectory);
          server.watcher.on('all', (event, path) => {
            const contained = relative(documentationDirectory, path);
            if (
              contained.startsWith('..') ||
              isAbsolute(contained) ||
              !['add', 'change', 'unlink'].includes(event)
            )
              return;
            try {
              generateDocumentation();
            } catch (error) {
              server.config.logger.error(String(error));
            }
          });
        },
      },
      react(),
      ...(site ? [] : [viteSingleFile()]),
    ],
    publicDir: '../../assets/brand/envUI',
    resolve: {
      conditions: ['envui-source', 'module', 'browser', 'development|production'],
      dedupe: ['react', 'react-dom'],
    },
    // The linked catalogue has thousands of modules; serve it as one lazy dependency in dev.
    optimizeDeps: { include: ['@envsemble/envui/icons'] },
    build: {
      outDir: site ? '../../dist/site' : '../../dist/catalogue',
      emptyOutDir: true,
      target: 'es2022',
      ...(!site && { assetsInlineLimit: () => true, cssCodeSplit: false }),
      // The token reference reads the authored HSL channels from CSS.
      cssMinify: false,
    },
  };
});
