// Builds the site or the browser tests' fixture and serves the build with `vite preview`, as a web
// server of the browser tests (playwright.config.ts).
//
//   node scripts/test/ServeBuild.ts --app <site|fixture> --port <port>
//
// A page of a build loads a few dozen files; on the development server it loads every module of
// the library's and the app's sources, some 800, each a request the server answers and the browser
// compiles again in every test's fresh context: on CI's two cores, the fixture's specs take half as
// long on its build. The site is built for production, as it is hosted, its pages pre-rendered
// (scripts/site/PrerenderSite.ts), which the preview server serves at their addresses. The fixture is built for development:
// React's development build, with its warnings and StrictMode's checks, as the library's specs
// expect, bundled. Each builds in seconds, into node_modules, which the visual baseline's Docker run
// keeps apart from the host's. Outside CI a build follows its sources, so a server Playwright
// reuses serves the code as it is.
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { build, preview, type InlineConfig } from 'vite';
import { prerenderSite } from '../site/PrerenderSite.ts';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const { values } = parseArgs({
  options: { app: { type: 'string' }, port: { type: 'string' } },
});
const port = Number(values.port);
if ((values.app !== 'site' && values.app !== 'fixture') || !Number.isInteger(port))
  throw new Error('Usage: ServeBuild.ts --app <site|fixture> --port <port>');

const outDir = resolve(root, 'node_modules/.cache/envui-test-builds', values.app);
const fixture = resolve(root, 'tests/fixture');
const app: InlineConfig =
  values.app === 'site'
    ? { root: resolve(root, 'apps/site'), configFile: resolve(root, 'apps/site/vite.config.ts') }
    : {
        configFile: resolve(fixture, 'vite.config.ts'),
        mode: 'development',
        build: {
          // Every page of the fixture: index.html and the pages of their own (Fixtures in AGENTS.md).
          rolldownOptions: {
            input: readdirSync(fixture)
              .filter((file) => file.endsWith('.html'))
              .map((file) => resolve(fixture, file)),
          },
        },
      };
// React and the library resolve their development builds, as on the development server.
if (values.app === 'fixture') process.env.NODE_ENV = 'development';

const output = await build({
  ...app,
  logLevel: 'warn',
  build: {
    ...app.build,
    outDir,
    emptyOutDir: true,
    // Readable stack traces in failures, without the time source maps take.
    minify: false,
    watch: process.env.CI ? null : {},
  },
});
/** Pre-renders the site's pages into its build, as npm run build:site does. */
const prerender = () =>
  values.app === 'site'
    ? prerenderSite(outDir, resolve(root, 'node_modules/.cache/envui-test-builds/site-server'))
    : Promise.resolve();
// Watching, the first build has ended once the watcher says so; each build after it is pre-rendered
// again, and a page that fails to pre-render leaves the build as it was rendered last.
if ('on' in output) {
  await new Promise<void>((done, fail) =>
    output.on('event', (event) => {
      if (event.code === 'END') done();
      if (event.code === 'ERROR') fail(event.error);
    }),
  );
  await prerender();
  output.on('event', (event) => {
    if (event.code === 'END') prerender().catch((error: unknown) => console.error(error));
  });
} else await prerender();

await preview({
  ...app,
  logLevel: 'warn',
  build: { outDir },
  preview: { host: '127.0.0.1', port, strictPort: true },
  plugins: [
    {
      // Uncompressed: the browser is on the same machine, and the preview server would gzip every
      // file again for every test's fresh context: on CI's two cores, five minutes of the suite.
      name: 'envui-uncompressed',
      configurePreviewServer(server) {
        server.middlewares.use((request, _response, next) => {
          delete request.headers['accept-encoding'];
          next();
        });
      },
    },
  ],
});
console.log(`Serving the ${values.app}'s build at http://127.0.0.1:${port}`);
