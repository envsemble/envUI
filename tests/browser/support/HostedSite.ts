import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { headersFor, siteHeaders } from '../../../scripts/site/SiteHeaders.ts';

const site = resolve('dist/site');
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

export const siteBuilt = () => existsSync(resolve(site, 'module-files.json'));

export function requireSite() {
  const built = siteBuilt();
  if (!built && process.env.CI)
    throw new Error('The hosted build is missing: run npm run build:site first');
  test.skip(!built, 'Needs the hosted build: npm run build:site');
}

export function moduleFiles(module: string) {
  const files: string[] =
    JSON.parse(readFileSync(resolve(site, 'module-files.json'), 'utf8'))[module] ?? [];
  expect(files.length, `${module} in module-files.json`).toBeGreaterThan(0);
  return files.map((file) => `/${file}`);
}

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

function siteFile(pathname: string) {
  const path = decodeURI(pathname);
  const file = resolve(site, `.${path.endsWith('/') ? `${path}index.html` : path}`);
  if (existsSync(file) && statSync(file).isFile()) return file;
  const page = resolve(site, `.${path.replace(/\/$/, '')}.html`);
  return path !== '/' && existsSync(page) ? page : undefined;
}

export interface ServeSiteOptions {
  failing?: (pathname: string) => boolean;
  failure?: 'missing' | 'aborted';
  script?: (text: string) => string;
}

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
    const requested = new URL(request.url()).pathname;
    const pathname = redirects.get(requested)?.split('#')[0] ?? requested;
    const found = gone ? undefined : siteFile(pathname);
    const file = found ?? resolve(site, '404.html');
    const body = extname(file) === '.js' ? script(readFileSync(file, 'utf8')) : readFileSync(file);
    return route.fulfill({
      status: found ? 200 : 404,
      headers: {
        ...headersFor(rules, pathname),
        'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
      },
      body,
    });
  });
}
