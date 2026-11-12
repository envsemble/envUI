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
import { technicalText } from '../../apps/site/src/documentation/CatalogueContent.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { importSource } from '../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../support/Markup.ts';

// The server entry as the build makes it (scripts/site/PrerenderSite.ts), built here, in seconds,
// rather than read from dist/site-server, which the build beside this test may be writing.
const serverDirectory = resolve(repositoryRoot, '.cache/unit/site-server');
await buildSiteServer(serverDirectory);
const server = await loadSiteServer(serverDirectory);
const { allPages } = await importSource('SiteRoutes', 'apps/site/src/routes/SiteRoutes.ts');

/** Each page pre-rendered once, by its route, for the tests that read every page. */
const renderedPages = new Map();
const renderedPage = (route) => {
  if (!renderedPages.has(route)) renderedPages.set(route, server.renderPage(route));
  return renderedPages.get(route);
};

/**
 * The site's root as a page pre-renders it, as elements (tests/support/Markup.ts): its scripts
 * and style sheets, whose text is no element's, left out.
 */
const pageRoot = async (route) =>
  firstElement(
    `<div>${(await renderedPage(route)).html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '')}</div>`,
  );

/**
 * `element` and every element within it, in document order, each with whether it is inside one
 * that `skip` matches, itself included.
 */
function* walk(element, skip, skipped = false) {
  const inside = skipped || skip(element);
  yield [element, inside];
  for (const child of element.children)
    if (typeof child === 'object') yield* walk(child, skip, inside);
}

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
    const { title, description, html } = await renderedPage(route);
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

/**
 * What a page of the catalogue shows that its words leave out: the Code disclosures under its
 * figures, the examples they show, which are envUI at work with an application's own sample text,
 * and what the page hides.
 */
const notCatalogueWords = (element) =>
  element.tag === 'pre' ||
  'hidden' in element.attributes ||
  [
    'site-live-example-code',
    'env-code-block',
    'site-live-example',
    'site-verdict-stage',
    'site-anatomy-subject',
    'catalogue-tile-stage',
    'catalogue-open-example',
    'catalogue-banner-motif',
  ].some((name) => hasClass(element, name));

test("the catalogue's component, pattern and foundation pages show no technical text", async () => {
  // The catalogue is for people looking at envUI: no token names, hex colors, lengths, percentages
  // or code, which belong to the page's guide in the Docs. Its texts, names, titles and
  // placeholders count, as a reader and a screen reader meet them; its figures render in the
  // browser alone.
  const found: string[] = [];
  for (const { path, area, kind } of allPages) {
    if (area !== 'catalogue' || !['component', 'pattern', 'foundation'].includes(kind)) continue;
    const main = elementsOf(await pageRoot(path)).find((element) => hasClass(element, 'site-main'));
    assert.ok(main, `${path} has its main`);
    for (const [element, skipped] of walk(main, notCatalogueWords)) {
      if (skipped) continue;
      const words = [
        ...element.children.filter((child) => typeof child === 'string'),
        ...['aria-label', 'title', 'alt', 'placeholder'].map((name) => element.attributes[name]),
      ];
      for (const text of words)
        if (text?.trim())
          for (const technical of technicalText(text.trim()))
            found.push(`${path}: ${technical.kind}: ${technical.text}`);
    }
  }
  assert.deepEqual(
    found,
    [],
    "Say it in words, and move the value to the page's guide in the Docs.",
  );
});

/** What holds headings of its own rather than the page's: an example, a specimen or a dialog. */
const notPageSections = (element) =>
  ['site-live-example', 'catalogue-open-example', 'catalogue-specimen', 'env-dialog'].some((name) =>
    hasClass(element, name),
  );

/** The links of a list of the contents, one to each of its items, leaving out the nested lists'. */
const linksOf = (list) =>
  list.children
    .filter((item) => item.tag === 'li')
    .flatMap((item) => item.children.filter((child) => child.tag === 'a'));

/** The values that occur more than once in `values`. */
const repeated = (values) => values.filter((value, index) => values.indexOf(value) !== index);

test("a page's contents list its own sections, each once, at addresses of their own, and every page of the Docs has them", async () => {
  for (const { path, area } of allPages) {
    const elements = elementsOf(await pageRoot(path));
    const column = elements.find((element) => hasClass(element, 'site-page-column'));
    assert.ok(column, `${path} has its column`);
    // The page's own sections, in its order.
    const sections = [...walk(column, notPageSections)]
      .filter(([element, skipped]) => !skipped && element.tag === 'h2' && element.attributes.id)
      .map(([element]) => `#${element.attributes.id}`);
    const ids = elements.map((element) => element.attributes.id).filter(Boolean);
    // The contents beside the page, and the copy a narrow window shows under its banner.
    const contents = elements.filter(
      (element) => element.tag === 'nav' && element.attributes['aria-label'] === 'On this page',
    );
    if (area === 'docs') assert.ok(contents.length > 0, `${path} has its contents`);
    for (const navigation of contents) {
      const lists = elementsOf(navigation).filter(({ tag }) => tag === 'ol' || tag === 'ul');
      const hrefs = elementsOf(navigation)
        .filter(({ tag }) => tag === 'a')
        .map((link) => link.attributes.href);
      // Each level lists a heading's label once, and the whole list each address once.
      assert.deepEqual(
        lists.flatMap((list) => repeated(linksOf(list).map((link) => textOf(link).trim()))),
        [],
        `${path}: labels listed twice`,
      );
      assert.deepEqual(repeated(hrefs), [], `${path}: addresses listed twice`);
      // Each address leads to one element of the page.
      assert.deepEqual(
        hrefs.filter((href) => ids.filter((id) => `#${id}` === href).length !== 1),
        [],
        `${path}: addresses that lead to no element or to several`,
      );
      // The top level is the page's sections, in its order.
      assert.deepEqual(
        linksOf(lists[0]).map((link) => link.attributes.href),
        sections,
        path,
      );
    }
  }
});
