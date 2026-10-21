#!/usr/bin/env node
// The browser step's dev server, run in a child process with the agent's environment, so the
// result's own Vite config and plugins never run inside the runner. It serves the app in
// development with envUI's dev mode loaded, and prints one line when it listens or fails:
//
//   node dev-server.mjs <app directory> <port> <cache directory>
//   -> "READY http://127.0.0.1:<port>/" or "ERROR <message>"
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [appDir, port, cacheDir] = process.argv.slice(2);

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
 * like the app's imports. It sets `__benchDevMode` when the readout is there.
 */
const devModePlugin = {
  name: 'bench-dev-mode',
  apply: 'serve',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      const script = `<script type="module">
import('@envsemble/envui/dev').then(
  ({ installDevMode }) => {
    installDevMode({ button: false, shortcut: false, parts: [] });
    window.__benchDevMode = 'ready';
  },
  (error) => { window.__benchDevMode = 'error: ' + (error && error.message ? error.message : error); },
);
</script>`;
      return html.includes('</head>')
        ? html.replace('</head>', `${script}\n</head>`)
        : `${script}\n${html}`;
    },
  },
};

/** The package a bare module specifier names: `@pierre/theme/pierre-dark` is `@pierre/theme`. */
const packageOf = (specifier) =>
  specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

/**
 * Stands in for envUI's optional peer dependencies that the app hasn't installed. Dev mode's own UI
 * reaches the content entry's code highlighting, whose theme package is an optional peer, so an app
 * without it couldn't load dev mode. The stand-in is an empty module; dev mode's readout doesn't use
 * it. Applied in the dependency optimizer and in the dev server alike.
 */
function missingPeersPlugin() {
  const require = createRequire(join(appDir, 'package.json'));
  let optional = new Set();
  try {
    const manifest = JSON.parse(
      readFileSync(require.resolve('@envsemble/envui/package.json'), 'utf8'),
    );
    const meta = manifest.peerDependenciesMeta ?? {};
    optional = new Set(Object.keys(meta).filter((name) => meta[name]?.optional));
  } catch {
    // No envUI installed: nothing to stand in for.
  }
  const missing = new Map();
  const isMissing = (name) => {
    if (!missing.has(name)) {
      let found = true;
      try {
        require.resolve(`${name}/package.json`);
      } catch {
        found = false;
      }
      missing.set(name, !found);
    }
    return missing.get(name);
  };
  const prefix = '\0bench-missing-peer:';
  return {
    name: 'bench-missing-peers',
    resolveId(id) {
      if (/^[./\0]/.test(id)) return null;
      const name = packageOf(id);
      return optional.has(name) && isMissing(name) ? `${prefix}${id}` : null;
    },
    load(id) {
      return id.startsWith(prefix)
        ? 'const missing = { colors: {}, tokenColors: [] };\nexport default missing;\n'
        : null;
    },
  };
}

try {
  const vite = await appVite();
  const missingPeers = missingPeersPlugin();
  const server = await vite.createServer({
    root: appDir,
    mode: 'development',
    configLoader: 'runner',
    cacheDir,
    logLevel: 'silent',
    clearScreen: false,
    plugins: [devModePlugin, missingPeers],
    optimizeDeps: {
      include: ['@envsemble/envui/dev'],
      rolldownOptions: { plugins: [missingPeers] },
    },
    server: {
      host: '127.0.0.1',
      port: Number(port),
      strictPort: true,
      open: false,
      hmr: false,
      watch: null,
    },
  });
  await server.listen();
  console.log(`READY http://127.0.0.1:${port}/`);
} catch (error) {
  console.log(
    `ERROR ${String(error?.message ?? error)
      .replace(/\s+/g, ' ')
      .slice(0, 400)}`,
  );
  process.exit(1);
}
