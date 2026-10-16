/**
 * Scale and size: every control of one size has the same height in a scale, in both scales, and
 * the scale's control heights are the token tables' (docs/foundations/scale.md). The density
 * fixture's sizes section holds one row per size of every control that takes a size, in a
 * comfortable and a compact Theme. Under a coarse pointer controls keep their size and gain a hit
 * area of the touch height.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';
import { controlSizes, densityScales } from '../fixture/DensitySections';
import { fixtureUrl } from './Servers';

/** The control heights of each scale, in CSS pixels at the default 16 px root. */
const heights = {
  comfortable: { sm: 32, md: 40, lg: 48 },
  compact: { sm: 26, md: 32, lg: 38 },
} as const;

async function openSizes(page: Page, theme = 'light') {
  await page.goto(`${fixtureUrl}/?fixture=density&section=sizes&theme=${theme}`);
  await expect(page.locator('[data-density-section="sizes"]')).toBeVisible();
}

/**
 * The outer box of each control in a row: buttons (Button, IconButton, CopyButton, Select's
 * trigger and Pagination's buttons), the wells of TextField, SearchField, Combobox and DatePicker,
 * and the SegmentedControl's rail, with a name for the failure message.
 */
async function controlBoxes(row: Locator) {
  return row.evaluate((element) =>
    [
      ...element.querySelectorAll<HTMLElement>(
        '.env-button, .env-text-field-well, .env-segmented-control',
      ),
    ]
      // Buttons inside a field or a rail are its parts, not controls of the row.
      .filter((control) => !control.parentElement?.closest('.env-text-field-well'))
      .map((control) => ({
        name:
          control.getAttribute('aria-label') ||
          control.className.split(' ').find((name) => name.startsWith('env-')) ||
          control.tagName,
        height: Math.round(control.getBoundingClientRect().height * 100) / 100,
      })),
  );
}

for (const scale of densityScales)
  for (const size of controlSizes)
    test(`every control of size ${size} is ${heights[scale][size]} px tall in the ${scale} scale`, async ({
      page,
    }) => {
      await openSizes(page);
      const row = page.locator(`[data-density-scale="${scale}"] [data-size-row="${size}"]`);
      const boxes = await controlBoxes(row);
      // Button, IconButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl,
      // CopyButton and Pagination's two buttons.
      expect(boxes.length).toBeGreaterThanOrEqual(11);
      expect(boxes, `${scale} ${size}`).toEqual(
        boxes.map(({ name }) => ({ name, height: heights[scale][size] })),
      );
    });

test('each scale writes data-env-scale on its boundary, and nested Themes and popups keep it', async ({
  page,
}) => {
  await openSizes(page);
  for (const scale of densityScales)
    await expect(page.locator(`.env-theme[data-density-scale="${scale}"]`)).toHaveAttribute(
      'data-env-scale',
      scale,
    );
  // A Select opened in the compact boundary portals its list into a compact Theme.
  await page
    .locator('[data-density-scale="compact"] [data-size-row="md"]')
    .getByRole('combobox', { name: 'Plan', exact: true })
    .click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.locator('xpath=ancestor::*[contains(@class, "env-theme")][1]')).toHaveAttribute(
    'data-env-scale',
    'compact',
  );
  // The list grows in; its rows reach the compact row height once it has.
  const option = list.getByRole('option', { name: 'Team', exact: true });
  await expect
    .poll(() => option.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(28);
});

test.describe('on a coarse pointer', () => {
  test.use({ hasTouch: true });

  test('controls keep their size and gain a 44 px hit area, and fields grow to it', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    await openSizes(page);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const row = page.locator('[data-density-scale="compact"] [data-size-row="sm"]');
    const button = row.locator('[data-control="button"]');
    expect(await button.evaluate((element) => element.getBoundingClientRect().height)).toBe(26);
    const hitArea = await button.evaluate((element) => {
      const overlay = getComputedStyle(element, '::before');
      const box = element.getBoundingClientRect();
      return {
        height: box.height - 2 * parseFloat(overlay.top),
        width: box.width - 2 * parseFloat(overlay.left),
      };
    });
    expect(hitArea.height).toBe(44);
    expect(hitArea.width).toBeGreaterThanOrEqual(44);
    const field = row.locator('.env-text-field-well').first();
    expect(await field.evaluate((element) => element.getBoundingClientRect().height)).toBe(44);
  });
});
