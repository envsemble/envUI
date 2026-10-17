import { test, expect, type Locator, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { catalogueUrl, fixtureUrl } from './Servers';

const appShell = `${fixtureUrl}/?fixture=app-shell`;
const fullShell = `${fixtureUrl}/?fixture=full-shell`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('Landmarks and skip links', () => {
  test('the frame is a banner, a named navigation and a main, with skip links first', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(appShell);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('main')).toHaveAttribute('id', 'env-app-shell-main');
    // The skip links are the first tab stops, shown as they take focus.
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    expect((await box(skip)).width).toBeGreaterThan(40);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to Primary' })).toBeFocused();
    // Each moves focus to its region.
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('landmarks={false} renders the parts without landmark roles', async ({ page }) => {
    await page.goto(`${appShell}&landmarks=off`);
    await expect(page.locator('.env-app-shell-main')).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(0);
    for (const part of ['.env-app-shell-header', '.env-app-shell-main', '.env-sidebar'])
      expect(await page.locator(part).evaluate((element) => element.tagName)).toBe('DIV');
    await expect(page.getByRole('navigation')).toHaveCount(0);
  });

  test('a sidebar out of view has no skip link', async ({ page }) => {
    await page.goto(`${appShell}&collapsible=offcanvas`);
    await page.evaluate(() => localStorage.removeItem('fixture-frame'));
    const navigation = page.getByRole('navigation', { name: 'Primary' });
    await navigation.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(page.locator('.env-sidebar')).toHaveAttribute('inert', '');
    await expect(
      page.getByRole('link', { name: 'Skip to Primary', includeHidden: true }),
    ).toHaveCount(0);
    // Focus that the hidden sidebar held goes to a trigger outside it.
    await expect(page.getByTestId('header-trigger')).toBeFocused();
    await page.getByTestId('header-trigger').click();
    await expect(page.locator('.env-sidebar')).not.toHaveAttribute('inert');
  });
});

test.describe('Collapsing and persistence', () => {
  test('the trigger collapses the sidebar to a rail, which remembers it and peeks on hover', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    // Without motion, boxes are final as soon as the state changes.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(appShell);
    await page.evaluate(() => localStorage.removeItem('fixture-frame'));
    await page.reload();
    const sidebar = page.locator('.env-sidebar');
    const navigation = page.getByRole('navigation', { name: 'Primary' });
    const products = navigation.getByRole('link', { name: 'Products' });
    await expect(products).toHaveText('Products');
    const main = await box(page.locator('.env-app-shell-main'));
    await navigation.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(sidebar).toHaveAttribute('data-rail', '');
    expect(await page.evaluate(() => localStorage.getItem('fixture-frame'))).toBe(
      '{"start":{"open":false}}',
    );
    await expect(page.getByTestId('open-changes')).toHaveText('start closed trigger');
    // The pointer stays over the trigger, so the rail doesn't open again at once.
    await expect(products).toHaveText('');
    await expect.poll(async () => (await box(sidebar)).width).toBeLessThan(80);
    // The same node, now icon-only, keeps its place in the tab order.
    await expect(products).toHaveAttribute('data-icon-only', '');
    // Main moved to the rail's edge.
    expect((await box(page.locator('.env-app-shell-main'))).x).toBeLessThan(main.x);

    // Resting on the rail opens it over the content; Main stays put.
    await page.mouse.move(700, 500);
    const railMain = await box(page.locator('.env-app-shell-main'));
    await products.hover();
    await expect(sidebar).toHaveAttribute('data-peek', '');
    await expect(products).toHaveText('Products');
    expect((await box(page.locator('.env-app-shell-main'))).x).toBe(railMain.x);
    await expect(navigation.getByRole('button', { name: 'Keep sidebar open' })).toBeVisible();
    await page.mouse.move(700, 500);
    await expect(sidebar).not.toHaveAttribute('data-peek');

    // The preference survives a reload.
    await page.reload();
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await navigation.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    expect(errors).toEqual([]);
  });

  test('a cookie keeps the state for the server, and the client reads it before its first paint', async ({
    page,
  }) => {
    await page.goto(`${appShell}&persist=cookie`);
    const sidebar = page.locator('.env-sidebar');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Collapse sidebar' })
      .click();
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    const cookie = (await page.context().cookies()).find((each) => each.name === 'fixture-frame');
    expect(decodeURIComponent(cookie!.value)).toBe('start.open=0');
    expect(cookie!.sameSite).toBe('Lax');
    // Read synchronously as the frame mounts: the first committed markup is already collapsed.
    await page.addInitScript(() => {
      new MutationObserver((records, observer) => {
        const sidebar = document.querySelector('.env-sidebar');
        if (!sidebar) return;
        document.documentElement.dataset.firstState = sidebar.getAttribute('data-state') ?? '';
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-first-state', 'collapsed');
  });

  test('a shortcut toggles the sidebar, but not while typing', async ({ page }) => {
    await page.goto(`${appShell}&shortcut=mod%2Bb`);
    await page.evaluate(() => localStorage.removeItem('fixture-frame'));
    await page.reload();
    const sidebar = page.locator('.env-sidebar');
    const trigger = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: 'Collapse sidebar' });
    await expect(trigger).toHaveAttribute('aria-keyshortcuts', /^(Control|Meta)\+B$/);
    await page.getByRole('button', { name: 'Page action' }).focus();
    await page.keyboard.press('ControlOrMeta+b');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(page.getByTestId('open-changes')).toHaveText('start closed shortcut');
    await page.keyboard.press('ControlOrMeta+b');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });
});

test.describe('Frame variables', () => {
  for (const scale of ['comfortable', 'compact'] as const)
    test(`getStickyTop equals the header's bottom edge, in the ${scale} scale and with a 20 px root font`, async ({
      page,
    }) => {
      await page.goto(
        scale === 'compact' ? `${appShell}&span=full&scale=compact` : `${appShell}&span=full`,
      );
      const read = async () => {
        await page.getByRole('button', { name: 'Read the sticky top' }).click();
        return Number(await page.getByTestId('sticky-top').textContent());
      };
      const header = page.getByRole('banner');
      expect(await read()).toBeCloseTo((await box(header)).height, 1);
      // Sticky content sits flush under the header while the document scrolls.
      await page.evaluate(() => window.scrollTo(0, 800));
      await expect
        .poll(async () => (await box(page.getByTestId('sticky-header'))).y)
        .toBeCloseTo((await box(header)).y + (await box(header)).height, 0);
      // <html> carries the measured header size too, for content portaled out of the frame.
      await expect
        .poll(() =>
          page.evaluate(() =>
            document.documentElement.style.getPropertyValue('--env-frame-header-block-size'),
          ),
        )
        .toBe(`${(await box(header)).height}px`);
      await page.evaluate(() => (document.documentElement.style.fontSize = '20px'));
      await expect.poll(read).toBeCloseTo((await box(header)).height, 1);
    });

  test('where Main scrolls, sticky content sticks at its top', async ({ page }) => {
    await page.goto(`${appShell}&scroll=main`);
    await page.getByRole('button', { name: 'Read the sticky top' }).click();
    await expect(page.getByTestId('sticky-top')).toHaveText('0');
    const main = page.locator('.env-app-shell-main');
    await main.evaluate((element) => element.scrollTo(0, 800));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect
      .poll(async () => (await box(page.getByTestId('sticky-header'))).y)
      .toBeCloseTo((await box(main)).y, 0);
  });
});

test.describe('Scroll padding', () => {
  test('focus that scrolls the document lands below the header, not under it', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto(appShell);
    await page.locator('.env-app-shell-main').evaluate((content) => {
      const spacer = () =>
        Object.assign(document.createElement('div'), { style: 'height: 1200px' });
      const before = Object.assign(document.createElement('button'), { textContent: 'Before' });
      const region = Object.assign(document.createElement('div'), { tabIndex: 0 });
      region.setAttribute('data-testid', 'tall-region');
      region.style.height = '620px';
      const action = Object.assign(document.createElement('button'), { textContent: 'Sort' });
      region.append(action);
      content.append(spacer(), before, spacer(), region, spacer());
    });
    const header = await box(page.getByRole('banner'));
    const below = header.y + header.height;
    const region = page.getByTestId('tall-region');
    await page.getByRole('button', { name: 'Before' }).focus();
    await page.keyboard.press('Tab');
    await expect(region).toBeFocused();
    expect((await box(region)).y).toBeGreaterThanOrEqual(below);
    const action = region.getByRole('button', { name: 'Sort' });
    await action.evaluate((element) =>
      window.scrollBy(0, element.getBoundingClientRect().top - 10),
    );
    await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    expect((await box(action)).y).toBeGreaterThanOrEqual(below);
  });

  test('the scroll padding gives way to the application', async ({ page }) => {
    await page.goto(appShell);
    const html = page.locator('html');
    const header = await box(page.getByRole('banner'));
    await expect(html).toHaveCSS('scroll-padding-top', `${header.height + 8}px`);
    expect(
      await html.evaluate((element) =>
        element.style.getPropertyValue('scroll-padding-block-start'),
      ),
    ).toBe('');
    await html.evaluate((element) =>
      element.style.setProperty('scroll-padding-block-start', '123px'),
    );
    await expect(html).toHaveCSS('scroll-padding-top', '123px');
    await html.evaluate((element) => element.style.removeProperty('scroll-padding-block-start'));
    const layered = await page.evaluateHandle(() => {
      const style = document.createElement('style');
      style.textContent = '@layer utilities { html { scroll-padding-top: 6rem; } }';
      document.head.append(style);
      return style;
    });
    await expect(html).toHaveCSS('scroll-padding-top', '96px');
    await layered.evaluate((style) => style.remove());
    // Where Main scrolls, the document needs none.
    await page.goto(fullShell);
    await expect(html).toHaveCSS('scroll-padding-top', 'auto');
  });

  test('several frames keep the padding for the tallest header that shows', async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=two-app-shells`);
    const html = page.locator('html');
    const size = () =>
      html.evaluate((element) => element.style.getPropertyValue('--env-frame-header-block-size'));
    await expect.poll(size).toBe('80px');
    await expect(html).toHaveCSS('scroll-padding-top', '88px');
    await page.getByRole('button', { name: 'Hide the second shell' }).click();
    await expect.poll(size).toBe('52px');
    await page.getByRole('button', { name: 'Show the second shell' }).click();
    await expect.poll(size).toBe('80px');
    await page.getByRole('button', { name: 'Remove the second shell' }).click();
    await expect.poll(size).toBe('52px');
    await page.getByRole('button', { name: 'Hide the first shell' }).click();
    await expect.poll(size).toBe('0px');
    await expect(html).toHaveCSS('scroll-padding-top', '8px');
  });

  test.describe('server-rendered', () => {
    test.use({ javaScriptEnabled: false });

    test('an anchor in the address lands below the header from the first paint', async ({
      page,
    }) => {
      const stylesheet = `/@fs/${resolve('packages/ui/src/styles/index.css').replaceAll('\\', '/')}?direct`;
      await page.route('**/server-rendered-frame.html', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<!doctype html><html lang="en"><head><link rel="stylesheet" href="${stylesheet}"></head><body><div class="env-theme" data-env-theme="light"><div class="env-app-shell" data-scroll="document" data-header-span="main" data-breakpoint="md"><header class="env-app-shell-header">Header</header><main class="env-app-shell-main"><div style="height: 1500px"></div><h2 id="later-section">Later section</h2><div style="height: 1500px"></div></main></div></div></body></html>`,
        }),
      );
      await page.goto(`${fixtureUrl}/server-rendered-frame.html#later-section`);
      const header = await box(page.locator('.env-app-shell-header'));
      expect(header.height).toBeGreaterThan(40);
      await expect
        .poll(async () => (await box(page.locator('#later-section'))).y)
        .toBeGreaterThanOrEqual(header.y + header.height);
    });
  });
});

