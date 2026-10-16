import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

// Options for dense, document-centred applications: compact menus, code in the app's code theme
// and tabs that fill a region.

/** The computed display of the panel each tab of a tab list controls, in order. */
function panelDisplays(page: Page, list: string) {
  return page.getByRole('tablist', { name: list, exact: true }).evaluate((element) =>
    [...element.querySelectorAll('[role="tab"]')].map((tab) => {
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      return panel ? getComputedStyle(panel).display : 'missing';
    }),
  );
}

test('a compact menu has shorter rows on a raised popup than a standard menu', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/menu/preview`);
  // The account menu of the overview is standard; the compact density example is compact.
  await page
    .getByRole('group', { name: 'Menu example' })
    .getByRole('button', { name: 'Open account menu' })
    .click();
  const standard = page.getByRole('menu', { name: 'Account', exact: true });
  await expect(standard).not.toHaveAttribute('data-density');
  await expect(standard).not.toHaveAttribute('data-starting-style');
  // Rows reach their size once the popup has grown in.
  const standardRow = standard.getByRole('menuitem', { name: 'Preferences' });
  await expect
    .poll(async () => Math.round((await standardRow.boundingBox())!.height))
    .toBeGreaterThanOrEqual(48);
  const standardHeight = (await standardRow.boundingBox())!.height;
  await page.keyboard.press('Escape');
  await expect(standard).toBeHidden();
  await page
    .getByRole('group', { name: 'Compact density example' })
    .getByRole('button', { name: 'Document', exact: true })
    .click();
  const compact = page.getByRole('menu', { name: 'Document', exact: true });
  await expect(compact).toHaveAttribute('data-density', 'compact');
  await expect(compact).not.toHaveAttribute('data-starting-style');
  await expect
    .poll(async () =>
      Math.round((await compact.getByRole('menuitem', { name: 'Save' }).boundingBox())!.height),
    )
    .toBe(28);
  expect(28).toBeLessThan(standardHeight);
  expect(
    await compact.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderTopWidth),
    ),
  ).toBeGreaterThan(0);
  await expect(compact.getByRole('separator')).toHaveCount(1);
  await compact.getByRole('menuitem', { name: 'Save' }).click();
  await expect(compact).toBeHidden();
});

test('inline code and code blocks take the Pierre code theme of the app theme', async ({
  page,
}) => {
  await page.goto(`${catalogueUrl}/#/components/code/preview`);
  const inline = page.locator('code.env-code', { hasText: 'c9f60ee' }).first();
  const block = page.locator('.env-code-block').first();
  await expect(inline).toBeVisible();
  const background = (locator: typeof inline) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor);
  // Pierre Light's sidebar grey, which stands out on the white canvas, then Pierre Dark's editor.
  for (const [theme, color] of [
    ['light', 'rgb(245, 245, 245)'],
    ['dark', 'rgb(10, 10, 10)'],
  ] as const) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect.poll(() => background(inline), theme).toBe(color);
    await expect.poll(() => background(block), theme).toBe(color);
  }
});

test('filling tabs give the selected panel the height left below the list', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/components/tabs/overview`);
  const example = page.locator('.docs-live-example[data-example="FillARegion"]');
  const canvas = example.getByRole('tabpanel', { name: 'Canvas' }).locator(':scope > *').first();
  await expect(canvas).toBeVisible();
  // The example's region, which has a height of its own.
  const region = await example.locator(':scope > div').first().boundingBox();
  const list = await example.getByRole('tablist', { name: 'Diagram views' }).boundingBox();
  const box = await canvas.boundingBox();
  // The canvas reaches the bottom of the region and starts below the list.
  expect(Math.abs(box!.y + box!.height - (region!.y + region!.height))).toBeLessThanOrEqual(2);
  expect(box!.y).toBeGreaterThan(list!.y + list!.height - 1);
  expect(box!.height).toBeGreaterThan(100);
});

test('filling tabs that keep inactive panels mounted display only the selected panel', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=fill-tabs`);
  for (const theme of ['light', 'dark']) {
    // Tabs nested in a filling panel keep their own layout, and their hidden panel stays hidden.
    await expect
      .poll(() => panelDisplays(page, `Canvas layers ${theme}`))
      .toEqual(['block', 'none']);
    // Alone, and vertical with the list beside a heading through renderList.
    for (const name of [`Filling views ${theme}`, `Vertical filling views ${theme}`]) {
      await expect.poll(() => panelDisplays(page, name)).toEqual(['flex', 'none', 'none']);
      await page
        .getByRole('tablist', { name, exact: true })
        .getByRole('tab', { name: 'History' })
        .click();
      // The outgoing panel is hidden once it has faded out.
      await expect.poll(() => panelDisplays(page, name)).toEqual(['none', 'none', 'flex']);
    }
  }
});

test('a compact surface gives its controls the compact height', async ({ page }) => {
  // The density specimen shows the same toolbar on a standard and a compact surface.
  await page.goto(`${catalogueUrl}/#/components/surface/guidelines`);
  const height = async (toolbar: string, name: string) =>
    (await page.getByRole('group', { name: toolbar }).getByRole('button', { name }).boundingBox())!
      .height;
  expect(await height('Compact toolbar', 'Fit')).toBeLessThan(
    await height('Standard toolbar', 'Fit'),
  );
  expect(await height('Compact toolbar', 'Zoom in')).toBeLessThan(
    await height('Standard toolbar', 'Zoom in'),
  );
  await expect(page.getByRole('group', { name: 'Compact toolbar' })).toHaveAttribute(
    'data-density',
    'compact',
  );
});
