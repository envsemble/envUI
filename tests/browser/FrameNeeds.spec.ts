// The proof of Phase 4's "Done when": each describe reproduces one application need with the frame
// parts alone, in the fixtures of tests/fixture/frame. tests/FrameFixtures.test.mjs proves
// statically that the fixtures override nothing of the frame and measure nothing.
import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const rails = `${fixtureUrl}/?fixture=frame-rails`;
const documentFrame = `${fixtureUrl}/?fixture=frame-document`;
const titleBarFrame = `${fixtureUrl}/?fixture=frame-title-bar`;
const windowFrame = `${fixtureUrl}/?fixture=frame-window`;
const splitFrame = `${fixtureUrl}/?fixture=frame-split`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** A fresh page: no remembered frame state, and boxes final at once. */
async function open(page: Page, url: string, key?: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  if (key) {
    await page.evaluate((name) => localStorage.removeItem(name), key);
    await page.reload();
  }
}

/** Computed app-region of an element, or null where the engine has no app regions. */
function appRegion(locator: Locator) {
  return locator.evaluate((element) => {
    if (!CSS.supports('app-region', 'drag') && !CSS.supports('-webkit-app-region', 'drag'))
      return null;
    const style = getComputedStyle(element);
    return style.getPropertyValue('app-region') || style.getPropertyValue('-webkit-app-region');
  });
}

