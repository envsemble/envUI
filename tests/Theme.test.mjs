// Theme on the server: the attributes it writes, and its development warning about a theme that is
// neither light nor dark, as JavaScript that passes 0.x's useTheme() to it would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { build as vite } from 'vite';
import { Theme, useTheme } from '../packages/ui/dist/index.js';

const themeModule = fileURLToPath(
  new URL('../packages/ui/dist/foundations/Theme.js', import.meta.url),
);
const warning = 'takes a theme of';

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

test('Theme renders where nothing defines process, as in a browser without a bundler', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
  delete globalThis.process;
  let result;
  try {
    assert.equal(typeof process, 'undefined');
    result = render(h(Theme, { theme: { theme: 'dark' } }, 'a'));
  } finally {
    Object.defineProperty(globalThis, 'process', descriptor);
  }
  assert.match(result.markup, /class="env-theme"/);
  // Without a development build to report in, the warning stays silent.
  assert.equal(result.errors.length, 0);
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
