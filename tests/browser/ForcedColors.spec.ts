import { expect, test, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

/**
 * Under forced colors the system replaces envUI's colors, drops shadows and paints no fills, so a
 * state shown by a fill alone would vanish. Each stateful component sets system colors for its
 * states instead (tests/fixture/forced-colors.tsx shows them side by side). This spec compares what
 * is painted for a state and for its rest, from computed styles: the colors, borders, outlines,
 * opacity and decoration of the element, its descendants and their ::before and ::after,
 * with a background in the canvas color counting as none, as it paints nothing on the canvas.
 *
 * Chromium and Firefox apply forced colors when emulated; WebKit only matches the media query and
 * keeps the page's colors, where the states differ too.
 */

/** Each state, as a locator, with the rest it must differ from. */
const states: Record<string, [state: string, rest: string]> = {
  'a disabled button': ['[data-testid=button-disabled]', '[data-testid=button]'],
  'a focused button': ['[data-testid=button-focus]', '[data-testid=button]'],
  'a pressed toolbar toggle': ['[data-testid=toolbar-pressed]', '[data-testid=toolbar-released]'],
  'an invalid field part': ['[data-testid=field-invalid]', '[data-testid=field-valid]'],
  'the chosen segment': [
    '.env-segmented-control-item >> nth=0',
    '.env-segmented-control-item >> nth=1',
  ],
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
    '.env-segmented-control-item[data-checked]',
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

/** The system colors a forced-colors rule may use, resolved in the page. */
function systemColors(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const read = (value: string) => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };
    const names = ['Canvas', 'CanvasText', 'Highlight', 'HighlightText', 'ButtonText', 'LinkText'];
    const colors = Object.fromEntries(names.map((name) => [name, read(name)]));
    probe.remove();
    return colors;
  });
}

/**
 * WCAG contrast of two `rgb()` or `rgba()` colors; a translucent one is composited over
 * `under`, the canvas, first.
 */
function contrast(a: string, b: string, under = 'rgb(255, 255, 255)') {
  const channels = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
  const [ur, ug, ub] = channels(under);
  const luminance = (value: string) => {
    const [r, g, b, alpha = 1] = channels(value);
    const [cr, cg, cb] = [
      r * alpha + ur * (1 - alpha),
      g * alpha + ug * (1 - alpha),
      b * alpha + ub * (1 - alpha),
    ].map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Focused items that sit in a selection or carry a forced-colors mark of their own, each with the
 * element that draws the ring, what that ring is drawn on (its own fill when inset, the canvas when
 * outside), what to focus and how to reach the state first.
 */
interface FocusCase {
  name: string;
  ring: string;
  over: 'fill' | 'canvas';
  focus?: string;
  prepare?: (page: Page) => Promise<void>;
}

const focusCases: FocusCase[] = [
  { name: 'the selected tab', ring: '[role=tab][aria-selected=true]', over: 'fill' },
  { name: 'the selected navigation item', ring: '[data-testid=nav-selected]', over: 'fill' },
  { name: 'the chosen segment', ring: '.env-segmented-control-item[data-checked]', over: 'canvas' },
  { name: 'the active document tab', ring: '.env-document-tab[data-active]', over: 'fill' },
  {
    name: 'a chosen radio row',
    ring: '.env-radio-option >> nth=0',
    over: 'canvas',
    focus: 'fieldset:has-text("Role") input >> nth=0',
  },
  {
    // A calendar opens with focus on today, whose own outline must give way to the ring.
    name: "today's calendar day",
    ring: '.env-calendar-day[aria-current=date] > .env-calendar-day-mark',
    over: 'canvas',
    focus: '.env-calendar-day[aria-current=date]',
  },
  {
    name: 'the selected tree row',
    ring: "[role=treeitem][aria-selected='true']",
    over: 'fill',
    focus: '[role=tree]',
  },
  {
    name: 'a highlighted menu item',
    ring: '[role=menuitemcheckbox] >> nth=0',
    over: 'fill',
  },
  {
    // The trigger of an open menu that has focus, as Base UI marks it.
    name: 'the trigger of an open menubar menu',
    ring: '.env-menubar-trigger >> nth=0',
    over: 'fill',
    prepare: (page) =>
      page
        .locator('.env-menubar-trigger')
        .first()
        .evaluate((trigger) => trigger.setAttribute('data-popup-open', '')),
  },
  {
    name: 'a highlighted Select option',
    ring: '[role=option][data-highlighted]',
    over: 'fill',
    prepare: async (page) => {
      await page.getByRole('combobox', { name: 'Plan type' }).focus();
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('[role=option][data-highlighted]')).toHaveCount(1);
    },
  },
];

test('a focused item keeps a ring in a system color that shows on what it is drawn on', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'WebKit keeps the page’s colors under forced colors.');
  await open(page);
  const system = await systemColors(page);
  for (const { name, ring, over, focus, prepare } of focusCases) {
    await prepare?.(page);
    const ringElement = page.locator(ring).first();
    const target = focus ? page.locator(focus).first() : ringElement;
    // The ring is measured against the item at rest, before it takes focus.
    const alreadyFocused = await target.evaluate((element) => element === document.activeElement);
    const rest = alreadyFocused ? undefined : await ringElement.evaluate(painted);
    await target.focus();
    expect(await target.evaluate((element) => element.matches(':focus-visible')), name).toBe(true);
    // The fill may still be fading in; measure it settled.
    await ringElement.evaluate((element) =>
      Promise.all(element.getAnimations().map((animation) => animation.finished)),
    );
    if (rest !== undefined)
      expect(await ringElement.evaluate(painted), `${name} shows its focus`).not.toBe(rest);
    const { outline, style, width, fill } = await ringElement.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        outline: computed.outlineColor,
        style: computed.outlineStyle,
        width: parseFloat(computed.outlineWidth),
        fill: computed.backgroundColor,
      };
    });
    expect(style, name).not.toBe('none');
    expect(width, `${name}: the focus ring, not a thinner mark`).toBeGreaterThanOrEqual(2);
    expect(Object.values(system), `${name}: the ring is a system color`).toContain(outline);
    const behind = over === 'fill' ? fill : system.Canvas;
    // At least 3:1, or as much as the system's own selection pair has, where the ring is in it.
    const least = Math.min(3, contrast(system.HighlightText, system.Highlight));
    expect(contrast(outline, behind), `${name}: the ring on ${behind}`).toBeGreaterThanOrEqual(
      least,
    );
  }
});

