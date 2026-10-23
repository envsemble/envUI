import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import {
  documentationDirectory,
  examplesDirectory,
  generateDocumentation,
  specimensDirectory,
} from '../../scripts/GenerateDocumentation.mjs';
// `vite build` makes the static site: separate files with content-hashed names that browsers keep
// cached, the Site at the root and the Docs under /docs, both from one index.html.
import { tokensVitePlugin } from '../../scripts/BuildTokens.mjs';
import { createThemeBootstrapScript } from '../../packages/ui/src/foundations/ThemeBootstrap.ts';
import { createDisplayBootstrapScript, displayStorageKeys } from './src/theme/DisplayStorage.ts';
import { checkoutMarker } from '../../scripts/CheckoutMarker.mjs';
import { resetClosedConnections } from '../../scripts/ServerSockets.mjs';

/**
 * The revision the catalogue's links to source files point at: the release tag when the build is
 * of a release's commit, and otherwise the commit itself, as for archived and next builds, so a
 * link shows the source the page was generated from. Without Git, the package version's tag.
 */
function sourceRevision() {
  const manifest = new URL('../../packages/ui/package.json', import.meta.url);
  const tag = `v${JSON.parse(readFileSync(manifest, 'utf8')).version}`;
  const git = (...args: string[]) =>
    execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    return git('tag', '--points-at', 'HEAD').split(/\s+/).includes(tag)
      ? tag
      : git('rev-parse', 'HEAD');
  } catch {
    return tag;
  }
}

export default defineConfig(() => {
  return {
    define: {
      __ENVUI_SOURCE_REVISION__: JSON.stringify(sourceRevision()),
    },
    plugins: [
      // Tells the browser tests which checkout this server serves.
      checkoutMarker(),
      // The browser tests' closed connections leave no ports behind: scripts/ServerSockets.mjs.
      resetClosedConnections(),
      {
        // The stored theme, contrast and scale apply before the catalogue loads, so a dark theme
        // does not flash light and a compact page does not start at the comfortable size.
        name: 'envui-theme-bootstrap',
        // The script goes right after <meta charset>, which has to stay within the first 1024
        // bytes, and before the styles, so it runs before the first paint.
        transformIndexHtml: {
          order: 'pre',
          handler: (html) => {
            const meta = /<meta charset="utf-8"\s*\/?>/i;
            if (!meta.test(html)) throw new Error('index.html needs <meta charset="UTF-8" />.');
            return html.replace(
              meta,
              (tag) =>
                `${tag}\n    <script>${
                  createThemeBootstrapScript({ storageKey: displayStorageKeys.theme }) +
                  createDisplayBootstrapScript()
                }</script>`,
            );
          },
        },
      },
      // Rebuilds Tokens.css from packages/ui/tokens on every token edit; Vite hot-reloads it.
      tokensVitePlugin(),
      {
        name: 'envui-documentation',
        buildStart() {
          generateDocumentation();
        },
        configureServer(server) {
          // Pages, generated props and the example and specimen files they reference.
          const sources = [documentationDirectory, examplesDirectory, specimensDirectory];
          server.watcher.add(sources);
          server.watcher.on('all', (event, path) => {
            const inside = (directory: string) => {
              const contained = relative(directory, path);
              return !contained.startsWith('..') && !isAbsolute(contained);
            };
            if (!sources.some(inside) || !['add', 'change', 'unlink'].includes(event)) return;
            try {
              generateDocumentation();
            } catch (error) {
              server.config.logger.error(String(error));
            }
          });
        },
      },
      react(),
    ],
    publicDir: '../../assets/brand/envUI',
    resolve: {
      conditions: ['envui-source', 'module', 'browser', 'development|production'],
      dedupe: ['react', 'react-dom'],
    },
    // The linked catalogue has thousands of modules; serve it as one lazy dependency in dev.
    optimizeDeps: { include: ['@envsemble/envui/icons'] },
    build: {
      outDir: '../../dist/site',
      emptyOutDir: true,
      // The site's manifest, which FinalizeSite.mjs turns into module-files.json: the files a
      // reload fetches again when part of a page failed to load.
      manifest: true,
      target: 'es2022',
      // The token reference reads the authored HSL channels from CSS.
      cssMinify: false,
    },
  };
});