test('the loading bar runs along the bottom edge of the header, across the frame', async ({
  page,
}) => {
  await page.goto(appShell);
  await page.getByRole('button', { name: 'Toggle page loading' }).click();
  const bar = page.getByRole('progressbar', { name: 'Loading page' });
  await expect(bar).toBeVisible();
  const header = await box(page.getByRole('banner'));
  const frame = await box(page.locator('.env-app-shell'));
  const edge = await box(bar);
  expect(Math.abs(edge.y + edge.height - (header.y + header.height))).toBeLessThanOrEqual(1);
  expect(edge.width).toBeCloseTo(frame.width, 0);
});

test.describe('Header across the window', () => {
  test('the sidebar sits below the header, which holds the trigger in line with the rail', async ({
    page,
  }) => {
    await page.goto(`${appShell}&span=full`);
    await page.evaluate(() => localStorage.removeItem('fixture-frame'));
    await page.reload();
    const header = await box(page.getByRole('banner'));
    const sidebar = page.locator('.env-sidebar');
    expect((await box(sidebar)).y).toBeCloseTo(header.y + header.height, 0);
    const trigger = page.getByTestId('header-trigger');
    await trigger.click();
    await page.mouse.move(700, 500);
    await expect(sidebar).toHaveAttribute('data-rail', '');
    const icon = await box(page.getByRole('link', { name: 'Home' }).locator('.env-icon'));
    const toggle = await box(trigger);
    expect(icon.x + icon.width / 2).toBeCloseTo(toggle.x + toggle.width / 2, 0);
  });
});

