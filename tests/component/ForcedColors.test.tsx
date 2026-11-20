import { afterEach, expect, test, vi } from 'vitest';
import { commands, page, server } from 'vitest/browser';
import * as fixture from '../fixture/ForcedColors.fixture.tsx';
import * as popupsFixture from '../fixture/ThemeContrast.fixture.tsx';
import { keyboard, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';
import { closePopup, openPopup, popupKinds, popupShown } from './support/Popups.ts';

afterEach(() => {
  vi.useRealTimers();
});

function find(selector: string, { text, index = 0, inner, innerIndex = 0 }: Find = {}) {
  const matches = [...document.querySelectorAll(selector)].filter(
    (element) =>
      text === undefined || element.textContent!.toLowerCase().includes(text.toLowerCase()),
  );
  const found = matches[index];
  if (!found) throw new Error(`Nothing matches ${selector} ${text ?? ''} ${index}`);
  return inner ? found.querySelectorAll(inner)[innerIndex]! : found;
}
interface Find {
  text?: string;
  index?: number;
  inner?: string;
  innerIndex?: number;
}
type Target = [selector: string, find?: Find];

const states: Record<string, [state: Target, rest: Target]> = {
  'a disabled button': [['[data-testid=button-disabled]'], ['[data-testid=button]']],
  'a focused button': [['[data-testid=button-focus]'], ['[data-testid=button]']],
  'a pressed toolbar toggle': [
    ['[data-testid=toolbar-pressed]'],
    ['[data-testid=toolbar-released]'],
  ],
  'an invalid field part': [['[data-testid=field-invalid]'], ['[data-testid=field-valid]']],
  'the chosen segment': [
    ['.env-segmented-control-item'],
    ['.env-segmented-control-item', { index: 1 }],
  ],
  'the selected navigation item': [
    ['.env-navigation-drawer-item[data-current]'],
    ['.env-navigation-drawer-item:not([data-current])'],
  ],
  'the current rail destination': [
    ['.env-navigation-rail-item[data-current] .env-navigation-rail-indicator'],
    ['.env-navigation-rail-item:not([data-current]) .env-navigation-rail-indicator'],
  ],
  'a checked checkbox': [
    ['.env-checkbox', { text: 'Checked' }],
    ['.env-checkbox', { text: 'Unchecked' }],
  ],
  'a switch that is on': [
    ['.env-switch', { text: 'On' }],
    ['.env-switch', { text: 'Off' }],
  ],
  'a chosen radio': [
    ['fieldset', { text: 'Plan', inner: '.env-radio' }],
    ['fieldset', { text: 'Plan', inner: '.env-radio', innerIndex: 1 }],
  ],
  'an invalid field': [
    ['.env-text-field', { text: 'Invalid', inner: '.env-text-field-control' }],
    ['.env-text-field', { text: 'Valid', inner: '.env-text-field-control' }],
  ],
  'a disabled field': [
    ['.env-text-field', { text: 'Disabled', inner: '.env-text-field-control' }],
    ['.env-text-field', { text: 'Valid', inner: '.env-text-field-control' }],
  ],
  'a selected table row': [['[data-testid=row-selected]'], ['[data-testid=row]']],
  'the current list row': [['[data-testid=list-selected]'], ['[data-testid=list-item]']],
  'the selected tree row': [['[role=treeitem]'], ['[role=treeitem]', { index: 1 }]],
  'the chosen calendar day': [
    ['.env-calendar-day[aria-selected=true]'],
    ['.env-calendar-day', { text: '20' }],
  ],
  "today's calendar day": [
    ['.env-calendar-day[aria-current=date]'],
    ['.env-calendar-day', { text: '20' }],
  ],
  'the chosen hour': [
    ['[data-part=hour] .env-time-list-row[data-centered]'],
    ['[data-part=hour] .env-time-list-row[data-value="10"]'],
  ],
  'an unavailable hour': [
    ['[data-part=hour] .env-time-list-row[data-value="7"]'],
    ['[data-part=hour] .env-time-list-row[data-value="10"]'],
  ],
  'the chosen month': [
    ['.env-month-picker-month[aria-selected=true]'],
    ['.env-month-picker-month[data-month="2026-05"]'],
  ],
  'an unavailable month': [
    ['.env-month-picker-month[data-month="2026-01"]'],
    ['.env-month-picker-month[data-month="2026-05"]'],
  ],
  'the active document tab': [
    ['.env-document-tabs-item', { text: 'Active' }],
    ['.env-document-tabs-item', { text: 'Other' }],
  ],
  'the current section of the contents': [
    ['.env-table-of-contents-link[aria-current=location]'],
    ['.env-table-of-contents-link:not([aria-current])'],
  ],
  'a checked menu item': [['[role=menuitemcheckbox]'], ['[role=menuitemcheckbox]', { index: 1 }]],
};

const element = ([selector, options]: Target) => find(selector, options);

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

async function open() {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-16T12:00:00') });
  await commands.emulateMedia({ forcedColors: 'active' });
  mount(fixture);
  expect(matchMedia('(forced-colors: active)').matches).toBe(true);
  await expect.poll(() => page.getByRole('menu').elements().length).toBe(2);
  await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('menu');
  const focus = page.getByTestId('button-focus');
  (focus.element() as HTMLElement).focus();
  await keyboard.press('Shift+Tab');
  await keyboard.press('Tab');
  await expect.element(focus).toHaveFocus();
}

test(
  'every state stays distinguishable from its rest under forced colors, and every button variant keeps a visible edge',
  { tags: ['engines'] },
  async () => {
    await open();
    const same: string[] = [];
    for (const [name, [state, rest]] of Object.entries(states)) {
      const stateLook = painted(element(state));
      if (stateLook === painted(element(rest)))
        same.push(`${name}:
${stateLook}`);
    }
    expect(same, 'States that paint the same as their rest').toEqual([]);

    const { Canvas } = systemColors();
    const buttons = document.querySelectorAll('[data-testid^=variant-]');
    expect(buttons.length).toBeGreaterThan(7);
    for (const button of buttons) {
      const style = getComputedStyle(button);
      const id = button.getAttribute('data-testid')!;
      expect(parseFloat(style.borderTopWidth), id).toBeGreaterThan(0);
      expect(style.borderTopStyle, id).toBe('solid');
      expect(contrast(style.borderTopColor, Canvas!), id).toBeGreaterThanOrEqual(3);
    }
  },
);

function systemColors() {
  const probe = document.createElement('span');
  document.body.append(probe);
  const read = (value: string) => {
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };
  const names = ['Canvas', 'CanvasText', 'Highlight', 'HighlightText', 'ButtonText', 'LinkText'];
  const colors = Object.fromEntries(names.map((name) => [name, read(name)]));
  probe.remove();
  return colors as Record<(typeof names)[number], string>;
}

test(
  'selection and checked states take the system colors, and the states a fill carries show in what the forced-colors rules paint',
  { tags: ['engines'] },
  async () => {
    await open();
    const { Highlight } = systemColors();
    const background = (target: Target) => getComputedStyle(element(target)).backgroundColor;
    for (const target of [
      ['.env-segmented-control-item[data-checked]'],
      ['.env-navigation-drawer-item[data-current]'],
      ['.env-navigation-rail-item[data-current] .env-navigation-rail-indicator'],
      ["[role=treeitem][aria-selected='true']"],
      ['.env-calendar-day[aria-selected=true] > .env-calendar-day-mark'],
      ['[data-part=hour] .env-time-list-row[data-centered]'],
      ['.env-month-picker-month[aria-selected=true] > .env-month-picker-month-mark'],
      ['.env-checkbox', { text: 'Checked', inner: '.env-checkbox-input' }],
      ['.env-switch', { text: 'On', inner: '.env-switch-input' }],
    ] satisfies Target[])
      expect(background(target), target[0]).toBe(Highlight);
    if (server.browser !== 'webkit')
      expect(background(['.env-navigation-drawer-item:not([data-current])'])).not.toBe(Highlight);

    const fillStates: Record<string, 'highlight' | 'outline' | 'dashed'> = {
      'the chosen segment': 'highlight',
      'the selected navigation item': 'highlight',
      'the current rail destination': 'highlight',
      'a switch that is on': 'highlight',
      'a selected table row': 'highlight',
      'the selected tree row': 'highlight',
      'the chosen calendar day': 'highlight',
      'the active document tab': 'highlight',
      "today's calendar day": 'outline',
      'an invalid field': 'dashed',
      'a pressed toolbar toggle': 'highlight',
      'an invalid field part': 'dashed',
    };
    const marks = (target: Target) => {
      const root = element(target);
      return [root, ...root.querySelectorAll('*')].flatMap((node) => {
        const style = getComputedStyle(node);
        return [
          ...[style.backgroundColor, style.color, style.outlineColor, style.fill]
            .filter((color) => color === Highlight)
            .map(() => 'highlight'),
          ...(style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
            ? ['outline']
            : []),
          ...(style.borderTopStyle === 'dashed' ? ['dashed'] : []),
        ];
      });
    };
    const missing: string[] = [];
    for (const [name, mark] of Object.entries(fillStates)) {
      const [state, rest] = states[name]!;
      if (!marks(state).includes(mark) || marks(rest).includes(mark))
        missing.push(`${name}: ${mark}`);
    }
    expect(missing, 'States the forced-colors rules don’t mark').toEqual([]);
  },
);

function contrast(a: string, b: string, under = 'rgb(255, 255, 255)') {
  const channels = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
  const [ur, ug, ub] = channels(under);
  const luminance = (value: string) => {
    const [r, g, b, alpha = 1] = channels(value);
    const [cr, cg, cb] = [
      r! * alpha + ur! * (1 - alpha),
      g! * alpha + ug! * (1 - alpha),
      b! * alpha + ub! * (1 - alpha),
    ].map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * cr! + 0.7152 * cg! + 0.0722 * cb!;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

interface FocusCase {
  name: string;
  ring: Target;
  over: 'fill' | 'canvas';
  focus?: Target;
  prepare?: () => Promise<void>;
}

const focusCases: FocusCase[] = [
  {
    name: 'the selected navigation item',
    ring: ['.env-navigation-drawer-item[data-current]'],
    over: 'fill',
  },
  {
    name: 'the chosen segment',
    ring: ['.env-segmented-control-item[data-checked]'],
    over: 'fill',
  },
  {
    name: 'the active document tab',
    ring: ['.env-document-tabs-item[data-active]'],
    over: 'fill',
    focus: ['.env-document-tabs-item[data-active] [role=tab]'],
  },
  {
    name: "today's calendar day",
    ring: ['.env-calendar-day[aria-current=date] > .env-calendar-day-mark'],
    over: 'canvas',
    focus: ['.env-calendar-day[aria-current=date]'],
  },
  {
    name: 'the selected tree row',
    ring: ["[role=treeitem][aria-selected='true']"],
    over: 'fill',
    focus: ['[role=tree]'],
  },
  { name: 'a highlighted menu item', ring: ['[role=menuitemcheckbox]'], over: 'fill' },
  {
    name: 'the trigger of an open menubar menu',
    ring: ['.env-menubar-trigger[data-popup-open]'],
    over: 'fill',
  },
  {
    name: 'a highlighted Select option',
    ring: ['[role=option][data-highlighted]'],
    over: 'fill',
    prepare: async () => {
      const select = page.getByRole('combobox', { name: 'Plan type' });
      (select.element() as HTMLElement).focus();
      await keyboard.press('ArrowDown');
      await expect
        .poll(() => document.querySelectorAll('[role=option][data-highlighted]').length)
        .toBe(1);
    },
  },
];

test(
  'a focused item keeps a ring in a system color that shows on what it is drawn on',
  { tags: ['engines'] },
  async ({ skip }) => {
    skip(server.browser === 'webkit', 'WebKit keeps the page’s colors under forced colors.');
    await open();
    const system = systemColors();
    for (const { name, ring, over, focus, prepare } of focusCases) {
      await prepare?.();
      const ringElement = element(ring);
      const target = (focus ? element(focus) : ringElement) as HTMLElement;
      const rest = target === document.activeElement ? undefined : painted(ringElement);
      target.focus();
      expect(target.matches(':focus-visible'), name).toBe(true);
      await nextFrames();
      await Promise.all(ringElement.getAnimations().map((animation) => animation.finished));
      if (rest !== undefined)
        expect(painted(ringElement), `${name} shows its focus`).not.toBe(rest);
      const computed = getComputedStyle(ringElement);
      const outline = computed.outlineColor;
      expect(computed.outlineStyle, name).not.toBe('none');
      expect(
        parseFloat(computed.outlineWidth),
        `${name}: the focus ring, not a thinner mark`,
      ).toBeGreaterThanOrEqual(2);
      expect(Object.values(system), `${name}: the ring is a system color`).toContain(outline);
      const behind = over === 'fill' ? computed.backgroundColor : system.Canvas!;
      const least = Math.min(3, contrast(system.HighlightText!, system.Highlight!));
      expect(contrast(outline, behind), `${name}: the ring on ${behind}`).toBeGreaterThanOrEqual(
        least,
      );
    }
  },
);

const popupSurfaces =
  '.env-popup, .env-menu, .env-popover, .env-tooltip, .env-hover-card, .env-dialog-surface, .env-command-palette, .env-toast';

test(
  'every popup keeps a visible edge under forced colors, where its fill is gone',
  { tags: ['engines'], timeout: 60_000 },
  async () => {
    await commands.emulateMedia({ contrast: 'no-preference', forcedColors: 'active' });
    mount(popupsFixture);
    for (const kind of popupKinds) {
      const popup = await openPopup(kind, 'standard');
      await expect.poll(() => popupShown(popup), { message: `${kind} opens` }).toBe(true);
      const surface = popup()!.closest(popupSurfaces)!;
      const style = getComputedStyle(surface);
      const side =
        ['top', 'left', 'right', 'bottom'].find(
          (each) => parseFloat(style.getPropertyValue(`border-${each}-width`)) >= 1,
        ) ?? 'top';
      const read = (part: string) => style.getPropertyValue(`border-${side}-${part}`);
      const name = `${kind} (${surface.className})`;
      expect(parseFloat(read('width')), `${name} has an edge`).toBeGreaterThanOrEqual(1);
      expect(read('style'), `${name} draws its edge`).toBe('solid');
      expect(read('color'), `${name}'s edge is painted`).not.toMatch(
        /rgba\(0, 0, 0, 0\)|transparent/,
      );
      expect(read('color'), `${name}'s edge differs from its fill`).not.toBe(style.backgroundColor);
      await closePopup(kind, popup);
    }
  },
);
