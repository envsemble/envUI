import { test, expect, type Page } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

/** The computed display of the panel each tab of a tab list controls, in order. */
function panelDisplays(page: Page, list: string) {
  return page.getByRole('tablist', { name: list, exact: true }).evaluate((element) =>
    [...element.querySelectorAll('[role="tab"]')].map((tab) => {
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      return panel ? getComputedStyle(panel).display : 'missing';
    }),
  );
}

test('compact tabs make the whole rail as tall as a compact control', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=compact-tabs`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`compact-tabs-${theme}`);
    const control = (await scope.getByTestId(`compact-control-${theme}`).boundingBox())!;
    const rail = (await scope.getByRole('tablist').boundingBox())!;
    expect(Math.abs(rail.height - control.height), theme).toBeLessThan(1);
    // The counter fits inside its tab, centred on the label's line.
    const tab = (await scope.getByRole('tab', { name: /Submissions/ }).boundingBox())!;
    const counter = (await scope.locator('.env-counter-badge').boundingBox())!;
    expect(counter.y).toBeGreaterThanOrEqual(tab.y);
    expect(counter.y + counter.height).toBeLessThanOrEqual(tab.y + tab.height);
    const label = await scope.getByRole('tab', { name: /Submissions/ }).evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node.firstChild!);
      return range.getBoundingClientRect();
    });
    expect(
      Math.abs(counter.y + counter.height / 2 - (label.y + label.height / 2)),
      theme,
    ).toBeLessThan(1.5);
  }
});

test('the arrow keys follow the text direction, from dir or from EnvUIProvider', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=rtl-tabs`);
  for (const name of ['Right-to-left tabs', 'Provider tabs']) {
    const list = page.getByRole('tablist', { name });
    await list.getByRole('tab', { name: 'One' }).focus();
    // In right-to-left text the next tab is to the left.
    await page.keyboard.press('ArrowLeft');
    await expect(list.getByRole('tab', { name: 'Two' })).toBeFocused();
    await expect(list.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'One' })).toBeFocused();
  }
});

test('a panel keeps the direction around it, not the tab list’s', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=rtl-tabs`);
  const slider = page.getByRole('slider', { name: 'Volume' });
  await slider.focus();
  // The slider is in a left-to-right region, so → raises it.
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '51');
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
