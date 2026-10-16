// Theme on the server: the attributes it writes, and its development warning about a theme that is
// neither light nor dark, as JavaScript that passes 0.x's useTheme() to it would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build as esbuild } from 'esbuild';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { build as vite, createServer } from 'vite';
import { Theme, useTheme } from '../packages/ui/dist/index.js';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const themeModule = fileURLToPath(
  new URL('../packages/ui/dist/foundations/Theme.js', import.meta.url),
);
const warning = 'takes a theme of';
const require = createRequire(import.meta.url);

/** Renders on the server and returns the markup and what was reported through console.error. */
function render(element) {
  const errors = [];
  const original = console.error;
  console.error = (...values) => errors.push(values.join(' '));
  try {
    return { markup: renderToString(element), errors };
  } finally {
    console.error = original;
  }
}

test('Theme warns once in development about a theme that is not light or dark', () => {
  const portal = { theme: 'dark', contrast: 'high' };
  const { errors } = render(
    h('div', null, h(Theme, { theme: portal }, 'a'), h(Theme, { theme: portal }, 'b')),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /"light" or "dark", not \{"theme":"dark","contrast":"high"\}/);
  assert.match(errors[0], /<Theme \{\.\.\.useTheme\(\)\}>/);
  assert.equal(render(h(Theme, { theme: 'dark' }, 'c')).errors.length, 0);
});

test('Theme shows any theme in its warning, and lets an error from console.error through', () => {
  const circular = { theme: 'dark' };
  circular.self = circular;
  const { errors } = render(
    h('div', null, h(Theme, { theme: circular }, 'a'), h(Theme, { theme: { size: 1n } }, 'b')),
  );
  assert.equal(errors.length, 2);
  assert.match(errors[0], /not \{"theme":"dark","self":"\[Circular\]"\}/);
  assert.match(errors[1], /not \{"size":"1n"\}/);

  // A console.error that throws, as some test setups make it, fails the render rather than going
  // unnoticed, and the theme is reported again on the next one.
  const original = console.error;
  console.error = () => {
    throw new Error('console.error was called');
  };
  try {
    assert.throws(() => renderToString(h(Theme, { theme: 'sepia' }, 'c')), /console\.error/);
  } finally {
    console.error = original;
  }
  const again = render(h(Theme, { theme: 'sepia' }, 'c')).errors;
  assert.equal(again.length, 1);
  assert.match(again[0], /not sepia\./);
});

test('a Theme without a contrast takes a data-env-contrast written on it, and the prop wins', () => {
  function Inner() {
    return h('output', null, useTheme().contrast);
  }
  const attribute = render(
    h(Theme, { theme: 'light', 'data-env-contrast': 'high' }, h(Inner)),
  ).markup;
  assert.match(attribute, /data-env-contrast="high"/);
  assert.match(attribute, /<output>high<\/output>/);
  const prop = render(
    h(Theme, { theme: 'light', contrast: 'standard', 'data-env-contrast': 'high' }, h(Inner)),
  ).markup;
  assert.match(prop, /data-env-contrast="standard"/);
  assert.match(prop, /<output>standard<\/output>/);
});

test('a Theme writes its scale, which nested Themes inherit, and a data-env-scale counts', () => {
  function Inner() {
    return h('output', null, useTheme().scale);
  }
  const plain = render(h(Theme, { theme: 'light' }, h(Inner))).markup;
  assert.match(plain, /data-env-scale="comfortable"/);
  assert.match(plain, /<output>comfortable<\/output>/);
  const nested = render(
    h(Theme, { theme: 'light', scale: 'compact' }, h(Theme, { theme: 'dark' }, h(Inner))),
  ).markup;
  assert.equal(nested.match(/data-env-scale="compact"/g)?.length, 2);
  assert.match(nested, /<output>compact<\/output>/);
  const attribute = render(
    h(Theme, { theme: 'light', 'data-env-scale': 'compact' }, h(Inner)),
  ).markup;
  assert.match(attribute, /<output>compact<\/output>/);
  const prop = render(
    h(Theme, { theme: 'light', scale: 'comfortable', 'data-env-scale': 'compact' }, h(Inner)),
  ).markup;
  assert.match(prop, /data-env-scale="comfortable"/);
});

