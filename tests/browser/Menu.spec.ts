import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;
const menusFixture = `${fixtureUrl}/?fixture=menus`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** Computed colors of theme tokens, read beside an element so they resolve in its theme. */
async function tokenColors(locator: Locator, tokens: string[]) {
  return locator.evaluate((element, names) => {
    const probe = document.createElement('div');
    element.parentElement!.append(probe);
    const colors = names.map((name) => {
      probe.style.backgroundColor = `var(${name})`;
      return getComputedStyle(probe).backgroundColor;
    });
    probe.remove();
    return colors;
  }, tokens);
}

/** Waits until a popup has finished growing in, so its boxes have their final size. */
async function settled(locator: Locator) {
  await expect(locator).not.toHaveAttribute('data-starting-style');
  await locator.evaluate(async (element) => {
    // The transition starts in the frame after the starting style is removed.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.allSettled(
      element.getAnimations({ subtree: true }).map(({ finished }) => finished),
    );
  });
}

/**
 * Moves focus to a menu item once the menu holds focus: a menu takes focus as it opens, which would
 * otherwise race with the move.
 */
async function focusItem(menu: Locator, item: Locator) {
  await expect
    .poll(() => menu.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  await item.focus();
  await expect(item).toBeFocused();
}

/** The menu popup's own surface: fill, border and corners. */
async function popupSurface(menu: Locator) {
  return menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      borderColor: style.borderTopColor,
      shadow: style.boxShadow,
      filter: style.backdropFilter,
      borderWidth: Number.parseFloat(style.borderTopWidth),
      radius: Number.parseFloat(style.borderTopLeftRadius),
      padding: Number.parseFloat(style.paddingTop),
    };
  });
}

