/**
 * The hosted catalogue from `npm run build:site`, which specs serve from dist/site/ at a made-up
 * address with page.route: the browser fetches nothing over the network, so no server, port or
 * connection is involved.
 */
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import type { Page } from '@playwright/test';

export const site = resolve('dist/site');
export const siteUrl = 'http://envui.site.test';
export const contentTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

/** Whether the hosted catalogue is built. */
export const siteBuilt = () => existsSync(resolve(site, 'module-files.json'));

/** The hosted Worker's answer for a file under /assets/ that is gone. */
export const notFound = {
  status: 404,
  body: 'Not found\n',
  headers: {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  },
};

/** The file of the hosted build at a path, as the Worker serves it, or undefined when it has none. */
export function siteFile(pathname: string) {
  const file = resolve(site, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  return existsSync(file) ? file : undefined;
}

/** Serves the hosted build to the page at siteUrl, as the Worker does. */
export async function serveSite(page: Page) {
  await page.route(`${siteUrl}/**`, (route) => {
    const file = siteFile(new URL(route.request().url()).pathname);
    if (!file) return route.fulfill(notFound);
    return route.fulfill({
      body: readFileSync(file),
      contentType: contentTypes[extname(file)] ?? 'application/octet-stream',
    });
  });
}
