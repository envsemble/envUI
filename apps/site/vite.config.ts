// `vite build` makes the static site: separate files with content-hashed names that browsers keep
// cached, the catalogue at the root and the Docs under /docs, both from one index.html. The site's
// own plugins are in the modules of their concerns: index.html's head in src/IndexHead.ts, the rest
// in scripts/.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
import { checkoutMarker } from '../../scripts/test/CheckoutMarker.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';
import { cssCommentsPlugin } from '../../scripts/site/CssComments.ts';
import { pagePreloadsPlugin } from '../../scripts/site/PagePreloads.ts';
import { agentFilesPlugin } from '../../scripts/site/SiteAgentFiles.ts';
import { siteDataPlugins } from '../../scripts/site/SiteData.ts';
import { indexHeadPlugins } from './src/IndexHead.ts';

/** The library's generated list of every icon, which only the icon catalogue imports. */
const iconList = fileURLToPath(new URL('../../packages/ui/src/icons/index.ts', import.meta.url));
/** The library's source, the site's only door into what its entry points don't export. */
const libraryInternals = fileURLToPath(new URL('../../packages/ui/src', import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      // Tells the browser tests which checkout this server serves.
      checkoutMarker(),
      // The browser tests' closed connections leave no ports behind: scripts/test/ServerSockets.ts.
      resetClosedConnections(),
      // The stored display settings, applied before the first paint, the site's description and
      // the font's preload.
      ...indexHeadPlugins(),
      // The style sheets ship without their comments, which are about half their size.
      cssCommentsPlugin(),
      // The files each pre-rendered page loads beside the site's script (PrerenderSite.ts).
      pagePreloadsPlugin(),
      // Rebuilds Tokens.css from packages/ui/tokens on every token edit; Vite hot-reloads it.
      tokensVitePlugin(),
      // The documentation's data, and the data the pages read as virtual:envui-* modules.
      ...siteDataPlugins(),
      // SKILL.md and llms.txt at the site's root, for coding agents.
      agentFilesPlugin(),
      react(),
    ],
    publicDir: '../../assets/brand/envUI',
    resolve: {
      conditions: ['envui-source', 'module', 'browser', 'development|production'],
      dedupe: ['react', 'react-dom'],
      alias: {
        // The icon catalogue's list of every icon, which the package doesn't export.
        'envui-icon-list': iconList,
        // What the library's entry points don't export, such as its reduced-motion query.
        '@envui-internal': libraryInternals,
      },
    },
    // That list has thousands of modules; serve it as one lazy dependency in dev.
    optimizeDeps: { include: ['envui-icon-list'] },
    build: {
      outDir: '../../dist/site',
      emptyOutDir: true,
      // The site's manifest, which FinalizeSite.ts turns into module-files.json: the files a
      // reload fetches again when part of a page failed to load.
      manifest: true,
      target: 'es2022',
      // The token reference reads the authored HSL channels from CSS.
      cssMinify: false,
      rolldownOptions: {
        output: {
          codeSplitting: {
            // What the site starts with is one file, with one style sheet, rather than a file for
            // each set of its modules that parts of pages loaded later share: over a hundred, most
            // under 2 kB, each a request of its own, and smaller to compress.
            groups: [{ name: 'site', tags: ['$initial'] }],
          },
        },
      },
    },
  };
});
