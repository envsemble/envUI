import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

/**
 * envUI's own colors don't change when the color properties are added: with none set, every
 * component that has them paints, in every state and theme, what the integration branch painted.
 * DefaultColors.json holds a hash of each control's colors, and its parts', in each state and theme,
 * recorded from the integration branch's style sheets (1.0.0-prerelease.1) with
 * ENVUI_RECORD_DEFAULT_COLORS=1. A deliberate change to a default color records it again.
 */
const snapshotFile = fileURLToPath(new URL('./DefaultColors.json', import.meta.url));
const record = process.env.ENVUI_RECORD_DEFAULT_COLORS === '1';

const themes = [
  { name: 'light', attributes: { 'data-env-theme': 'light' } },
  { name: 'dark', attributes: { 'data-env-theme': 'dark' } },
  {
    name: 'light-high-contrast',
    attributes: { 'data-env-theme': 'light', 'data-env-contrast': 'high' },
  },
  {
    name: 'dark-high-contrast',
    attributes: { 'data-env-theme': 'dark', 'data-env-contrast': 'high' },
  },
] as const;

const section = '[data-testid="default-colors"]';
/** The controls, each forced into every state; popups render outside the section. */
const targets = [
  `${section} .env-button`,
  `${section} .env-card`,
  `${section} .env-surface`,
  `${section} .env-list-item`,
  `${section} .env-drawer-item`,
  `${section} .env-rail-item`,
  `${section} .env-bar-item`,
  `${section} .env-tabs-tab`,
  `${section} .env-segmented-control-item`,
  `${section} .env-text-field-control`,
  `${section} .env-checkbox-input`,
  `${section} .env-radio`,
  `${section} .env-switch-input`,
  `${section} .env-slider-thumb`,
  `${section} .env-slider-track`,
  `${section} .env-slider-indicator`,
  `${section} .env-meter-track`,
  `${section} .env-meter-indicator`,
  `${section} .env-progress-track`,
  `${section} .env-progress-indicator`,
  `${section} .env-badge`,
  `${section} .env-avatar`,
  `${section} .env-alert`,
  `${section} .env-combobox-chip`,
  '.env-menu-item',
  '.env-tooltip',
  '.env-toast',
];

const states = {
  rest: [],
  hover: ['hover'],
  pressed: ['hover', 'active'],
  focus: ['focus', 'focus-visible', 'focus-within'],
} as const;

/**
 * The colors an element and its parts paint, as one line. A slider's native range input is left
 * out: Base UI hides it visually, so it paints nothing, and its colors are the browser's own, which
 * differ by platform (Chromium colors an enabled range input #101010 on Windows, #9d968e on Linux).
 */
function paint(element: Element) {
  const properties = [
    'background-color',
    'color',
    'border-top-color',
    'border-bottom-color',
    'outline-color',
    'box-shadow',
    'fill',
    'accent-color',
    'caret-color',
  ];
  const describe = (node: Element, pseudo?: string) => {
    const style = getComputedStyle(node, pseudo);
    return properties.map((name) => style.getPropertyValue(name)).join(';');
  };
  return [
    describe(element),
    describe(element, '::before'),
    describe(element, '::after'),
    ...[...element.querySelectorAll('*')]
      .filter((node) => !node.matches('input[type="range"]'))
      .slice(0, 40)
      .map((node) => describe(node)),
  ].join('\n');
}

test('with no color property set, every component paints its colors of before in every state and theme', async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.goto(`${fixtureUrl}/?fixture=default-colors`);
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  await expect(page.locator('.env-menu-item').first()).toBeVisible();
  await expect(page.locator('.env-tooltip')).toBeVisible();
  await expect(page.locator('.env-toast')).toHaveCount(3);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const nodes = async (selector: string) =>
    (await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector })).nodeIds;
  const force = async (nodeIds: number[], classes: readonly string[]) => {
    for (const nodeId of nodeIds)
      await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [...classes] });
  };
  const measured: Record<string, string> = {};
  const details: Record<string, string> = {};
  for (const theme of themes) {
    await page.evaluate((attributes) => {
      for (const boundary of document.querySelectorAll('.env-theme')) {
        boundary.removeAttribute('data-env-contrast');
        for (const [name, value] of Object.entries(attributes)) boundary.setAttribute(name, value);
      }
    }, theme.attributes);
    for (const selector of targets) {
      const ids = await nodes(selector);
      expect(ids.length, `${selector} renders`).toBeGreaterThan(0);
      for (const [index, nodeId] of ids.entries())
        for (const [state, classes] of Object.entries(states)) {
          await force([nodeId], classes);
          // A row is pressed through its target, which the row's style reads.
          const { nodeIds: inner } = await cdp.send('DOM.querySelectorAll', {
            nodeId,
            selector: '[data-row-target]',
          });
          await force(inner, state === 'pressed' ? ['active'] : []);
          const { object } = await cdp.send('DOM.resolveNode', { nodeId });
          const { result } = await cdp.send('Runtime.callFunctionOn', {
            objectId: object.objectId!,
            functionDeclaration: `function () { return (${paint.toString()})(this); }`,
            returnByValue: true,
          });
          await force([nodeId, ...inner], []);
          const key = `${theme.name} ${selector} #${index} ${state}`;
          details[key] = result.value as string;
          measured[key] = createHash('sha1')
            .update(result.value as string)
            .digest('hex')
            .slice(0, 16);
        }
    }
  }
  if (record) {
    writeFileSync(snapshotFile, `${JSON.stringify(measured, null, 2)}\n`);
    return;
  }
  expect(existsSync(snapshotFile), 'DefaultColors.json is recorded').toBe(true);
  const recorded = JSON.parse(readFileSync(snapshotFile, 'utf8')) as Record<string, string>;
  const changed = Object.keys(recorded).filter((key) => measured[key] !== recorded[key]);
  expect(
    changed.slice(0, 20).map((key) => `${key}:\n${details[key] ?? '(gone)'}`),
    `${changed.length} default colors changed`,
  ).toEqual([]);
  expect(Object.keys(measured).sort()).toEqual(Object.keys(recorded).sort());
});
