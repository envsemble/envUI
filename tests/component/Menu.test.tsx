import { beforeEach, describe, expect, test } from 'vitest';
import { cdp, commands, page, type Locator } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as menus from '../fixture/Menu.fixture.tsx';
import {
  addStyle,
  box,
  collectErrors,
  css,
  keyboard,
  mouse,
  nextFrames,
  shown,
} from './Browser.ts';
import { mount } from './Mount.tsx';

/** Computed colors of theme tokens, read beside an element so they resolve in its theme. */
function tokenColors(locator: Locator, tokens: string[]) {
  const probe = document.createElement('div');
  locator.element().parentElement!.append(probe);
  const colors = tokens.map((name) => {
    probe.style.backgroundColor = `var(${name})`;
    return getComputedStyle(probe).backgroundColor;
  });
  probe.remove();
  return colors;
}

/** Waits until a popup is open and has finished growing in, so its boxes have their final size. */
async function settled(locator: Locator) {
  await expect.poll(() => shown(locator)).toBe(true);
  await expect.element(locator).not.toHaveAttribute('data-starting-style');
  // The transition starts in the frame after the starting style is removed.
  await nextFrames();
  await Promise.allSettled(
    locator
      .element()
      .getAnimations({ subtree: true })
      .map(({ finished }) => finished),
  );
}

const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isGone = (locator: Locator) => expect.poll(() => locator.elements().length).toBe(0);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const hasText = (locator: Locator, text: string) =>
  expect.poll(() => locator.query()?.textContent).toBe(text);
/** The theme or scale the nearest ancestor of an element gives it, as `data-env-<name>`. */
const ancestorAttribute = (locator: Locator, name: string) =>
  locator.element().parentElement!.closest(`[data-env-${name}]`)!.getAttribute(`data-env-${name}`);

/**
 * Moves focus to a menu item once the menu holds focus: a menu takes focus as it opens, which would
 * otherwise race with the move.
 */
async function focusItem(menu: Locator, item: Locator) {
  await expect.poll(() => menu.query()?.contains(document.activeElement)).toBe(true);
  (item.element() as HTMLElement).focus();
  await isFocused(item);
}

/** The menu popup's own surface: fill, border and corners. */
function popupSurface(menu: Locator) {
  const style = getComputedStyle(menu.element());
  return {
    background: style.backgroundColor,
    borderColor: style.borderTopColor,
    shadow: style.boxShadow,
    filter: style.backdropFilter,
    borderWidth: Number.parseFloat(style.borderTopWidth),
    radius: Number.parseFloat(style.borderTopLeftRadius),
    padding: Number.parseFloat(style.paddingTop),
  };
}

const section = (theme: string) => page.getByTestId(`menus-${theme}`);