test.describe('Below the breakpoint', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the sidebar is a drawer from its trigger, with focus rules for each way it closes', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(appShell);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
    await expect(page.locator('.env-app-shell-header-title')).toBeHidden();
    const trigger = page.getByTestId('header-trigger');
    await expect(trigger).toHaveAccessibleName('Open navigation');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: 'Primary' });
    await expect(drawer).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // It opens from the inline start, with the trigger inside it as its close button.
    expect((await box(drawer)).x).toBe(0);
    await expect(drawer.getByRole('button', { name: 'Close' })).toHaveCount(0);
    await expect(drawer.getByRole('button', { name: 'Collapse sidebar' })).toBeFocused();
    // Escape returns focus to the trigger.
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
    // A navigation closes it and focuses Main.
    await trigger.click();
    await drawer.getByRole('link', { name: 'Products' }).click();
    await expect(drawer).toBeHidden();
    await expect(page).toHaveURL(/#\/products$/);
    await expect(page.getByRole('main')).toBeFocused();
    // Widening the window closes it; the control that had focus takes it in the inline sidebar.
    await trigger.click();
    await drawer.getByRole('link', { name: 'Settings' }).focus();
    await page.setViewportSize({ width: 1200, height: 844 });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Settings' }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('the drawer mirrors in right-to-left text', async ({ page }) => {
    await page.goto(`${appShell}&dir=rtl`);
    await page.getByTestId('header-trigger').click();
    const drawer = page.getByRole('dialog', { name: 'Primary' });
    await expect(drawer).toBeVisible();
    const edge = await box(drawer);
    expect(edge.x + edge.width).toBeCloseTo(390, 0);
  });

  test.describe('under a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true });

    test('the trigger is 44 px', async ({ page }) => {
      await page.goto(appShell);
      const trigger = await box(page.getByTestId('header-trigger'));
      expect([trigger.width, trigger.height]).toEqual([44, 44]);
    });
  });
});

