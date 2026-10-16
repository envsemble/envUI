import { expect, test, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

/**
 * Under forced colors the system replaces envUI's colors, drops shadows and paints no fills, so a
 * state shown by a fill alone would vanish. Each stateful component sets system colors for its
 * states instead (tests/fixture/forced-colors.tsx shows them side by side). This spec compares what
 * is painted for a state and for its rest, from computed styles: the colors, borders, outlines,
 * opacity, weight and decoration of the element, its descendants and their ::before and ::after,
 * with a background in the canvas color counting as none, as it paints nothing on the canvas.
 *
 * Chromium and Firefox apply forced colors when emulated; WebKit only matches the media query and
 * keeps the page's colors, where the states differ too.
 */

/** Each state, as a locator, with the rest it must differ from. */
const states: Record<string, [state: string, rest: string]> = {
  'a disabled button': ['[data-testid=button-disabled]', '[data-testid=button]'],
  'a focused button': ['[data-testid=button-focus]', '[data-testid=button]'],
  'the chosen segment': ['.env-segment >> nth=0', '.env-segment >> nth=1'],
  'the selected tab': ['[role=tab] >> nth=0', '[role=tab] >> nth=1'],
  'the selected navigation item': ['[data-testid=nav-selected]', '[data-testid=nav]'],
  'a disabled navigation item': ['[data-testid=nav-disabled]', '[data-testid=nav]'],
  'a checked checkbox': [
    '.env-choice-control:has-text("Checked") >> nth=0',
    '.env-choice-control:has-text("Unchecked")',
  ],
  'a switch that is on': [
    '.env-choice-control:has-text("On")',
    '.env-choice-control:has-text("Off")',
  ],
  'a chosen radio': [
    'fieldset:has-text("Plan") .env-choice-control >> nth=0',
    'fieldset:has-text("Plan") .env-choice-control >> nth=1',
  ],
  'a chosen radio row': ['.env-radio-option >> nth=0', '.env-radio-option >> nth=1'],
  'an invalid field': [
    '.env-text-field-well:has-text("Invalid")',
    '.env-text-field-well:has-text("Valid") >> nth=0',
  ],
  'a disabled field': [
    '.env-text-field-well:has-text("Disabled")',
    '.env-text-field-well:has-text("Valid") >> nth=0',
  ],
  'a selected table row': ['[data-testid=row-selected]', '[data-testid=row]'],
  'the selected tree row': ['[role=treeitem] >> nth=0', '[role=treeitem] >> nth=1'],
  'the chosen calendar day': [
    '.env-calendar-day[aria-selected=true]',
    '.env-calendar-day:has-text("20")',
  ],
  "today's calendar day": [
    '.env-calendar-day[aria-current=date]',
    '.env-calendar-day:has-text("20")',
  ],
  'the active document tab': [
    '.env-document-tab:has-text("Active")',
    '.env-document-tab:has-text("Other")',
  ],
  'a filled star': ['.env-rating-star >> nth=0', '.env-rating-star >> nth=4'],
  'a checked menu item': ['[role=menuitemcheckbox] >> nth=0', '[role=menuitemcheckbox] >> nth=1'],
};

/** What an element and its subtree paint, from computed styles, as text. */
function painted(element: Element) {
  const canvas = getComputedStyle(document.body).backgroundColor;
  const channels = (value: string) => value.match(/[\d.]+/g)?.map(Number) ?? [];
  const color = (value: string) => {
    const [r, g, b, a = 1] = channels(value);
    if (value === 'transparent' || a === 0) return 'none';
    const [cr, cg, cb] = channels(canvas);
    if (r === cr && g === cg && b === cb) return 'none';
    return value;
  };
  const describe = (node: Element, pseudo?: string) => {
    const style = getComputedStyle(node, pseudo);
    if (pseudo && (style.content === 'none' || style.content === 'normal')) return null;
    if (style.display === 'none' || style.visibility === 'hidden') return 'hidden';
    const parts = [`background ${color(style.backgroundColor)}`, `color ${color(style.color)}`];
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const width = parseFloat(style.getPropertyValue(`border-${side}-width`));
      const kind = style.getPropertyValue(`border-${side}-style`);
      if (width > 0 && kind !== 'none' && kind !== 'hidden')
        parts.push(
          `border-${side} ${width} ${kind} ${color(style.getPropertyValue(`border-${side}-color`))}`,
        );
    }
    if (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0)
      parts.push(
        `outline ${style.outlineWidth} ${style.outlineStyle} ${color(style.outlineColor)}`,
      );
    if (style.textDecorationLine !== 'none') parts.push(`decoration ${style.textDecorationLine}`);
    if (style.opacity !== '1') parts.push(`opacity ${style.opacity}`);
    if (style.fontWeight !== '400') parts.push(`weight ${style.fontWeight}`);
    if (node instanceof SVGElement) parts.push(`fill ${color(style.fill)}`);
    // A native radio draws its own state in system colors.
    if (node instanceof HTMLInputElement && style.appearance !== 'none' && node.checked)
      parts.push('checked');
    return parts.join('; ');
  };
  const lines: string[] = [];
  const walk = (node: Element, depth: string) => {
    lines.push(`${depth}${describe(node)}`);
    for (const pseudo of ['::before', '::after']) {
      const pseudoLine = describe(node, pseudo);
      if (pseudoLine) lines.push(`${depth}${pseudo} ${pseudoLine}`);
    }
    for (const child of node.children) walk(child, `${depth} `);
  };
  walk(element, '');
  return lines.join('\n');
}

async function open(page: Page) {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(`${fixtureUrl}/forced-colors.html`);
  await page.waitForSelector('body[data-styles-ready] .env-theme');
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  // Keyboard focus on the button whose ring the states compare.
  await page.getByTestId('button-focus').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('button-focus')).toBeFocused();
}

test('every state stays distinguishable from its rest under forced colors', async ({ page }) => {
  await open(page);
  const same: string[] = [];
  for (const [name, [state, rest]] of Object.entries(states)) {
    const stateLook = await page.locator(state).first().evaluate(painted);
    const restLook = await page.locator(rest).first().evaluate(painted);
    if (stateLook === restLook) same.push(`${name}:\n${stateLook}`);
  }
  expect(same, 'States that paint the same as their rest').toEqual([]);
});

test('selection and checked states take the system colors', async ({ page, browserName }) => {
  await open(page);
  const system = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const read = (value: string) => {
      probe.style.backgroundColor = value;
      return getComputedStyle(probe).backgroundColor;
    };
    const colors = { highlight: read('Highlight'), canvas: read('Canvas') };
    probe.remove();
    return colors;
  });
  const background = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
  for (const selector of [
    '.env-segment[data-checked]',
    '.env-nav-list-item-selected',
    "[role=treeitem][aria-selected='true']",
    '.env-calendar-day[aria-selected=true] > .env-calendar-day-mark',
    '.env-choice-control:has-text("Checked") >> nth=0 >> .env-checkbox-control',
    '.env-choice-control:has-text("On") >> .env-switch-control',
  ])
    expect(await background(selector), selector).toBe(system.highlight);
  // Where the system forces colors, an unselected item paints no fill of its own.
  if (browserName !== 'webkit')
    expect(await background('[data-testid=nav]')).not.toBe(system.highlight);
});