describe('Menus', () => {
  test('every menu has the same anatomy, and a compact region gives it 32 px rows', async () => {
    mount(menus);
    await section('light').getByRole('button', { name: 'View options' }).click();
    const menu = page.getByRole('menu', { name: 'View options' });
    await settled(menu);
    // Frosted: the popup color, white in light as the raised surfaces are, at 88 % over a blur, no
    // visible edge, and a soft shadow that parts it from a white card or table beneath.
    const [popup] = tokenColors(menu, ['--env-color-bg-popup']);
    expect(popup).toBe('rgb(255, 255, 255)');
    const frosted = popupSurface(menu);
    expect(frosted.background).toBe('color(srgb 1 1 1 / 0.88)');
    expect(frosted.borderColor).toBe('rgba(0, 0, 0, 0)');
    expect(frosted.shadow).not.toBe('none');
    expect(frosted.filter).toBe('blur(22px) saturate(1.4)');
    expect(frosted.radius).toBeCloseTo(20, 0);
    expect(frosted.padding).toBeCloseTo(6, 0);
    expect(box(menu.getByRole('menuitemradio', { name: 'Name' })).height).toBeCloseTo(40, 0);
    // A group's label sits 10 px in, a little ahead of the rows' 12 px, whatever leads them.
    const label = menu.element().querySelector('.env-menu-group-label')!;
    expect(Number.parseFloat(css(label, 'padding-left'))).toBeCloseTo(10, 0);
    await keyboard.press('Escape');
    await section('light').getByRole('button', { name: 'Open at the button' }).click();
    const actions = page.getByRole('menu', { name: 'Programmatic actions' });
    await settled(actions);
    expect(popupSurface(actions).radius).toBeCloseTo(16, 0);
    expect(box(actions.getByRole('menuitem', { name: 'Programmatic action' })).height).toBeCloseTo(
      32,
      0,
    );
  });

  for (const [why, setUp, tearDown] of [
    [
      'high contrast',
      () => commands.emulateMedia({ contrast: 'more' }),
      () => commands.emulateMedia({ contrast: null }),
    ],
    [
      'reduced transparency',
      () =>
        cdp().send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
        }),
      () => cdp().send('Emulation.setEmulatedMedia', { features: [] }),
    ],
  ] as const)
    test(`a menu is solid with its edge, no blur and no shadow under ${why}`, async () => {
      await setUp();
      try {
        mount(menus);
        await section('light').getByRole('button', { name: 'View options' }).click();
        const menu = page.getByRole('menu', { name: 'View options' });
        await settled(menu);
        // The edge is its elevation's, and at high contrast a modal's, the strongest.
        const [popup, edge] = tokenColors(menu, [
          '--env-color-bg-popup',
          why === 'high contrast' ? '--env-elevation-3-border' : '--env-elevation-2-border',
        ]);
        const solid = popupSurface(menu);
        // Opaque: the popup color itself, white in light as the raised surfaces are; high contrast
        // keeps its own steps, the popup a gray between its page and its raised surfaces. With no
        // shadow, the edge alone parts it from a surface of its color beneath, so the edge is an
        // opaque color apart from the fill.
        const [expected, srgb] =
          why === 'high contrast'
            ? ['rgb(245, 245, 247)', 'color(srgb 0.960784 0.960784 0.968627)']
            : ['rgb(255, 255, 255)', 'color(srgb 1 1 1)'];
        expect(popup).toBe(expected);
        expect(solid.background).toBe(srgb);
        expect(solid.borderColor).toBe(edge);
        expect(edge).toMatch(/^rgb\(/);
        expect(edge).not.toBe(popup);
        expect(solid.borderWidth).toBe(1);
        expect(solid.shadow).toBe('none');
        expect(solid.filter).toBe('blur(0px) saturate(1.4)');
      } finally {
        await tearDown();
      }
    });
});

