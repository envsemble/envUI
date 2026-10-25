import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
// The type brings dev mode's `window.envui` with it.
import type { DevModeHandle, LayoutProblem } from '@envsemble/envui/dev';

declare global {
  interface Window {
    /** The fixture's dev mode (tests/fixture/DevMode.tsx). */
    envuiDevMode?: DevModeHandle;
  }
}

/** The page's `envui.layout`, once dev mode has installed it. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=dev-mode`);
  await page.waitForFunction(() => window.envui?.layout !== undefined);
}

/**
 * Opens dev mode over the fixture's page, as `open()` does, for a test that needs no tab of its
 * own; Escape closes it again. Returns its panel.
 */
async function openOver(page: Page) {
  await page.waitForFunction(() => window.envuiDevMode !== undefined);
  await page.evaluate(() => window.envuiDevMode!.open());
  const panel = page.getByRole('region', { name: 'Dev mode' });
  await expect(panel).toBeVisible();
  return panel;
}

/** Picks an angle in the toolbar's View dropdown, which also brings the whole page into view. */
async function turnTo(page: Page, panel: Locator, name: string) {
  await panel
    .getByRole('toolbar', { name: '3D view' })
    .getByRole('button', { name: 'View', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'View' })
    .getByRole('button', { name, exact: true })
    .click();
}

/** Turns on the responsive frame and picks a device in the toolbar's Responsive dropdown. */
async function pickDevice(page: Page, panel: Locator, device: RegExp) {
  await panel.getByRole('button', { name: 'Responsive', exact: true }).click();
  const frame = page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ });
  if ((await frame.getAttribute('aria-checked')) !== 'true') await frame.click();
  await page.getByRole('menuitem', { name: /^Device/ }).click();
  await page.getByRole('menuitemradio', { name: device }).click();
}

test('the readout describes and checks the layout nodes, also at other widths', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await open(page);
  const text = await page.evaluate(() => window.envui!.layout!.describe());
  // The tree: kinds and names, the container and the threshold its queries test, the resolved
  // grid columns, identical siblings folded, hidden nodes counted.
  expect(text).toMatch(
    /^scaffold "app" · [\d.]+×[\d.]+rem · expanded · container env-scaffold \(queried at 37\.5(?:, 52\.5, 75)?rem\)/m,
  );
  expect(text).toMatch(
    /^ {2}grid "frame" · .* · grid · gap 1rem · padding 1rem · columns 2 = 12 \| /m,
  );
  expect(text).toContain('row "cards" · ');
  expect(text).toContain('… and 2 more like "first" ("second", "third")');
  expect(text).toMatch(/box "hidden" · hidden \(display: none\) \(1 node inside\)/);
  expect(text).toMatch(/row "heading" · .* · sticky top, but nothing around it scrolls/);
  expect(text).not.toContain('env-dev');

  const rules = (problems: LayoutProblem[]) =>
    problems.map(({ rule, node }) => `${rule} ${node}`).sort();
  const problems = await page.evaluate(() => window.envui!.layout!.check());
  expect(rules(problems)).toEqual([
    'layout-paints row "painted"',
    'sticky-without-scroll row "heading"',
  ]);
  expect(problems[0].path).toMatch(/^scaffold "app" > grid "frame" > page > /);

  // At 22rem the scaffold stacks and the 30rem content overflows its grid; at 60rem it fits. The
  // root gets its own width back after each.
  const before = await page.evaluate(
    () => document.querySelector('.env-theme')!.getBoundingClientRect().width,
  );
  const results = await page.evaluate(() => window.envui!.layout!.at(['22rem', 960]));
  expect(results.map(({ width, windowClass }) => `${width} ${windowClass}`)).toEqual([
    '22rem compact',
    '960 expanded',
  ]);
  expect(results[0].text).toMatch(/^scaffold "app" · 22×[\d.]+rem · compact/m);
  expect(rules(results[0].problems)).toContain('child-overflow grid "wide"');
  expect(rules(results[1].problems)).not.toContain('child-overflow grid "wide"');
  expect(
    await page.evaluate(() => document.querySelector('.env-theme')!.getBoundingClientRect().width),
  ).toBe(before);
  // …and no style attribute it didn't have.
  expect(
    await page.evaluate(() => document.querySelector('.env-theme')!.hasAttribute('style')),
  ).toBe(false);
  // A height too, as a window of that size would show the page.
  const sized = await page.evaluate(() =>
    window.envui!.layout!.at([{ width: '22rem', height: '20rem' }]),
  );
  expect(sized[0]).toMatchObject({ width: '22rem', height: '20rem', windowClass: 'compact' });
  expect(sized[0].text).toMatch(/^root .*· 22×20rem · compact/m);
  expect(
    await page.evaluate(() => document.querySelector('.env-theme')!.hasAttribute('style')),
  ).toBe(false);

  // A dialog, in its positioner fixed over the window, is an open overlay.
  await page.getByRole('button', { name: 'Open the dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Details' })).toBeVisible();
  expect(await page.evaluate(() => window.envui!.layout!.describe())).toMatch(
    /open overlays \(1\):\n {2}dialog\b/,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // An open overlay is listed with where it landed, and found off the window.
  await page.getByRole('button', { name: 'Open the popover' }).click();
  const withOverlay = await page.evaluate(() => window.envui!.layout!.describe());
  expect(withOverlay).toMatch(
    /open overlays \(1\):\n {2}popover · 10×[\d.]+rem · .* · at -4,2rem in the window/,
  );
  expect(rules(await page.evaluate(() => window.envui!.layout!.check()))).toContain(
    'overlay-off-window popover',
  );
});

