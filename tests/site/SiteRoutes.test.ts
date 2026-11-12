// The site's addresses: the old ones that lead to the pages they became, each page's counterpart in
// the other part, and the Docs' tree and trails (apps/site/src/routes/).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { importSource } from '../support/ImportSource.ts';

const {
  allPages,
  componentGroups,
  counterpartOf,
  docsTrail,
  docsTree,
  findPage,
  normalizeRoute,
  otherPartRoute,
  pagesOf,
  routeOfDocument,
} = await importSource('SiteAddresses', [
  "export { allPages, findPage, pagesOf, routeOfDocument } from './apps/site/src/routes/SiteRoutes.ts';",
  "export { counterpartOf, otherPartRoute } from './apps/site/src/routes/Counterparts.ts';",
  "export { docsTree } from './apps/site/src/routes/DocsTree.ts';",
  "export { normalizeRoute } from './apps/site/src/routes/OldAddresses.ts';",
  "export { docsTrail } from './apps/site/src/routes/Trails.ts';",
  "export { componentGroups } from './apps/site/src/routes/PageModel.ts';",
]);

test('the addresses of the views before the catalogue and the Docs split open the pages they became', () => {
  const routes = {
    'components/button/overview': 'components/button',
    'components/button/props?section=props-Button-variant':
      'docs/components/button?section=props-Button-variant',
    'components/button/overview?section=keyboard': 'components/button?section=keyboard',
    'components/field/overview': 'docs/components/field',
    'foundations/colors/preview': 'foundations/colors',
    'foundations/colors/usage': 'docs/foundations/colors',
    'foundations/tokens': 'docs/tokens',
    // Nine foundations became six: merged pages open the page they joined.
    'foundations/scale': 'foundations/spacing',
    'foundations/scale/usage': 'docs/foundations/spacing',
    'docs/foundations/scale': 'docs/foundations/spacing',
    'foundations/composition': 'docs/customizing',
    'docs/foundations/composition': 'docs/customizing',
    'docs/customizing-colors': 'docs/customizing',
    'overview/components': 'overview',
    'overview/components?section=components-actions': 'components?section=components-actions',
    'overview/get-started': 'docs',
    'overview/get-started?skill=migrate&section=local-development': 'docs?section=coding-agents',
    // The agent skills' page went with the skills, and the guide for agents into setup.
    'docs/agent-skills': 'docs?section=coding-agents',
    'docs/agent-tooling': 'docs?section=coding-agents',
    // The setup guide is the Docs' home.
    'docs/setup': 'docs',
    'docs/setup?section=install-a-release': 'docs?section=install-a-release',
    // The codemods went, and developing envUI locally is a contributor's guide now.
    'docs/codemods': 'docs/migration',
    'docs/local-development': 'docs',
    // The agent benchmark went, and its page opens the overview.
    benchmark: 'overview',
    'get-started/migration': 'docs/migration',
    // The catalogue's Get started page is the setup guide, the Docs' home.
    'get-started': 'docs',
    'contributing/library-development': 'overview',
    // The catalogue's changelog is the Docs' now, with its release notes.
    changelog: 'docs/changelog',
    'changelog?section=release-0-7-0': 'docs/changelog?section=release-0-7-0',
    // Dev mode's page in the catalogue folded into its guide in the Docs.
    'dev-mode': 'docs/dev-mode',
    'dev-mode?section=opening-it': 'docs/dev-mode?section=opening-it',
    // Pages folded into another open it, at the section that holds them, and in the Docs its page.
    'components/bar': 'components/navigation-drawer',
    'components/rail/props': 'docs/components/navigation-drawer',
    'components/drawer': 'components/navigation-drawer',
    'components/page-header?section=sticky': 'components/page?section=sticky',
    'docs/components/page-header': 'docs/components/page',
    'patterns/feature-cards': 'components/card?section=feature-card',
    'docs/patterns/feature-cards': 'docs/components/card',
    'patterns/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'components/search-trigger':
      'components/command-palette?section=opening-it-the-button-and-the-shortcut',
    'docs/patterns/search-trigger': 'docs/components/command-palette',
    // Patterns merged into others open the pattern they joined, in the catalogue and in the Docs.
    'patterns/window-frame': 'patterns/app-frame',
    'docs/patterns/window-frame': 'docs/patterns/app-frame',
    'components/window-frame': 'patterns/app-frame',
    'patterns/account-menu': 'patterns/account-and-organizations',
    'patterns/organization-switcher': 'patterns/account-and-organizations',
    'docs/patterns/organization-switcher': 'docs/patterns/account-and-organizations',
    // Old addresses that name a document that is gone open the page it became.
    'overview/get-started?document=dev-mode-overview': 'docs/dev-mode',
    'overview/get-started?document=agent-skills': 'docs?section=coding-agents',
    'overview/get-started?document=full-changelog': 'docs/changelog',
    'get-started/scale?section=density': 'foundations/spacing?section=density',
    'get-started/composition': 'docs/customizing',
    // The content guidelines are the Writing guide in the Docs.
    'foundations/content': 'docs/writing',
    'docs/foundations/content': 'docs/writing',
  };
  for (const [from, to] of Object.entries(routes)) assert.equal(normalizeRoute(from), to, from);
  // The ids of documents that are gone are old addresses' alone.
  assert.equal(routeOfDocument('dev-mode-overview'), undefined);
  // Every page of both areas is its own route.
  for (const { path } of allPages) assert.equal(normalizeRoute(path), path);
});