test('every button variant keeps a visible edge under forced colors', async ({ page }) => {
  await open(page);
  const system = await systemColors(page);
  const buttons = page.locator('[data-testid^=variant-]');
  expect(await buttons.count()).toBeGreaterThan(7);
  for (const button of await buttons.all()) {
    const edge = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        id: element.getAttribute('data-testid'),
        width: parseFloat(style.borderTopWidth),
        style: style.borderTopStyle,
        color: style.borderTopColor,
      };
    });
    expect(edge.width, edge.id!).toBeGreaterThan(0);
    expect(edge.style, edge.id!).toBe('solid');
    expect(contrast(edge.color, system.Canvas), edge.id!).toBeGreaterThanOrEqual(3);
  }
});

/**
 * States that a fill or a shadow carries, which only the forced-colors rules keep visible, each with
 * what those rules paint: the selection color, an outline or a dashed border. Font weight, opacity
 * and structure don't count, so removing the rules fails this test.
 */
const fillStates: Record<string, 'highlight' | 'outline' | 'dashed'> = {
  'the chosen segment': 'highlight',
  'the selected tab': 'highlight',
  'the selected navigation item': 'highlight',
  'a switch that is on': 'highlight',
  'a selected table row': 'highlight',
  'the selected tree row': 'highlight',
  'the chosen calendar day': 'highlight',
  'the active document tab': 'highlight',
  'a filled star': 'highlight',
  "today's calendar day": 'outline',
  'an invalid field': 'dashed',
  'a pressed toolbar toggle': 'highlight',
  'an invalid field part': 'dashed',
};

test('the states a fill carries show in what the forced-colors rules paint', async ({ page }) => {
  await open(page);
  const { Highlight } = await systemColors(page);
  const marks = (element: Element, highlight: string) =>
    [element, ...element.querySelectorAll('*')].flatMap((node) => {
      const style = getComputedStyle(node);
      return [
        ...[style.backgroundColor, style.color, style.outlineColor, style.fill]
          .filter((color) => color === highlight)
          .map(() => 'highlight'),
        ...(style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 ? ['outline'] : []),
        ...(style.borderTopStyle === 'dashed' ? ['dashed'] : []),
      ];
    });
  const missing: string[] = [];
  for (const [name, mark] of Object.entries(fillStates)) {
    const [state, rest] = states[name];
    const stateMarks = await page.locator(state).first().evaluate(marks, Highlight);
    const restMarks = await page.locator(rest).first().evaluate(marks, Highlight);
    if (!stateMarks.includes(mark) || restMarks.includes(mark)) missing.push(`${name}: ${mark}`);
  }
  expect(missing, 'States the forced-colors rules don’t mark').toEqual([]);
});
