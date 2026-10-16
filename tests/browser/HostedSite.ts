/**
 * The hosted catalogue from `npm run build:site`, served at a made-up address through the hosted
 * Worker script, as Cloudflare serves it, for the browser tests of the hosted build.
 */
import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import worker from '../../apps/catalogue/site/Worker.mjs';

export const site = resolve('dist/site');
export const siteUrl = 'http://envui.site.test';
const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.png': 'image/png',
};

/**
 * Requires the hosted build. `npm run verify` builds it first, and so does CI, where a missing build
 * fails rather than skips; a local run without one skips.
 */
export function requireSite() {
  const built = existsSync(resolve(site, 'module-files.json'));
  if (!built && process.env.CI)
    throw new Error('The hosted build is missing: run npm run build:site first');
  test.skip(!built, 'Needs the hosted build: npm run build:site');
}

/** The files of the hosted build that a module, by its path in the catalogue app, loads. */
export function moduleFiles(module: string) {
  const files: string[] =
    JSON.parse(readFileSync(resolve(site, 'module-files.json'), 'utf8'))[module] ?? [];
  expect(files.length, `${module} in module-files.json`).toBeGreaterThan(0);
  return files.map((file) => `/${file}`);
}

/**
 * Serves the hosted build at siteUrl through the hosted Worker script, with an asset server that
 * answers as Cloudflare's does from dist/site: a path without a file gets index.html. The files
 * `failing` returns true for fail as `failure` says: gone after a deploy, which the Worker answers
 * as not found, or with the connection dropped. `script` rewrites the scripts it serves.
 */
export async function serveSite(
  page: Page,
  failing: (pathname: string) => boolean,
  failure: 'missing' | 'aborted',
  script: (text: string) => string = (text) => text,
) {
  await page.route(`${siteUrl}/**`, async (route) => {
    const request = route.request();
    const gone = failing(new URL(request.url()).pathname);
    if (gone && failure === 'aborted') return route.abort('internetdisconnected');
    const assets = {
      async fetch(assetRequest: Request) {
        const { pathname } = new URL(assetRequest.url);
        const path = resolve(
          site,
          `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`,
        );
        const file = !gone && existsSync(path) ? path : resolve(site, 'index.html');
        const body =
          extname(file) === '.js' ? script(readFileSync(file, 'utf8')) : readFileSync(file);
        return new Response(body, {
          headers: { 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream' },
        });
      },
    };
    const response: Response = await worker.fetch(
      new Request(request.url(), { method: request.method() }),
      { ASSETS: assets },
    );
    return route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
}
