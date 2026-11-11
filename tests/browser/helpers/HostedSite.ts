/**
 * The hosted site from `npm run build:site`, which specs serve from dist/site/ at a made-up
 * address with page.route, through the hosted Worker script and with the headers of its _headers,
 * as Cloudflare serves it: the browser fetches nothing over the network, so no server, port or
 * connection is involved.
 */
import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import worker from '../../../apps/site/hosting/Worker.mjs';
import { headersFor, siteHeaders } from '../../../scripts/site/SiteHeaders.ts';

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
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/** Whether the hosted site is built. */
export const siteBuilt = () => existsSync(resolve(site, 'module-files.json'));

/**
 * Requires the hosted build. `npm run verify` builds it first, and so does CI, where a missing build
 * fails rather than skips; a local run without one skips.
 */
export function requireSite() {
  const built = siteBuilt();
  if (!built && process.env.CI)
    throw new Error('The hosted build is missing: run npm run build:site first');
  test.skip(!built, 'Needs the hosted build: npm run build:site');
}

/** The files of the hosted build that a module, by its path in the site app, loads. */
export function moduleFiles(module: string) {
  const files: string[] =
    JSON.parse(readFileSync(resolve(site, 'module-files.json'), 'utf8'))[module] ?? [];
  expect(files.length, `${module} in module-files.json`).toBeGreaterThan(0);
  return files.map((file) => `/${file}`);
}

/**
 * The redirects of old addresses in the hosted build's _redirects, by the address each redirects:
 * `/from /to 301` lines, as PrerenderSite.ts writes them.
 */
function siteRedirects() {
  const file = resolve(site, '_redirects');
  if (!existsSync(file)) return new Map<string, string>();
  return new Map(
    readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [from = '', to = ''] = line.split(' ');
        return [from, to];
      }),
  );
}

/**
 * The file of the hosted build at a path, or undefined when it has none: a page's pre-rendered
 * file, such as components/button.html for /components/button, as Cloudflare's asset server finds
 * it (html_handling), or index.html for the root.
 */
function siteFile(pathname: string) {
  const path = decodeURI(pathname);
  const file = resolve(site, `.${path.endsWith('/') ? `${path}index.html` : path}`);
  // A page's folder, such as docs/ beside docs.html, is no file.
  if (existsSync(file) && statSync(file).isFile()) return file;
  const page = resolve(site, `.${path.replace(/\/$/, '')}.html`);
  return path !== '/' && existsSync(page) ? page : undefined;
}

export interface ServeSiteOptions {
  /** The paths whose files fail, as `failure` says; none by default. */
  failing?: (pathname: string) => boolean;
  /**
   * How a failing file fails: missing, gone after a deploy, which the Worker answers as not found,
   * or aborted, with the connection dropped.
   */
  failure?: 'missing' | 'aborted';
  /** Rewrites the scripts the site serves. */
  script?: (text: string) => string;
}

/**
 * Serves the hosted build to the page at siteUrl through the hosted Worker script, with an asset
 * server that answers as Cloudflare's does from dist/site: a page's address gets its pre-rendered
 * file, an old address _redirects lists the page it leads to, and any other path without a file
 * 404.html with a 404 status, where an old address renders the page it leads to, with the headers
 * dist/site/_headers gives its path, and the Worker answers a file missing under /assets/ as not
 * found. With options, chosen files fail, to test how the catalogue recovers.
 */
export async function serveSite(
  page: Page,
  { failing = () => false, failure = 'missing', script = (text) => text }: ServeSiteOptions = {},
) {
  const rules = siteHeaders(resolve(site, '_headers'));
  const redirects = siteRedirects();
  await page.route(`${siteUrl}/**`, async (route) => {
    const request = route.request();
    const gone = failing(new URL(request.url()).pathname);
    if (gone && failure === 'aborted') return route.abort('internetdisconnected');
    const assets = {
      async fetch(assetRequest: Request) {
        // A route can't answer a page load with a redirect, which Chromium then fails: an old
        // address _redirects lists gets the file of the page it leads to, whose script corrects
        // the address (routes/useSiteRoute.ts), as the redirect would.
        const requested = new URL(assetRequest.url).pathname;
        const pathname = redirects.get(requested)?.split('#')[0] ?? requested;
        const found = gone ? undefined : siteFile(pathname);
        const file = found ?? resolve(site, '404.html');
        const body =
          extname(file) === '.js' ? script(readFileSync(file, 'utf8')) : readFileSync(file);
        return new Response(body, {
          status: found ? 200 : 404,
          headers: {
            // The asset server applies _headers; the Worker's own responses under /assets/ set theirs.
            ...(pathname.startsWith('/assets/') ? {} : headersFor(rules, pathname)),
            'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
          },
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