test('the button and the shortcut open dev mode in a new tab, which only closing ends', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await open(page);
  const button = page.getByRole('button', { name: 'Dev mode', exact: true });
  await expect(button).toHaveAttribute('aria-keyshortcuts', 'Alt+Shift+D');
  const [tab] = await Promise.all([page.context().waitForEvent('page'), button.click()]);
  // The tab is the page's address, marked as dev mode's.
  const address = new URL(tab.url());
  expect(address.searchParams.get('fixture')).toBe('dev-mode');
  expect(address.searchParams.has('envui-dev')).toBe(true);
  // Dev mode is open there at once, over the whole window, and says so in the tab's title.
  const panel = tab.getByRole('region', { name: 'Dev mode' });
  await expect(panel).toBeVisible();
  await expect(tab).toHaveTitle(/^Dev mode/);
  const { width, height } = tab.viewportSize()!;
  expect(await panel.boundingBox()).toEqual({ x: 0, y: 0, width, height });
  await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(15);
  // Nothing in it leaves dev mode: no close button, no corner button, and Esc and the shortcut
  // leave it open.
  await expect(tab.getByRole('button', { name: /^(Dev mode|Close dev mode)$/ })).toHaveCount(0);
  await tab.bringToFront();
  await expect(panel).toBeFocused();
  await tab.keyboard.press('Escape');
  await tab.keyboard.press('Alt+Shift+D');
  await expect(panel).toBeVisible();
  expect(page.context().pages()).toHaveLength(2);
  // The page it came from stays as it was, with no dev mode over it.
  await expect(page.getByRole('region', { name: 'Dev mode' })).toHaveCount(0);
  expect(
    await page.evaluate(() => (document.querySelector('.env-theme') as HTMLElement).inert),
  ).toBe(false);
  // The shortcut opens another.
  const [second] = await Promise.all([
    page.context().waitForEvent('page'),
    page.keyboard.press('Alt+Shift+D'),
  ]);
  await expect(second.getByRole('region', { name: 'Dev mode' })).toBeVisible();
  await tab.close();
  await second.close();
});

test('opened over the page, it covers it until Escape, and shows the nodes and the inspector', async ({
  page,
}) => {
  await open(page);
  const panel = await openOver(page);
  // Focus moves into the panel, and the page under it is inert.
  const pageInert = () =>
    page.evaluate(() => (document.querySelector('.env-theme') as HTMLElement).inert);
  await expect(panel).toBeFocused();
  expect(await pageInert()).toBe(true);
  // A plane for every shown node, each carrying copies of what the node holds.
  await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(15);
  await expect(panel.locator('.env-dev-plane[data-problems]')).toHaveCount(2);
  await expect(panel.locator('.env-dev-surface').filter({ hasText: 'Painted' })).toHaveCount(1);
  // The tree, in its sidebar, lists the nodes; the inspector shows the selected one.
  await panel
    .getByRole('complementary', { name: 'Layout nodes' })
    .getByRole('treeitem', { name: /row "painted"/ })
    .click();
  await expect(
    panel
      .getByRole('complementary', { name: 'Dev mode inspector' })
      .getByRole('region', { name: 'Details of row "painted"' }),
  ).toContainText('Layout never paints');
  await panel.getByRole('tab', { name: 'Readout' }).click();
  await expect(panel.getByRole('tabpanel', { name: 'Readout' }).locator('pre')).toContainText(
    'scaffold "app"',
  );
  // The readout leaves dev mode's own UI out, also while it is open.
  expect(await page.evaluate(() => window.envui!.layout!.describe())).not.toContain('env-dev');
  // Escape closes it and gives the page back.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  expect(await pageInert()).toBe(false);
  await expect(page.getByRole('button', { name: 'Dev mode', exact: true })).toBeVisible();
});

