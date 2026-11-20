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
    'docs/agent-skills': 'docs?section=coding-agents',
    'docs/agent-tooling': 'docs?section=coding-agents',
    'docs/setup': 'docs',
    'docs/setup?section=install-a-release': 'docs?section=install-a-release',
    'docs/codemods': 'docs',
    'docs/migration': 'docs',
    'docs/local-development': 'docs',
    benchmark: 'overview',
    'get-started/migration': 'docs',
    'overview/get-started?document=migration': 'docs',
    'get-started': 'docs',
    'contributing/library-development': 'overview',
    changelog: 'docs/changelog',
    'changelog?section=release-0-7-0': 'docs/changelog?section=release-0-7-0',
    'dev-mode': 'docs/dev-mode',
    'dev-mode?section=opening-it': 'docs/dev-mode?section=opening-it',
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
    'components/rating': 'components/meter?section=a-score-in-stars',
    'components/rating/props': 'docs/components/meter',
    'docs/components/rating': 'docs/components/meter',
    'components/animated-number': 'foundations/typography?section=a-number-that-changes',
    'components/animated-number/props': 'docs/foundations/typography',
    'docs/components/animated-number': 'docs/foundations/typography',
    'components/calendar-heatmap': 'components/tooltip?section=details-of-each-day-in-a-grid',
    'components/heatmap': 'components/tooltip?section=details-of-each-day-in-a-grid',
    'docs/components/calendar-heatmap': 'docs/components/tooltip',
    patterns: 'docs',
    'docs/patterns': 'docs',
    'patterns/forms': 'docs',
    'patterns/forms?section=rules': 'docs',
    'docs/patterns/forms': 'docs',
    'patterns/window-frame': 'docs',
    'docs/patterns/organization-switcher': 'docs',
    'templates/app-frame': 'docs',
    'components/window-frame': 'docs',
    'components/stats/props': 'docs',
    'components/loading': 'docs',
    'components/skeleton': 'docs',
    'components/empty-state': 'components/empty-state',
    'overview/get-started?document=dev-mode-overview': 'docs/dev-mode',
    'overview/get-started?document=agent-skills': 'docs?section=coding-agents',
    'overview/get-started?document=full-changelog': 'docs/changelog',
    'get-started/scale?section=density': 'foundations/spacing?section=density',
    'get-started/composition': 'docs/customizing',
    'foundations/content': 'docs/writing',
    'docs/foundations/content': 'docs/writing',
  };
  for (const [from, to] of Object.entries(routes)) assert.equal(normalizeRoute(from), to, from);
  assert.equal(routeOfDocument('dev-mode-overview'), undefined);
  for (const { path } of allPages) assert.equal(normalizeRoute(path), path);
});

test("each page of a subject leads to its page in the other part, and a page without one to the other part's start", () => {
  const paired = (kinds) => pagesOf('catalogue').filter(({ kind }) => kinds.includes(kind));
  for (const page of paired(['component', 'foundation'])) {
    const docs = counterpartOf(page);
    assert.equal(docs, `docs/${page.path}`, page.path);
    assert.equal(findPage(docs)?.area, 'docs', page.path);
    assert.equal(counterpartOf(findPage(docs)), page.path, docs);
    assert.equal(otherPartRoute(page, 'catalogue'), docs);
  }
  for (const page of paired(['home', 'components'])) {
    assert.equal(counterpartOf(page), undefined, page.path);
    assert.equal(otherPartRoute(page, 'catalogue'), 'docs', page.path);
  }
  for (const path of [
    'docs',
    'docs/dev-mode',
    'docs/changelog',
    'docs/tokens',
    'docs/components/field',
  ])
    assert.equal(otherPartRoute(findPage(path), 'docs'), 'overview', path);
  assert.equal(otherPartRoute(undefined, 'docs'), 'overview');
  assert.equal(otherPartRoute(undefined, 'catalogue'), 'docs');
});

test("the Docs' navigation is a tree of sections and groups, and each page's trail follows it", () => {
  assert.deepEqual(
    docsTree.map(({ label }) => label),
    ['Get started', 'Guides', 'Foundations', 'Components', 'Changelog'],
  );
  const section = (label) => docsTree.find((entry) => entry.label === label);
  assert.deepEqual(section('Components').pages, []);
  const groups = section('Components').groups.map(({ label }) => label);
  assert.deepEqual(
    groups,
    componentGroups.filter((group) => groups.includes(group)),
  );
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
  assert.deepEqual(trail('docs/foundations/spacing'), ['Docs', 'Foundations', 'Spacing & density']);
  assert.deepEqual(trail('docs/changelog'), ['Docs', 'Changelog']);
  assert.deepEqual(trail('docs'), ['Docs', 'Get started', 'Install and set up']);
  assert.equal(docsTrail(findPage('docs'))[0].route, undefined);
  assert.deepEqual(
    docsTrail(findPage('docs/components/button')).map(({ route }) => route),
    ['docs', undefined, undefined, 'docs/components/button'],
  );
});