describe('Submenus', () => {
  async function openCompactOptions() {
    mount(menus);
    await section('light').getByRole('button', { name: 'Compact options' }).click();
    const menu = page.getByRole('menu', { name: 'Compact options' });
    await settled(menu);
    return menu;
  }

  test('a submenu opens beside its row on hover, with the rows of its menu', async () => {
    const errors = collectErrors();
    const menu = await openCompactOptions();
    const recent = menu.getByRole('menuitem', { name: 'Open recent' });
    await expect.element(recent).toHaveAttribute('aria-haspopup', 'menu');
    await recent.hover();
    const submenu = page.getByRole('menu', { name: 'Open recent' });
    await isShown(submenu);
    await expect.element(recent).toHaveAttribute('data-popup-open', '');
    await settled(submenu);
    // It opens at the inline end, just clear of the menu, with its first row beside the trigger row.
    const [menuBox, submenuBox, rowBox, firstBox] = [
      box(menu),
      box(submenu),
      box(recent),
      box(submenu.getByRole('menuitem', { name: 'Quarterly report' })),
    ];
    expect(submenuBox.x).toBeGreaterThanOrEqual(menuBox.x + menuBox.width);
    expect(submenuBox.x).toBeLessThanOrEqual(menuBox.x + menuBox.width + 4);
    expect(Math.abs(firstBox.y - rowBox.y)).toBeLessThanOrEqual(1.5);
    expect(firstBox.height).toBeCloseTo(40, 0);
    // The submenu row stays highlighted while its submenu is open.
    const [popup] = tokenColors(menu, ['--env-color-bg-popup']);
    expect(css(recent, 'background-color')).not.toBe(popup);

    // Several levels nest; choosing a deep item runs it and closes every menu.
    await submenu.getByRole('menuitem', { name: 'More documents' }).hover();
    const nested = page.getByRole('menu', { name: 'More documents' });
    await settled(nested);
    const nestedBox = box(nested);
    const submenuEdge = box(submenu);
    expect(nestedBox.x).toBeGreaterThanOrEqual(submenuEdge.x + submenuEdge.width);
    await nested.getByRole('menuitem', { name: 'Budget' }).click();
    await isHidden(menu);
    await isHidden(submenu);
    await isHidden(nested);
    await hasText(page.getByTestId('menu-log-light'), 'Open Budget');
    // onOpenChange reports the submenu opening, for example to load its items.
    await hasText(page.getByTestId('submenu-state-light'), 'system 1');
    expect(errors).toEqual([]);
  });

  test('the keyboard opens and closes submenus', { tags: ['engines'] }, async () => {
    const errors = collectErrors();
    mount(menus);
    const trigger = section('light').getByRole('button', { name: 'Compact options' });
    (trigger.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'Compact options' });
    await isShown(menu);
    const recent = menu.getByRole('menuitem', { name: 'Open recent' });
    await focusItem(menu, recent);
    // ArrowRight opens the submenu with its first row highlighted; ArrowLeft returns to the row.
    await keyboard.press('ArrowRight');
    const submenu = page.getByRole('menu', { name: 'Open recent' });
    await isShown(submenu);
    const first = submenu.getByRole('menuitem', { name: 'Quarterly report' });
    await expect.element(first).toHaveAttribute('data-highlighted', '');
    await isFocused(first);
    await keyboard.press('ArrowLeft');
    await isHidden(submenu);
    await isFocused(recent);
    await isShown(menu);
    // Enter opens it too; Escape closes only the submenu.
    await keyboard.press('Enter');
    await isFocused(first);
    await keyboard.press('Escape');
    await isHidden(submenu);
    await isShown(menu);
    await isFocused(recent);
    // A disabled submenu row does not open.
    const unavailable = menu.getByRole('menuitem', { name: 'Unavailable documents' });
    await expect.element(unavailable).toHaveAttribute('aria-disabled', 'true');
    await focusItem(menu, unavailable);
    await keyboard.press('ArrowRight');
    await isGone(page.getByRole('menu', { name: 'Unavailable documents' }));
    // Radio items in a submenu keep their choice.
    await focusItem(menu, menu.getByRole('menuitem', { name: 'Appearance' }));
    await keyboard.press('ArrowRight');
    const choices = page.getByRole('menu', { name: 'Appearance' });
    await expect
      .element(choices.getByRole('menuitemradio', { name: 'System' }))
      .toHaveAttribute('aria-checked', 'true');
    await isFocused(choices.getByRole('menuitemradio', { name: 'Light' }));
    await keyboard.press('ArrowDown');
    await isFocused(choices.getByRole('menuitemradio', { name: 'Dark' }));
    await keyboard.press('Enter');
    await isHidden(menu);
    await hasText(page.getByTestId('submenu-state-light'), 'dark 2');
    await isFocused(trigger);
    expect(errors).toEqual([]);
  });

  test(
    'near the edge of the window a submenu opens on the other side',
    { tags: ['engines'] },
    async () => {
      mount(menus);
      // The light section's controls move to the inline end of the window.
      addStyle(
        '.fixture-main { max-width: none; } [data-testid="menus-light"] { justify-items: end; }',
      );
      await section('light').getByRole('button', { name: 'Compact options' }).click();
      const menu = page.getByRole('menu', { name: 'Compact options' });
      await settled(menu);
      await focusItem(menu, menu.getByRole('menuitem', { name: 'Open recent' }));
      await keyboard.press('ArrowRight');
      const submenu = page.getByRole('menu', { name: 'Open recent' });
      await settled(submenu);
      await expect.element(submenu).toHaveAttribute('data-side', 'inline-start');
      const [menuBox, submenuBox] = [box(menu), box(submenu)];
      expect(submenuBox.x + submenuBox.width).toBeLessThanOrEqual(menuBox.x);
      expect(submenuBox.x).toBeGreaterThanOrEqual(0);
    },
  );

  test('submenus follow the scale and theme of their menu', async () => {
    mount(menus);
    // A dark menu opens a dark submenu.
    await section('dark').getByRole('button', { name: 'View options' }).click();
    const menu = page.getByRole('menu', { name: 'View options' });
    await isShown(menu);
    await focusItem(menu, menu.getByRole('menuitem', { name: 'More views' }));
    await keyboard.press('ArrowRight');
    const submenu = page.getByRole('menu', { name: 'More views' });
    await isShown(submenu);
    expect(ancestorAttribute(submenu, 'theme')).toBe('dark');
    await isFocused(submenu.getByRole('menuitem', { name: 'Split right' }));
    await keyboard.press('Enter');
    await isHidden(menu);
    await hasText(page.getByTestId('menu-log-dark'), 'Split right');

    // A context menu in a compact region opens compact submenus.
    await section('light').getByRole('button', { name: 'Open at the button' }).click();
    const actions = page.getByRole('menu', { name: 'Programmatic actions' });
    await isShown(actions);
    expect(ancestorAttribute(actions, 'scale')).toBe('compact');
    await focusItem(actions, actions.getByRole('menuitem', { name: 'Share' }));
    await keyboard.press('ArrowRight');
    const share = page.getByRole('menu', { name: 'Share' });
    await isShown(share);
    expect(ancestorAttribute(share, 'scale')).toBe('compact');
    await share.getByRole('menuitem', { name: 'Copy link' }).click();
    await isHidden(actions);
    await hasText(page.getByTestId('menu-log-light'), 'Copy link');
  });
});

