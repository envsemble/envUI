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
  const fixture = resolve('tests/fixture/Hydration.fixture.tsx');
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
  // A Date that is the server's moment when made without a value; called as a function, as no
  // code here does, it would still give the real date.
  globalThis.Date = class extends RealDate {
    constructor(...values: unknown[]) {
      // The real Date takes what it is given, one value or a date's parts, which no one overload is.
      super(...((values.length > 0 ? values : [serverTime]) as [number, number]));
    }
    static now() {
      return serverTime;
    }
  } as DateConstructor;
  let markup;
  try {
    markup = renderToString(createElement(HydrationApp));
  } finally {
    globalThis.Date = RealDate;
  }
  assert.match(markup, /Server value/);
  // The server names the search shortcut with Ctrl, whatever platform it runs on.
  assert.match(markup, /aria-keyshortcuts="Control\+K"/);
  // The server renders the panes with their size and the side-by-side split, which CSS decides.
  assert.match(markup, /--env-panes-size:22\.5rem/);
  // A width kept in a cookie, which the server read: its markup has it.
  assert.match(markup, /--env-panes-size:30rem/);
  assert.match(markup, /data-split-at="medium"/);
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
      contents: `import {hydrateRoot} from 'react-dom/client';import {createElement} from 'react';import {HydrationApp} from './tests/fixture/Hydration.fixture.tsx';hydrateRoot(document.getElementById('root'),createElement(HydrationApp),{onRecoverableError:error=>{window.hydrationErrors.push(error.message)}});window.hydrationReady=true;`,
      resolveDir: process.cwd(),
    },
    jsx: 'automatic',
    bundle: true,
    // The page loads styles.css itself.
    loader: { '.css': 'empty' },
    format: 'iife',
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
  });
  let css = await readFile('packages/ui/dist/styles.css', 'utf8');
  const font = await readFile('packages/ui/dist/assets/Geist.woff2');
  css = css.replace(
    /url\([^)]*Geist\.woff2[^)]*\)/g,
    `url(data:font/woff2;base64,${font.toString('base64')})`,
  );
  const script = client.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  await writeFile(
    '.cache/Hydration.html',
    `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root">${markup}</div><script>window.hydrationErrors=[];${script}</script></body></html>`,
  );
});
