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
  // The server renders on a fixed day, so the browser's own today can lie in another month.
  const RealDate = Date;
  const serverTime = RealDate.parse('2026-03-17T10:00:00Z');
  globalThis.Date = class extends RealDate {
    constructor(...values) {
      super(...(values.length > 0 ? values : [serverTime]));
    }
    static now() {
      return serverTime;
    }
  };
  let markup;
  try {
    markup = renderToString(createElement(HydrationApp));
  } finally {
    globalThis.Date = RealDate;
  }
  assert.match(markup, /Server value/);
  // The server wrote the relative time in its own language; the browser corrects it.
  assert.match(markup, />in 2 days<\/time>/);
  // Date fields and calendars without a locale write British English on the server, as the
  // browser does while hydrating; a calendar without a value leaves today's month to the browser.
  assert.match(markup, />17 Mar 2026</);
  const localCalendar = markup.slice(markup.indexOf('aria-label="Hydrated local calendar"'));
  assert.match(localCalendar.slice(0, localCalendar.indexOf('</table>')), />March 2026</);
  const todayCalendar = markup.slice(markup.indexOf('aria-label="Hydrated today"'));
  assert.doesNotMatch(todayCalendar.slice(0, todayCalendar.indexOf('</table>')), /data-date=/);
  // Nor does it tell whether its month buttons reach past min and max.
  const boundedCalendar = markup.slice(markup.indexOf('aria-label="Hydrated bounded today"'));
  assert.doesNotMatch(
    boundedCalendar.slice(0, boundedCalendar.indexOf('</table>')),
    /aria-disabled=/,
  );
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
