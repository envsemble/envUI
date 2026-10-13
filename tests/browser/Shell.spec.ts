import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const resizableShell = `${fixtureUrl}/?fixture=resizable-shell`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('Resizable AppShell', () => {
  test('the sidebar edge resizes with the pointer and the keyboard and remembers the width', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(resizableShell);
    const sidebar = page.locator('.env-app-sidebar');
    const context = page.locator('.env-app-topbar-context');
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuemin', '192');
    await expect(handle).toHaveAttribute('aria-valuemax', '512');
    const start = Number(await handle.getAttribute('aria-valuenow'));
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(start, 0);

    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 300, { steps: 4 });
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-resizing', '');
    await page.mouse.up();
    await expect(page.locator('.env-app-shell')).not.toHaveAttribute('data-resizing');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 60));
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(start + 60, 0);
    await expect.poll(async () => (await context.boundingBox())!.width).toBeCloseTo(start + 60, 0);
    expect(
      await page.evaluate(() => localStorage.getItem('fixture-resizable-sidebar-chosen-width')),
    ).toBe(String(start + 60));
    await expect(page.getByTestId('width-changes')).toContainText(String(start + 60));

    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 44));
    await page.keyboard.press('Shift+ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 92));
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '512');
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(512, 0);
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '192');

    // Dragging past a bound stops at it.
    await page.keyboard.press('ArrowRight');
    // Keyboard steps ease into place; take the edge position once it settles.
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(208, 0);
    const edge = (await handle.boundingBox())!;
    await page.mouse.move(edge.x + edge.width / 2, edge.y + 200);
    await page.mouse.down();
    await page.mouse.move(edge.x - 200, edge.y + 200, { steps: 4 });
    await page.mouse.up();
    await expect(handle).toHaveAttribute('aria-valuenow', '192');

    await page.keyboard.press('Shift+ArrowRight');
    await page.reload();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute(
      'aria-valuenow',
      '240',
    );
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(240, 0);
    // Measuring the content after a reload never replaces the chosen width.
    await page.reload();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute(
      'aria-valuenow',
      '240',
    );

    // A collapsed sidebar cannot be resized and hides the sidebar content.
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveCount(0);
    await expect(page.getByTestId('sidebar-list')).toBeHidden();
    await page.mouse.move(900, 500);
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(240, 0);
    expect(errors).toEqual([]);
  });

  test('an application shortcut compacts the sidebar even while it holds focus', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(resizableShell);
    const shell = page.locator('.env-app-shell');
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    await page.mouse.move(900, 500);

    // From the resize handle, which a compact sidebar removes.
    await handle.focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await expect(handle).toHaveCount(0);

    // From a navigation item, which keeps focus on its icon.
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).not.toHaveAttribute('data-compact');
    const documents = page.getByRole('button', { name: 'Documents' });
    await documents.focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await expect(documents).toBeFocused();
    // Focus moving within the sidebar afterwards expands it again.
    await page.getByRole('button', { name: 'Search' }).focus();
    await expect(shell).not.toHaveAttribute('data-compact');

    // With the pointer over the sidebar too, until the pointer leaves and comes back.
    await page.keyboard.press('Alt+KeyB');
    const box = (await page.getByRole('button', { name: 'Search' }).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(shell).not.toHaveAttribute('data-compact');
    await page.getByRole('button', { name: 'Documents' }).focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await page.mouse.move(900, 500);
    const compact = (await page.locator('.env-app-sidebar').boundingBox())!;
    await page.mouse.move(compact.x + compact.width / 2, box.y + box.height / 2);
    await expect(shell).not.toHaveAttribute('data-compact');
    expect(errors).toEqual([]);
  });

  test('sidebar content fills the height below the navigation and scrolls on its own', async ({
    page,
  }) => {
    await page.goto(resizableShell);
    const list = page.getByTestId('sidebar-list');
    const navigation = page.getByRole('navigation', { name: 'Resizable navigation' });
    const viewport = page.viewportSize()!;
    const listBox = (await list.boundingBox())!;
    const navigationBox = (await navigation.boundingBox())!;
    expect(listBox.y).toBeCloseTo(navigationBox.y + navigationBox.height, 0);
    expect(listBox.y + listBox.height).toBeCloseTo(viewport.height, 0);
    const navigationHeight = navigationBox.height;

    await list.hover();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect((await navigation.boundingBox())!.height).toBeCloseTo(navigationHeight, 0);
  });

  test('page content can stick below the topbar while the document scrolls', async ({ page }) => {
    await page.goto(resizableShell);
    const header = page.getByTestId('sticky-header');
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect((await header.boundingBox())!.y).toBeCloseTo(topbar.height, 0);
  });
});

const fullShell = `${fixtureUrl}/?fixture=full-shell`;

