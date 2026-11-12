import axe from 'axe-core';
import { expect, test } from 'vitest';
import type { FixtureModule } from '../fixture/FixtureMount.tsx';
import { fixtureName } from '../fixture/FixtureName.ts';
import { nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/**
 * The accessibility scan of the library: axe over each component fixture as it mounts, in the
 * themes the fixture mounts in, compared with this file's snapshot, so a new violation fails and so
 * does one that no longer occurs. The site's pages are scanned by kind in
 * tests/accessibility/Accessibility.spec.ts; `npm run test:a11y` runs both, and
 * `npm run test:a11y:update` rewrites both lists.
 *
 * Violations are counted by rule and a stable target: the element's tag with its env- classes, or,
 * without any, those of its nearest ancestor that has some.
 */

/** As the fixture page mounts them (tests/fixture/App.tsx), and the rich text editor's. */
const fixtures = Object.entries(
  import.meta.glob<FixtureModule>(
    ['../fixture/*.fixture.tsx', '!../fixture/CascadeLayers.fixture.tsx'],
    {
      eager: true,
    },
  ),
)
  // The parts of another fixture, such as ContactSheetParts.fixture.tsx, have no default export.
  .filter(([, module]) => module.default)
  .map(([file, module]) => [fixtureName(file), module] as const);

/** WCAG 2.0–2.2 A and AA plus axe's best practices, as the site's scan runs them. */
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
/**
 * Rules about a whole page, which a fixture is not, run in the site's scan; contrast, which the
 * contrast gate measures for every pair of tokens in every theme (tests/component/Contrast.test.tsx),
 * and the site's scan on its pages.
 */
const skippedRules = [
  'color-contrast',
  'bypass',
  'document-title',
  'html-has-lang',
  'landmark-one-main',
  'page-has-heading-one',
  'region',
];

test.for(fixtures)(
  '%s has no new accessibility violations',
  { tags: ['a11y'] },
  async ([, module]) => {
    mount(module);
    // What loads on its own, such as a code diff's renderer, is busy until it has: up to a few
    // seconds, as a fixture may show a busy state on purpose.
    for (
      let waited = 0;
      document.querySelector('[aria-busy="true"]') && waited < 3_000;
      waited += 50
    )
      await new Promise((resolve) => setTimeout(resolve, 50));
    await nextFrames();
    const { violations } = await axe.run(document, {
      runOnly: { type: 'tag', values: tags },
      rules: Object.fromEntries(skippedRules.map((rule) => [rule, { enabled: false }])),
      resultTypes: ['violations'],
    });
    const found: Record<string, Record<string, number>> = {};
    for (const violation of violations)
      for (const node of violation.nodes) {
        const element = document.querySelector(String(node.target.at(-1)));
        const target = element ? stableTarget(element) : 'unresolved';
        const rule = (found[violation.id] ??= {});
        rule[target] = (rule[target] ?? 0) + 1;
      }
    expect(found).toMatchSnapshot();
  },
);

function stableTarget(element: Element): string {
  const part = (each: Element) =>
    each.localName +
    [...each.classList]
      .filter((name) => name.startsWith('env-'))
      .map((name) => `.${name}`)
      .join('');
  if ([...element.classList].some((name) => name.startsWith('env-'))) return part(element);
  const anchor = element.parentElement?.closest('[class*="env-"]');
  return anchor ? `${part(anchor)} ${part(element)}` : part(element);
}
