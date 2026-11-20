import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { checkoutMarker } from '../../scripts/test/CheckoutMarker.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';
import { cssCommentsPlugin } from '../../scripts/site/CssComments.ts';
import { pagePreloadsPlugin } from '../../scripts/site/PagePreloads.ts';
import { agentFilesPlugin } from '../../scripts/site/SiteAgentFiles.ts';
import { siteDataPlugins } from '../../scripts/site/SiteData.ts';
import { indexHeadPlugins } from '../../scripts/site/IndexHead.ts';

const iconList = fileURLToPath(new URL('../../packages/ui/src/icons/index.ts', import.meta.url));
const libraryInternals = fileURLToPath(new URL('../../packages/ui/src', import.meta.url));
const tokenReferenceReadsAuthoredHslChannels = true;
const siteStartInOneFile = { name: 'site', tags: ['$initial' as const] };

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      checkoutMarker(),
      resetClosedConnections(),
      ...indexHeadPlugins(),
      cssCommentsPlugin(),
      pagePreloadsPlugin(),
      tokensVitePlugin(),
      ...siteDataPlugins(),
      agentFilesPlugin(),
      react(),
    ],
    publicDir: '../../assets/brand/envUI',
    resolve: {
      conditions: ['envui-source', 'module', 'browser', 'development|production'],
      dedupe: ['react', 'react-dom'],
      alias: {
        'envui-icon-list': iconList,
        '@envui-internal': libraryInternals,
      },
    },
    optimizeDeps: { include: ['envui-icon-list'] },
    build: {
      outDir: '../../dist/site',
      emptyOutDir: true,
      manifest: true,
      target: 'es2022',
      cssMinify: !tokenReferenceReadsAuthoredHslChannels,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [siteStartInOneFile],
          },
        },
      },
    },
  };
});
