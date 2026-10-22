import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
// The type brings dev mode's `window.envui` with it.
import type { LayoutProblem } from '@envsemble/envui/dev';

/** The page's `envui.layout`, once dev mode has installed it. */
async function open(page: Page) {
  await page.goto(`${fixtureUrl}/?fixture=dev-mode`);
  await page.waitForFunction(() => window.envui?.layout !== undefined);
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

test('the toggle opens the 3D view and the inspector, which Escape and the shortcut close', async ({
  page,
}) => {
  await open(page);
  const toggle = page.getByRole('button', { name: 'Dev mode', exact: true });
  await toggle.click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  await expect(panel).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  // Focus moves into the panel, and the page under it is inert.
  const pageInert = () =>
    page.evaluate(() => (document.querySelector('.env-theme') as HTMLElement).inert);
  await expect(panel).toBeFocused();
  expect(await pageInert()).toBe(true);
  // A plane for every shown node, each carrying copies of what the node holds.
  await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(14);
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
  // Escape closes it and gives focus back; the shortcut opens and closes it too.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(toggle).toBeFocused();
  expect(await pageInert()).toBe(false);
  await page.keyboard.press('Alt+Shift+D');
  await expect(panel).toBeFocused();
  await page.keyboard.press('Alt+Shift+D');
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test(
  'the toolbar turns the view to each direction, and fits it',
  { tag: '@engines' },
  async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Dev mode', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Dev mode' });
    const toolbar = panel.getByRole('toolbar', { name: '3D view' });
    const scene = panel.locator('.env-dev-scene');
    await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(14);
    const turn = (rx: number, ry: number) => `rotateX(${rx}deg) rotateY(${ry}deg)`;
    // Each view is an icon button named by its label, which its tooltip shows.
    const views: [string, string][] = [
      ['Tilted', turn(38, -22)],
      ['Straight on', turn(0, 0)],
      ['From the top', turn(-70, 0)],
      ['From the left', turn(0, 70)],
      ['From the right', turn(0, -70)],
    ];
    for (const [name, rotation] of views) {
      await toolbar.getByRole('button', { name, exact: true }).click();
      await expect.poll(() => scene.getAttribute('style')).toContain(rotation);
    }
    await toolbar.getByRole('button', { name: 'Straight on' }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('Straight on');
    // Fit turns it back to the tilted view, the whole page in view.
    await toolbar.getByRole('button', { name: 'Fit' }).click();
    await expect(scene).toHaveAttribute('style', /rotateX\(38deg\) rotateY\(-22deg\)/);
    // The arrow keys move between the toolbar's buttons.
    await toolbar.getByRole('button', { name: 'Straight on' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'From the top' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(scene).toHaveAttribute('style', /rotateX\(-70deg\) rotateY\(0deg\)/);
  },
);

test('"only the selected" shows the selected node and what is inside it', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Dev mode', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  const planes = panel.locator('.env-dev-plane[data-plane]');
  const only = panel.getByRole('button', { name: 'Only the selected' });
  await expect(planes).toHaveCount(14);
  // On, with nothing selected, every plane shows, also under the pointer.
  await only.click();
  await expect(only).toHaveAttribute('aria-pressed', 'true');
  await planes.first().hover({ force: true });
  await expect(planes).toHaveCount(14);
  // Selecting the cards' row shows it and its three cards; another node, that one alone.
  await panel.getByRole('treeitem', { name: /row "cards"/ }).click();
  await expect(planes).toHaveCount(4);
  await expect(panel.locator('.env-dev-plane[data-selected]')).toHaveCount(1);
  await panel.getByRole('treeitem', { name: /row "painted"/ }).click();
  await expect(planes).toHaveCount(1);
  // Clicking the selected row again clears the selection, and everything shows.
  await panel.getByRole('treeitem', { name: /row "painted"/ }).click();
  await expect(planes).toHaveCount(14);
  // Off, the selection no longer filters.
  await panel.getByRole('treeitem', { name: /row "cards"/ }).click();
  await only.click();
  await expect(only).toHaveAttribute('aria-pressed', 'false');
  await expect(planes).toHaveCount(14);
});

test(
  'the frame lays the page out at another size, not the viewport',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page);
    await page.getByRole('button', { name: 'Dev mode', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Dev mode' });
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
    await expect(right).toHaveAttribute('aria-valuenow', String(Math.round(ownWidth)));

    // A device lays the page out at its size, and the planes follow; the window and the view keep
    // theirs.
    await panel.getByRole('button', { name: 'Device' }).click();
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
    // Rotate swaps the width and the height.
    await panel.getByRole('button', { name: 'Rotate' }).click();
    await expect.poll(rootSize).toBe('667×375');
    await expect(label).toContainText('667×375px · 41.69×23.44rem · medium');

    // The arrow keys on an edge step by 1rem, with Shift by 5rem; stepping makes it a free frame.
    await bottom.focus();
    await page.keyboard.press('ArrowUp');
    await expect.poll(rootSize).toBe('667×391');
    await expect(label).toHaveText('667×391px · 41.69×24.44rem · medium');
    await right.focus();
    await page.keyboard.press('Shift+ArrowLeft');
    await expect.poll(rootWidth).toBe(587);
    // Dragging the right edge to the left narrows it, with the whole frame in view.
    await panel.getByRole('button', { name: 'Fit' }).click();
    const box = (await right.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 40, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect.poll(rootWidth).toBeLessThan(587);

    // Back to the page's own size: the root's style is as it was.
    await panel.getByRole('button', { name: "Back to the page's own size" }).click();
    await expect.poll(rootSize).toBe(own);
    expect(await root.evaluate((element) => element.hasAttribute('style'))).toBe(false);
    // Closing dev mode with a size set puts it back too.
    await bottom.focus();
    await page.keyboard.press('Shift+ArrowUp');
    await expect.poll(rootSize).not.toBe(own);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    expect(await rootSize()).toBe(own);
    expect(await root.evaluate((element) => element.hasAttribute('style'))).toBe(false);
  },
);

test("dev mode switches the page's theme, and gives it back as it closes", async ({ page }) => {
  await open(page);
  const toggle = page.getByRole('button', { name: 'Dev mode', exact: true });
  await toggle.click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  const boundary = page.locator('.env-theme:not([data-env-dev] *)').first();
  const ownTheme = await boundary.getAttribute('data-env-theme');
  const ownContrast = await boundary.getAttribute('data-env-contrast');
  const devTheme = await page.locator('.env-dev').getAttribute('data-env-theme');
  const surfaces = panel.locator('.env-dev-surface');
  const surfaceColor = () =>
    surfaces.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).color).join(),
    );
  const before = await surfaceColor();

  await panel.getByRole('button', { name: 'Page theme' }).click();
  await page.getByRole('menuitemradio', { name: 'Dark' }).click();
  await expect(boundary).toHaveAttribute('data-env-theme', 'dark');
  await panel.getByRole('button', { name: 'Page theme' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'High contrast' }).click();
  await expect(boundary).toHaveAttribute('data-env-contrast', 'high');
  // The check item leaves its menu open; Escape closes the menu first.
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  // Dev mode's own UI keeps its theme, and the planes copy the page again in its new colors.
  await expect(page.locator('.env-dev')).toHaveAttribute('data-env-theme', devTheme!);
  await expect.poll(surfaceColor).not.toBe(before);

  // Closing dev mode gives the page its own theme back.
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  expect(await boundary.getAttribute('data-env-theme')).toBe(ownTheme);
  expect(await boundary.getAttribute('data-env-contrast')).toBe(ownContrast);
});