describe('ContextMenu', () => {
  for (const theme of ['light', 'dark']) {
    test(`right click opens the menu for the clicked row in the ${theme} theme`, async () => {
      const errors = collectErrors();
      mount(menus);
      const area = page.getByTestId(`context-area-${theme}`);
      const row = area.getByRole('button', { name: 'Beta' });
      row.element().scrollIntoView({ block: 'nearest' });
      const rowBox = box(row);
      await page.elementLocator(row.element().querySelector('span')!).click({ button: 'right' });
      const menu = page.getByRole('menu', { name: 'Document actions' });
      await isShown(menu);
      expect(ancestorAttribute(menu, 'theme')).toBe(theme);
      // The menu opens at the pointer; near the viewport edge it shifts to stay visible.
      const menuBox = box(menu);
      const pointerY = rowBox.y + rowBox.height / 2;
      expect(pointerY).toBeGreaterThanOrEqual(menuBox.y - 16);
      expect(pointerY).toBeLessThanOrEqual(menuBox.y + menuBox.height + 16);
      expect(Math.abs(menuBox.x - (rowBox.x + rowBox.width / 2))).toBeLessThan(16);

      const rename = menu.getByRole('menuitem', { name: 'Rename Beta' });
      await expect.element(rename).toHaveAttribute('aria-keyshortcuts', 'F2');
      const side = menu.getByRole('menuitem', { name: 'Open to the side' });
      await expect.element(side).toHaveAccessibleDescription('Opens beside the current document');

      await keyboard.press('ArrowDown');
      await expect.element(rename).toHaveAttribute('data-highlighted', '');
      await keyboard.press('ArrowDown');
      await expect.element(side).toHaveAttribute('data-highlighted', '');
      await keyboard.press('Escape');
      await isHidden(menu);

      await area.getByText('Empty space').click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'New document' }).click();
      await hasText(page.getByTestId(`menu-log-${theme}`), 'New document');
      expect(errors).toEqual([]);
    });
  }

  test(
    'the keyboard opens the menu at the focused element and activates items',
    { tags: ['engines'] },
    async () => {
      mount(menus);
      const area = page.getByTestId('context-area-light');
      const row = area.getByRole('button', { name: 'Gamma' });
      // The open menu is modal, so the row is measured first.
      row.element().scrollIntoView({ block: 'nearest' });
      const rowBox = box(row);
      (row.element() as HTMLElement).focus();
      await keyboard.press('Shift+F10');
      const menu = page.getByRole('menu', { name: 'Document actions' });
      await isShown(menu);
      const menuBox = box(menu);
      expect(menuBox.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height - 1);
      expect(menuBox.y).toBeLessThan(rowBox.y + rowBox.height + 24);
      await keyboard.press('ArrowDown');
      await expect
        .element(menu.getByRole('menuitem', { name: 'Rename Gamma' }))
        .toHaveAttribute('data-highlighted', '');
      await keyboard.press('Enter');
      await isHidden(menu);
      await hasText(page.getByTestId('menu-log-light'), 'Rename Gamma');
      await isFocused(row);

      await keyboard.press('ContextMenu');
      await isShown(menu);
      await isShown(menu.getByRole('menuitem', { name: 'Rename Gamma' }));
      await keyboard.press('Escape');
      await isHidden(menu);
      await isFocused(row);
    },
  );

  test(
    'content that renders nothing leaves the browser its own context menu',
    { tags: ['engines'] },
    async () => {
      mount(menus);
      const area = page.getByTestId('context-area-light');
      const field = area.getByRole('textbox', { name: 'Note light' });
      const text = area.getByText('Plain text');
      // Records, after every listener, whether each contextmenu or ContextMenu-key event was cancelled.
      const cancelled: string[] = [];
      const record = (event: Event) => {
        if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'F10') return;
        setTimeout(() => cancelled.push(`${event.type} ${event.defaultPrevented}`));
      };
      for (const type of ['contextmenu', 'keydown'])
        window.addEventListener(type, record, { capture: true });
      try {
        // The field's content is false, as from editable && <Menu.Item>; the text's is ''.
        await field.click({ button: 'right' });
        await text.click({ button: 'right' });
        (field.element() as HTMLElement).focus();
        await keyboard.press('Shift+F10');
        await expect
          .poll(() => cancelled.slice(0, 3))
          .toEqual(['contextmenu false', 'contextmenu false', 'keydown false']);
        // Two frames on, past the frame a menu would mount in, none has, and the contextmenu event
        // some browsers send after Shift+F10 was not cancelled either.
        await nextFrames();
        expect(cancelled.filter((entry) => entry.endsWith('true'))).toEqual([]);
        expect(page.getByRole('menu').elements()).toHaveLength(0);
      } finally {
        for (const type of ['contextmenu', 'keydown'])
          window.removeEventListener(type, record, { capture: true });
      }
    },
  );

  test('a controlled context menu opens at a supplied point', async () => {
    mount(menus);
    const button = section('light').getByRole('button', { name: 'Open at the button' });
    const buttonBox = box(button);
    await button.click();
    const menu = page.getByRole('menu', { name: 'Programmatic actions' });
    await isShown(menu);
    const menuBox = box(menu);
    expect(Math.abs(menuBox.x - buttonBox.x)).toBeLessThan(8);
    expect(Math.abs(menuBox.y - (buttonBox.y + buttonBox.height + 4))).toBeLessThan(8);
    await menu.getByRole('menuitem', { name: 'Programmatic action' }).click();
    await isHidden(menu);
    await hasText(page.getByTestId('menu-log-light'), 'Programmatic action');
  });
});

