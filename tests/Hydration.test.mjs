import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

test('prepare compiled-public-API hydration acceptance fixture', async () => {
  await mkdir('.cache', { recursive: true });
  const fixture = resolve('tests/fixture/hydration/HydrationApp.tsx');
  const server = resolve('.cache/HydrationServer.mjs');
  await build({
    entryPoints: [fixture],
    jsx: 'automatic',
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: server,
  });
  const { HydrationApp } = await import(pathToFileURL(server).href);
  const markup = renderToString(createElement(HydrationApp));
  assert.match(markup, /Server value/);
  const client = await build({
    stdin: {
      contents: `import {hydrateRoot} from 'react-dom/client';import {createElement} from 'react';import {HydrationApp} from './tests/fixture/hydration/HydrationApp.tsx';hydrateRoot(document.getElementById('root'),createElement(HydrationApp),{onRecoverableError:error=>{window.hydrationErrors.push(error.message)}});window.hydrationReady=true;`,
      resolveDir: process.cwd(),
    },
    jsx: 'automatic',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
  });
  let css = await readFile('packages/ui/dist/styles.css', 'utf8');
  const font = await readFile('packages/ui/dist/assets/Inter.woff2');
  css = css.replace(
    /url\([^)]*Inter\.woff2[^)]*\)/g,
    `url(data:font/woff2;base64,${font.toString('base64')})`,
  );
  const script = client.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  await writeFile(
    '.cache/Hydration.html',
    `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root">${markup}</div><script>window.hydrationErrors=[];${script}</script></body></html>`,
  );
});