/** Computed app-region of an element, or null where the engine has no app regions. */
function appRegion(locator: Locator) {
  return locator.evaluate((element) => {
    if (!CSS.supports('app-region', 'drag') && !CSS.supports('-webkit-app-region', 'drag'))
      return null;
    const style = getComputedStyle(element);
    return style.getPropertyValue('app-region') || style.getPropertyValue('-webkit-app-region');
  });
}

/** The declared value of a property in the rule for a selector, searched through every sheet. */
function declaredValue(page: Page, selector: string, property: string) {
  return page.evaluate(
    ({ selector, property }) => {
      const find = (rules: CSSRuleList): string | undefined => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && rule.selectorText === selector)
            return rule.style.getPropertyValue(property);
          const nested =
            rule instanceof CSSImportRule
              ? rule.styleSheet?.cssRules
              : 'cssRules' in rule
                ? (rule as CSSGroupingRule).cssRules
                : undefined;
          const value = nested && find(nested);
          if (value) return value;
        }
        return undefined;
      };
      for (const sheet of Array.from(document.styleSheets)) {
        const value = find(sheet.cssRules);
        if (value) return value;
      }
      return undefined;
    },
    { selector, property },
  );
}

test.describe('Full-width topbar', () => {
  test('one row across the window: the toggle, the context at its natural width, the title and the actions', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(`${fullShell}&titleBar=off`);
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-topbar', 'full');
    await expect(shell).not.toHaveAttribute('data-title-bar');
    const topbar = page.locator('.env-app-topbar');
    const context = page.locator('.env-app-context');
    const viewport = page.viewportSize()!;
    const box = async (locator: Locator) => (await locator.boundingBox())!;
    const toggle = await box(page.getByRole('button', { name: 'Collapse sidebar' }));
    const contextBox = await box(context);
    const menubar = await box(page.getByRole('menubar', { name: 'Application menu' }));
    const picker = await box(page.getByTestId('context-picker'));
    const title = await box(page.locator('.env-app-title'));
    const actions = await box(page.locator('.env-app-actions'));
    const sidebar = await box(page.locator('.env-app-sidebar'));
    // The context follows the toggle at its natural width, wider than the sidebar below it.
    expect(contextBox.x).toBeCloseTo(toggle.x + toggle.width + 12, 0);
    expect(contextBox.width).toBeCloseTo(menubar.width + 8 + picker.width, 0);
    expect(contextBox.width).toBeGreaterThan(sidebar.width);
    // The sidebar fits the navigation, not the context: 12 rem here.
    expect(sidebar.width).toBeCloseTo(192, 0);
    // The title follows the context and the actions end the row; no divider splits it.
    expect(title.x).toBeGreaterThan(contextBox.x + contextBox.width);
    expect(actions.x + actions.width).toBeCloseTo(viewport.width - 16, 0);
    expect(
      await page
        .locator('.env-app-topbar-context')
        .evaluate((element) => getComputedStyle(element).borderInlineEndWidth),
    ).toBe('0px');
    // The topbar does not follow the sidebar: collapsing it moves nothing and keeps the context.
    expect(await topbar.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
      '0s',
    );
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(shell).toHaveAttribute('data-compact', '');
    expect((await box(context)).x).toBe(contextBox.x);
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await expect(context).toBeVisible();
    await expect
      .poll(async () => (await box(page.locator('.env-app-sidebar'))).width)
      .toBeLessThan(80);
    expect((await box(context)).x).toBe(contextBox.x);
    expect(errors).toEqual([]);
  });

  test('a narrow window still opens the sidebar over the content', async ({ page }) => {
    await page.setViewportSize({ width: 560, height: 800 });
    await page.goto(fullShell);
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-narrow', '');
    await expect(page.locator('.env-app-title')).toBeHidden();
    await expect(page.locator('.env-app-sidebar')).toBeHidden();
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(shell).toHaveAttribute('data-narrow-open', '');
    const navigation = page.getByRole('navigation', { name: 'Notes navigation' });
    await expect(navigation).toBeVisible();
    // The overlay starts below the title bar.
    expect((await page.locator('.env-app-sidebar').boundingBox())!.y).toBe(40);
    await page.keyboard.press('Escape');
    await expect(shell).not.toHaveAttribute('data-narrow-open');
  });
});

