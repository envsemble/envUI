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
    /^scaffold "app" · [\d.]+×[\d.]+rem · expanded · container env-scaffold \(queried at 37\.5rem\)/m,
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

test('the toggle opens the 3D view and the inspector, and the shortcut closes them', async ({
  page,
}) => {
  await open(page);
  const toggle = page.getByRole('button', { name: 'Dev mode' });
  await toggle.click();
  const panel = page.getByRole('region', { name: 'Dev mode' });
  await expect(panel).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  // A plane for every shown node, each carrying copies of what the node holds.
  await expect(panel.locator('.env-dev-plane[data-plane]')).toHaveCount(12);
  await expect(panel.locator('.env-dev-plane[data-problems]')).toHaveCount(2);
  await expect(panel.locator('.env-dev-surface').filter({ hasText: 'Painted' })).toHaveCount(1);
  // The inspector lists the nodes and shows the selected one.
  await panel.getByRole('treeitem', { name: /row "painted"/ }).click();
  await expect(panel.getByRole('region', { name: 'Details of row "painted"' })).toContainText(
    'Layout never paints',
  );
  await panel.getByRole('tab', { name: 'Readout' }).click();
  await expect(panel.getByRole('tabpanel', { name: 'Readout' }).locator('pre')).toContainText(
    'scaffold "app"',
  );
  // The readout leaves dev mode's own UI out, also while it is open.
  expect(await page.evaluate(() => window.envui!.layout!.describe())).not.toContain('env-dev');
  await page.keyboard.press('Alt+Shift+D');
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});
