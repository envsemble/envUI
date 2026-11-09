import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
import { displayStorageKeys } from './src/display/DisplayStorage.ts';
import { partModules, viewModules } from './src/pages/ViewModules.ts';
import { siteDescription } from './src/routes/SiteDescription.ts';
import {
  createDisplayBootstrapScript,
  createFirstPaintStyle,
  createSiteBootstrapScript,
  createStorageMigrationScript,
} from './src/display/HeadScripts.ts';
import { checkoutMarker } from '../../scripts/test/CheckoutMarker.ts';
import { resetClosedConnections } from '../../scripts/test/ServerSockets.ts';
import { readReleaseNotes, releaseNotesSources } from '../../scripts/site/ReleaseNotes.ts';
import { siteAgentFiles } from '../../scripts/site/SiteAgentFiles.ts';
import {
  changelogOutlineSources,
  exampleLinesSources,
  readChangelogOutline,
  readExampleLines,
  readTokenOutline,
  tokenOutlineSources,
} from '../../scripts/site/PartOutlines.ts';
import { withoutComments } from '../../scripts/site/CssComments.ts';

/** Whether the site is building rather than serving: set by envui-page-parts. */
let building = false;

/** The recorded size of each part that loads with a page (scripts/site/RecordPartSizes.ts). */
const partSizesFile = fileURLToPath(new URL('./src/generated/PartSizes.json', import.meta.url));
function readPartSizes(): Record<string, [number, number]> {
  const { $comment: _comment, ...sizes } = JSON.parse(readFileSync(partSizesFile, 'utf8'));
  return sizes;
}
/** Every part's size and every example's lines, read once a build. */
let pageParts: { sizes: Record<string, [number, number]>; lines: Record<string, number> } = {
  sizes: {},
  lines: {},
};
/**
 * The key of a part of one page, an example, a specimen, the stage of an example shown open or a
 * guide's figure, with the page's id.
 */
const pagePart = /^(?:example|specimen|open|figure):([^/]+)\//;

/**
 * Data the site's pages read from the repository when the site app builds or serves, as
 * virtual modules: the release notes, and the outlines of the parts that load with a page, which
 * their skeletons are drawn from. While serving, a change to their files reloads the page with the
 * new data; an outline (`reloads: false`), which only shapes a skeleton, waits for the next load,
 * so editing an example updates it in place.
 */
const siteData: Record<string, { read: () => unknown; sources: string[]; reloads?: false }> = {
  'virtual:envui-release-notes': { read: readReleaseNotes, sources: releaseNotesSources },
  // In a build, a page's parts' sizes and lines go with its content (envui-page-parts), and the
  // site's start keeps only the sizes of parts of no one page.
  'virtual:envui-part-sizes': {
    read: () =>
      building
        ? Object.fromEntries(
            Object.entries(readPartSizes()).filter(([part]) => !pagePart.test(part)),
          )
        : readPartSizes(),
    sources: [partSizesFile],
    reloads: false,
  },
  'virtual:envui-example-lines': {
    read: () => (building ? {} : readExampleLines()),
    sources: exampleLinesSources,
    reloads: false,
  },
  'virtual:envui-changelog-outline': {
    read: readChangelogOutline,
    sources: changelogOutlineSources,
    reloads: false,
  },
  'virtual:envui-token-outline': {
    read: readTokenOutline,
    sources: tokenOutlineSources,
    reloads: false,
  },
};
const resolvedId = (id: string) => `\0${id}`;
/** The library's generated list of every icon, which only the icon catalogue imports. */
const iconList = fileURLToPath(new URL('../../packages/ui/src/icons/index.ts', import.meta.url));
/** The documentation's model (scripts/docs/model), which the site imports as @docs-model. */
const docsModel = fileURLToPath(new URL('../../scripts/docs/model', import.meta.url));
/** The library's source, the site's only door into what its entry points don't export. */
const libraryInternals = fileURLToPath(new URL('../../packages/ui/src', import.meta.url));

/** The files for coding agents at the site's root, with the type each is served as. */
const agentFileTypes = {
  'SKILL.md': 'text/markdown; charset=utf-8',
  'llms.txt': 'text/plain; charset=utf-8',
};