test("a menu takes its trigger's name, and keeps its own choices from their defaults", async () => {
  mount(menus);
  await section('light').getByRole('button', { name: 'Density' }).click();
  const menu = page.getByRole('menu', { name: 'Density' });
  // Open in full before its row is pressed, as a person sees it: a press in the moment the menu
  // opens may not choose.
  await settled(menu);
  await expect
    .element(menu.getByRole('menuitemradio', { name: 'Cozy' }))
    .toHaveAttribute('aria-checked', 'true');
  await expect
    .element(menu.getByRole('menuitemcheckbox', { name: 'Show icons' }))
    .toHaveAttribute('aria-checked', 'true');
  await expect
    .element(page.getByTestId('density-separator-light'))
    .toHaveClass(/env-menu-separator/);
  // One column of check marks and one of labels, though one row holds an icon too and the others
  // don't.
  const starts = (selector: string) =>
    [...menu.element().querySelectorAll(selector)].map((element) => box(element).x);
  const checks = starts('.env-menu-item-indicator-slot');
  const labels = starts('.env-menu-item-label');
  expect(checks).toHaveLength(3);
  expect(new Set(checks).size).toBe(1);
  expect(new Set(labels).size).toBe(1);
  await menu.getByRole('menuitemradio', { name: 'Tight' }).click();
  await section('light').getByRole('button', { name: 'Density' }).click();
  await expect
    .element(
      page.getByRole('menu', { name: 'Density' }).getByRole('menuitemradio', { name: 'Tight' }),
    )
    .toHaveAttribute('aria-checked', 'true');
});