test(
  'the View dropdown turns the view to each angle, and fits it; the toolbar names its buttons at once',
  { tag: '@engines' },
  async ({ page }) => {
    await open(page);
    const panel = await openOver(page);
    const toolbar = panel.getByRole('toolbar', { name: '3D view' });
    const scene = panel.locator('.env-dev-scene');
    await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(15);
    const rotation = (rx: number, ry: number) => `rotateX(${rx}deg) rotateY(${ry}deg)`;
    const angles: [string, string][] = [
      ['Front', rotation(0, 0)],
      ['Top', rotation(-70, 0)],
      ['Left', rotation(0, 70)],
      ['Right', rotation(0, -70)],
      ['Tilted', rotation(38, -22)],
    ];
    for (const [name, turned] of angles) {
      await turnTo(page, panel, name);
      await expect.poll(() => scene.getAttribute('style')).toContain(turned);
      // The dropdown closes; opened again, it marks the angle the view is at.
      await expect(page.getByRole('group', { name: 'Angles' })).toBeHidden();
    }
    await toolbar.getByRole('button', { name: 'View', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Tilted', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Front', exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    // Picking the angle the view is at again brings the whole page back after zooming.
    await page.keyboard.press('Escape');
    const zoom = async () =>
      Number(/scale\(([\d.]+)\)/.exec((await scene.getAttribute('style')) ?? '')?.[1]);
    const fittedZoom = await zoom();
    const view = (await panel.locator('.env-dev-view').boundingBox())!;
    await page.mouse.move(view.x + 40, view.y + view.height - 40);
    await page.keyboard.down('Control');
    for (let turn = 0; turn < 3; turn += 1) await page.mouse.wheel(0, -100);
    await page.keyboard.up('Control');
    await expect.poll(zoom).toBeGreaterThan(fittedZoom * 1.2);
    await turnTo(page, panel, 'Tilted');
    await expect.poll(zoom).toBeCloseTo(fittedZoom, 3);
    // The toolbar's buttons show their names at once, with no wait.
    await toolbar.getByRole('button', { name: 'Show', exact: true }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('Show', { timeout: 300 });
    // The arrow keys move between the toolbar's dropdowns.
    await toolbar.getByRole('button', { name: 'View', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Show', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Responsive', exact: true })).toBeFocused();
  },
);

test(
  'dragging turns the view, also over a selection, and never drags a picture',
  { tag: '@engines' },
  async ({ page }) => {
    await open(page);
    const panel = await openOver(page);
    const scene = panel.locator('.env-dev-scene');
    await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(15);
    await page.evaluate(() => {
      const seen = { drags: 0, cancels: 0 };
      (window as unknown as { seen: typeof seen }).seen = seen;
      document.addEventListener('dragstart', () => (seen.drags += 1), true);
      document.addEventListener('pointercancel', () => (seen.cancels += 1), true);
    });
    const view = (await panel.locator('.env-dev-view').boundingBox())!;
    /** Drags across the view's middle, 150px right and 50px down, and returns the rotation. */
    const drag = async () => {
      const x = view.x + view.width / 2;
      const y = view.y + view.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 150, y + 50, { steps: 10 });
      await page.mouse.up();
      return /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/
        .exec((await scene.getAttribute('style')) ?? '')!
        .slice(1)
        .map(Number);
    };
    // From the tilted view, 38 and -22 degrees, a drag turns it 0.3 degrees a pixel.
    expect(await drag()).toEqual([23, 23]);
    // Text selected across the view, as by Ctrl+A or a selection dragged out of a sidebar, used to
    // be dragged as a picture, which cancelled the pointer and stopped the view turning.
    await panel.getByRole('heading', { name: 'Nodes' }).click();
    await page.keyboard.press('ControlOrMeta+A');
    expect(await page.evaluate(() => String(window.getSelection()).length)).toBeGreaterThan(0);
    expect(await drag()).toEqual([8, 68]);
    expect(await page.evaluate(() => (window as unknown as { seen: object }).seen)).toEqual({
      drags: 0,
      cancels: 0,
    });
  },
);

test('"only the selected" shows the selected node and what is inside it', async ({ page }) => {
  await open(page);
  const panel = await openOver(page);
  const planes = panel.locator('.env-dev-plane[data-plane]');
  const show = panel.getByRole('button', { name: 'Show', exact: true });
  const only = page.getByRole('menuitemcheckbox', { name: /^Only the selected/ });
  /** Turns Only the selected on or off in the Show dropdown, which stays open, and closes it. */
  const toggleOnly = async (checked: boolean) => {
    await show.click();
    await only.click();
    await expect(only).toHaveAttribute('aria-checked', String(checked));
    await page.keyboard.press('Escape');
    await expect(only).toBeHidden();
  };
  await expect(planes).toHaveCount(15);
  // On, with nothing selected, every plane shows, also under the pointer.
  await toggleOnly(true);
  await planes.first().hover({ force: true });
  await expect(planes).toHaveCount(15);
  // Selecting the cards' row shows it and its three cards; another node, that one alone.
  await panel.getByRole('treeitem', { name: /row "cards"/ }).click();
  await expect(planes).toHaveCount(4);
  await expect(panel.locator('.env-dev-plane[data-selected]')).toHaveCount(1);
  await panel.getByRole('treeitem', { name: /row "painted"/ }).click();
  await expect(planes).toHaveCount(1);
  // Clicking the selected row again clears the selection, and everything shows.
  await panel.getByRole('treeitem', { name: /row "painted"/ }).click();
  await expect(planes).toHaveCount(15);
  // Off, the selection no longer filters.
  await panel.getByRole('treeitem', { name: /row "cards"/ }).click();
  await toggleOnly(false);
  await expect(planes).toHaveCount(15);
  // Escape closed only the dropdown each time: dev mode is still open.
  await expect(panel).toBeVisible();
});

test(
  'the Responsive dropdown lays the page out at another size, not the viewport',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page);
    const panel = await openOver(page);
    const root = page.locator('.env-theme').first();
    const view = panel.locator('.env-dev-view');
    const scene = panel.locator('.env-dev-scene');
    const right = panel.getByRole('slider', { name: 'Page width, right edge' });
    const bottom = panel.getByRole('slider', { name: 'Page height, bottom edge' });
    const label = panel.locator('.env-dev-frame-label');
    const rootSize = () =>
      root.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return `${box.width}×${box.height}`;
      });
    const rootWidth = () => root.evaluate((element) => element.getBoundingClientRect().width);
    const own = await rootSize();
    const ownWidth = await rootWidth();
    const viewBox = await view.boundingBox();
    const frame = panel.locator('.env-dev-frame');
    const responsive = panel.getByRole('button', { name: 'Responsive', exact: true });
    const toggle = page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ });
    const deviceMenu = page.getByRole('menuitem', { name: /^Device/ });
    const portrait = page.getByRole('menuitemradio', { name: 'Portrait' });
    const landscape = page.getByRole('menuitemradio', { name: 'Landscape' });
    // Off by default: the page at its own size, with no frame, handles or label, and the device
    // and the orientation wait until it is on.
    await responsive.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(deviceMenu).toHaveAttribute('aria-disabled', 'true');
    await expect(portrait).toHaveAttribute('aria-disabled', 'true');
    await expect(frame).toHaveCount(0);
    await expect(right).toHaveCount(0);
    // Turned on, the frame starts at the page's own size; turned off, it goes again.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(right).toHaveAttribute('aria-valuenow', String(Math.round(ownWidth)));
    expect(await rootSize()).toBe(own);
    await toggle.click();
    await expect(frame).toHaveCount(0);
    await expect.poll(rootSize).toBe(own);

    // On, a device lays the page out at its size, and the planes follow; the window and the view
    // keep theirs.
    await toggle.click();
    await deviceMenu.click();
    await page.getByRole('menuitemradio', { name: /^iPhone SE/ }).click();
    await expect.poll(rootSize).toBe('375×667');
    await expect(scene).toHaveCSS('width', '375px');
    await expect(label).toHaveText('iPhone SE · 375×667px · 23.44×41.69rem · compact');
    await expect(right).toHaveAttribute('aria-valuetext', /^iPhone SE · 375×667px/);
    expect(page.viewportSize()).toEqual({ width: 1280, height: 720 });
    expect(await view.boundingBox()).toEqual(viewBox);
    // The inspector's readout follows the size.
    await panel.getByRole('tab', { name: 'Readout' }).click();
    await expect(panel.getByRole('tabpanel', { name: 'Readout' }).locator('pre')).toContainText(
      'scaffold "app" · 23.44×',
    );
    // Landscape swaps the width and the height, and keeps the device.
    await responsive.click();
    await expect(portrait).toHaveAttribute('aria-checked', 'true');
    await landscape.click();
    await expect.poll(rootSize).toBe('667×375');
    await expect(label).toContainText('iPhone SE · 667×375px · 41.69×23.44rem · medium');

    // The arrow keys on an edge step by 1rem, with Shift by 5rem; stepping makes it a free frame.
    await bottom.focus();
    await page.keyboard.press('ArrowUp');
    await expect.poll(rootSize).toBe('667×391');
    await expect(label).toHaveText('667×391px · 41.69×24.44rem · medium');
    await right.focus();
    await page.keyboard.press('Shift+ArrowLeft');
    await expect.poll(rootWidth).toBe(587);
    // Dragging the right edge to the left narrows it, with the whole frame in view, once the view
    // has turned there.
    await turnTo(page, panel, 'Tilted');
    await expect
      .poll(async () => {
        const before = await scene.getAttribute('style');
        await page.waitForTimeout(50);
        return before === (await scene.getAttribute('style'));
      })
      .toBe(true);
    const box = (await right.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 40, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect.poll(rootWidth).toBeLessThan(587);

    // Responsive frame off: the frame goes, and the root's style is as it was.
    await responsive.click();
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect.poll(rootSize).toBe(own);
    await expect(frame).toHaveCount(0);
    expect(await root.evaluate((element) => element.hasAttribute('style'))).toBe(false);
    // Closing dev mode with a size set puts it back too.
    await responsive.click();
    await toggle.click();
    await page.keyboard.press('Escape');
    await bottom.focus();
    await page.keyboard.press('Shift+ArrowUp');
    await expect.poll(rootSize).not.toBe(own);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    expect(await rootSize()).toBe(own);
    expect(await root.evaluate((element) => element.hasAttribute('style'))).toBe(false);
  },
);