test.describe('Need: a navigation rail that opens on hover', () => {
  test.use({ viewport: { width: 1100, height: 760 } });

  test('below dockAt it is a rail that peeks after a rest, over the content', async ({ page }) => {
    const errors = collectErrors(page);
    await open(page, rails, 'frame-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const main = page.getByRole('main');
    await expect(primary).toHaveAttribute('data-rail', '');
    await expect(page.getByTestId('app-name')).toBeHidden();
    const before = await box(main);
    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    await expect(page.getByTestId('app-name')).toBeVisible();
    // Over the content: Main keeps its box.
    expect(await box(main)).toEqual(before);
    // A link closes the peek.
    await primary.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/#\/projects$/);
    await expect(primary).not.toHaveAttribute('data-peek');
    expect(errors).toEqual([]);
  });

  test('a press during the rest cancels the peek, so the press reaches its link', async ({
    page,
  }) => {
    await open(page, rails, 'frame-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    const settings = await box(primary.getByRole('link', { name: 'Settings' }));
    await page.mouse.move(settings.x + settings.width / 2, settings.y + settings.height / 2);
    await page.mouse.down();
    // Just past the 200 ms rest, to show it stayed a rail.
    await page.waitForTimeout(300);
    await expect(primary).not.toHaveAttribute('data-peek');
    await page.mouse.up();
    await expect(page).toHaveURL(/#\/settings$/);
  });

  test('Tab into the rail leaves it a rail; the Create menu holds a peek until it closes', async ({
    page,
  }) => {
    await open(page, rails, 'frame-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await primary.getByRole('button', { name: 'Search' }).focus();
    await page.keyboard.press('Tab');
    await expect(primary.getByRole('button', { name: 'Create' })).toBeFocused();
    await expect(primary).toHaveAttribute('data-rail', '');
    await expect(primary).not.toHaveAttribute('data-peek');
    // A peek holds while its menu is open, wherever the pointer goes.
    await page.mouse.move(30, 400);
    await expect(primary).toHaveAttribute('data-peek', '');
    await primary.getByRole('button', { name: 'Create' }).click();
    await page.mouse.move(700, 400);
    await expect(page.getByRole('menu', { name: 'Create' })).toBeVisible();
    await expect(primary).toHaveAttribute('data-peek', '');
    await page.getByRole('menuitem', { name: 'Folder' }).click();
    await expect(page.getByTestId('created')).toHaveText('folder');
    await expect(primary).not.toHaveAttribute('data-peek');
  });

  test('the trigger holds the rail open until an outside press, keeping the same nodes', async ({
    page,
  }) => {
    await open(page, rails, 'frame-rails');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    // A mark on the focused node shows that expanding and collapsing never remount it.
    const trigger = primary.getByRole('button', { name: 'Expand sidebar' });
    await trigger.evaluate((element) => (element.dataset.marked = 'yes'));
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(primary).toHaveAttribute('data-held', '');
    const held = primary.getByRole('button', { name: 'Collapse sidebar' });
    await expect(held).toBeFocused();
    await expect(held).toHaveAttribute('data-marked', 'yes');
    await page.mouse.click(700, 400);
    await expect(primary).not.toHaveAttribute('data-held');
    await expect(primary.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'data-marked',
      'yes',
    );
  });

  test.describe('from dockAt up', () => {
    test.use({ viewport: { width: 1400, height: 760 } });

    test('the trigger docks it, and each side remembers its own state across a reload', async ({
      page,
    }) => {
      await open(page, rails, 'frame-rails');
      const primary = page.getByRole('navigation', { name: 'Primary' });
      const directory = page.getByRole('complementary', { name: 'Directory' });
      await expect(primary).toHaveAttribute('data-state', 'expanded');
      await primary.getByRole('button', { name: 'Collapse sidebar' }).click();
      await page.mouse.move(700, 400);
      await expect(primary).toHaveAttribute('data-rail', '');
      await page.mouse.move(30, 400);
      await primary.getByRole('button', { name: 'Keep sidebar open' }).click();
      await expect(primary).toHaveAttribute('data-state', 'expanded');
      await directory.getByRole('button', { name: 'Collapse sidebar' }).click();
      await page.reload();
      await expect(primary).toHaveAttribute('data-state', 'expanded');
      await expect(directory).toHaveAttribute('data-state', 'collapsed');
      expect(JSON.parse((await page.evaluate(() => localStorage.getItem('frame-rails')))!)).toEqual(
        { start: { open: true }, end: { open: false } },
      );
    });

    test('kept in a cookie, the state is there before the first paint', async ({ page }) => {
      await page.context().clearCookies();
      await open(page, `${rails}&persist=cookie`);
      const primary = page.getByRole('navigation', { name: 'Primary' });
      await primary.getByRole('button', { name: 'Collapse sidebar' }).click();
      await expect(primary).toHaveAttribute('data-state', 'collapsed');
      const cookie = (await page.context().cookies()).find(({ name }) => name === 'frame-rails');
      expect(decodeURIComponent(cookie!.value)).toContain('start.open=0');
      // The first markup the frame commits is already collapsed: no flash of the docked sidebar.
      await page.addInitScript(() => {
        new MutationObserver((records, observer) => {
          const sidebar = document.querySelector('nav.env-sidebar');
          if (!sidebar) return;
          document.documentElement.dataset.firstState = sidebar.getAttribute('data-state') ?? '';
          observer.disconnect();
        }).observe(document, { childList: true, subtree: true });
      });
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-first-state', 'collapsed');
    });
  });
});

test.describe('Need: a directory sidebar at the end', () => {
  test.use({ viewport: { width: 1100, height: 760 } });

  test('it peeks from the inline end on its own, and choosing a person dismisses it', async ({
    page,
  }) => {
    await open(page, rails, 'frame-rails');
    const directory = page.getByRole('complementary', { name: 'Directory' });
    const primary = page.getByRole('navigation', { name: 'Primary' });
    // In its rail only the avatars show.
    await expect(page.getByTestId('directory-avatars')).toBeVisible();
    await page.mouse.move(1080, 300);
    await expect(directory).toHaveAttribute('data-peek', '');
    await expect(primary).not.toHaveAttribute('data-peek');
    const panel = await box(directory.locator('.env-sidebar-panel'));
    expect(panel.x + panel.width).toBeCloseTo(1100, 0);
    expect(panel.width).toBeGreaterThan(150);
    // More people load as the list's end comes into view.
    await expect(directory.getByRole('list', { name: 'People' }).getByRole('listitem')).toHaveCount(
      8,
    );
    await directory.getByRole('button', { name: 'Sam Lee' }).click();
    await expect(page.getByTestId('chosen')).toHaveText('Sam Lee');
    await expect(directory).not.toHaveAttribute('data-peek');
  });

  test('Escape in its search field or its menu closes only those; the next Escape closes it', async ({
    page,
  }) => {
    await open(page, rails, 'frame-rails');
    const directory = page.getByRole('complementary', { name: 'Directory' });
    await directory.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect(directory).toHaveAttribute('data-held', '');
    const field = directory.getByRole('searchbox', { name: 'Find people' });
    await field.fill('Sam');
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await expect(directory).toHaveAttribute('data-held', '');
    await directory.getByRole('button', { name: 'Sort people' }).click();
    const menu = page.getByRole('menu', { name: 'Sort people' });
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(directory).toHaveAttribute('data-held', '');
    await page.keyboard.press('Escape');
    await expect(directory).not.toHaveAttribute('data-held');
  });

  test('right-to-left text mirrors both rails and their peeks', async ({ page }) => {
    await open(page, `${rails}&dir=rtl`, 'frame-rails');
    const directory = page.getByRole('complementary', { name: 'Directory' });
    const primary = page.getByRole('navigation', { name: 'Primary' });
    expect((await box(directory)).x).toBeLessThan(100);
    expect((await box(primary)).x).toBeGreaterThan(1000);
    await page.mouse.move(20, 300);
    await expect(directory).toHaveAttribute('data-peek', '');
    expect((await box(directory.locator('.env-sidebar-panel'))).x).toBeCloseTo(0, 0);
  });
});

test.describe("Need: a phone's top bar", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('its triggers open each drawer from its side, trap focus and hand it back', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await open(page, rails, 'frame-rails');
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    // The account menu shows as an avatar named by the person.
    await expect(header.getByRole('button', { name: 'Priya Shah' })).toBeVisible();
    const navigationTrigger = header.getByRole('button', { name: 'Open navigation' });
    // Opened from the keyboard, as a press doesn't focus a button in WebKit.
    await navigationTrigger.focus();
    await page.keyboard.press('Enter');
    const navigation = page.getByRole('dialog', { name: 'Primary' });
    await expect.poll(async () => Math.round((await box(navigation)).x)).toBe(0);
    // Focus stays inside while it is open.
    for (let step = 0; step < 12; step++) await page.keyboard.press('Tab');
    // The trap's guards hand focus back to the drawer's first or last control.
    await expect
      .poll(() => navigation.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(navigation).toBeHidden();
    await expect(navigationTrigger).toBeFocused();
    // A link closes it and focuses Main.
    await navigationTrigger.click();
    await navigation.getByRole('link', { name: 'Projects' }).click();
    await expect(navigation).toBeHidden();
    await expect(page.getByRole('main')).toBeFocused();
    // The directory opens from the inline end.
    await header.getByRole('button', { name: 'Open Directory' }).click();
    const directory = page.getByRole('dialog', { name: 'Directory' });
    await expect
      .poll(async () => Math.round((await box(directory)).x + (await box(directory)).width))
      .toBe(390);
    // Widening the window past the breakpoint closes it, and the top bar goes.
    await page.setViewportSize({ width: 1400, height: 844 });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(header).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('right-to-left text mirrors the drawers', async ({ page }) => {
    await open(page, `${rails}&dir=rtl`, 'frame-rails');
    await page.getByRole('banner').getByRole('button', { name: 'Open navigation' }).click();
    const navigation = page.getByRole('dialog', { name: 'Primary' });
    await expect
      .poll(async () => Math.round((await box(navigation)).x + (await box(navigation)).width))
      .toBe(390);
  });

  test.describe('under a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true });

    test('the triggers are 44 px', async ({ page }) => {
      await open(page, rails);
      for (const id of ['phone-navigation', 'phone-directory']) {
        const trigger = await box(page.getByTestId(id));
        expect([trigger.width, trigger.height]).toEqual([44, 44]);
      }
    });
  });
});

/** Reads useAppShell().getStickyTop() through the fixture's button. */
async function stickyTop(page: Page) {
  await page.getByRole('button', { name: 'Read the sticky top' }).click();
  return Number(await page.getByTestId('sticky-top').textContent());
}

/** getStickyTop and a bar at --env-frame-sticky-top against the header's bottom edge. */
async function expectStickyUnderHeader(page: Page) {
  const header = await box(page.getByRole('banner'));
  const bottom = header.y + header.height;
  // Where the document scrolls, the sticky top is the header's size; where Main scrolls below a
  // title bar, it is Main's top, 0, which is the header's bottom edge too.
  const titleBar = (await page.locator('.env-app-shell').getAttribute('data-scroll')) === 'main';
  expect(await stickyTop(page)).toBeCloseTo(titleBar ? 0 : bottom, 1);
  const scroller = titleBar ? page.getByRole('main') : page.locator('html');
  await scroller.evaluate((element) => element.scrollTo(0, 900));
  await expect
    .poll(async () => Math.round((await box(page.getByTestId('sticky-bar'))).y))
    .toBe(Math.round(bottom));
}

test.describe('Need: sticky offsets without measuring the header', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const variant of ['comfortable', 'compact', 'root font 20 px', 'title bar'] as const)
    test(`getStickyTop and --env-frame-sticky-top meet the header's bottom edge: ${variant}`, async ({
      page,
    }) => {
      const query = { compact: '&scale=compact', 'title bar': '&titleBar' }[variant as string];
      await open(page, `${documentFrame}${query ?? ''}`, 'frame-document');
      if (variant === 'root font 20 px')
        await page.evaluate(() => (document.documentElement.style.fontSize = '20px'));
      await expectStickyUnderHeader(page);
      if (variant === 'title bar') return;
      // <html> carries the header's size too, for content portaled out of the frame.
      const header = await box(page.getByRole('banner'));
      await expect
        .poll(() =>
          page.evaluate(() =>
            document.documentElement.style.getPropertyValue('--env-frame-header-block-size'),
          ),
        )
        .toBe(`${header.height}px`);
    });

  test.describe('under a coarse pointer', () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width: 1280, height: 800 } });

    test("getStickyTop meets the header's bottom edge", async ({ page }) => {
      await open(page, documentFrame, 'frame-document');
      await expectStickyUnderHeader(page);
    });
  });

  test('scroll padding keeps a focused field below the header; reveal lands below both headers', async ({
    page,
  }) => {
    await open(page, documentFrame, 'frame-document');
    const header = await box(page.getByRole('banner'));
    await page.evaluate(() => window.scrollTo(0, 2000));
    const field = page.getByRole('textbox', { name: 'Form title' });
    await field.focus();
    await expect
      .poll(async () => (await box(field)).y)
      .toBeGreaterThanOrEqual(header.y + header.height - 1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Reveal Sharing' }).click();
    const pageHeader = page.locator('.env-page-header');
    await expect
      .poll(async () => Math.round((await box(page.locator('#section-sharing'))).y))
      .toBe(Math.round((await box(pageHeader)).y + (await box(pageHeader)).height));
    expect((await box(pageHeader)).y).toBeCloseTo(header.y + header.height, 0);
  });

  test("the summary moves into the sidebar's slot where the page is narrow", async ({ page }) => {
    await open(page, documentFrame, 'frame-document');
    const summary = page.getByTestId('summary');
    await expect(summary).toHaveAttribute('data-place', 'page');
    await page.setViewportSize({ width: 820, height: 800 });
    await expect(summary).toHaveAttribute('data-place', 'sidebar');
    await expect(page.getByTestId('sidebar-slot').getByTestId('summary')).toBeVisible();
  });
});

