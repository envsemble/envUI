import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { checkoutMarker } from '../../scripts/DevServers.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  plugins: [checkoutMarker(), resetClosedConnections(), tokensVitePlugin(), react()],
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  server: { strictPort: true },
});
