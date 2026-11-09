import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { buildSiteServer, loadSiteServer, pageFile } from '../../scripts/site/PrerenderSite.ts';
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
    assert.equal(description, page.summary ?? description, route);
    assert.ok(description, `${route} has a description`);
  }
});

test("a page's figures are skeletons at their recorded size until it hydrates", async () => {
  const { html } = await server.renderPage('components/button');
  // The page's first figure holds its place for its example, which renders in the browser alone.
  assert.match(html, /data-site-part="example:button\/CreateProject"[^>]*;block-size:\d/);
});

test("a page's code is highlighted as it pre-renders, and its HTML carries the tokens", async () => {
  const { html, code } = await server.renderPage('docs/components/button');
  // Each token is a span in its theme's color, the light one's on the server.
  assert.match(html, /<pre[^>]*><code><span style="--env-code-token:#/);
  const data = JSON.parse(
    /<script type="application\/json" id="site-page-code">(.*)<\/script>/.exec(code)[1],
  );
  assert.ok(data.blocks.length > 0);
  assert.ok(data.blocks.every(([language, lines]) => language && lines.length));
  // A page without code carries none.
  assert.equal((await server.renderPage('components/button')).code, undefined);
});

test('each page is written at the file its address is served from', () => {
  assert.equal(pageFile('/'), 'index.html');
  assert.equal(pageFile('/components/button'), 'components/button.html');
  assert.equal(pageFile('/docs'), 'docs.html');
});
