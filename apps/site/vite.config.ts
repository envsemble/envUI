import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  documentationDirectory,
  examplesDirectory,
  generateDocumentation,
  specimensDirectory,
} from '../../scripts/docs/GenerateDocumentation.ts';
// `vite build` makes the static site: separate files with content-hashed names that browsers keep
// cached, the catalogue at the root and the Docs under /docs, both from one index.html.
import { tokensVitePlugin } from '../../scripts/build/BuildTokens.ts';
// Node runs this file as it is, before anything is built: the package's entry,
// @envsemble/envui/theme-bootstrap, is its build in dist/, which a checkout has only after
// npm run build, so the library's source module is imported instead.
import { createThemeBootstrapScript } from '../../packages/ui/src/foundations/themeBootstrap.ts';
import {
  createDisplayBootstrapScript,
  createStorageMigrationScript,
  displayStorageKeys,
} from './src/theme/DisplayStorage.ts';
import { checkoutMarker } from '../../scripts/test/CheckoutMarker.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';
import { readReleaseNotes, releaseNotesSources } from '../../scripts/site/ReleaseNotes.ts';
import { siteAgentFiles } from '../../scripts/site/SiteAgentFiles.ts';
import { withoutComments } from '../../scripts/site/CssComments.ts';

/**
 * Data the site's pages read from the repository when the site app builds or serves, as
 * virtual modules: the release notes. While serving, a change to their files reloads the page with
 * the new data.
 */
const siteData: Record<string, { read: () => unknown; sources: string[] }> = {
  'virtual:envui-release-notes': { read: readReleaseNotes, sources: releaseNotesSources },
};
const resolvedId = (id: string) => `\0${id}`;
/** The library's generated list of every icon, which only the icon catalogue imports. */
const iconList = fileURLToPath(new URL('../../packages/ui/src/icons/index.ts', import.meta.url));

/** The files for coding agents at the site's root, with the type each is served as. */
const agentFileTypes = {
  'SKILL.md': 'text/markdown; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
};

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
      // The browser tests' closed connections leave no ports behind: scripts/test/ServerSockets.ts.
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
                  createStorageMigrationScript() +
                  createThemeBootstrapScript({ storageKey: displayStorageKeys.theme }) +
                  createDisplayBootstrapScript()
                }</script>`,
            );
          },
        },
      },
      {
        // The style sheets ship without their comments, which are about half their size. Their
        // rules and values stay as written, as cssMinify is off for the token reference.
        name: 'envui-css-comments',
        apply: 'build',
        enforce: 'post',
        generateBundle(_options, bundle) {
          for (const file of Object.values(bundle))
            if (file.type === 'asset' && file.fileName.endsWith('.css'))
              file.source = withoutComments(String(file.source));
        },
      },
      {
        // The text's font loads with the page rather than once the style sheets that name it have
        // arrived, so the text shows in it from the first paint more often.
        name: 'envui-font-preload',
        apply: 'build',
        transformIndexHtml: {
          order: 'post',
          handler: (_html, { bundle }) =>
            Object.values(bundle ?? {})
              .filter((file) => file.type === 'asset' && file.fileName.endsWith('.woff2'))
              .map((font) => ({
                tag: 'link',
                attrs: {
                  rel: 'preload',
                  href: `/${font.fileName}`,
                  as: 'font',
                  type: 'font/woff2',
                  crossorigin: '',
                },
                injectTo: 'head' as const,
              })),
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
      {
        name: 'envui-site-data',
        resolveId(id) {
          return Object.hasOwn(siteData, id) ? resolvedId(id) : undefined;
        },
        load(id) {
          const name = Object.keys(siteData).find((entry) => resolvedId(entry) === id);
          if (!name) return undefined;
          return `export default ${JSON.stringify(siteData[name].read())};`;
        },
        configureServer(server) {
          const sources = Object.values(siteData).flatMap((entry) => entry.sources);
          server.watcher.add(sources);
          server.watcher.on('all', (_event, path) => {
            for (const [name, { sources: files }] of Object.entries(siteData)) {
              const touched = files.some((source) => {
                const contained = relative(source, path);
                return !contained.startsWith('..') && !isAbsolute(contained);
              });
              const module = touched && server.moduleGraph.getModuleById(resolvedId(name));
              if (!module) continue;
              server.moduleGraph.invalidateModule(module);
              server.ws.send({ type: 'full-reload' });
            }
          });
        },
      },
      {
        // SKILL.md and llms.txt at the site's root, for coding agents: scripts/site/SiteAgentFiles.ts.
        // Served fresh while developing, and written into the build.
        name: 'envui-agent-files',
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            const name = request.url?.split('?')[0]?.slice(1) ?? '';
            if (!Object.hasOwn(agentFileTypes, name)) return next();
            response.setHeader('Content-Type', agentFileTypes[name]!);
            response.end(siteAgentFiles()[name as keyof typeof agentFileTypes]);
          });
        },
        generateBundle() {
          for (const [fileName, source] of Object.entries(siteAgentFiles()))
            this.emitFile({ type: 'asset', fileName, source });
        },
      },
      react(),
    ],
    publicDir: '../../assets/brand/envUI',
    resolve: {
      conditions: ['envui-source', 'module', 'browser', 'development|production'],
      dedupe: ['react', 'react-dom'],
      // The icon catalogue's list of every icon, which the package doesn't export.
      alias: { 'envui-icon-list': iconList },
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
