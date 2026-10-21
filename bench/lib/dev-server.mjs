#!/usr/bin/env node
// The browser step's dev server, run in a child process with the agent's environment, so the
// result's own Vite config and plugins never run inside the runner. It serves the app in
// development with envUI's dev mode loaded, and prints one line when it listens or fails:
//
//   node dev-server.mjs <app directory> <port> <cache directory> [<fault>]
//   -> "READY http://127.0.0.1:<port>/"
//   -> "ERROR result <message>": the result's config or plugins failed, the agent's doing
//   -> "ERROR port <message>": the port couldn't be bound, the harness's
//
// <fault> simulates a failure of the harness, for trying the step's handling of it: "port" binds
// the port first, "dev-mode" breaks the runner's dev-mode plugin, "silent" never starts.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer as createNetServer } from 'node:net';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [appDir, port, cacheDir, fault] = process.argv.slice(2);
const oneLine = (error) =>
  String(error?.message ?? error)
    .replace(/\s+/g, ' ')
    .slice(0, 400);

/** Vite as the app installed it, so the app's own config and plugins load as in `npm run dev`. */
async function appVite() {
  const require = createRequire(join(appDir, 'package.json'));
  const manifestFile = require.resolve('vite/package.json');
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const entry = manifest.exports?.['.'];
  const file =
    typeof entry === 'string' ? entry : (entry?.import?.default ?? entry?.import ?? entry?.default);
  return import(pathToFileURL(join(dirname(manifestFile), file)).href);
}

/**
 * Loads dev mode before the app's own scripts: an inline module script the dev server resolves
 * like the app's imports. It sets `__benchDevMode` when the readout is there, or the error.
 */
const devModeEntry = fault === 'dev-mode' ? '@envsemble/envui/dev-missing' : '@envsemble/envui/dev';
/**
 * The part names dev mode reads, served from the installed package as Vite serves the app's files;
 * without them, dev mode names parts by their classes alone.
 */
const partsFile = join(appDir, 'node_modules/@envsemble/envui/docs/generated/parts.json');
const partsOption = existsSync(partsFile)
  ? "parts: '/node_modules/@envsemble/envui/docs/generated/parts.json', "
  : '';
/**
 * The runner's own module, `virtual:bench-dev-mode`, which the page imports first. A build error
 * that names it is the runner's, not the result's.
 */
export const devModeModule = 'virtual:bench-dev-mode';
const devModeCode = `import('${devModeEntry}').then(
  ({ installDevMode }) => {
    try {
      installDevMode({ ${partsOption}button: false, shortcut: false });
      window.__benchDevMode = 'ready';
    } catch (error) {
      window.__benchDevMode = 'error: ' + (error && error.message ? error.message : error);
    }
  },
  (error) => { window.__benchDevMode = 'error: ' + (error && error.message ? error.message : error); },
);
`;
const devModePlugin = {
  name: 'bench-dev-mode',
  enforce: 'pre',
  apply: 'serve',
  async resolveId(id, importer) {
    if (id === devModeModule) return `\0${devModeModule}`;
    if (importer !== `\0${devModeModule}`) return null;
    // What the runner's module imports: a failure to resolve it names the module, so the step can
    // tell it from the result's own build errors.
    try {
      return await this.resolve(id, importer, { skipSelf: true });
    } catch (error) {
      throw new Error(`[${devModeModule}] ${error?.message ?? error}`, { cause: error });
    }
  },
  load(id) {
    return id === `\0${devModeModule}` ? devModeCode : null;
  },
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const script = `<script type="module">import '${devModeModule}';</script>`;
      return html.includes('</head>')
        ? html.replace('</head>', `${script}\n</head>`)
        : `${script}\n${html}`;
    },
  },
};

if (fault === 'silent') {
  // Stays up and says nothing; the interval keeps the process alive.
  setInterval(() => {}, 60_000);
  await new Promise(() => {});
}
if (fault === 'port')
  await new Promise((resolve) =>
    createNetServer().listen(Number(port), '127.0.0.1', () => resolve()),
  );

let server;
try {
  // The result's vite.config and plugins load here.
  const vite = await appVite();
  server = await vite.createServer({
    root: appDir,
    mode: 'development',
    configLoader: 'runner',
    cacheDir,
    logLevel: 'silent',
    clearScreen: false,
    plugins: [devModePlugin],
    optimizeDeps: { include: ['@envsemble/envui/dev'] },
    server: {
      host: '127.0.0.1',
      port: Number(port),
      strictPort: true,
      open: false,
      hmr: false,
      watch: null,
    },
  });
} catch (error) {
  console.log(`ERROR result ${oneLine(error)}`);
  process.exit(1);
}
try {
  await server.listen();
} catch (error) {
  const kind =
    ['EADDRINUSE', 'EACCES'].includes(error?.code) || /port/i.test(error?.message)
      ? 'port'
      : 'result';
  console.log(`ERROR ${kind} ${oneLine(error)}`);
  process.exit(1);
}
console.log(`READY http://127.0.0.1:${port}/`);