test('the side columns hide and show, and the view takes their room', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Dev mode', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  const toolbar = panel.getByRole('toolbar', { name: '3D view' });
  const tree = panel.getByRole('complementary', { name: 'Layout nodes' });
  const inspector = panel.getByRole('complementary', { name: 'Dev mode inspector' });
  const view = panel.locator('.env-dev-view');
  const width = async () => (await view.boundingBox())!.width;
  const both = await width();
  await toolbar.getByRole('button', { name: 'Nodes', exact: true }).click();
  await expect(tree).toBeHidden();
  await expect(toolbar.getByRole('button', { name: 'Nodes', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await inspector.getByRole('button', { name: 'Hide the inspector' }).click();
  await expect(inspector).toBeHidden();
  expect(await width()).toBe(page.viewportSize()!.width);
  await toolbar.getByRole('button', { name: 'Nodes', exact: true }).click();
  await toolbar.getByRole('button', { name: 'Inspector', exact: true }).click();
  await expect(tree).toBeVisible();
  await expect(inspector).toBeVisible();
  expect(await width()).toBe(both);
  // The inspector's two documents close one by one, and closing the last hides it.
  await inspector.getByRole('tab', { name: 'Details' }).click();
  await page.keyboard.press('Delete');
  await expect(inspector.getByRole('tab')).toHaveCount(1);
  await expect(inspector.getByRole('tabpanel', { name: 'Readout' })).toBeVisible();
  await page.keyboard.press('Delete');
  await expect(inspector).toBeHidden();
  await toolbar.getByRole('button', { name: 'Inspector', exact: true }).click();
  await expect(inspector.getByRole('tab')).toHaveCount(2);
});

test('the legend floats over the view, with no pane behind it', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Dev mode', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  const legend = panel.locator('.env-dev-view').getByRole('group', { name: 'Legend' });
  await expect(legend).toContainText('scaffold');
  await expect(legend).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(legend).toHaveCSS('border-style', 'none');
  await expect(legend).toHaveCSS('pointer-events', 'none');
  // Colored by window class, it names the classes.
  await panel.getByRole('button', { name: 'Color by window class' }).click();
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