test('menu groups, radio and checkbox items keep their choice', async () => {
  mount(menus);
  const scope = section('light');
  const state = page.getByTestId('menu-state-light');
  await scope.getByRole('button', { name: 'View options' }).click();
  const menu = page.getByRole('menu', { name: 'View options' });
  await isShown(menu.getByRole('group', { name: 'Sort by' }));
  await isShown(menu.getByRole('group', { name: 'Display' }));
  const name = menu.getByRole('menuitemradio', { name: 'Name' });
  const date = menu.getByRole('menuitemradio', { name: 'Date' });
  await expect.element(name).toHaveAttribute('aria-checked', 'true');
  // The chosen radio row takes the selection's fill and text with its check mark; the other keeps
  // none.
  const [selected, onSelected] = tokenColors(menu, [
    '--env-color-bg-selected',
    '--env-color-fg-on-selected',
  ]);
  const look = (item: Locator) => [css(item, 'background-color'), css(item, 'color')];
  await expect.element(menu).not.toHaveAttribute('data-starting-style');
  await mouse.move(0, 0);
  await expect.poll(() => look(name)).toEqual([selected, onSelected]);
  await isShown(page.elementLocator(name.element().querySelector('.env-menu-item-indicator')!));
  expect(look(date)[0]).toBe('rgba(0, 0, 0, 0)');
  await expect.element(date).toHaveAccessibleDescription('Most recently changed first');
  await date.click();
  await isHidden(menu);
  await hasText(state, 'date hidden concealed');

  await scope.getByRole('button', { name: 'View options' }).click();
  await expect
    .element(menu.getByRole('menuitemradio', { name: 'Date' }))
    .toHaveAttribute('aria-checked', 'true');
  const hidden = menu.getByRole('menuitemcheckbox', { name: 'Show hidden files' });
  await hidden.click();
  // Checkbox items keep the menu open, so several options can change.
  await isShown(menu);
  await expect.element(hidden).toHaveAttribute('aria-checked', 'true');
  await hasText(state, 'date hidden shown');
  const palette = menu.getByRole('menuitem', { name: 'Command palette' });
  await expect.element(palette).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+P');
  const keys = (item: Locator, selector = 'kbd.env-kbd') =>
    [...item.element().querySelectorAll(selector)].map((key) => key.textContent);
  // The hint shows as keys.
  expect(keys(palette, '.env-menu-item-shortcut kbd.env-kbd')).toEqual(['Ctrl', 'Shift', 'P']);
  // Muted text in one unit, no chip per key: the keys carry no fill and the + between them shows;
  // the chords of a sequence stand apart by space.
  const spacing = (itemName: string) => {
    const shortcut = menu
      .getByRole('menuitem', { name: itemName })
      .element()
      .querySelector('.env-menu-item-shortcut')!;
    const kbds = [...shortcut.querySelectorAll('kbd.env-kbd')];
    const rects = kbds.map((key) => key.getBoundingClientRect());
    const separators = [...shortcut.querySelectorAll('.env-kbd-separator')];
    return {
      text: shortcut.textContent,
      gaps: rects.slice(1).map((key, index) => Math.round(key.left - rects[index]!.right)),
      fills: [...new Set(kbds.map((key) => getComputedStyle(key).backgroundColor))],
      shown: separators.every((separator) => separator.getBoundingClientRect().width > 3),
    };
  };
  expect(spacing('Command palette')).toEqual({
    text: 'Ctrl+Shift+P',
    gaps: [7, 7],
    fills: ['rgba(0, 0, 0, 0)'],
    shown: true,
  });
  expect(spacing('Keyboard shortcuts').gaps).toEqual([7, 10, 7]);
  // The plus key keeps its name, and a sequence shows its keys without claiming a single shortcut.
  const zoom = menu.getByRole('menuitem', { name: 'Zoom in' });
  await expect.element(zoom).toHaveAttribute('aria-keyshortcuts', 'Control+Plus');
  expect(keys(zoom)).toEqual(['Ctrl', '+']);
  // An arrow shows as its glyph and is announced by its key name.
  const back = menu.getByRole('menuitem', { name: 'Back' });
  await expect.element(back).toHaveAttribute('aria-keyshortcuts', 'Alt+ArrowLeft');
  expect(keys(back)).toEqual(['Alt', '←']);
  const sequence = menu.getByRole('menuitem', { name: 'Keyboard shortcuts' });
  expect(sequence.element().hasAttribute('aria-keyshortcuts')).toBe(false);
  expect(keys(sequence)).toEqual(['Ctrl', 'K', 'Ctrl', 'S']);
  const plusSequence = menu.getByRole('menuitem', { name: 'Zoom sequence' });
  expect(plusSequence.element().hasAttribute('aria-keyshortcuts')).toBe(false);
  expect(keys(plusSequence)).toEqual(['Ctrl', 'Shift', '+', 'Ctrl', 'K']);
  await keyboard.press('Escape');
  await isHidden(menu);
});

