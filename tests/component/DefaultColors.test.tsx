import { expect, test } from 'vitest';
import { cdp, commands } from 'vitest/browser';
import * as fixture from '../fixture/DefaultColors.fixture.tsx';
import { addStyle } from './Browser.ts';
import { mount } from './Mount.tsx';

/**
 * envUI's own colors don't change when the color properties are added: with none set, every
 * component that has them paints, in every state and theme, what the integration branch painted.
 * DefaultColors.json holds a hash of each control's colors, and its parts', in each state and theme,
 * recorded from the integration branch's style sheets (1.0.0-prerelease.1). A deliberate change to
 * a default color records it again: delete DefaultColors.json and run the test, which writes it
 * and fails until it is committed.
 */
/** From the repository's root, where the browser's file commands start. */
const snapshotFile = 'tests/component/DefaultColors.json';
/** The note DefaultColors.json opens with: it is recorded, not edited. */
const generatedNote =
  'Recorded by tests/component/DefaultColors.test.tsx when the file is missing; do not edit.';

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
  `${section} .env-navigation-drawer-item`,
  `${section} .env-navigation-rail-item`,
  `${section} .env-navigation-bar-item`,
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

/** The first 16 hex digits of a text's SHA-1. */
async function hash(text: string) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

type DomNode = {
  nodeId: number;
  nodeName: string;
  attributes?: string[];
  children?: DomNode[];
  contentDocument?: DomNode;
};

/**
 * The DevTools node of this test's document: the page holds it in a frame, beside the frames of
 * other test files, so the document marks its root element to be found by.
 */
async function ownDocument(session: ReturnType<typeof cdp>) {
  const mark = String(Math.random());
  document.documentElement.dataset.colorsFrame = mark;
  const { root } = await session.send('DOM.getDocument', { depth: -1, pierce: true });
  const find = (node: DomNode): DomNode | undefined => {
    const html = node.children?.find((child) => child.nodeName === 'HTML');
    const attributes = html?.attributes ?? [];
    if (attributes[attributes.indexOf('data-colors-frame') + 1] === mark) return node;
    for (const child of [
      ...(node.children ?? []),
      ...(node.contentDocument ? [node.contentDocument] : []),
    ]) {
      const found = find(child);
      if (found) return found;
    }
    return undefined;
  };
  const own = find(root as DomNode)!;
  delete document.documentElement.dataset.colorsFrame;
  return own;
}

test('with no color property set, every component paints its colors of before in every state and theme', async () => {
  mount(fixture);
  addStyle('*, *::before, *::after { transition: none !important; animation: none !important; }');
  await expect.poll(() => document.querySelectorAll('.env-menu-item').length).toBeGreaterThan(0);
  await expect.poll(() => document.querySelectorAll('.env-tooltip').length).toBeGreaterThan(0);
  await expect.poll(() => document.querySelectorAll('.env-toast').length).toBe(3);
  const session = cdp();
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const own = await ownDocument(session);
  const nodes = async (nodeId: number, selector: string) =>
    (await session.send('DOM.querySelectorAll', { nodeId, selector })).nodeIds;
  const force = async (nodeIds: number[], classes: readonly string[]) => {
    for (const nodeId of nodeIds)
      await session.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [...classes] });
  };
  const measured: Record<string, string> = {};
  const details: Record<string, string> = {};
  for (const theme of themes) {
    for (const boundary of document.querySelectorAll('.env-theme')) {
      boundary.removeAttribute('data-env-contrast');
      for (const [name, value] of Object.entries(theme.attributes))
        boundary.setAttribute(name, value);
    }
    for (const selector of targets) {
      const ids = await nodes(own.nodeId, selector);
      const elements = document.querySelectorAll(selector);
      expect(ids.length, `${selector} renders`).toBeGreaterThan(0);
      expect(ids.length).toBe(elements.length);
      for (const [index, nodeId] of ids.entries()) {
        // A row is pressed through its target, which the row's style reads.
        const inner = await nodes(nodeId, '[data-row-target]');
        for (const [state, classes] of Object.entries(states)) {
          // Each state's classes replace the last's.
          await force([nodeId], classes);
          if (state === 'pressed') await force(inner, ['active']);
          const value = paint(elements[index]!);
          if (state === 'pressed') await force(inner, []);
          const key = `${theme.name} ${selector} #${index} ${state}`;
          details[key] = value;
          measured[key] = await hash(value);
        }
        await force([nodeId], []);
      }
    }
  }
  const saved = await commands.readFile(snapshotFile).catch(() => undefined);
  if (saved === undefined) {
    await commands.writeFile(
      snapshotFile,
      `${JSON.stringify({ $comment: generatedNote, ...measured }, null, 2)}\n`,
    );
    expect.fail('DefaultColors.json was missing and is recorded now: review it and commit it.');
  }
  const { $comment: _note, ...recorded }: Record<string, string> = JSON.parse(saved!);
  const changed = Object.keys(recorded).filter((key) => measured[key] !== recorded[key]);
  expect(
    changed.slice(0, 20).map((key) => `${key}:\n${details[key] ?? '(gone)'}`),
    `${changed.length} default colors changed`,
  ).toEqual([]);
  expect(Object.keys(measured).sort()).toEqual(Object.keys(recorded).sort());
});