test.describe('Menus', () => {
  test('every menu has the same anatomy, and a compact region gives it 32 px rows', async ({
    page,
  }) => {
    await page.goto(menusFixture);
    await page.getByTestId('menus-light').getByRole('button', { name: 'View options' }).click();
    const menu = page.getByRole('menu', { name: 'View options' });
    await expect(menu).toBeVisible();
    await settled(menu);
    // Frosted: the popup color, white in light as the raised surfaces are, at 88 % over a blur, no
    // visible edge, and a soft shadow that parts it from a white card or table beneath.
    const [popup] = await tokenColors(menu, ['--env-color-bg-popup']);
    expect(popup).toBe('rgb(255, 255, 255)');
    const frosted = await popupSurface(menu);
    expect(frosted.background).toBe('color(srgb 1 1 1 / 0.88)');
    expect(frosted.borderColor).toBe('rgba(0, 0, 0, 0)');
    expect(frosted.shadow).not.toBe('none');
    expect(frosted.filter).toBe('blur(22px) saturate(1.4)');
    expect(frosted.radius).toBeCloseTo(20, 0);
    expect(frosted.padding).toBeCloseTo(6, 0);
    const row = (await menu.getByRole('menuitemradio', { name: 'Name' }).boundingBox())!;
    expect(row.height).toBeCloseTo(40, 0);
    // A group's label sits 10 px in, a little ahead of the rows' 12 px, whatever leads them.
    const labelInset = await menu
      .locator('.env-menu-group-label')
      .first()
      .evaluate((label) => Number.parseFloat(getComputedStyle(label).paddingLeft));
    expect(labelInset).toBeCloseTo(10, 0);
    await page.keyboard.press('Escape');
    await page
      .getByTestId('menus-light')
      .getByRole('button', { name: 'Open at the button' })
      .click();
    const actions = page.getByRole('menu', { name: 'Programmatic actions' });
    await expect(actions).toBeVisible();
    await settled(actions);
    const surface = await popupSurface(actions);
    expect(surface.radius).toBeCloseTo(16, 0);
    const action = (await actions
      .getByRole('menuitem', { name: 'Programmatic action' })
      .boundingBox())!;
    expect(action.height).toBeCloseTo(32, 0);
  });

  test('in dark a menu takes the popup color, a step above the cards, frosted and solid', async ({
    page,
  }) => {
    await page.goto(menusFixture);
    const open = async () => {
      await page.getByTestId('menus-dark').getByRole('button', { name: 'View options' }).click();
      const menu = page.getByRole('menu', { name: 'View options' });
      await expect(menu).toBeVisible();
      await settled(menu);
      return menu;
    };
    let menu = await open();
    const [popup, card] = await tokenColors(menu, [
      '--env-color-bg-popup',
      '--env-color-bg-raised',
    ]);
    expect(popup).toBe('rgb(52, 54, 56)');
    expect(popup).not.toBe(card);
    expect((await popupSurface(menu)).background).toBe(
      'color(srgb 0.203922 0.211765 0.219608 / 0.9)',
    );
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await page.emulateMedia({ contrast: 'more' });
    menu = await open();
    // Solid: the popup color itself, as the same mix resolves it, inside the strongest edge.
    const [solid, edge] = await menu.evaluate((element) => {
      const probe = document.createElement('div');
      element.append(probe);
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--env-color-bg-popup) 100%, transparent)';
      const fill = getComputedStyle(probe).backgroundColor;
      probe.style.backgroundColor = 'var(--env-elevation-3-border)';
      const border = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return [fill, border];
    });
    const look = await popupSurface(menu);
    expect(look.background).toBe(solid);
    expect(look.borderColor).toBe(edge);
  });

  for (const [why, setUp] of [
    ['high contrast', (page: Page) => page.emulateMedia({ contrast: 'more' })],
    [
      'reduced transparency',
      async (page: Page) => {
        const session = await page.context().newCDPSession(page);
        await session.send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
        });
      },
    ],
  ] as const)
    test(`a menu is solid with its edge, no blur and no shadow under ${why}`, async ({ page }) => {
      await setUp(page);
      await page.goto(menusFixture);
      await page.getByTestId('menus-light').getByRole('button', { name: 'View options' }).click();
      const menu = page.getByRole('menu', { name: 'View options' });
      await expect(menu).toBeVisible();
      await settled(menu);
      // The edge is its elevation's, and at high contrast a modal's, the strongest.
      const [popup, edge] = await tokenColors(menu, [
        '--env-color-bg-popup',
        why === 'high contrast' ? '--env-elevation-3-border' : '--env-elevation-2-border',
      ]);
      const solid = await popupSurface(menu);
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
    });
});