test('Menu supports keyboard navigation, actions and routed destinations', async () => {
  const errors = collectErrors();
  mount(adoption);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  (trigger.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Account', exact: true });
  await isShown(menu);
  expect(menu.getByRole('menuitem').elements()).toHaveLength(2);
  // The header, the account menu pattern's avatar centered above the name, is not an item, and
  // the menu keeps its own name.
  await settled(menu);
  const [avatar, name] = [
    box(menu.getByTestId('account-avatar')),
    box(menu.getByTestId('account-name')),
  ];
  expect(avatar.y + avatar.height).toBeLessThanOrEqual(name.y);
  expect(Math.abs(avatar.x + avatar.width / 2 - (name.x + name.width / 2))).toBeLessThan(1);
  // Opening from the keyboard highlights the first item.
  await isFocused(menu.getByRole('menuitem', { name: 'Account settings' }));
  await keyboard.press('ArrowDown');
  await isFocused(menu.getByRole('menuitem', { name: 'Sign out' }));
  await keyboard.press('Enter');
  await hasText(page.getByTestId('menu-action'), 'Signed out');
  await isGone(menu);
  await isFocused(trigger);

  await trigger.click();
  const link = page.getByRole('menuitem', { name: 'Account settings' });
  await expect.element(link).toHaveAttribute('data-router-link', '');
  await link.click();
  await expect.poll(() => document.body.dataset.navigatedTo).toBe('/account');
  // Its onClick runs too, such as to record the choice.
  await hasText(page.getByTestId('menu-action'), 'Followed account settings');
  expect(errors).toEqual([]);
});

describe('Focus as a menu closes', { tags: ['engines'] }, () => {
  /** Counts the focus events an element receives from now on. */
  const countFocus = (element: Locator) => {
    const node = element.element() as HTMLElement;
    node.dataset.focusCount = '0';
    node.addEventListener('focus', () => {
      node.dataset.focusCount = String(Number(node.dataset.focusCount) + 1);
    });
  };
  const openCompact = async () => {
    const button = section('light').getByRole('button', { name: 'Compact options' });
    (button.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'Compact options' });
    await isFocused(menu.getByRole('menuitem', { name: 'New window' }));
    await settled(menu);
    return { button, menu };
  };

  beforeEach(() => {
    mount(menus);
    // The exit lasts long enough to act while the closing menu still fades out.
    addStyle('.env-popup[data-ending-style] { transition-duration: 1.5s; }');
  });

  test('a press outside leaves focus to the press, never taking it to the trigger first', async () => {
    const { button, menu } = await openCompact();
    countFocus(button);
    // Away from the menu and its trigger: the press lands on the menu's backdrop.
    const at = box(menu);
    await mouse.click(at.x + at.width + 200, at.y + at.height / 2);
    await expect.element(menu).toHaveAttribute('data-ending-style');
    await expect.element(button).not.toHaveFocus();
    await expect.element(button).toHaveAttribute('data-focus-count', '0');
    // Base UI decides once the menu has gone, and moves focus once at most.
    await isGone(menu);
    await expect
      .element(button)
      .toHaveAttribute('data-focus-count', expect.stringMatching(/^[01]$/));
  });

  test('Tab moves on from the menu, and focus stays where it went', async () => {
    const { button, menu } = await openCompact();
    countFocus(button);
    await keyboard.press('Tab');
    await expect.element(menu).toHaveAttribute('data-ending-style');
    // Past the trigger, to the control after it, without passing through the trigger.
    const next = section('light').getByRole('button', { name: 'Density' });
    await isFocused(next);
    await isGone(menu);
    await isFocused(next);
    await expect.element(button).toHaveAttribute('data-focus-count', '0');
  });

  test('Escape gives focus to the trigger as the menu starts to fade', async () => {
    const { button, menu } = await openCompact();
    await keyboard.press('Escape');
    await expect.element(menu).toHaveAttribute('data-ending-style');
    await isFocused(button);
  });

  test('a submenu closed with Escape gives its row focus, and focus moved on stays', async () => {
    const { menu } = await openCompact();
    const row = menu.getByRole('menuitem', { name: 'Open recent' });
    (row.element() as HTMLElement).focus();
    await keyboard.press('ArrowRight');
    const recent = page.getByRole('menu', { name: 'Open recent' });
    await isFocused(recent.getByRole('menuitem', { name: 'Quarterly report' }));
    await settled(recent);
    await keyboard.press('Escape');
    await expect.element(recent).toHaveAttribute('data-ending-style');
    await isFocused(row);
    await keyboard.press('ArrowUp');
    const save = menu.getByRole('menuitem', { name: 'Save' });
    await isFocused(save);
    // Gone, the submenu leaves focus where it moved rather than taking it back to its row.
    await isGone(recent);
    await isFocused(save);
  });
});
