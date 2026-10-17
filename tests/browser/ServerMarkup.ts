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
 *     import {SplitPane} from '@envsemble/envui';
 *     export const element = h(SplitPane.Root, …);`);
 */
export async function openServerMarkup(page: Page, source: string) {
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
  const stylesheet = `/@fs/${resolve('packages/ui/src/styles/index.css').replaceAll('\\', '/')}?direct`;
  await page.route('**/server-markup.html', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><head><link rel="stylesheet" href="${stylesheet}"></head><body><div class="env-theme" data-env-theme="light">${markup}</div></body></html>`,
    }),
  );
  await page.goto(`${fixtureUrl}/server-markup.html`);
}
