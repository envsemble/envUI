import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { checkoutMarker } from '../../scripts/test/CheckoutMarker.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  // The contrast gate measures the tokens as the token files hold them, even before a rebuild.
  // The marker tells the browser tests which checkout this server serves, and the closed
  // connections of their many short-lived browser contexts leave no ports behind.
  plugins: [checkoutMarker(), resetClosedConnections(), tokensVitePlugin(), react()],
  resolve: {
    conditions: ['envui-source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
  server: { strictPort: true },
});
