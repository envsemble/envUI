import type { Page } from '@playwright/test';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fixtureUrl } from './Servers';

/**
 * Renders the library's source on the server, as an application would, and opens the markup in a
 * page with the style sheet: what people see before any script runs. `source` is a module, run
 * from the checkout, that exports `element`; `@envsemble/envui` resolves to the source.
 *
 *   await openServerMarkup(page, `import {createElement as h} from 'react';
 *     import {Panes} from '@envsemble/envui';
 *     export const element = h(Panes.Root, …);`);
 *
 * With `hydrate`, the page also loads the same module for the browser, and the returned function
 * hydrates the markup, so a spec can measure the page before and after any script runs. It
 * resolves with the recoverable errors React reported, such as a hydration mismatch.
 */
export async function openServerMarkup(
  page: Page,
  source: string,
  { hydrate = false }: { hydrate?: boolean } = {},
): Promise<() => Promise<string[]>> {
  await mkdir('.cache', { recursive: true });
  const server = resolve(`.cache/server-markup-${process.pid}-${Date.now()}.mjs`);
  await build({
    stdin: {
      contents: `${source}\nexport { renderToString } from 'react-dom/server';`,
      resolveDir: process.cwd(),
      loader: 'tsx',
    },
    alias: { '@envsemble/envui': './packages/ui/src/index.ts' },
    jsx: 'automatic',
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: server,
    logLevel: 'error',
  });
  let markup: string;
  try {
    const { element, renderToString } = await import(pathToFileURL(server).href);
    markup = renderToString(element);
  } finally {
    await rm(server, { force: true });
  }
  let client = '';
  if (hydrate) {
    const bundle = await build({
      stdin: {
        contents:
          `${source}
import { hydrateRoot } from 'react-dom/client';
` +
          `window.envHydrate = () => new Promise((resolve) => { const errors = [];
` +
          `  hydrateRoot(document.getElementById('server-markup'), element,
` +
          `    { onRecoverableError: (error) => errors.push(String(error)) });
` +
          `  setTimeout(() => requestAnimationFrame(() => resolve(errors)), 50); });`,
        resolveDir: process.cwd(),
        loader: 'tsx',
      },
      alias: { '@envsemble/envui': './packages/ui/src/index.ts' },
      define: { 'process.env.NODE_ENV': '"development"' },
      jsx: 'automatic',
      bundle: true,
      platform: 'browser',
      format: 'iife',
      write: false,
      logLevel: 'error',
    });
    client = bundle.outputFiles[0]!.text;
    await page.route('**/server-markup.js', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: client }),
    );
  }
  const stylesheet = `/@fs/${resolve('packages/ui/src/styles/index.css').replaceAll('\\', '/')}?direct`;
  await page.route('**/server-markup.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><head><link rel="stylesheet" href="${stylesheet}"></head><body><div id="server-markup" class="env-theme" data-env-theme="light">${markup}</div>${hydrate ? '<script src="server-markup.js"></script>' : ''}</body></html>`,
    }),
  );
  await page.goto(`${fixtureUrl}/server-markup.html`);
  return () =>
    page.evaluate(() =>
      (window as unknown as { envHydrate: () => Promise<string[]> }).envHydrate(),
    );
}