test('right-to-left text puts the start sidebar on the right', async ({ page }) => {
  await page.goto(`${appShell}&dir=rtl`);
  const sidebar = await box(page.locator('.env-sidebar'));
  const viewport = page.viewportSize()!;
  expect(sidebar.x + sidebar.width).toBeCloseTo(viewport.width, 0);
  expect((await box(page.locator('.env-app-shell-main'))).x).toBeLessThan(sidebar.x);
});

test('nothing in the frame animates under a reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(appShell);
  await expect(page.locator('.env-sidebar')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.env-sidebar-panel')).toHaveCSS('transition-duration', /^0s/);
});

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

test('getScrollElement serves page content from its first layout effects', async ({ page }) => {
  // While the document scrolls, the first call already returns it.
  await page.goto(appShell);
  await expect(page.getByTestId('mount-scroll-element')).toHaveText(/^html( html)*$/);
  // Where Main scrolls, the function changes once Main is attached, so a layout
  // effect that depends on it runs again and gets Main.
  await page.goto(fullShell);
  await expect(page.getByTestId('mount-scroll-element')).toHaveText(/(^| )main$/);
  // In a frame rendered into the document of a frame, the function changes once the frame is
  // attached, so the layout effect runs again and gets the frame's scrolling element.
  await page.goto(`${fixtureUrl}/?fixture=framed-app-shell`);
  const frame = page.frameLocator('iframe[title="Framed shell"]');
  await expect(frame.getByTestId('framed-mount-scroll-element')).toHaveText(/(^| )frame$/);
});