test("dev mode's own theme switches at the tree's foot, persists and leaves the page's alone", async ({
  page,
}) => {
  await open(page);
  const panel = await openOver(page);
  const editor = page.locator('.env-dev');
  const boundary = page.locator('.env-theme:not([data-env-dev] *)').first();
  const pageAttributes = () =>
    boundary.evaluate((element) =>
      ['data-env-theme', 'data-env-contrast'].map((name) => element.getAttribute(name)).join(),
    );
  const pageBefore = await pageAttributes();
  const pageTheme = await boundary.getAttribute('data-env-theme');
  const other = pageTheme === 'dark' ? 'Light' : 'Dark';
  // By default dev mode takes the page's theme.
  await expect(editor).toHaveAttribute('data-env-theme', pageTheme!);
  const themeButton = panel
    .getByRole('complementary', { name: 'Layout nodes' })
    .getByRole('button', { name: 'Dev mode theme' });

  await themeButton.click();
  await page.getByRole('menuitemradio', { name: other }).click();
  await expect(editor).toHaveAttribute('data-env-theme', other.toLowerCase());
  await themeButton.click();
  await page.getByRole('menuitemcheckbox', { name: 'High contrast' }).click();
  await expect(editor).toHaveAttribute('data-env-contrast', 'high');
  // The check item leaves its menu open; Escape closes the menu first.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  // The page keeps its own theme.
  expect(await pageAttributes()).toBe(pageBefore);

  // The choice outlasts a reload.
  await page.reload();
  await openOver(page);
  await expect(editor).toHaveAttribute('data-env-theme', other.toLowerCase());
  await expect(editor).toHaveAttribute('data-env-contrast', 'high');
  expect(await pageAttributes()).toBe(pageBefore);
  // Same as the page goes back to the page's theme.
  await themeButton.click();
  await page.getByRole('menuitemradio', { name: 'Same as the page' }).click();
  await expect(editor).toHaveAttribute('data-env-theme', pageTheme!);
});

