import { test, expect, type Locator, type Page } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

const resizableShell = `${fixtureUrl}/?fixture=resizable-shell`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

type Box = { x: number; y: number; width: number; height: number };

/** Reads the boxes of the elements in one frame once the fonts have loaded, so neither a font swap
 * nor another layout change falls between the readings. */
async function measure<K extends string>(page: Page, selectors: Record<K, string>) {
  const boxes = await page.evaluate(async (entries) => {
    await document.fonts.ready;
    return Object.fromEntries(
      entries.map(([name, selector]) => {
        const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect();
        return [name, { x, y, width, height }];
      }),
    );
  }, Object.entries<string>(selectors));
  return boxes as Record<K, Box>;
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
    // Content sticks at --env-app-sticky-top, the topbar height while the document scrolls.
    const offsets = await page.locator('.env-app-shell').evaluate((shell) => {
      const style = getComputedStyle(shell);
      return [
        style.getPropertyValue('--env-app-sticky-top'),
        style.getPropertyValue('--env-topbar-height'),
      ];
    });
    expect(offsets[0]!.trim()).toBe(offsets[1]!.trim());
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect((await header.boundingBox())!.y).toBeCloseTo(topbar.height, 0);
    // The document is the element that scrolls the page content.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Restore scroll position' }).click();
    await expect(page.getByTestId('scroll-element')).toHaveText('html');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
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

const scrollKeys = `${fixtureUrl}/?fixture=scroll-keys`;

/** The scroll position of an element once it has stayed still for a quarter of a second. */
function settledTop(scroller: Locator) {
  return scroller.evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        let last = element.scrollTop;
        let stillFrames = 0;
        const check = () => {
          stillFrames = element.scrollTop === last ? stillFrames + 1 : 0;
          last = element.scrollTop;
          if (stillFrames >= 15) resolve(last);
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }),
  );
}

/** Holds a key: its first press and then repeats, as a held key sends them. */
async function hold(page: Page, key: string, repeats: number) {
  await page.keyboard.down(key);
  for (let repeat = 0; repeat < repeats; repeat++) {
    await page.waitForTimeout(30);
    await page.keyboard.down(key);
  }
  await page.keyboard.up(key);
}