test.describe('Need: an application layout without .env-* overrides', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('a title-bar frame with a stretched search strip, cards and a filling tree', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await open(page, titleBarFrame, 'frame-title-bar');
    const header = page.getByRole('banner');
    expect((await box(header)).height).toBe(40);
    expect((await box(page.getByTestId('share'))).height).toBeCloseTo(32, 0);
    const region = await appRegion(header);
    if (region !== null) {
      expect(region).toBe('drag');
      expect(await appRegion(page.getByTestId('share'))).toBe('no-drag');
    }
    const sidebar = page.getByRole('navigation', { name: 'Projects' });
    const content = sidebar.locator('.env-sidebar-content').first();
    const inner = await content.evaluate((element) => {
      const style = getComputedStyle(element);
      return (
        element.clientWidth -
        parseFloat(style.paddingInlineStart) -
        parseFloat(style.paddingInlineEnd)
      );
    });
    // The strip and the cards take the sidebar's full width; the field takes what the button leaves.
    expect((await box(page.getByTestId('search-strip'))).width).toBeCloseTo(inner, 0);
    const field = await box(sidebar.getByRole('searchbox', { name: 'Find projects' }));
    const button = await box(sidebar.getByRole('button', { name: 'New project' }));
    expect(field.width).toBeGreaterThan(inner - button.width - 24);
    for (const card of await page.getByTestId('project-cards').locator('.env-card').all())
      expect((await box(card)).width).toBeCloseTo(inner, 0);
    // The tree fills the rest of the sidebar's height and width.
    const tree = await box(sidebar.getByRole('tree', { name: 'Documents' }));
    expect(tree.width).toBeCloseTo(inner, 0);
    expect(tree.y + tree.height).toBeGreaterThan(700);
    // Main scrolls below the title bar, holding the tabs and the dock.
    await expect(page.getByRole('tablist', { name: 'Open documents' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Assistant' })).toBeVisible();
    // Collapsed, the cards become avatars through useSidebar().isRail.
    await header.getByRole('button', { name: 'Collapse sidebar' }).click();
    await page.mouse.move(700, 400);
    await expect(sidebar).toHaveAttribute('data-rail', '');
    await expect(page.getByTestId('project-avatars')).toBeVisible();
    await expect(page.getByTestId('project-cards')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('a window with a section bar, a sticky aside and a body that fills the window', async ({
    page,
  }) => {
    await open(page, windowFrame);
    const titleBar = await box(page.locator('.env-window-frame-title-bar'));
    const bottom = titleBar.y + titleBar.height;
    await expect(page.getByRole('tablist', { name: 'Sections' })).toBeVisible();
    // The body is at least as tall as the window below the title bar; a short one is exactly that.
    expect((await box(page.getByTestId('body-Overview'))).height).toBeGreaterThan(800);
    await page.getByRole('tab', { name: 'Risks' }).click();
    const risks = await box(page.getByTestId('body-Risks'));
    expect(risks.height).toBeCloseTo(800 - titleBar.height, 0);
    await page.getByRole('tab', { name: 'Overview' }).click();
    // The PageHeader's controls are small. Look inside the Overview body: the Risks one can still be
    // on its way out.
    const overview = page.getByTestId('body-Overview');
    await expect(page.getByTestId('body-Risks')).toBeHidden();
    expect((await box(overview.getByRole('button', { name: 'Share' }))).height).toBeCloseTo(32, 0);
    expect((await box(overview.getByRole('button', { name: 'Filter' }))).height).toBeCloseTo(32, 0);
    expect(
      (await box(overview.getByRole('searchbox', { name: 'Search overview' }))).height,
    ).toBeLessThanOrEqual(32);
    // The aside sticks flush at the top of the content, right under the title bar.
    await page
      .getByRole('region', { name: 'Launch plan' })
      .evaluate((element) => element.scrollTo(0, 600));
    await expect
      .poll(async () => Math.round((await box(page.getByTestId('aside'))).y))
      .toBe(Math.round(bottom));
  });
});

test.describe('Need: a split header with a switcher, a loading bar and a skeleton', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the switcher hides in a rail, and the loading bar runs across both columns', async ({
    page,
  }) => {
    await open(page, splitFrame, 'frame-split');
    const sidebar = page.getByRole('navigation', { name: 'Main navigation' });
    const switcher = sidebar.getByRole('button', { name: /Northwind/ });
    await expect(switcher).toBeVisible();
    await page.getByRole('button', { name: 'Load the next page' }).click();
    const bar = page.getByRole('progressbar', { name: 'Loading page' });
    await expect(bar).toBeVisible();
    const header = await box(page.getByRole('banner'));
    const edge = await box(bar);
    expect(Math.abs(edge.y + edge.height - (header.y + header.height))).toBeLessThanOrEqual(1);
    expect(edge.x).toBeCloseTo(0, 0);
    expect(edge.width).toBeCloseTo(1280, 0);
    await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
    await page.mouse.move(700, 400);
    await expect(sidebar).toHaveAttribute('data-rail', '');
    await expect(switcher).toBeHidden();
  });

  test("the skeleton's boxes are the frame's", async ({ page }) => {
    await open(page, splitFrame, 'frame-split');
    const boxes = async () => ({
      sidebar: await box(page.locator('.env-sidebar')),
      header: await box(page.locator('.env-app-shell-header')),
      main: await box(page.locator('.env-app-shell-main')),
    });
    const frame = await boxes();
    await page.goto(`${splitFrame}&skeleton`);
    await expect(page.locator('.env-nav-list-skeleton-item').first()).toBeVisible();
    expect(await boxes()).toEqual(frame);
  });
});