test('dev mode takes the theme of the boundary around its root', async ({ page }) => {
  // The root sits in a nested theme boundary of the other theme, such as a dark region of a light
  // page: dev mode takes the root's theme, not the document's.
  await page.goto(`${fixtureUrl}/?fixture=dev-mode&root=.dev-page`);
  await page.waitForFunction(() => window.envui?.layout !== undefined);
  const documentTheme = await page
    .locator('.env-theme:not([data-env-dev] *)')
    .first()
    .getAttribute('data-env-theme');
  const other = documentTheme === 'dark' ? 'light' : 'dark';
  await page.locator('.dev-scaffold').evaluate((element, theme) => {
    element.classList.add('env-theme');
    element.setAttribute('data-env-theme', theme);
  }, other);
  await openOver(page);
  await expect(page.locator('.env-dev')).toHaveAttribute('data-env-theme', other);
});

test('each sidebar hides from its header, comes back from its corner, and resizes by its edge', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 720 });
  await open(page);
  const panel = await openOver(page);
  const tree = panel.getByRole('complementary', { name: 'Layout nodes' });
  const inspector = panel.getByRole('complementary', { name: 'Dev mode inspector' });
  const view = panel.locator('.env-dev-view');
  const width = async (locator: Locator) => (await locator.boundingBox())!.width;
  const both = await width(view);
  // No toolbar button shows or hides a sidebar.
  await expect(
    panel
      .getByRole('toolbar', { name: '3D view' })
      .getByRole('button', { name: /nodes|inspector/i }),
  ).toHaveCount(0);

  // Hidden, a sidebar leaves its button in the same top corner of the window.
  const hideTree = tree.getByRole('button', { name: 'Hide the nodes' });
  const hideInspector = inspector.getByRole('button', { name: 'Hide the inspector' });
  const treeCorner = (await hideTree.boundingBox())!;
  const inspectorCorner = (await hideInspector.boundingBox())!;
  await hideTree.click();
  await hideInspector.click();
  await expect(tree).toBeHidden();
  await expect(inspector).toBeHidden();
  expect(await width(view)).toBe(page.viewportSize()!.width);
  const showTree = panel.getByRole('button', { name: 'Show the nodes' });
  const showInspector = panel.getByRole('button', { name: 'Show the inspector' });
  const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.abs(a.x - b.x) <= 8 && Math.abs(a.y - b.y) <= 8;
  expect(near((await showTree.boundingBox())!, treeCorner)).toBe(true);
  expect(near((await showInspector.boundingBox())!, inspectorCorner)).toBe(true);
  await showTree.click();
  await showInspector.click();
  await expect(tree).toBeVisible();
  await expect(inspector).toBeVisible();
  expect(await width(view)).toBe(both);

  // Each resizes by its inner edge, as a resizable Drawer does: by dragging, the arrow keys and a
  // double click back to its width.
  const treeHandle = panel.getByRole('separator', { name: 'Resize the nodes' });
  const inspectorHandle = panel.getByRole('separator', { name: 'Resize the inspector' });
  const treeWidth = await width(tree);
  const handle = (await treeHandle.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 80, handle.y + handle.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  await expect.poll(() => width(tree)).toBeGreaterThan(treeWidth + 60);
  await treeHandle.dblclick();
  await expect.poll(() => width(tree)).toBe(treeWidth);
  const inspectorWidth = await width(inspector);
  await inspectorHandle.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => width(inspector)).toBeGreaterThan(inspectorWidth);
  // The widths and what is hidden outlast a reload.
  const kept = await width(inspector);
  await hideTree.click();
  await page.reload();
  await openOver(page);
  await expect(tree).toBeHidden();
  expect(await width(inspector)).toBe(kept);
});