/** Presses a key several times, faster than a smooth scroll settles. */
async function pressQuickly(page: Page, key: string, times: number) {
  for (let press = 0; press < times; press++) {
    if (press) await page.waitForTimeout(100);
    await page.keyboard.press(key);
  }
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
    const {
      toggle,
      context: contextBox,
      menubar,
      picker,
      title,
      actions,
      sidebar,
    } = await measure(page, {
      toggle: '.env-app-sidebar-toggle',
      context: '.env-app-context',
      menubar: '[role="menubar"][aria-label="Application menu"]',
      picker: '[data-testid="context-picker"]',
      title: '.env-app-title',
      actions: '.env-app-actions',
      sidebar: '.env-app-sidebar',
    });
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

test('a narrow window opens the sidebar as a drawer with room for its content', async ({
  page,
}) => {
  for (const [width, expected] of [
    [390, 320],
    [320, 272],
  ] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(resizableShell);
    const shell = page.locator('.env-app-shell');
    await expect(shell).toHaveAttribute('data-narrow', '');
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(shell).toHaveAttribute('data-narrow-open', '');
    const sidebar = page.locator('.env-app-sidebar');
    await expect(page.getByTestId('sidebar-list')).toBeVisible();
    // 20 rem, or the window less 3 rem, so some of the page stays in view beside it.
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(expected, 0);
    const list = (await page.getByTestId('sidebar-list').boundingBox())!;
    expect(list.width).toBeGreaterThan(expected - 40);
    await page.keyboard.press('Escape');
    await expect(shell).not.toHaveAttribute('data-narrow-open');
  }
});

test("a narrow window gives the full topbar's context the room it needs", async ({ page }) => {
  // About half of a 1280 px screen.
  await page.setViewportSize({ width: 640, height: 800 });
  await page.goto(fullShell);
  await expect(page.locator('.env-app-shell')).toHaveAttribute('data-narrow', '');
  const { context, menubar, picker, actions } = await measure(page, {
    context: '.env-app-context',
    menubar: '[role="menubar"][aria-label="Application menu"]',
    picker: '[data-testid="context-picker"]',
    actions: '.env-app-actions',
  });
  // The menubar and the picker keep their natural width side by side, beyond the 16 rem a split
  // topbar allows above a narrow sidebar.
  expect(context.width).toBeGreaterThan(256);
  expect(context.width).toBeCloseTo(menubar.width + 8 + picker.width, 0);
  // The actions stay at the end of the row, inside the window.
  expect(actions.x).toBeGreaterThan(context.x + context.width);
  expect(actions.x + actions.width).toBeCloseTo(640 - 12, 0);
});

test('getScrollElement serves page content from its first layout effects', async ({ page }) => {
  // While the document scrolls, the first call already returns it.
  await page.goto(resizableShell);
  await expect(page.getByTestId('mount-scroll-element')).toHaveText(/^html( html)*$/);
  // In a title-bar shell the function changes once the content area is attached, so a layout
  // effect that depends on it runs again and gets the content area.
  await page.goto(fullShell);
  await expect(page.getByTestId('mount-scroll-element')).toHaveText(/(^| )main$/);
  // In a shell rendered into the document of a frame, the function changes once the shell is
  // attached, so the layout effect runs again and gets the frame's scrolling element.
  await page.goto(`${fixtureUrl}/?fixture=framed-shell`);
  const frame = page.frameLocator('iframe[title="Framed shell"]');
  await expect(frame.getByTestId('framed-mount-scroll-element')).toHaveText(/(^| )frame$/);
});

test('a copy of getScrollElement kept from the first render returns the current element', async ({
  page,
}) => {
  for (const [url, element] of [
    [resizableShell, 'html'],
    [fullShell, 'main'],
  ] as const) {
    await page.goto(url);
    await page.getByRole('button', { name: 'Read the first scroll element' }).click();
    await expect(page.getByTestId('first-scroll-element')).toHaveText(element);
  }
  // A shell rendered into the document of a frame returns that document's scrolling element.
  await page.goto(`${fixtureUrl}/?fixture=framed-shell`);
  const frame = page.frameLocator('iframe[title="Framed shell"]');
  await frame.getByRole('button', { name: 'Read the scroll element' }).click();
  await expect(frame.getByTestId('framed-scroll-element')).toHaveText('frame');
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
    // --env-topbar-height follows the title bar, so the sidebar and the content area line up below it.
    const offsets = await page.evaluate(() => ({
      content: document.querySelector('.env-app-content')!.getBoundingClientRect().top,
      sidebar: document.querySelector('.env-app-sidebar')!.getBoundingClientRect().top,
    }));
    expect(offsets).toEqual({ content: 40, sidebar: 40 });

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
      .locator('.env-icon')
      .first()
      .boundingBox())!;
    expect(icon.x + icon.width / 2).toBeCloseTo(toggleBox.x + toggleBox.width / 2, 0);
    // Hovering the collapsed sidebar still expands it over the content.
    await page.getByRole('navigation', { name: 'Notes navigation' }).hover();
    await expect(shell).toHaveAttribute('data-expanded-overlay', '');
    await page.mouse.move(800, 500);
    await expect(shell).not.toHaveAttribute('data-expanded-overlay');
    // Expanded again, the sidebar resizes and the content area follows its edge.
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await page.mouse.move(800, 500);
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    const start = Number(await handle.getAttribute('aria-valuenow'));
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 16));
    await expect
      .poll(() =>
        page
          .locator('.env-app-content')
          .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingInlineStart)),
      )
      .toBeCloseTo(start + 16, 0);

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
        page.getByRole('button', { name: 'Collapse sidebar' }),
      ])
        expect(await appRegion(control)).toBe('no-drag');
    }
    expect(errors).toEqual([]);
  });

  test('a title-bar shell scrolls its content area below the title bar instead of the document', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(fullShell);
    const content = page.locator('.env-app-content');
    const viewport = page.viewportSize()!;
    const geometry = await content.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const root = document.scrollingElement!;
      return {
        top: box.top,
        bottom: box.bottom,
        overflowY: style.overflowY,
        gutter: style.getPropertyValue('scrollbar-gutter'),
        documentOverflow: root.scrollHeight - root.clientHeight,
        overflows: element.scrollHeight > element.clientHeight,
        stickyTop: style.getPropertyValue('--env-app-sticky-top').trim(),
        gutterSupported: CSS.supports('scrollbar-gutter', 'stable'),
      };
    });
    // The content area runs from the title bar to the bottom of the window and scrolls; the
    // document does not, so no scrollbar reaches under the window controls.
    expect([geometry.top, geometry.bottom]).toEqual([40, viewport.height]);
    expect(geometry.overflowY).toBe('auto');
    expect(geometry.overflows).toBe(true);
    expect(geometry.documentOverflow).toBeLessThanOrEqual(0);
    expect(geometry.stickyTop).toBe('0px');
    if (geometry.gutterSupported) expect(geometry.gutter).toBe('stable');
    await page.mouse.move(800, 500);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // Sticky content sticks to the top of the content area, just below the title bar.
    expect((await page.getByTestId('sticky-header').boundingBox())!.y).toBeCloseTo(40, 0);

    // getScrollElement is the content area, for restoring scroll positions.
    await content.evaluate((element) => element.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Restore scroll position' }).click();
    await expect(page.getByTestId('scroll-element')).toHaveText('main');
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(300);

    // The layout keeps its width when the content stops overflowing.
    if (geometry.gutterSupported) {
      const width = await content.evaluate((element) => element.clientWidth);
      await page.getByRole('button', { name: 'Shorten page' }).click();
      await expect
        .poll(() => content.evaluate((element) => element.scrollHeight <= element.clientHeight))
        .toBe(true);
      expect(await content.evaluate((element) => element.clientWidth)).toBe(width);
    }

    // A fixed view inside the content still covers the whole window, title bar included.
    await page.getByRole('button', { name: 'Show full view' }).click();
    const view = (await page.getByTestId('full-view').boundingBox())!;
    expect([view.x, view.y, view.width, view.height]).toEqual([
      0,
      0,
      viewport.width,
      viewport.height,
    ]);
    await page.getByRole('button', { name: 'Close full view' }).click();
    await expect(page.getByTestId('full-view')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('the keyboard scrolls the content area of a title-bar shell as it would the document', async ({
    page,
  }) => {
    // Without motion the scroll positions are exact.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fullShell);
    const content = page.locator('.env-app-content');
    const metrics = () =>
      content.evaluate((element) => ({
        top: element.scrollTop,
        end: element.scrollHeight - element.clientHeight,
        page: element.clientHeight * 0.875,
      }));
    const { page: step, end } = await metrics();
    const expectTop = (top: number) =>
      expect.poll(async () => Math.abs((await metrics()).top - top)).toBeLessThanOrEqual(1.5);

    // A fresh window: focus is on the document.
    await page.keyboard.press('PageDown');
    await expectTop(step);
    await page.keyboard.press('ArrowDown');
    await expectTop(step + 40);
    await page.keyboard.press('ArrowUp');
    await expectTop(step);
    await page.keyboard.press('Space');
    await expectTop(2 * step);
    await page.keyboard.press('Shift+Space');
    await expectTop(step);
    await page.keyboard.press('End');
    await expectTop(end);
    await page.keyboard.press('Home');
    await expectTop(0);

    // After choosing a destination in the sidebar: the page keys scroll, while Space activates
    // the focused item.
    const searchItem = page
      .getByRole('navigation', { name: 'Notes navigation' })
      .getByRole('button', { name: 'Search' });
    await searchItem.focus();
    await page.keyboard.press('PageDown');
    await expectTop(step);
    await page.keyboard.press('Home');
    await expectTop(0);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    expect((await metrics()).top).toBe(0);

    // Widgets that use the keys keep them, such as a menubar trigger.
    await page.getByRole('menuitem', { name: 'File', exact: true }).focus();
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(200);
    expect((await metrics()).top).toBe(0);

    // A list that scrolls itself takes the keys.
    const list = page.getByTestId('sidebar-list');
    await list.focus();
    await page.keyboard.press('PageDown');
    await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect((await metrics()).top).toBe(0);

    // Keys that the page handles stay its own, such as a shortcut added to the document after the
    // shell mounted.
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      document.addEventListener('keydown', (event) => {
        if (event.key === 'End') event.preventDefault();
      });
    });
    await page.keyboard.press('End');
    await page.waitForTimeout(200);
    expect((await metrics()).top).toBe(0);
    await page.keyboard.press('PageDown');
    await expectTop(step);
  });

  test('quick presses and held keys scroll as far as the browser scrolls', async ({ page }) => {
    // With motion allowed the keys scroll smoothly, and many hold-and-settle steps take a while.
    test.slow();
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-content');
    const sequences = {
      page: () => page.keyboard.press('PageDown'),
      quickPages: () => pressQuickly(page, 'PageDown', 3),
      heldPage: () => hold(page, 'PageDown', 6),
      line: () => page.keyboard.press('ArrowDown'),
      heldLine: () => hold(page, 'ArrowDown', 15),
      quickSpaces: () => pressQuickly(page, 'Space', 2),
    };
    type Distances = Record<keyof typeof sequences, number>;
    async function distances(focus: () => Promise<unknown>) {
      const result: Partial<Distances> = {};
      for (const [name, run] of Object.entries(sequences)) {
        await content.evaluate((element) => element.scrollTo({ top: 0, behavior: 'instant' }));
        await settledTop(content);
        await focus();
        await run();
        result[name as keyof Distances] = await settledTop(content);
      }
      return result as Distances;
    }
    // With focus in the content area the browser scrolls it; from the document the shell does.
    const native = await distances(() => page.getByTestId('page-start').focus());
    const emulated = await distances(() =>
      page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur()),
    );
    // Engines step by different amounts, so a single press only comes close to the browser's own.
    for (const name of ['page', 'line'] as const)
      expect(Math.abs(emulated[name] - native[name])).toBeLessThanOrEqual(native[name] / 3);
    // Counted in single presses, quick presses add up and held keys repeat as in the browser.
    for (const [name, unit] of [
      ['quickPages', 'page'],
      ['heldPage', 'page'],
      ['heldLine', 'line'],
      ['quickSpaces', 'page'],
    ] as const)
      expect(emulated[name] / emulated[unit]).toBeCloseTo(native[name] / native[unit], 0);
  });

  test('the browser keeps the keys in the content area and in what the pointer last pressed', async ({
    page,
  }) => {
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-content');
    const notes = page.getByTestId('sidebar-notes');
    const top = (scroller: Locator) => scroller.evaluate((element) => element.scrollTop);
    // A window listener added once the shell is ready hears whether the shell took a key.
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-ready', '');
    await page.evaluate(() =>
      window.addEventListener('keydown', (event) => {
        document.body.dataset.taken = String(event.defaultPrevented);
      }),
    );
    const taken = () => page.evaluate(() => document.body.dataset.taken);

    // A click in the page focuses the content area, which the browser then scrolls.
    await page.getByText('Paragraph 2', { exact: true }).click();
    await expect(content).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('false');
    await expect.poll(() => top(content)).toBeGreaterThan(0);
    await page.keyboard.press('Space');
    expect(await taken()).toBe('false');
    const scrolled = await settledTop(content);

    // With focus on the document, the browser scrolls the list that the pointer last pressed.
    await notes.getByText('Note 3', { exact: true }).click();
    await expect(page.locator('body')).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('false');
    await expect.poll(() => top(notes)).toBeGreaterThan(0);
    expect(await settledTop(content)).toBe(scrolled);

    // After a press on the title, which does not scroll, the shell scrolls the content area.
    await page.locator('.env-app-title').click();
    await expect(page.locator('body')).toBeFocused();
    await page.keyboard.press('PageDown');
    expect(await taken()).toBe('true');
    await expect.poll(() => top(content)).toBeGreaterThan(scrolled);
  });

  test('Space scrolls from a link, and a field in a web component keeps its keys', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-content');
    const step = await content.evaluate((element) => element.clientHeight * 0.875);
    const expectTop = (expected: number) =>
      expect
        .poll(async () => Math.abs((await settledTop(content)) - expected))
        .toBeLessThanOrEqual(1.5);
    // Links follow Enter only, so Space scrolls from them as it would the document.
    await page.getByRole('link', { name: 'Settings' }).focus();
    await page.keyboard.press('Space');
    await expectTop(step);
    // A field in a shadow root keeps Space and the page keys.
    const field = page.getByRole('textbox', { name: 'Quick note' });
    await field.focus();
    await page.keyboard.type('a b');
    await page.keyboard.press('PageDown');
    await expect(field).toHaveValue('a b');
    await expectTop(step);
  });

  test('a field in a closed shadow root and media controls keep their keys', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-content');
    // A window listener added once the shell is ready hears whether the shell took a key.
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-ready', '');
    await page.evaluate(() =>
      window.addEventListener('keydown', (event) => {
        document.body.dataset.taken = String(event.defaultPrevented);
      }),
    );
    const taken = () => page.evaluate(() => document.body.dataset.taken);
    // The path of a key typed in a closed shadow root ends at its host, so the shell cannot tell a
    // field from a button there and leaves Space and Home to it.
    const closedField = page.locator('fixture-closed-field');
    await closedField.focus();
    await page.keyboard.type('a b');
    expect(await taken()).toBe('false');
    await page.keyboard.press('Home');
    expect(await taken()).toBe('false');
    await page.keyboard.type('x');
    expect(
      await closedField.evaluate((element) => (element as HTMLElement & { value: string }).value),
    ).toBe('xa b');
    // So does an ordinary element with a closed shadow root, which cannot take focus itself.
    const plainField = page.getByTestId('plain-closed-field');
    await plainField.focus();
    await page.keyboard.type('c');
    await page.keyboard.press('Space');
    expect(await taken()).toBe('false');
    await page.keyboard.type('d');
    expect(
      await plainField.evaluate((element) => (element as HTMLElement & { value: string }).value),
    ).toBe('c d');
    // Media controls use the keys too.
    await page.getByLabel('Recording').focus();
    for (const key of ['Space', 'Home', 'ArrowDown']) {
      await page.keyboard.press(key);
      expect(await taken()).toBe('false');
    }
    expect(await settledTop(content)).toBe(0);
  });

  test('a scroll area that takes focus without a tabindex passes its keys on at its end', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-content');
    const notes = page.getByTestId('sidebar-notes');
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-ready', '');
    // Chromium and Firefox let a scroll area take focus without a tabindex; WebKit does not.
    const focused = await notes.evaluate((element) => {
      (element as HTMLElement).focus();
      return element.ownerDocument.activeElement === element;
    });
    test.skip(!focused, 'This engine does not focus a scroll area without a tabindex.');
    // The list scrolls itself to its end; from there, the content area scrolls, as a page would.
    await page.keyboard.press('End');
    await expect
      .poll(() =>
        notes.evaluate(
          (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
        ),
      )
      .toBeLessThanOrEqual(1);
    expect(await settledTop(content)).toBe(0);
    await page.keyboard.press('PageDown');
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test('WindowFrame fills the window and scrolls its content below the title bar', async ({
    page,
  }) => {
    // With motion allowed, the keyboard scrolls smoothly.
    await page.goto(`${fixtureUrl}/?fixture=title-bar`);
    const content = page.getByTestId('window-frame').locator('.env-window-frame-content');
    const viewport = page.viewportSize()!;
    const geometry = await content.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const root = document.scrollingElement!;
      return {
        top: box.top,
        bottom: box.bottom,
        overflowY: style.overflowY,
        gutter: style.getPropertyValue('scrollbar-gutter'),
        gutterSupported: CSS.supports('scrollbar-gutter', 'stable'),
        documentOverflow: root.scrollHeight - root.clientHeight,
        overflows: element.scrollHeight > element.clientHeight,
      };
    });
    // The content runs from the title bar to the bottom of the window and scrolls; the document
    // does not, so no scrollbar reaches under the window controls.
    expect([geometry.top, geometry.bottom]).toEqual([40, viewport.height]);
    expect(geometry.overflowY).toBe('auto');
    expect(geometry.overflows).toBe(true);
    expect(geometry.documentOverflow).toBeLessThanOrEqual(0);
    if (geometry.gutterSupported) expect(geometry.gutter).toBe('stable');
    // The keyboard scrolls it from a fresh window.
    await page.keyboard.press('PageDown');
    await expect
      .poll(() => content.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(viewport.height / 2);
    await page.keyboard.press('Home');
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(0);
    // scrollRef is the scrolling element, for restoring scroll positions.
    await page.getByRole('button', { name: 'Restore start page scroll' }).click();
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(200);
  });

  test('a page whose document scrolls keeps its keys while it shows a title-bar frame', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${catalogueUrl}/#/components/app-shell/overview`);
    await expect(page.locator('.env-app-shell[data-title-bar]')).toBeVisible();
    await page.keyboard.press('PageDown');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    for (const scroller of await page
      .locator('.env-window-frame-content, .env-app-shell[data-title-bar] .env-app-content')
      .all())
      expect(await scroller.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test('a title bar keeps at least --env-title-bar-height, which an application can set', async ({
    page,
  }) => {
    await page.goto(fullShell);
    // The window reports a smaller height once the page is zoomed in; the bar keeps its least height.
    // Its hairline runs below the title bar area, under the window controls too.
    // Compared without white space, which a declaration that wraps over lines keeps.
    const compact = (value: string | undefined) => value?.replace(/\s+/g, '');
    expect(compact(await declaredValue(page, '.env-title-bar', 'block-size'))).toContain(
      'max(calc(env(titlebar-area-height,0px)+0.0625rem)',
    );
    expect(
      compact(await declaredValue(page, '.env-app-shell[data-title-bar]', '--env-topbar-height')),
    ).toContain('max(calc(env(titlebar-area-height,0px)+0.0625rem)');
    await page
      .locator('.env-app-shell')
      .evaluate((shell: HTMLElement) => shell.style.setProperty('--env-title-bar-height', '48px'));
    expect((await page.locator('.env-app-topbar').boundingBox())!.height).toBe(48);
    expect(
      await page
        .locator('.env-app-content')
        .evaluate((element) => element.getBoundingClientRect().top),
    ).toBe(48);
    await page.goto(`${fixtureUrl}/?fixture=title-bar`);
    await page
      .getByTestId('title-bar')
      .evaluate((bar: HTMLElement) => bar.style.setProperty('--env-title-bar-height', '48px'));
    expect((await page.getByTestId('title-bar').boundingBox())!.height).toBe(48);
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

  test('icon-only text buttons in a title bar take the quiet icon color', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${fixtureUrl}/?fixture=title-bar`);
    const bar = page.getByTestId('title-bar');
    const color = (token: string) =>
      bar.evaluate((element, value) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${value})`;
        element.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, token);
    const back = page.getByRole('button', { name: 'Back' });
    // Like the window controls beside them, not the link blue; they darken while hovered.
    await expect(back).toHaveCSS('color', await color('--env-color-fg-muted'));
    expect(await color('--env-color-fg-muted')).not.toBe(await color('--env-color-fg-link'));
    await back.hover();
    await expect(back).toHaveCSS('color', await color('--env-color-fg-default'));
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
        .evaluate((element) => element.getBoundingClientRect().top),
    ).toBe(40);
  });
});
