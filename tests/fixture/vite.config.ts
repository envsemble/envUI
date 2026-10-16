import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/BuildTokens.mjs';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  // The contrast gate measures the tokens as the token files hold them, even before a rebuild.
  plugins: [tokensVitePlugin(), react()],
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  server: { strictPort: true },
});