test('the legend floats over the view, with no pane behind it', async ({ page }) => {
  await open(page);
  const panel = await openOver(page);
  const legend = panel.locator('.env-dev-view').getByRole('group', { name: 'Legend' });
  await expect(legend).toContainText('scaffold');
  await expect(legend).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(legend).toHaveCSS('border-style', 'none');
  await expect(legend).toHaveCSS('pointer-events', 'none');
  // Colored by window class, it names the classes.
  await panel.getByRole('button', { name: 'Show', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Color by window class' }).click();
  await expect(legend).toContainText('compact < 37.5');
});

test('the readout counts rem from the root font size, also when it is not 16px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await open(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });
  const results = await page.evaluate(() => window.envui!.layout!.at(['22rem', '40rem', 800]));
  // 40rem is 800px at 20px a rem: the same width and window class, and the scaffold's 37.5rem
  // query holds at both.
  expect(results.map(({ width, windowClass }) => `${width} ${windowClass}`)).toEqual([
    '22rem compact',
    '40rem medium',
    '800 medium',
  ]);
  expect(results[0].text).toMatch(/· 1rem = 20px$/m);
  expect(results[0].text).toMatch(/^scaffold "app" · 22×[\d.]+rem · compact/m);
  for (const result of results.slice(1)) {
    expect(result.text).toMatch(/^scaffold "app" · 40×[\d.]+rem · medium/m);
    expect(result.text).toMatch(
      /^ {2}grid "frame" · .* · gap 1rem · padding 1rem · columns 2 = 12 \| /m,
    );
  }
});

test(
  'in a short window the wheel scrolls the tree to its last node, the inspector and the device menu, and the page once dev mode closes',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    await open(page);
    const scrollY = () => page.evaluate(() => document.scrollingElement!.scrollTop);
    const panel = await openOver(page);
    /** Where an element's scroll is: its offset and the most it takes. */
    const scroll = (locator: Locator) =>
      locator.evaluate((element) => [
        element.scrollTop,
        element.scrollHeight - element.clientHeight,
      ]);
    /** Turns the wheel down over the visible middle of an element, more than it can scroll. */
    const wheelOver = async (locator: Locator) => {
      const box = (await locator.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, (box.y + Math.min(box.y + box.height, 300)) / 2);
      for (let turn = 0; turn < 12; turn += 1) await page.mouse.wheel(0, 200);
    };
    /** Scrolled to its end, which is further than it shows. */
    const atEnd = async (locator: Locator) => {
      await expect
        .poll(async () => {
          const [top, most] = await scroll(locator);
          return most > 0 && top >= most - 1;
        })
        .toBe(true);
    };

    // The tree scrolls itself, to its last node.
    const tree = panel.getByRole('tree', { name: 'Layout nodes' });
    await wheelOver(tree);
    await atEnd(tree);
    await expect(tree.getByRole('treeitem', { name: /box "hidden"/ })).toBeInViewport();
    // The inspector's column scrolls the details, and the readout.
    await tree.getByRole('treeitem', { name: /row "painted"/ }).click();
    const details = panel.getByRole('tabpanel', { name: 'Details' });
    await expect(details.getByRole('region', { name: 'Details of row "painted"' })).toBeVisible();
    await wheelOver(details);
    await atEnd(details);
    await panel.getByRole('tab', { name: 'Readout' }).click();
    const readout = panel.getByRole('tabpanel', { name: 'Readout' });
    await expect(readout.locator('pre')).toContainText('problems (2):');
    await readout.evaluate((element) => element.scrollTo(0, 0));
    await wheelOver(readout);
    await atEnd(readout);
    // The device menu, taller than the window, scrolls to its last device.
    await panel.getByRole('button', { name: 'Responsive', exact: true }).click();
    await page.getByRole('menuitemcheckbox', { name: /^Responsive frame/ }).click();
    await page.getByRole('menuitem', { name: /^Device/ }).click();
    const menu = page.getByRole('menu', { name: 'Device' });
    await wheelOver(menu);
    await atEnd(menu);
    await expect(menu.getByRole('menuitemradio').last()).toBeInViewport();
    // Escape closes the device menu, then the Responsive one, or both at once in some engines;
    // dev mode stays open.
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    if (await page.getByRole('menu').count()) await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(panel).toBeVisible();
    // The wheel past the columns' ends, or where nothing in dev mode scrolls, leaves the page under
    // it where it was.
    await wheelOver(panel.getByRole('heading', { name: 'Nodes' }));
    await wheelOver(panel.getByRole('toolbar', { name: '3D view' }));
    expect(await scrollY()).toBe(0);

    // Closed, dev mode leaves nothing that stops the page scrolling. Focus leaves the Responsive
    // button first, whose tooltip Escape would close before dev mode.
    await page.mouse.move(640, 290);
    await panel.focus();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    expect(
      await page.evaluate(() =>
        [document.documentElement, document.body, document.querySelector('.env-theme')!].map(
          (element) => {
            const style = getComputedStyle(element);
            return `${style.overflow} ${style.pointerEvents} ${style.touchAction} ${(element as HTMLElement).inert}`;
          },
        ),
      ),
    ).toEqual(Array(3).fill('visible auto auto false'));
    await page.mouse.move(640, 150);
    await page.mouse.wheel(0, 200);
    await expect.poll(scrollY).toBeGreaterThan(0);
  },
);

