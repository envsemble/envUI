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
import { technicalText } from '../../scripts/docs/validation/CatalogueWording.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';
import { importSource } from '../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../support/Markup.ts';

const serverDirectory = resolve(repositoryRoot, '.cache/unit/site-server');
await buildSiteServer(serverDirectory);
const server = await loadSiteServer(serverDirectory);
const { allPages } = await importSource('SiteRoutes', 'apps/site/src/routes/SiteRoutes.ts');

const renderedPages = new Map();
const renderedPage = (route) => {
  if (!renderedPages.has(route)) renderedPages.set(route, server.renderPage(route));
  return renderedPages.get(route);
};

const pageRoot = async (route) =>
  firstElement(
    `<div>${(await renderedPage(route)).html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, '')}</div>`,
  );

function* walk(element, skip, skipped = false) {
  const inside = skipped || skip(element);
  yield [element, inside];
  for (const child of element.children)
    if (typeof child === 'object') yield* walk(child, skip, inside);
}

const text = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

test('the server renders with the library from its source, as the browser does', async () => {
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
    const [, heading] = headings[0];
    const name = text(heading) || /aria-label="([^"]*)"/.exec(heading)?.[1];
    assert.equal(
      name,
      page.kind === 'home' ? 'A React design system for clear, accessible interfaces.' : page.title,
      route,
    );
    const site = page.area === 'docs' ? 'envUI Docs' : 'envUI';
    const home = page.kind === 'home' || page.path === 'docs';
    assert.equal(title, home ? site : `${page.title} · ${site}`, route);
    assert.equal(description, page.summary ?? siteDescription, route);
  }
});

test("a page's figures are skeletons at their recorded size until it hydrates", async () => {
  const { html } = await server.renderPage('components/button');
  assert.match(html, /data-site-part="example:button\/CreateProject"[^>]*;block-size:\d/);
});

test("a page's code is highlighted as it pre-renders, and its HTML carries the tokens", async () => {
  const { html, code } = await server.renderPage('docs/components/button');
  assert.match(html, /<pre[^>]*><code><span style="--_code-token:#/);
  const data = JSON.parse(
    /<script type="application\/json" id="site-page-code">(.*)<\/script>/.exec(code)[1],
  );
  assert.ok(data.blocks.length > 0);
  assert.ok(data.blocks.every(([language, lines]) => language && lines.length));
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

test("the catalogue's component and foundation pages show no technical text", async () => {
  const found: string[] = [];
  for (const { path, area, kind } of allPages) {
    if (area !== 'catalogue' || !['component', 'foundation'].includes(kind)) continue;
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

const notPageSections = (element) =>
  ['site-live-example', 'catalogue-open-example', 'catalogue-specimen', 'env-dialog'].some((name) =>
    hasClass(element, name),
  );

const linksOf = (list) =>
  list.children
    .filter((item) => item.tag === 'li')
    .flatMap((item) => item.children.filter((child) => child.tag === 'a'));

const repeated = (values) => values.filter((value, index) => values.indexOf(value) !== index);

const fewestListedEntries = 3;

test("a page's contents list its own sections, each once, at addresses of their own, and every page of the Docs with three sections or more has them, and none lists fewer than three entries", async () => {
  for (const { path, area } of allPages) {
    const elements = elementsOf(await pageRoot(path));
    const column = elements.find((element) => hasClass(element, 'site-page-column'));
    assert.ok(column, `${path} has its column`);
    const sections = [...walk(column, notPageSections)]
      .filter(([element, skipped]) => !skipped && element.tag === 'h2' && element.attributes.id)
      .map(([element]) => `#${element.attributes.id}`);
    const ids = elements.map((element) => element.attributes.id).filter(Boolean);
    const contents = elements.filter(
      (element) => element.tag === 'nav' && element.attributes['aria-label'] === 'On this page',
    );
    if (area === 'docs' && sections.length >= fewestListedEntries)
      assert.ok(contents.length > 0, `${path} lists its contents`);
    for (const navigation of contents) {
      const entries = elementsOf(navigation).filter(({ tag }) => tag === 'a').length;
      assert.ok(entries >= fewestListedEntries, `${path} lists ${entries} entries`);
    }
    for (const navigation of contents) {
      const lists = elementsOf(navigation).filter(({ tag }) => tag === 'ol' || tag === 'ul');
      const hrefs = elementsOf(navigation)
        .filter(({ tag }) => tag === 'a')
        .map((link) => link.attributes.href);
      assert.deepEqual(
        lists.flatMap((list) => repeated(linksOf(list).map((link) => textOf(link).trim()))),
        [],
        `${path}: labels listed twice`,
      );
      assert.deepEqual(repeated(hrefs), [], `${path}: addresses listed twice`);
      assert.deepEqual(
        hrefs.filter((href) => ids.filter((id) => `#${id}` === href).length !== 1),
        [],
        `${path}: addresses that lead to no element or to several`,
      );
      assert.deepEqual(
        linksOf(lists[0]).map((link) => link.attributes.href),
        sections,
        path,
      );
    }
  }
});
