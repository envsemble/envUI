import axe from 'axe-core';
import { expect, test } from 'vitest';
import type { FixtureModule } from '../fixture/FixtureMount.tsx';
import { fixtureName } from '../fixture/FixtureName.ts';
import { nextFrames, waitOnRealTime } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const fixtures = Object.entries(
  import.meta.glob<FixtureModule>(
    ['../fixture/*.fixture.tsx', '!../fixture/CascadeLayers.fixture.tsx'],
    {
      eager: true,
    },
  ),
)
  .filter(([, module]) => module.default)
  .map(([file, module]) => [fixtureName(file), module] as const);

const siteScanTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const rulesTheSiteScanAndContrastGateCover = [
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
    await waitUntilLoadedOrBusyOnPurpose();
    await nextFrames();
    const { violations } = await axe.run(document, {
      runOnly: { type: 'tag', values: siteScanTags },
      rules: Object.fromEntries(
        rulesTheSiteScanAndContrastGateCover.map((rule) => [rule, { enabled: false }]),
      ),
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

async function waitUntilLoadedOrBusyOnPurpose() {
  for (let waited = 0; document.querySelector('[aria-busy="true"]') && waited < 3_000; waited += 50)
    await waitOnRealTime(50);
}

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