test.describe('Title bar', () => {
  test('the shell topbar is the window title bar: its height, compact controls and drag regions', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(fullShell);
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-title-bar', '');
    const topbar = page.locator('.env-app-topbar');
    expect((await topbar.boundingBox())!.height).toBe(40);
    // --topbar-height follows the title bar, so the sidebar, the content and sticky content line up.
    const offsets = await page.evaluate(() => {
      const content = document.querySelector('.env-app-content')!;
      return {
        content: getComputedStyle(content).paddingTop,
        sidebar: document.querySelector('.env-app-sidebar')!.getBoundingClientRect().top,
      };
    });
    expect(offsets.content).toBe('40px');
    expect(offsets.sidebar).toBe(40);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect((await page.getByTestId('sticky-header').boundingBox())!.y).toBeCloseTo(40, 0);
    await page.evaluate(() => window.scrollTo(0, 0));

    // Controls take the compact height; the toggle shrinks to match.
    for (const control of [
      page.getByTestId('action'),
      page.getByTestId('context-picker'),
      page.getByRole('menuitem', { name: 'File', exact: true }),
    ])
      expect((await control.boundingBox())!.height).toBeCloseTo(32, 0);
    const toggle = page.getByRole('button', { name: 'Collapse sidebar' });
    const toggleBox = (await toggle.boundingBox())!;
    expect([toggleBox.width, toggleBox.height]).toEqual([32, 32]);
    // Collapsed, the toggle keeps the center line of the navigation icons.
    await toggle.click();
    await page.mouse.move(800, 500);
    await expect(shell).toHaveAttribute('data-compact', '');
    const icon = (await page
      .getByRole('navigation', { name: 'Notes navigation' })
      .locator('.env-symbol')
      .first()
      .boundingBox())!;
    expect(icon.x + icon.width / 2).toBeCloseTo(toggleBox.x + toggleBox.width / 2, 0);

    // The bar selects no text; empty space drags the window and controls stay clickable, in the
    // engines that have app regions.
    expect(
      await topbar.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.userSelect || style.getPropertyValue('-webkit-user-select');
      }),
    ).toBe('none');
    const region = await appRegion(topbar);
    if (region !== null) {
      expect(region).toBe('drag');
      for (const control of [
        page.getByTestId('action'),
        page.getByTestId('context-picker'),
        page.getByRole('menubar', { name: 'Application menu' }),
        page.getByRole('menuitem', { name: 'File', exact: true }),
        page.getByRole('button', { name: 'Expand sidebar' }),
      ])
        expect(await appRegion(control)).toBe('no-drag');
    }
    expect(errors).toEqual([]);
  });

  test('TitleBar alone matches the shell title bar and leaves room for the window controls', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(`${fixtureUrl}/?fixture=title-bar`);
    const bar = page.getByTestId('title-bar');
    const box = (await bar.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, viewport.width, 40]);
    // A normal block: the application decides whether it sticks or stays fixed.
    expect(await bar.evaluate((element) => getComputedStyle(element).position)).toBe('static');
    const mark = (await page.getByTestId('title-bar-mark').boundingBox())!;
    const settings = (await page.getByRole('button', { name: 'Settings' }).boundingBox())!;
    const title = (await page.getByTestId('title-bar-title').boundingBox())!;
    expect(mark.x).toBeCloseTo(12, 0);
    expect(settings.x + settings.width).toBeCloseTo(viewport.width - 12, 0);
    expect(title.x + title.width / 2).toBeCloseTo(viewport.width / 2, 0);
    for (const control of [
      page.getByRole('button', { name: 'Share' }),
      page.getByRole('button', { name: 'Settings' }),
      page.getByRole('menuitem', { name: 'File', exact: true }),
    ])
      expect((await control.boundingBox())!.height).toBeCloseTo(32, 0);
    const region = await appRegion(bar);
    if (region !== null) {
      expect(region).toBe('drag');
      expect(await appRegion(page.getByRole('button', { name: 'Share' }))).toBe('no-drag');
      expect(await appRegion(page.getByRole('menuitem', { name: 'File', exact: true }))).toBe(
        'no-drag',
      );
    }
    // The height and the space beside the window controls come from the title bar area
    // environment variables, with fallbacks for an ordinary browser window.
    expect(await declaredValue(page, '.env-title-bar', 'block-size')).toContain(
      'env(titlebar-area-height',
    );
    expect(await declaredValue(page, '.env-title-bar', 'padding-left')).toContain(
      'env(titlebar-area-x',
    );
    expect(await declaredValue(page, '.env-title-bar', 'padding-right')).toContain(
      'env(titlebar-area-width',
    );
    // The menubar inside opens its menus as anywhere else.
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    await expect(page.getByRole('menu', { name: 'File' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('AppShellSkeleton mirrors the full title bar frame', async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=full-shell-skeleton`);
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-topbar', 'full');
    await expect(shell).toHaveAttribute('data-title-bar', '');
    expect((await page.locator('.env-app-topbar').boundingBox())!.height).toBe(40);
    expect(
      await page
        .locator('.env-app-content')
        .evaluate((element) => getComputedStyle(element).paddingTop),
    ).toBe('40px');
  });
});