test(
  'the wheel in the 3D view scrolls what is under the pointer in the root, and Ctrl+wheel zooms',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    // The page is the root, inside a scaffold that scrolls; its clipped column scrolls too.
    await page.goto(`${fixtureUrl}/?fixture=dev-mode&root=.dev-page`);
    await page.waitForFunction(() => window.envui?.layout !== undefined);
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `.dev-scaffold { block-size: 20rem; overflow: auto; }
        .dev-clip { overflow: auto; }`;
      // After the fixture's own style sheet, so these rules win.
      document.body.append(style);
      const tall = (rem: number) => {
        const spacer = document.createElement('div');
        spacer.style.flex = `none`;
        spacer.style.blockSize = `${rem}rem`;
        return spacer;
      };
      document.querySelector('.dev-clip')!.append(tall(20));
      document.querySelector('.dev-page')!.append(tall(40));
    });
    const scaffold = page.locator('.dev-scaffold');
    const root = page.locator('.dev-page');
    const clip = page.locator('.dev-clip');
    const scrollTop = (locator: Locator) => locator.evaluate((element) => element.scrollTop);
    const panel = await openOver(page);
    const scene = panel.locator('.env-dev-scene');
    const zoom = async () =>
      Number(/scale\(([\d.]+)\)/.exec((await scene.getAttribute('style')) ?? '')?.[1]);
    const plane = (name: string) =>
      panel
        .locator('.env-dev-plane[data-plane]')
        .filter({ has: page.locator(':scope > .env-dev-name', { hasText: name }) });
    await turnTo(page, panel, 'Front');
    /**
     * Rests the pointer on a plane, near its bottom edge, clear of the planes above it; again
     * while the planes still move to where the page now is.
     */
    const restOn = (name: string) =>
      expect(async () => {
        const box = (await plane(name).boundingBox())!;
        await page.mouse.move(box.x + 6, box.y + box.height - 4);
        await page.mouse.move(box.x + 8, box.y + box.height - 6);
        await expect(plane(name)).toHaveAttribute('data-hovered', '', { timeout: 500 });
      }).toPass();

    // Over a node in a scroller, the wheel scrolls it.
    await restOn('column "clipped"');
    await page.mouse.wheel(0, 100);
    await expect.poll(() => scrollTop(clip)).toBeGreaterThan(0);
    // Over a node nothing in the root scrolls, the wheel zooms; what is outside the root stays.
    const before = await zoom();
    await restOn('row "painted"');
    await page.mouse.wheel(0, 100);
    await expect.poll(zoom).toBeLessThan(before);
    expect(await scrollTop(scaffold)).toBe(0);
    // Ctrl+wheel zooms anywhere.
    const out = await zoom();
    await restOn('column "clipped"');
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -100);
    await page.keyboard.up('Control');
    await expect.poll(zoom).toBeGreaterThan(out);

    // With a height from a device, the root scrolls in it, as a window would.
    await pickDevice(page, panel, /^iPhone SE/);
    await expect(root).toHaveCSS('overflow-y', 'auto');
    await turnTo(page, panel, 'Tilted');
    await restOn('row "painted"');
    await page.mouse.wheel(0, 200);
    await expect.poll(() => scrollTop(root)).toBeGreaterThan(0);
    expect(await scrollTop(scaffold)).toBe(0);

    // Closed, the root is as it was, and the page scrolls again.
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    expect(await root.evaluate((element) => element.hasAttribute('style'))).toBe(false);
    const box = (await scaffold.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 200);
    await expect.poll(() => scrollTop(scaffold)).toBeGreaterThan(0);
  },
);