test('a copy of getScrollElement kept from the first render returns the current element', async ({
  page,
}) => {
  for (const [url, element] of [
    [appShell, 'html'],
    [fullShell, 'main'],
  ] as const) {
    await page.goto(url);
    await page.getByRole('button', { name: 'Read the first scroll element' }).click();
    await expect(page.getByTestId('first-scroll-element')).toHaveText(element);
  }
  // A frame rendered into the document of a frame returns that document's scrolling element.
  await page.goto(`${fixtureUrl}/?fixture=framed-app-shell`);
  const frame = page.frameLocator('iframe[title="Framed shell"]');
  await frame.getByRole('button', { name: 'Read the scroll element' }).click();
  await expect(frame.getByTestId('framed-scroll-element')).toHaveText('frame');
});

test.describe('Main scroll', () => {
  test('the keyboard scrolls Main as it would the document', async ({ page }) => {
    // Without motion the scroll positions are exact.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fullShell);
    const content = page.locator('.env-app-shell-main');
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
    const content = page.locator('.env-app-shell-main');
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

  test('the browser keeps the keys in Main and in what the pointer last pressed', async ({
    page,
  }) => {
    await page.goto(scrollKeys);
    const content = page.locator('.env-app-shell-main');
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

    // A click in the page focuses Main, which the browser then scrolls.
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

    // After a press on the title, which does not scroll, the frame scrolls Main.
    await page.locator('.env-app-shell-header-title').click();
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
    const content = page.locator('.env-app-shell-main');
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
    const content = page.locator('.env-app-shell-main');
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
    const content = page.locator('.env-app-shell-main');
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
});

/** Computed app-region of an element, or null where the engine has no app regions. */
function appRegion(locator: Locator) {
  return locator.evaluate((element) => {
    if (!CSS.supports('app-region', 'drag') && !CSS.supports('-webkit-app-region', 'drag'))
      return null;
    const style = getComputedStyle(element);
    return style.getPropertyValue('app-region') || style.getPropertyValue('-webkit-app-region');
  });
}

test.describe('Title bar', () => {
  test("the header is the window's title bar: its height, small controls and drag regions", async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fullShell);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-title-bar', '');
    const header = page.getByRole('banner');
    expect((await box(header)).height).toBe(40);
    // --env-app-shell-header-height follows the title bar, so the sidebar and Main line up below it.
    const sidebar = page.getByRole('navigation', { name: 'Notes navigation' });
    expect((await box(sidebar)).y).toBe(40);
    expect((await box(page.locator('.env-app-shell-main'))).y).toBe(40);
    // Controls take the small height.
    for (const control of [
      page.getByTestId('action'),
      page.getByTestId('context-picker'),
      page.getByRole('menuitem', { name: 'File', exact: true }),
    ])
      expect((await box(control)).height).toBeCloseTo(32, 0);
    const trigger = header.getByRole('button', { name: 'Collapse sidebar' });
    const triggerBox = await box(trigger);
    expect([triggerBox.width, triggerBox.height]).toEqual([32, 32]);
    // Collapsed, the trigger keeps the centre line of the rail's icons.
    await trigger.click();
    await page.mouse.move(800, 500);
    await expect(sidebar).toHaveAttribute('data-rail', '');
    const icon = await box(sidebar.locator('.env-icon').first());
    expect(icon.x + icon.width / 2).toBeCloseTo(triggerBox.x + triggerBox.width / 2, 0);
    // The bar selects no text; empty space drags the window and controls stay clickable, in the
    // engines that have app regions.
    expect(
      await header.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.userSelect || style.getPropertyValue('-webkit-user-select');
      }),
    ).toBe('none');
    const region = await appRegion(header);
    if (region !== null) {
      expect(region).toBe('drag');
      for (const control of [
        page.getByTestId('action'),
        page.getByTestId('context-picker'),
        page.getByRole('menubar', { name: 'Application menu' }),
        header.getByRole('button', { name: 'Expand sidebar' }),
      ])
        expect(await appRegion(control)).toBe('no-drag');
    }
    expect(errors).toEqual([]);
  });

  test('Main scrolls below the title bar, and a full-window view still covers the window', async ({
    page,
  }) => {
    await page.goto(fullShell);
    const main = page.locator('.env-app-shell-main');
    const viewport = page.viewportSize()!;
    const geometry = await main.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const root = document.scrollingElement!;
      return {
        top: box.top,
        bottom: box.bottom,
        documentOverflow: root.scrollHeight - root.clientHeight,
      };
    });
    expect([geometry.top, geometry.bottom]).toEqual([40, viewport.height]);
    expect(geometry.documentOverflow).toBeLessThanOrEqual(0);
    await main.evaluate((element) => element.scrollTo(0, 600));
    // Sticky content sticks at the top of Main, just below the title bar.
    await expect.poll(async () => (await box(page.getByTestId('sticky-header'))).y).toBe(40);
    await page.getByRole('button', { name: 'Show full view' }).click();
    const view = await box(page.getByTestId('full-view'));
    expect([view.x, view.y, view.width, view.height]).toEqual([
      0,
      0,
      viewport.width,
      viewport.height,
    ]);
  });

  test('the title bar keeps at least --env-title-bar-height, which an application can set', async ({
    page,
  }) => {
    await page.goto(fullShell);
    await page
      .locator('.env-app-shell')
      .evaluate((shell: HTMLElement) => shell.style.setProperty('--env-title-bar-height', '48px'));
    expect((await box(page.getByRole('banner'))).height).toBe(48);
    expect((await box(page.locator('.env-app-shell-main'))).y).toBe(48);
    await page.getByRole('button', { name: 'Read the first scroll element' }).click();
    await expect(page.getByTestId('first-scroll-element')).toHaveText('main');
  });
});

test('a page whose document scrolls keeps its keys while it shows a frame whose Main scrolls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${catalogueUrl}/components/app-shell/overview`);
  await expect(page.locator(".env-app-shell[data-scroll='main']").first()).toBeVisible();
  await page.locator('#docs-main').focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  for (const scroller of await page.locator('.env-app-shell-main').all())
    expect(await scroller.evaluate((element) => element.scrollTop)).toBe(0);
});
