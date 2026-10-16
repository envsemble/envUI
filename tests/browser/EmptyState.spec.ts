import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('a centred empty state sits in the middle of the room its region gives it', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=empty-states`);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      const region = page.getByTestId(`empty-region-${theme}`);
      const state = region.locator('.env-empty-state');
      const regionBox = (await region.boundingBox())!;
      const regionMiddle = regionBox.x + regionBox.width / 2;
      // The icon, the heading and the action share the region's centre line.
      for (const part of [
        state.locator(':scope > .env-symbol'),
        state.getByRole('heading', { name: `No submissions yet ${theme}`, level: 2 }),
        state.getByRole('button', { name: `New form ${theme}` }),
      ]) {
        const box = (await part.boundingBox())!;
        expect(Math.abs(box.x + box.width / 2 - regionMiddle), `${theme}/${width}`).toBeLessThan(1);
      }
      // The content is centred vertically in the region's height too.
      const icon = (await state.locator(':scope > .env-symbol').boundingBox())!;
      const action = (await state.getByRole('button').boundingBox())!;
      const above = icon.y - regionBox.y;
      const below = regionBox.y + regionBox.height - (action.y + action.height);
      expect(Math.abs(above - below), `${theme}/${width}`).toBeLessThan(1);
      // The icon is larger than a start-aligned state's, and quieter than the text.
      const startIcon = (await page
        .getByTestId(`empty-start-${theme}`)
        .locator(':scope > .env-symbol')
        .boundingBox())!;
      expect(icon.width).toBeGreaterThan(startIcon.width * 2);
      const [iconColor, textColor] = await state.evaluate((element) => [
        getComputedStyle(element.querySelector(':scope > .env-symbol')!).color,
        getComputedStyle(element.querySelector('h2')!).color,
      ]);
      expect(iconColor).not.toBe(textColor);
      // An error keeps its error icon color and is still announced.
      const error = page.getByTestId(`empty-error-${theme}`);
      await expect(error).toHaveAttribute('role', 'alert');
      const [errorIconColor, errorFieldColor] = await error.evaluate((element) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--env-color-fg-danger)';
        element.append(probe);
        const colors = [
          getComputedStyle(element.querySelector(':scope > .env-symbol')!).color,
          getComputedStyle(probe).color,
        ];
        probe.remove();
        return colors;
      });
      expect(errorIconColor).toBe(errorFieldColor);
    }
  }
});

test('an empty state stays aligned to the start by default', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=empty-states`);
  const state = page.getByTestId('empty-start-light');
  const stateBox = (await state.boundingBox())!;
  const heading = (await state.getByRole('heading').boundingBox())!;
  const padding = await state.evaluate((element) =>
    parseFloat(getComputedStyle(element).paddingLeft),
  );
  expect(Math.abs(heading.x - (stateBox.x + padding))).toBeLessThan(1);
});