test('each control has one place: no two controls share a name', async ({ page }) => {
  await open(page);
  const panel = await openOver(page);
  /** The names of the buttons and menu items showing, in the panel and its popups. */
  const names = () =>
    page
      .locator('[data-env-dev-host]')
      .getByRole('button')
      .or(page.locator('[data-env-dev-host]').getByRole('menuitem'))
      .or(page.locator('[data-env-dev-host]').getByRole('menuitemcheckbox'))
      .or(page.locator('[data-env-dev-host]').getByRole('menuitemradio'))
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length > 0)
          .map(
            (element) =>
              element.getAttribute('aria-label') ??
              element.textContent?.replace(/\s+/g, ' ').trim() ??
              '',
          ),
      );
  const unique = (list: string[]) => expect(list.length).toBe(new Set(list).size);
  await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(15);
  unique(await names());
  // Nor with a dropdown open: the View dropdown's angles are named once, and nothing else in it
  // repeats one.
  for (const dropdown of ['View', 'Show', 'Responsive', 'View settings']) {
    await panel.getByRole('button', { name: dropdown, exact: true }).click();
    await expect(
      page.locator('[data-env-dev-host] [role=dialog], [data-env-dev-host] [role=menu]'),
    ).toBeVisible();
    unique(await names());
    await page.keyboard.press('Escape');
  }
});

test(
  'the frame lays the page out wider than the window, whole, and its planes keep their surfaces',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page);
    const panel = await openOver(page);
    await pickDevice(page, panel, /^Full HD/);
    // The root is 1920 px wide in a window of 1280: its planes are as wide, cut off by nothing
    // around the root.
    const widest = () =>
      panel
        .locator('.env-dev-plane[data-plane]')
        .evaluateAll((planes) =>
          Math.max(...planes.map((plane) => parseFloat((plane as HTMLElement).style.width))),
        );
    await expect.poll(widest).toBe(1920);
    // Once the page settles, every plane carries a copy of its node at the node's size.
    await expect
      .poll(() =>
        panel.locator('.env-dev-plane[data-plane]').evaluateAll(
          (planes) =>
            planes.filter((plane) => {
              const surface = plane.querySelector<HTMLElement>('.env-dev-surface');
              return (
                surface &&
                Math.abs(
                  parseFloat(surface.style.width) - parseFloat((plane as HTMLElement).style.width),
                ) > 1
              );
            }).length,
        ),
      )
      .toBe(0);
  },
);

test('a sidebar widens well past half the window, and the readout fits it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 720 });
  await open(page);
  const panel = await openOver(page);
  const inspector = panel.getByRole('complementary', { name: 'Dev mode inspector' });
  const handle = (await panel
    .getByRole('separator', { name: 'Resize the inspector' })
    .boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(300, handle.y + handle.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await inspector.boundingBox())!.width).toBeGreaterThan(720);
  // Narrowed again, the readout's lines wrap inside it: nothing runs past its edge.
  await inspector.getByRole('separator', { name: 'Resize the inspector' }).dblclick();
  await panel.getByRole('tab', { name: 'Readout' }).click();
  const readout = panel.getByRole('tabpanel', { name: 'Readout' }).locator('pre');
  await expect(readout).toContainText('scaffold "app"');
  const fits = await readout.evaluate((element) => ({
    overflow: element.scrollWidth - element.clientWidth,
    inside:
      element.getBoundingClientRect().right <=
      element.closest('aside')!.getBoundingClientRect().right,
  }));
  expect(fits).toEqual({ overflow: 0, inside: true });
});