test("each page of a subject leads to its page in the other part, and a page without one to the other part's start", () => {
  const paired = (kinds) => pagesOf('catalogue').filter(({ kind }) => kinds.includes(kind));
  // Every component, pattern and foundation in the catalogue has its page in the Docs, which
  // leads back to it.
  for (const page of paired(['component', 'pattern', 'foundation'])) {
    const docs = counterpartOf(page);
    assert.equal(docs, `docs/${page.path}`, page.path);
    assert.equal(findPage(docs)?.area, 'docs', page.path);
    assert.equal(counterpartOf(findPage(docs)), page.path, docs);
    assert.equal(otherPartRoute(page, 'catalogue'), docs);
  }
  // The catalogue's Overview and galleries lead to the Docs' home.
  for (const page of paired(['home', 'components', 'patterns'])) {
    assert.equal(counterpartOf(page), undefined, page.path);
    assert.equal(otherPartRoute(page, 'catalogue'), 'docs', page.path);
  }
  // A page of the Docs alone, such as a guide, the changelog or Field's, leads to the Overview.
  for (const path of [
    'docs',
    // Dev mode is the Docs' alone: its page in the catalogue folded into its guide.
    'docs/dev-mode',
    'docs/changelog',
    'docs/tokens',
    'docs/components/field',
  ])
    assert.equal(otherPartRoute(findPage(path), 'docs'), 'overview', path);
  // A page that isn't there leads to the other part's start.
  assert.equal(otherPartRoute(undefined, 'docs'), 'overview');
  assert.equal(otherPartRoute(undefined, 'catalogue'), 'docs');
});

test("the Docs' navigation is a tree of sections and groups, and each page's trail follows it", () => {
  assert.deepEqual(
    docsTree.map(({ label }) => label),
    ['Get started', 'Guides', 'Foundations', 'Components', 'Patterns', 'Changelog'],
  );
  const section = (label) => docsTree.find((entry) => entry.label === label);
  // Components by their group, in the catalogue's order, and patterns by their intent.
  assert.deepEqual(section('Components').pages, []);
  const groups = section('Components').groups.map(({ label }) => label);
  assert.deepEqual(
    groups,
    componentGroups.filter((group) => groups.includes(group)),
  );
  assert.ok(section('Patterns').groups.some(({ label }) => label === 'Enter and change data'));
  // Every page of the Docs is in the tree once.
  const inTree = docsTree.flatMap((entry) => [
    ...entry.pages,
    ...entry.groups.flatMap(({ pages }) => pages),
  ]);
  assert.deepEqual(
    inTree.map(({ path }) => path).sort(),
    pagesOf('docs')
      .map(({ path }) => path)
      .sort(),
  );
  const trail = (path) => docsTrail(findPage(path)).map(({ label }) => label);
  assert.deepEqual(trail('docs/components/button'), ['Docs', 'Components', 'Actions', 'Button']);
  assert.deepEqual(trail('docs/patterns/forms'), [
    'Docs',
    'Patterns',
    'Enter and change data',
    'Form layout and validation',
  ]);
  assert.deepEqual(trail('docs/foundations/spacing'), ['Docs', 'Foundations', 'Spacing & density']);
  // A section that is one page of its name is left out.
  assert.deepEqual(trail('docs/changelog'), ['Docs', 'Changelog']);
  // The home is the setup guide, where Docs leads nowhere.
  assert.deepEqual(trail('docs'), ['Docs', 'Get started', 'Install and set up']);
  assert.equal(docsTrail(findPage('docs'))[0].route, undefined);
  // Docs leads to their home; the section and group, which the navigation lists, lead nowhere.
  assert.deepEqual(
    docsTrail(findPage('docs/components/button')).map(({ route }) => route),
    ['docs', undefined, undefined, 'docs/components/button'],
  );
});
