import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

// The env-window container: the outermost theme boundary takes the width its context gives it,
// so it never collapses where its parent sizes to content, nested boundaries are no containers,
// a region opts in with a primitive's container prop, and popups measure their portal's boundary.
// The fixture's own root is a Theme; the boundaries outside it are added to the body.

/** Adds markup to the end of the body, outside the fixture's own Theme. */
async function append(page: Page, html: string) {
  await page.evaluate((markup) => {
    const holder = document.createElement('div');
    holder.innerHTML = markup;
    document.body.append(...holder.children);
  }, html);
}

const width = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => element.getBoundingClientRect().width);

const containerType = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => getComputedStyle(element).containerType);

test('the outermost boundary is the window and never collapses, nested ones size to content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  await expect(page.getByTestId('primitives')).toBeVisible();
  await append(
    page,
    `<div id="centered-root" style="display: grid; place-items: center; inline-size: 40rem">
       <div class="env-theme" data-env-theme="light" id="centered-theme">An application</div>
     </div>
     <div data-env-layout="row" id="outer-row" style="inline-size: 40rem">
       <div class="env-theme" data-env-theme="dark" id="outer-island">Dark island</div>
       <span>Beside it</span>
     </div>`,
  );
  // A Theme that is the application's root, in a parent that centres it: as wide as the parent.
  expect(await width(page, '#centered-theme')).toBeCloseTo(640, 0);
  expect(await containerType(page, '#centered-theme')).toBe('inline-size');
  // An outermost Theme in a row shares the row instead of collapsing.
  expect(await width(page, '#outer-island')).toBeGreaterThan(100);
  // The fixture's own root Theme is the window; a Theme inside it, such as a dark island in a Row,
  // sizes to its content and is no container.
  const root = page.locator('#root > .env-theme');
  expect(await root.evaluate((element) => getComputedStyle(element).containerName)).toBe(
    'env-window',
  );
  await page.evaluate(() => {
    const row = document.createElement('div');
    row.dataset.envLayout = 'row';
    row.id = 'nested-row';
    row.innerHTML =
      '<div class="env-theme" data-env-theme="dark" id="nested-island">Dark island</div><span>Beside it</span>';
    document.querySelector('[data-testid="primitives"]')!.append(row);
  });
  expect(await containerType(page, '#nested-island')).toBe('normal');
  const islandWidth = await width(page, '#nested-island');
  expect(islandWidth).toBeGreaterThan(40);
  expect(islandWidth).toBeLessThan(await width(page, '#nested-row'));
});

test('a primitive with container="env-window" is the window of what it holds', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  await expect(page.getByTestId('primitives')).toBeVisible();
  await page.addStyleTag({
    content:
      '@layer env.components { @container env-window (width >= 37.5rem) { .window-probe { --window-probe: medium; } } }',
  });
  await page.evaluate(() => {
    const scope = document.querySelector('[data-testid="primitives"]')!;
    scope.insertAdjacentHTML(
      'beforeend',
      `<div data-env-layout="box" data-env-container style="--env-layout-container: env-window; inline-size: 30rem">
         <span class="window-probe" id="narrow-probe">Narrow</span>
       </div>
       <span class="window-probe" id="page-probe">Page</span>`,
    );
  });
  const probe = (id: string) =>
    page
      .locator(id)
      .evaluate((element) => getComputedStyle(element).getPropertyValue('--window-probe'));
  // A 30 rem region is compact, though the page around it is not.
  expect(await probe('#narrow-probe')).toBe('');
  expect(await probe('#page-probe')).toBe('medium');
});

test('a date picker stacks its time under the calendar in a compact window', async ({ page }) => {
  for (const [viewport, beside] of [
    [1024, true],
    [480, false],
  ] as const) {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto(`${fixtureUrl}/?fixture=date-picker`);
    await page.getByRole('combobox', { name: 'Meeting light', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Meeting light' });
    await expect(dialog).toBeVisible();
    // The popup's portal boundary is the window, as wide as the document's body.
    expect(
      await dialog.evaluate(
        (element) => getComputedStyle(element.closest('.env-popup-theme')!).containerName,
      ),
    ).toBe('env-window');
    await expect(async () => {
      const calendar = (await dialog.locator('.env-calendar').boundingBox())!;
      const time = (await dialog.locator('.env-date-picker-time').boundingBox())!;
      if (beside) expect(time.x).toBeGreaterThan(calendar.x + calendar.width - 1);
      else expect(time.y).toBeGreaterThan(calendar.y + calendar.height - 1);
    }).toPass();
  }
});