test.describe('Submenus', () => {
  async function openCompactOptions(page: Page) {
    await page.goto(menusFixture);
    await page.getByTestId('menus-light').getByRole('button', { name: 'Compact options' }).click();
    const menu = page.getByRole('menu', { name: 'Compact options' });
    await expect(menu).toBeVisible();
    await settled(menu);
    return menu;
  }

  test('a separator is a break of half a row, with no line', async ({ page }) => {
    const menu = await openCompactOptions(page);
    const separator = menu.getByRole('separator').first();
    await expect(separator).toHaveCSS('border-top-width', '0px');
    // Half a row's height, so it reads as a break between groups rather than uneven spacing.
    const [height, row] = await separator.evaluate((element) => [
      element.getBoundingClientRect().height,
      element.closest('.env-menu')!.querySelector('.env-menu-item')!.getBoundingClientRect().height,
    ]);
    expect(height).toBeCloseTo(row / 2, 0);
  });

  test('a submenu opens beside its row on hover, with the rows of its menu', async ({ page }) => {
    const errors = collectErrors(page);
    const menu = await openCompactOptions(page);
    const recent = menu.getByRole('menuitem', { name: 'Open recent' });
    await expect(recent).toHaveAttribute('aria-haspopup', 'menu');
    await recent.hover();
    const submenu = page.getByRole('menu', { name: 'Open recent' });
    await expect(submenu).toBeVisible();
    await expect(recent).toHaveAttribute('data-popup-open', '');
    await settled(submenu);
    // It opens at the inline end, just clear of the menu, with its first row beside the trigger row.
    const [menuBox, submenuBox, rowBox, firstBox] = await Promise.all([
      menu.boundingBox(),
      submenu.boundingBox(),
      recent.boundingBox(),
      submenu.getByRole('menuitem', { name: 'Quarterly report' }).boundingBox(),
    ]);
    expect(submenuBox!.x).toBeGreaterThanOrEqual(menuBox!.x + menuBox!.width);
    expect(submenuBox!.x).toBeLessThanOrEqual(menuBox!.x + menuBox!.width + 4);
    expect(Math.abs(firstBox!.y - rowBox!.y)).toBeLessThanOrEqual(1.5);
    expect(firstBox!.height).toBeCloseTo(40, 0);
    // The submenu row stays highlighted while its submenu is open.
    const [popup] = await tokenColors(menu, ['--env-color-bg-popup']);
    expect(await recent.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
      popup,
    );

    // Several levels nest; choosing a deep item runs it and closes every menu.
    await submenu.getByRole('menuitem', { name: 'More documents' }).hover();
    const nested = page.getByRole('menu', { name: 'More documents' });
    await expect(nested).toBeVisible();
    await settled(nested);
    const nestedBox = (await nested.boundingBox())!;
    const submenuEdge = (await submenu.boundingBox())!;
    expect(nestedBox.x).toBeGreaterThanOrEqual(submenuEdge.x + submenuEdge.width);
    await nested.getByRole('menuitem', { name: 'Budget' }).click();
    await expect(menu).toBeHidden();
    await expect(submenu).toBeHidden();
    await expect(nested).toBeHidden();
    await expect(page.getByTestId('menu-log-light')).toHaveText('Open Budget');
    // onOpenChange reports the submenu opening, for example to load its items.
    await expect(page.getByTestId('submenu-state-light')).toHaveText('system 1');
    expect(errors).toEqual([]);
  });

  test('the keyboard opens and closes submenus', { tag: '@engines' }, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(menusFixture);
    const trigger = page
      .getByTestId('menus-light')
      .getByRole('button', { name: 'Compact options' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'Compact options' });
    await expect(menu).toBeVisible();
    const recent = menu.getByRole('menuitem', { name: 'Open recent' });
    await focusItem(menu, recent);
    // ArrowRight opens the submenu with its first row highlighted; ArrowLeft returns to the row.
    await page.keyboard.press('ArrowRight');
    const submenu = page.getByRole('menu', { name: 'Open recent' });
    await expect(submenu).toBeVisible();
    const first = submenu.getByRole('menuitem', { name: 'Quarterly report' });
    await expect(first).toHaveAttribute('data-highlighted', '');
    await expect(first).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(submenu).toBeHidden();
    await expect(recent).toBeFocused();
    await expect(menu).toBeVisible();
    // Enter opens it too; Escape closes only the submenu.
    await page.keyboard.press('Enter');
    await expect(first).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(submenu).toBeHidden();
    await expect(menu).toBeVisible();
    await expect(recent).toBeFocused();
    // A disabled submenu row does not open.
    const unavailable = menu.getByRole('menuitem', { name: 'Unavailable documents' });
    await expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await focusItem(menu, unavailable);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menu', { name: 'Unavailable documents' })).toHaveCount(0);
    // Radio items in a submenu keep their choice.
    const appearance = menu.getByRole('menuitem', { name: 'Appearance' });
    await focusItem(menu, appearance);
    await page.keyboard.press('ArrowRight');
    const choices = page.getByRole('menu', { name: 'Appearance' });
    await expect(choices.getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(choices.getByRole('menuitemradio', { name: 'Light' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(choices.getByRole('menuitemradio', { name: 'Dark' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('submenu-state-light')).toHaveText('dark 2');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test(
    'near the edge of the window a submenu opens on the other side',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(menusFixture);
      // The light section's controls move to the inline end of the window.
      await page.addStyleTag({
        content:
          '.fixture-main { max-width: none; } [data-testid="menus-light"] { justify-items: end; }',
      });
      await page
        .getByTestId('menus-light')
        .getByRole('button', { name: 'Compact options' })
        .click();
      const menu = page.getByRole('menu', { name: 'Compact options' });
      await expect(menu).toBeVisible();
      await settled(menu);
      await focusItem(menu, menu.getByRole('menuitem', { name: 'Open recent' }));
      await page.keyboard.press('ArrowRight');
      const submenu = page.getByRole('menu', { name: 'Open recent' });
      await expect(submenu).toBeVisible();
      await settled(submenu);
      await expect(submenu).toHaveAttribute('data-side', 'inline-start');
      const [menuBox, submenuBox] = [(await menu.boundingBox())!, (await submenu.boundingBox())!];
      expect(submenuBox.x + submenuBox.width).toBeLessThanOrEqual(menuBox.x);
      expect(submenuBox.x).toBeGreaterThanOrEqual(0);
    },
  );

  test('submenus follow the scale and theme of their menu', async ({ page }) => {
    await page.goto(menusFixture);
    // A dark menu opens a dark submenu.
    await page.getByTestId('menus-dark').getByRole('button', { name: 'View options' }).click();
    const menu = page.getByRole('menu', { name: 'View options' });
    await expect(menu).toBeVisible();
    await focusItem(menu, menu.getByRole('menuitem', { name: 'More views' }));
    await page.keyboard.press('ArrowRight');
    const submenu = page.getByRole('menu', { name: 'More views' });
    await expect(submenu).toBeVisible();
    await expect(submenu.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
      'data-env-theme',
      'dark',
    );
    await expect(submenu.getByRole('menuitem', { name: 'Split right' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-log-dark')).toHaveText('Split right');

    // A context menu in a compact region opens compact submenus.
    await page
      .getByTestId('menus-light')
      .getByRole('button', { name: 'Open at the button' })
      .click();
    const actions = page.getByRole('menu', { name: 'Programmatic actions' });
    await expect(actions.locator('xpath=ancestor::*[@data-env-scale][1]')).toHaveAttribute(
      'data-env-scale',
      'compact',
    );
    await focusItem(actions, actions.getByRole('menuitem', { name: 'Share' }));
    await page.keyboard.press('ArrowRight');
    const share = page.getByRole('menu', { name: 'Share' });
    await expect(share.locator('xpath=ancestor::*[@data-env-scale][1]')).toHaveAttribute(
      'data-env-scale',
      'compact',
    );
    await share.getByRole('menuitem', { name: 'Copy link' }).click();
    await expect(actions).toBeHidden();
    await expect(page.getByTestId('menu-log-light')).toHaveText('Copy link');
  });
});

test.describe('ContextMenu', () => {
  for (const theme of ['light', 'dark']) {
    test(`right click opens the menu for the clicked row in the ${theme} theme`, async ({
      page,
    }) => {
      const errors = collectErrors(page);
      await page.goto(menusFixture);
      const area = page.getByTestId(`context-area-${theme}`);
      const row = area.getByRole('button', { name: 'Beta' });
      await row.scrollIntoViewIfNeeded();
      const rowBox = (await row.boundingBox())!;
      await row.locator('span').click({ button: 'right' });
      const menu = page.getByRole('menu', { name: 'Document actions' });
      await expect(menu).toBeVisible();
      await expect(menu.locator('xpath=ancestor::*[@data-env-theme][1]')).toHaveAttribute(
        'data-env-theme',
        theme,
      );
      // The menu opens at the pointer; near the viewport edge it shifts to stay visible.
      const menuBox = (await menu.boundingBox())!;
      const pointerY = rowBox.y + rowBox.height / 2;
      expect(pointerY).toBeGreaterThanOrEqual(menuBox.y - 16);
      expect(pointerY).toBeLessThanOrEqual(menuBox.y + menuBox.height + 16);
      expect(Math.abs(menuBox.x - (rowBox.x + rowBox.width / 2))).toBeLessThan(16);

      const rename = menu.getByRole('menuitem', { name: 'Rename Beta' });
      await expect(rename).toHaveAttribute('aria-keyshortcuts', 'F2');
      const side = menu.getByRole('menuitem', { name: 'Open to the side' });
      await expect(side).toHaveAccessibleDescription('Opens beside the current document');

      await page.keyboard.press('ArrowDown');
      await expect(rename).toHaveAttribute('data-highlighted', '');
      await page.keyboard.press('ArrowDown');
      await expect(side).toHaveAttribute('data-highlighted', '');
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();

      await area.getByText('Empty space').click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'New document' }).click();
      await expect(page.getByTestId(`menu-log-${theme}`)).toHaveText('New document');
      expect(errors).toEqual([]);
    });
  }

  test(
    'the keyboard opens the menu at the focused element and activates items',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(menusFixture);
      const area = page.getByTestId('context-area-light');
      const row = area.getByRole('button', { name: 'Gamma' });
      // The open menu is modal, so the row is measured first.
      await row.scrollIntoViewIfNeeded();
      const rowBox = (await row.boundingBox())!;
      await row.focus();
      await page.keyboard.press('Shift+F10');
      const menu = page.getByRole('menu', { name: 'Document actions' });
      await expect(menu).toBeVisible();
      const menuBox = (await menu.boundingBox())!;
      expect(menuBox.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height - 1);
      expect(menuBox.y).toBeLessThan(rowBox.y + rowBox.height + 24);
      await page.keyboard.press('ArrowDown');
      await expect(menu.getByRole('menuitem', { name: 'Rename Gamma' })).toHaveAttribute(
        'data-highlighted',
        '',
      );
      await page.keyboard.press('Enter');
      await expect(menu).toBeHidden();
      await expect(page.getByTestId('menu-log-light')).toHaveText('Rename Gamma');
      await expect(row).toBeFocused();

      await page.keyboard.press('ContextMenu');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Rename Gamma' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(row).toBeFocused();
    },
  );

  test(
    'content that renders nothing leaves the browser its own context menu',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(menusFixture);
      const area = page.getByTestId('context-area-light');
      const field = area.getByRole('textbox', { name: 'Note light' });
      const text = area.getByText('Plain text');
      await page.evaluate(() => {
        // Records, after every listener, whether each contextmenu or ContextMenu-key event was cancelled.
        const log: string[] = [];
        (window as Window & { cancelled?: string[] }).cancelled = log;
        for (const type of ['contextmenu', 'keydown']) {
          window.addEventListener(
            type,
            (event) => {
              if (type === 'keydown' && (event as KeyboardEvent).key !== 'F10') return;
              setTimeout(() => log.push(`${type} ${event.defaultPrevented}`));
            },
            { capture: true },
          );
        }
      });
      const cancelled = () =>
        page.evaluate(() => (window as Window & { cancelled?: string[] }).cancelled);
      // The field's content is false, as from editable && <Menu.Item>; the text's is ''.
      await field.click({ button: 'right' });
      await text.click({ button: 'right' });
      await field.focus();
      await page.keyboard.press('Shift+F10');
      await expect
        .poll(async () => (await cancelled())?.slice(0, 3))
        .toEqual(['contextmenu false', 'contextmenu false', 'keydown false']);
      // Two frames on, past the frame a menu would mount in, none has, and the contextmenu event some browsers send
      // after Shift+F10 was not cancelled either.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      expect((await cancelled())?.filter((entry) => entry.endsWith('true'))).toEqual([]);
      await expect(page.getByRole('menu')).toHaveCount(0);
    },
  );

  test('a controlled context menu opens at a supplied point', async ({ page }) => {
    await page.goto(menusFixture);
    const scope = page.getByTestId('menus-light');
    const button = scope.getByRole('button', { name: 'Open at the button' });
    const buttonBox = (await button.boundingBox())!;
    await button.click();
    const menu = page.getByRole('menu', { name: 'Programmatic actions' });
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;
    expect(Math.abs(menuBox.x - buttonBox.x)).toBeLessThan(8);
    expect(Math.abs(menuBox.y - (buttonBox.y + buttonBox.height + 4))).toBeLessThan(8);
    await menu.getByRole('menuitem', { name: 'Programmatic action' }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByTestId('menu-log-light')).toHaveText('Programmatic action');
  });
});

test("a menu takes its trigger's name, and keeps its own choices from their defaults", async ({
  page,
}) => {
  await page.goto(menusFixture);
  await page.getByTestId('menus-light').getByRole('button', { name: 'Density' }).click();
  const menu = page.getByRole('menu', { name: 'Density' });
  await expect(menu.getByRole('menuitemradio', { name: 'Cozy' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Show icons' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByTestId('density-separator-light')).toHaveClass(/env-menu-separator/);
  // One column of check marks and one of labels, though one row holds an icon too and the others
  // don't.
  const starts = (selector: string) =>
    menu
      .locator(selector)
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().left));
  const checks = await starts('.env-menu-item-indicator-slot');
  const labels = await starts('.env-menu-item-label');
  expect(checks).toHaveLength(3);
  expect(new Set(checks).size).toBe(1);
  expect(new Set(labels).size).toBe(1);
  await menu.getByRole('menuitemradio', { name: 'Tight' }).click();
  await page.getByTestId('menus-light').getByRole('button', { name: 'Density' }).click();
  await expect(
    page.getByRole('menu', { name: 'Density' }).getByRole('menuitemradio', { name: 'Tight' }),
  ).toHaveAttribute('aria-checked', 'true');
});

test('menu groups, radio and checkbox items keep their choice', async ({ page }) => {
  await page.goto(menusFixture);
  const scope = page.getByTestId('menus-light');
  const state = page.getByTestId('menu-state-light');
  await scope.getByRole('button', { name: 'View options' }).click();
  const menu = page.getByRole('menu', { name: 'View options' });
  await expect(menu.getByRole('group', { name: 'Sort by' })).toBeVisible();
  await expect(menu.getByRole('group', { name: 'Display' })).toBeVisible();
  const name = menu.getByRole('menuitemradio', { name: 'Name' });
  const date = menu.getByRole('menuitemradio', { name: 'Date' });
  await expect(name).toHaveAttribute('aria-checked', 'true');
  // The chosen radio row shows its check mark alone, with no fill, as the other row has none.
  const [text] = await tokenColors(menu, ['--env-color-fg-default']);
  const look = (item: Locator) =>
    item.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.backgroundColor, style.color];
    });
  await expect(menu).not.toHaveAttribute('data-starting-style');
  await page.mouse.move(0, 0);
  await expect.poll(() => look(name)).toEqual(['rgba(0, 0, 0, 0)', text]);
  await expect(name.locator('.env-menu-item-indicator')).toBeVisible();
  expect((await look(date))[0]).toBe('rgba(0, 0, 0, 0)');
  await expect(date).toHaveAccessibleDescription('Most recently changed first');
  await date.click();
  await expect(menu).toBeHidden();
  await expect(state).toHaveText('date hidden concealed');

  await scope.getByRole('button', { name: 'View options' }).click();
  await expect(menu.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  const hidden = menu.getByRole('menuitemcheckbox', { name: 'Show hidden files' });
  await hidden.click();
  // Checkbox items keep the menu open, so several options can change.
  await expect(menu).toBeVisible();
  await expect(hidden).toHaveAttribute('aria-checked', 'true');
  await expect(state).toHaveText('date hidden shown');
  await expect(menu.getByRole('menuitem', { name: 'Command palette' })).toHaveAttribute(
    'aria-keyshortcuts',
    'Control+Shift+P',
  );
  // The hint shows as keys.
  await expect(
    menu
      .getByRole('menuitem', { name: 'Command palette' })
      .locator('.env-menu-item-shortcut kbd.env-kbd'),
  ).toHaveText(['Ctrl', 'Shift', 'P']);
  // Muted text in one unit, no chip per key: the keys carry no fill and the + between them shows;
  // the chords of a sequence stand apart by space.
  const spacing = (name: string) =>
    menu
      .getByRole('menuitem', { name })
      .locator('.env-menu-item-shortcut')
      .evaluate((shortcut) => {
        const keys = [...shortcut.querySelectorAll('kbd.env-kbd')].map((key) =>
          key.getBoundingClientRect(),
        );
        const separators = [...shortcut.querySelectorAll('.env-kbd-separator')];
        return {
          text: shortcut.textContent,
          gaps: keys.slice(1).map((key, index) => Math.round(key.left - keys[index]!.right)),
          fills: [
            ...new Set(
              [...shortcut.querySelectorAll('kbd.env-kbd')].map(
                (key) => getComputedStyle(key).backgroundColor,
              ),
            ),
          ],
          shown: separators.every((separator) => separator.getBoundingClientRect().width > 3),
        };
      });
  expect(await spacing('Command palette')).toEqual({
    text: 'Ctrl+Shift+P',
    gaps: [7, 7],
    fills: ['rgba(0, 0, 0, 0)'],
    shown: true,
  });
  expect((await spacing('Keyboard shortcuts')).gaps).toEqual([7, 10, 7]);
  // The plus key keeps its name, and a sequence shows its keys without claiming a single shortcut.
  const zoom = menu.getByRole('menuitem', { name: 'Zoom in' });
  await expect(zoom).toHaveAttribute('aria-keyshortcuts', 'Control+Plus');
  await expect(zoom.locator('kbd.env-kbd')).toHaveText(['Ctrl', '+']);
  // An arrow shows as its glyph and is announced by its key name.
  const back = menu.getByRole('menuitem', { name: 'Back' });
  await expect(back).toHaveAttribute('aria-keyshortcuts', 'Alt+ArrowLeft');
  await expect(back.locator('kbd.env-kbd')).toHaveText(['Alt', '←']);
  const sequence = menu.getByRole('menuitem', { name: 'Keyboard shortcuts' });
  await expect(sequence).not.toHaveAttribute('aria-keyshortcuts');
  await expect(sequence.locator('kbd.env-kbd')).toHaveText(['Ctrl', 'K', 'Ctrl', 'S']);
  const plusSequence = menu.getByRole('menuitem', { name: 'Zoom sequence' });
  await expect(plusSequence).not.toHaveAttribute('aria-keyshortcuts');
  await expect(plusSequence.locator('kbd.env-kbd')).toHaveText(['Ctrl', 'Shift', '+', 'Ctrl', 'K']);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('Menu supports keyboard navigation, actions and routed destinations', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(adoption);
  const trigger = page.getByRole('button', { name: 'Open account menu' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Account', exact: true });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveCount(2);
  // The header, the account menu pattern's avatar centered above the name, is not an item, and
  // the menu keeps its own name.
  await settled(menu);
  const [avatar, name] = await Promise.all(
    ['account-avatar', 'account-name'].map((id) => menu.getByTestId(id).boundingBox()),
  );
  expect(avatar!.y + avatar!.height).toBeLessThanOrEqual(name!.y);
  expect(Math.abs(avatar!.x + avatar!.width / 2 - (name!.x + name!.width / 2))).toBeLessThan(1);
  // Opening from the keyboard highlights the first item.
  await expect(menu.getByRole('menuitem', { name: 'Account settings' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Sign out' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('menu-action')).toHaveText('Signed out');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  const link = page.getByRole('menuitem', { name: 'Account settings' });
  await expect(link).toHaveAttribute('data-router-link', '');
  await link.click();
  await expect(page.locator('body')).toHaveAttribute('data-navigated-to', '/account');
  // Its onClick runs too, such as to record the choice.
  await expect(page.getByTestId('menu-action')).toHaveText('Followed account settings');
  expect(errors).toEqual([]);
});
