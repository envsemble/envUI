import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { isAbsolute, relative } from 'node:path';
import {
  documentationDirectory,
  generateDocumentation,
} from '../../scripts/GenerateDocumentation.mjs';
import { tokensVitePlugin } from '../../scripts/BuildTokens.mjs';
export default defineConfig({
  plugins: [
    // Rebuilds Tokens.css from packages/ui/tokens on every token edit; Vite hot-reloads it.
    tokensVitePlugin(),
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
    viteSingleFile(),
  ],
  publicDir: '../../assets/brand/envUI',
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  // The linked catalogue has thousands of modules; serve it as one lazy dependency in dev.
  optimizeDeps: { include: ['@envsemble/envui/icons'] },
  build: {
    outDir: '../../dist/catalogue',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    // The offline token reference reads the authored HSL channels from CSS.
    cssMinify: false,
  },
});
