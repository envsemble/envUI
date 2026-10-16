import { test, expect } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

test('cards provide native keyboard activation, focus and disabled behavior in both themes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  let activations = 0;
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`layout-${theme}`);
    const action = scope.getByTestId('clickable-action');
    await expect(action).toHaveAttribute('type', 'button');
    await action.focus();
    await page.keyboard.press('Space');
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));
    await page.keyboard.press('Enter');
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));
    expect(await action.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    await action.click({ position: { x: (await action.boundingBox())!.width / 2, y: 8 } });
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));

    const link = scope.getByTestId('clickable-link');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#destination$/);
    await expect(scope.getByTestId('disabled-card')).toBeDisabled();
    const disabledLink = scope.getByTestId('disabled-card-link');
    await expect(disabledLink).not.toHaveAttribute('href');
    await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledLink).toHaveAttribute('tabindex', '-1');
    await disabledLink.dispatchEvent('click');
    await expect(page).toHaveURL(/#destination$/);
    await expect(action.getByTestId('card-activations')).toHaveText(String(activations));
  }
  expect(errors).toEqual([]);
});

test('overview cards are single named links, including their padding', async ({ page }) => {
  await page.goto(`${catalogueUrl}/#/overview`);
  const catalogue = page.locator('.docs-catalogue-grid');
  const card = catalogue.getByRole('link', { name: 'Card', exact: true });
  await expect(card).toHaveAccessibleDescription(
    'A content surface with automatic spacing and optional actions.',
  );
  await expect(catalogue.locator('a a, a button')).toHaveCount(0);
  await expect(catalogue.getByText(/^Explore /)).toHaveCount(0);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await card.click({ position: { x: (await card.boundingBox())!.width / 2, y: 8 } });
  await expect(page).toHaveURL(/#\/components\/card\/preview$/);
});
