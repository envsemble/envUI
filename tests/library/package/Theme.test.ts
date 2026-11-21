import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build as esbuild } from 'esbuild';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { build as vite, createServer } from 'vite';
import { Theme, ThemePreferenceProvider, useTheme } from '../../../packages/ui/dist/index.js';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';
import { join } from 'node:path';

const themeModule = join(repositoryRoot, 'packages/ui/dist/foundations/Theme.js');
const warning = 'takes a theme of';
const require = createRequire(import.meta.url);

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

  const shared = { scheme: 'dark' };
  const deep = { inner: {} };
  deep.inner.outer = deep;
  const shown = (theme) => render(h(Theme, { theme }, 'a')).errors;
  assert.match(
    shown({ a: shared, b: [shared, shared] })[0],
    /not \{"a":\{"scheme":"dark"\},"b":\[\{"scheme":"dark"\},\{"scheme":"dark"\}\]\}\./,
  );
  assert.match(shown(deep)[0], /not \{"inner":\{"outer":"\[Circular\]"\}\}\./);
  assert.match(shown({ toJSON: () => undefined })[0], /not an object\./);

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
  assert.match(plain, /data-env-scale="system"/);
  assert.match(plain, /<output>system<\/output>/);
  const comfortable = render(
    h(Theme, { theme: 'light', scale: 'comfortable' }, h(Theme, { theme: 'dark' }, h(Inner))),
  ).markup;
  assert.equal(comfortable.match(/data-env-scale="comfortable"/g)?.length, 2);
  const nested = render(
    h(Theme, { theme: 'light', scale: 'compact' }, h(Theme, { theme: 'dark' }, h(Inner))),
  ).markup;
  assert.equal(nested.match(/data-env-scale="compact"/g)?.length, 2);
  assert.match(nested, /<output>compact<\/output>/);
  const attribute = render(
    h(Theme, { theme: 'light', 'data-env-scale': 'compact' }, h(Inner)),
  ).markup;
  assert.match(attribute, /<output>compact<\/output>/);
  const systemAttribute = render(
    h(Theme, { theme: 'light', 'data-env-scale': 'system' }, h(Inner)),
  ).markup;
  assert.match(systemAttribute, /<output>system<\/output>/);
  const prop = render(
    h(Theme, { theme: 'light', scale: 'comfortable', 'data-env-scale': 'compact' }, h(Inner)),
  ).markup;
  assert.match(prop, /data-env-scale="comfortable"/);
});

test('a Theme writes its selection and corners, which nested Themes and useTheme take', () => {
  function Inner() {
    const { selection, corners } = useTheme();
    return h('output', null, `${selection} ${corners}`);
  }
  const plain = render(h(Theme, { theme: 'light' }, h(Inner))).markup;
  assert.match(plain, /data-env-selection="neutral" data-env-corners="rounded"/);
  assert.doesNotMatch(plain, /data-env-surface/);
  const nested = render(
    h(
      Theme,
      { theme: 'light', selection: 'accent', corners: 'sharp' },
      h(Theme, { theme: 'dark', corners: 'round' }, h(Inner)),
    ),
  ).markup;
  assert.equal(nested.match(/data-env-selection="accent"/g)?.length, 2);
  assert.match(nested, /<output>accent round<\/output>/);
});

test('ThemePreferenceProvider renders its default on the server and leaves the look to the root', () => {
  function Inner() {
    return h('output', null, useTheme().theme);
  }
  const root = render(
    h(ThemePreferenceProvider, { className: 'app', defaultPreference: 'system' }, h(Inner)),
  ).markup;
  assert.match(root, /^<div data-env-ssr-root="" class="app"><output>light<\/output><\/div>$/);
  const own = render(
    h(ThemePreferenceProvider, { applyToDocument: false, defaultPreference: 'dark' }, h(Inner)),
  ).markup;
  assert.match(
    own,
    /^<div class="env-theme" data-env-theme="dark" data-env-scale="system" data-env-selection="neutral" data-env-corners="rounded">/,
  );
  assert.match(own, /<output>dark<\/output>/);
});

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

async function bundleTheme({ define = {}, stdin, plugins = [] }) {
  const built = await esbuild({
    ...(stdin ? { stdin: { contents: stdin, loader: 'js' } } : { entryPoints: [themeModule] }),
    bundle: true,
    loader: { '.css': 'empty' },
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
  assert.equal(result.errors.length, 0);
});

test('a development bundle warns in a browser, where nothing defines process', async () => {
  const { Theme: Bundled } = await bundleTheme({
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  const { errors } = withoutProcess(() => render(h(Bundled, { theme: { theme: 'light' } }, 'a')));
  assert.equal(errors.length, 1, 'esbuild in development stays silent');
  assert.match(errors[0], new RegExp(warning));
});

test("Vite's development server keeps the warning for the browser", async () => {
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
        return { path: fileURLToPath(new URL(`.${file}`, pathToFileURL(`${repositoryRoot}/`))) };
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
    loader: { '.css': 'empty' },
    minify: true,
    write: false,
    format: 'esm',
    define: { 'process.env.NODE_ENV': '"production"' },
    external: ['react', 'react/*'],
    logLevel: 'silent',
  });
  assert.doesNotMatch(built.outputFiles[0].text, new RegExp(warning), 'esbuild keeps the warning');

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