export default defineConfig(() => {
  return {
    plugins: [
      // Tells the browser tests which checkout this server serves.
      checkoutMarker(),
      // The browser tests' closed connections leave no ports behind: scripts/test/ServerSockets.ts.
      resetClosedConnections(),
      {
        // The stored theme, contrast and scale apply before the catalogue loads, so a dark theme
        // does not flash light and a compact page does not start at the comfortable size; the
        // page's background, in that theme, paints from the first frame. So do the drawer's width,
        // the banner's draw-in and the shortcuts' modifier (createSiteBootstrapScript).
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
                  createDisplayBootstrapScript() +
                  createSiteBootstrapScript()
                }</script>
    <style>${createFirstPaintStyle(
      readFileSync(
        fileURLToPath(new URL('../../packages/ui/src/generated/Tokens.css', import.meta.url)),
        'utf8',
      ),
    )}</style>`,
            );
          },
        },
      },
      {
        // What the site is, in the head: the sentence the site gives a page without a summary
        // (routes/SiteDescription.ts). A pre-rendered page carries its own (PrerenderSite.ts).
        name: 'envui-description',
        transformIndexHtml: () => [
          {
            tag: 'meta',
            attrs: { name: 'description', content: siteDescription },
            injectTo: 'head',
          },
        ],
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
        // What each page needs loads beside the site's script rather than once that has arrived and
        // run: the files the module of its kind's view imports (pages/ViewModules.ts), and those of
        // the parts of it that load on their own and that the server renders, and the file
        // of its content (generated/pages/<id>.json, PageContent.ts), and on a catalogue page the
        // style sheets of its figures (examples/<id>/, specimens/<id>/ and what they import), which
        // apply with its first paint. The lists go to dist/site/.vite/page-preloads.json, from which
        // scripts/site/PrerenderSite.ts links each pre-rendered page's files in its head.
        name: 'envui-content-preload',
        apply: 'build',
        generateBundle: {
          // After Vite drops the chunks that held only style sheets, which pages import as sheets.
          order: 'post',
          handler(_options, bundle) {
            // The server's build renders the pages, and loads nothing.
            if (this.environment.config.consumer !== 'client') return;
            const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
            const contents: Record<string, string> = {};
            for (const file of chunks) {
              const page = /[\\/]generated[\\/]pages[\\/]([\w-]+)\.json$/.exec(
                file.facadeModuleId ?? '',
              )?.[1];
              if (page) contents[page] = file.fileName;
            }
            const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
            // What the site's script loads itself, which the views' files leave out.
            const started = new Set<string>();
            const imported = (name: string, into: Set<string>) => {
              if (into.has(name)) return;
              into.add(name);
              for (const next of byName.get(name)?.imports ?? []) imported(next, into);
            };
            for (const chunk of chunks) if (chunk.isEntry) imported(chunk.fileName, started);
            // The files of a module, a view's or a part's, and what it imports, but the start's.
            const filesOf = (modules: Record<string, string>, what: string) =>
              Object.fromEntries(
                Object.entries(modules).map(([name, module]) => {
                  const chunk = chunks.find((file) => file.facadeModuleId?.endsWith(`/${module}`));
                  if (!chunk) throw new Error(`No chunk holds ${module}, which ${what} is in.`);
                  const scripts = new Set<string>();
                  imported(chunk.fileName, scripts);
                  const files = [...scripts].filter((file) => !started.has(file));
                  const styles = files.flatMap((file) => [
                    ...(byName.get(file)?.viteMetadata?.importedCss ?? []),
                  ]);
                  return [name, { scripts: files, styles: [...new Set(styles)] }];
                }),
              );
            const views = filesOf(viewModules, "a page's view");
            // The parts of pages that the server renders, which a page loads with its view.
            const parts = filesOf(partModules, 'a part of a page');
            // The style sheets the site starts with, which a page's figures' sheets leave out.
            const startedStyles = new Set(
              [...started].flatMap((name) => [
                ...(byName.get(name)?.viteMetadata?.importedCss ?? []),
              ]),
            );
            const figureStyles: Record<string, string[]> = {};
            for (const chunk of chunks) {
              const page = /[\\/]src[\\/](?:examples|specimens)[\\/]([\w-]+)[\\/]/.exec(
                chunk.facadeModuleId ?? '',
              )?.[1];
              if (!page || !contents[page]) continue;
              const files = new Set<string>();
              imported(chunk.fileName, files);
              // With the modules of the options its components set, which load as they render,
              // such as a table's column resizing.
              for (const name of [...files])
                for (const option of byName.get(name)?.dynamicImports ?? [])
                  if (/[\\/]packages[\\/]ui[\\/]/.test(byName.get(option)?.facadeModuleId ?? ''))
                    imported(option, files);
              const styles = new Set(figureStyles[page]);
              for (const name of files)
                for (const style of byName.get(name)?.viteMetadata?.importedCss ?? [])
                  if (!startedStyles.has(style)) styles.add(style);
              figureStyles[page] = [...styles].sort();
            }
            this.emitFile({
              type: 'asset',
              fileName: '.vite/page-preloads.json',
              source: JSON.stringify({ views, parts, contents, figureStyles }),
            });
          },
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
        // Each page's content file carries the recorded sizes of its examples and specimens and
        // its examples' lines of code, which their skeletons keep, so the site's start doesn't
        // carry every page's (the virtual modules above, while developing).
        name: 'envui-page-parts',
        apply: 'build',
        enforce: 'pre',
        config() {
          building = true;
        },
        buildStart() {
          pageParts = { sizes: readPartSizes(), lines: readExampleLines() };
        },
        transform(code, id) {
          const page = /\/src\/generated\/pages\/([^/]+)\.json$/.exec(id.split('?')[0]!)?.[1];
          if (!page) return undefined;
          const { sizes, lines } = pageParts;
          const content = {
            ...JSON.parse(code),
            partSizes: Object.fromEntries(
              Object.entries(sizes).filter(([part]) => pagePart.exec(part)?.[1] === page),
            ),
            exampleLines: Object.fromEntries(
              Object.entries(lines).filter(([example]) => example.startsWith(`${page}/`)),
            ),
          };
          return { code: JSON.stringify(content), map: null };
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
            for (const [name, { sources: files, reloads }] of Object.entries(siteData)) {
              const touched = files.some((source) => {
                const contained = relative(source, path);
                return !contained.startsWith('..') && !isAbsolute(contained);
              });
              const module = touched && server.moduleGraph.getModuleById(resolvedId(name));
              if (!module) continue;
              server.moduleGraph.invalidateModule(module);
              if (reloads !== false) server.ws.send({ type: 'full-reload' });
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
      alias: {
        // The icon catalogue's list of every icon, which the package doesn't export.
        'envui-icon-list': iconList,
        // The documentation's model, which the site and the scripts that build it both read.
        '@docs-model': docsModel,
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
