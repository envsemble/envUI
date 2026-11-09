import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { resolve } from 'node:path';
import {
  buildSiteServer,
  loadSiteServer,
  pageFile,
  redirectsFile,
} from '../../scripts/site/PrerenderSite.ts';
import { siteDescription } from '../../apps/site/src/routes/SiteDescription.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { importSource } from '../support/ImportSource.mjs';

// The server entry as the build makes it (scripts/site/PrerenderSite.ts), built here, in seconds,
// rather than read from dist/site-server, which the build beside this test may be writing.
const serverDirectory = resolve(repositoryRoot, '.cache/unit/site-server');
await buildSiteServer(serverDirectory);
const server = await loadSiteServer(serverDirectory);
const { allPages } = await importSource('SiteRoutes', 'apps/site/src/routes/SiteRoutes.ts');

/** The text of an element's HTML, its tags left out and its entities read. */
const text = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

test('the server renders with the library from its source, as the browser does', async () => {
  // One copy of the library: the built package beside the source would bring a second copy of
  // every context, and render what the last library build was rather than the source.
  const bundle = await readFile(resolve(serverDirectory, 'Server.js'), 'utf8');
  assert.equal(bundle.includes('packages/ui/dist/'), false);
  assert.equal(bundle.includes('packages/ui/src/'), true);
});

test('every page the site serves pre-renders, with its one heading and its title', async () => {
  assert.deepEqual(
    server.sitePages.map(({ route }) => route),
    allPages.map(({ path }) => path),
  );
  for (const { route } of server.sitePages) {
    const page = allPages.find(({ path }) => path === route);
    const { title, description, html } = await server.renderPage(route);
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(headings.length, 1, `${route} has one <h1>`);
    // The home page's heading is the logo, named envUI.
    const [, heading] = headings[0];
    const name = text(heading) || /aria-label="([^"]*)"/.exec(heading)?.[1];
    assert.equal(name, page.kind === 'home' ? 'envUI' : page.title, route);
    // The tab's title, as the site sets it.
    const site = page.area === 'docs' ? 'envUI Docs' : 'envUI';
    const home = page.kind === 'home' || page.path === 'docs';
    assert.equal(title, home ? site : `${page.title} · ${site}`, route);
    // Its summary, or else what the site is.
    assert.equal(description, page.summary ?? siteDescription, route);
  }
});

test("a page's figures are skeletons at their recorded size until it hydrates", async () => {
  const { html } = await server.renderPage('components/button');
  // The page's first figure holds its place for its example, which renders in the browser alone.
  assert.match(html, /data-site-part="example:button\/CreateProject"[^>]*;block-size:\d/);
});

test('each page is written at the file its address is served from', () => {
  assert.equal(pageFile('/'), 'index.html');
  assert.equal(pageFile('/components/button'), 'components/button.html');
  assert.equal(pageFile('/docs'), 'docs.html');
});

test('an address with no page pre-renders as Page not found, with no page named', async () => {
  const { title, description, html } = await server.renderNotFound();
  assert.equal(title, 'Page not found · envUI');
  assert.equal(description, siteDescription);
  assert.match(text(html), /Page not found/);
});

test('the host redirects old addresses that their path alone leads from, each to a page', () => {
  const pages = new Set(server.sitePages.map(({ address }) => address));
  assert.ok(server.oldAddresses.length > 50, 'the old addresses are listed');
  for (const { from, to } of server.oldAddresses) {
    assert.ok(!pages.has(from), `${from} is no page's address`);
    assert.ok(pages.has(to.split('#')[0]), `${from} leads to the page ${to}`);
  }
  const redirects = Object.fromEntries(server.oldAddresses.map(({ from, to }) => [from, to]));
  assert.equal(redirects['/components/buttons'], '/components/button');
  assert.equal(redirects['/patterns/feature-cards'], '/components/card#feature-card');
  assert.equal(
    redirectsFile([{ from: '/components/buttons', to: '/components/button' }]),
    '/components/buttons /components/button 301\n',
  );
});