/** Runs `run` where nothing defines process, as in a browser. */
function withoutProcess(run) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
  delete globalThis.process;
  try {
    assert.equal(typeof process, 'undefined');
    return run();
  } finally {
    Object.defineProperty(globalThis, 'process', descriptor);
  }
}

/**
 * Bundles Theme as an application's build would, with React left as an import, and returns its
 * exports. `stdin` replaces the module with code already transformed, such as by Vite's dev server.
 */
async function bundleTheme({ define = {}, stdin, plugins = [] }) {
  const built = await esbuild({
    ...(stdin ? { stdin: { contents: stdin, loader: 'js' } } : { entryPoints: [themeModule] }),
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'neutral',
    define,
    external: ['react', 'react/*'],
    plugins,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(
    require,
    module,
    module.exports,
  );
  return module.exports;
}

test('Theme renders where nothing defines process, as in a browser without a bundler', () => {
  const result = withoutProcess(() => render(h(Theme, { theme: { theme: 'dark' } }, 'a')));
  assert.match(result.markup, /class="env-theme"/);
  // Without a development build to report in, the warning stays silent.
  assert.equal(result.errors.length, 0);
});

test('a development bundle warns in a browser, where nothing defines process', async () => {
  // Bundlers replace process.env.NODE_ENV in an application's development build, but leave
  // `process` itself undefined in the browser.
  const { Theme: Bundled } = await bundleTheme({
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  const { errors } = withoutProcess(() => render(h(Bundled, { theme: { theme: 'light' } }, 'a')));
  assert.equal(errors.length, 1, 'esbuild in development stays silent');
  assert.match(errors[0], new RegExp(warning));
});

test("Vite's development server keeps the warning for the browser", async () => {
  // Starting a server sets NODE_ENV for the process; the production build below must not see it.
  const nodeEnvironment = process.env.NODE_ENV;
  const server = await createServer({
    configFile: false,
    root: repositoryRoot,
    logLevel: 'silent',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  let code;
  try {
    code = (await server.transformRequest('/packages/ui/dist/foundations/Theme.js')).code;
  } finally {
    await server.close();
    if (nodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = nodeEnvironment;
  }
  assert.doesNotMatch(code, /process\.env\.NODE_ENV/, 'Vite replaced process.env.NODE_ENV');
  // The served module imports by URL: React stays an import, the rest is the package's own file.
  const servedImports = {
    name: 'served-imports',
    setup(build) {
      build.onResolve({ filter: /^\// }, ({ path }) => {
        const file = path.replace(/\?.*$/, '');
        if (file.startsWith('/node_modules/react/'))
          return {
            path: file.includes('jsx-runtime') ? 'react/jsx-runtime' : 'react',
            external: true,
          };
        return { path: fileURLToPath(new URL(`.${file}`, pathToFileURL(repositoryRoot))) };
      });
    },
  };
  const { Theme: Served } = await bundleTheme({ stdin: code, plugins: [servedImports] });
  const { errors } = withoutProcess(() => render(h(Served, { theme: 'blue' }, 'a')));
  assert.equal(errors.length, 1, "Vite's development server stays silent");
  assert.match(errors[0], new RegExp(warning));
});

test('a production bundle leaves the development warning out', async () => {
  const external = /^react/;
  const built = await esbuild({
    entryPoints: [themeModule],
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: ['react', 'react/*'],
    logLevel: 'silent',
  });
  assert.doesNotMatch(built.outputFiles[0].text, new RegExp(warning), 'esbuild keeps the warning');

  // Vite replaces process.env.NODE_ENV itself in a production build, as it does for applications.
  const output = await vite({
    configFile: false,
    logLevel: 'silent',
    mode: 'production',
    build: {
      write: false,
      minify: true,
      rolldownOptions: { input: themeModule, preserveEntrySignatures: 'exports-only', external },
    },
  });
  const code = [output]
    .flat()
    .flatMap((result) => result.output)
    .map((chunk) => chunk.code ?? '')
    .join('');
  assert.match(code, /env-theme/, 'Vite bundled Theme');
  assert.doesNotMatch(code, new RegExp(warning), 'Vite keeps the warning');
});
