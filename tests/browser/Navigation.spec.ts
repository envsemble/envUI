import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('navigation owns official icon fill without a second icon, including wrapped symbols', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`navigation-icons-${theme}`);
    const geometry = async (id: string) =>
      scope
        .getByTestId(id)
        .locator('path')
        .evaluateAll((paths) => paths.map((path) => path.getAttribute('d')));
    const homeOutline = await scope.getByTestId('home-outline').locator('path').getAttribute('d');
    const homeFilled = await scope.getByTestId('home-filled').locator('path').getAttribute('d');
    const settingsOutline = await scope
      .getByTestId('settings-outline')
      .locator('path')
      .getAttribute('d');
    const settingsFilled = await scope
      .getByTestId('settings-filled')
      .locator('path')
      .getAttribute('d');
    expect(homeOutline).not.toEqual(homeFilled);
    expect(settingsOutline).not.toEqual(settingsFilled);
    expect(await geometry('home-navigation')).toEqual([homeFilled]);
    expect(await geometry('settings-navigation')).toEqual([settingsOutline]);
    await scope.getByTestId('settings-navigation').click();
    expect(await geometry('home-navigation')).toEqual([homeOutline]);
    expect(await geometry('settings-navigation')).toEqual([settingsFilled]);
    await expect(scope.getByTestId('settings-navigation')).toHaveAttribute('aria-current', 'page');
    await expect(scope.getByTestId('custom-navigation').locator('circle')).toHaveCount(1);
    await scope.getByTestId('custom-navigation').click();
    await expect(scope.getByTestId('custom-navigation').locator('rect')).toHaveCount(1);
    expect(await geometry('settings-navigation')).toEqual([settingsOutline]);
    await scope.getByTestId('home-navigation').click();
    expect(await geometry('home-navigation')).toEqual([homeFilled]);
    await expect(scope.getByTestId('custom-navigation').locator('circle')).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test('icon-only navigation items show their label in one tooltip, without a native title', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const scope = page.getByTestId('navigation-icons-light');
  const item = scope.getByTestId('icon-only-navigation');
  await expect(item).toHaveAccessibleName('Home overview');
  await expect(item).not.toHaveAttribute('title');
  const tooltip = page.locator('.env-tooltip');
  await expect(tooltip).toHaveCount(0);
  await item.hover();
  await expect(tooltip).toHaveText('Home overview');
  await expect(tooltip).toHaveCount(1);
  // The tooltip sits at the item's inline end.
  const itemBox = (await item.boundingBox())!;
  const tooltipBox = (await tooltip.boundingBox())!;
  expect(tooltipBox.x).toBeGreaterThanOrEqual(itemBox.x + itemBox.width);
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);

  // Keyboard focus shows it too.
  await item.focus();
  await expect(tooltip).toHaveText('Home overview');
  await item.blur();
  await expect(tooltip).toHaveCount(0);

  // A labelled item needs no tooltip.
  await scope.getByTestId('home-navigation').hover();
  await page.waitForTimeout(600);
  await expect(tooltip).toHaveCount(0);

  // An application's own Tooltip replaces the item's, so only one shows.
  const described = scope.getByTestId('described-navigation');
  await expect(described).not.toHaveAttribute('title');
  await described.hover();
  await expect(tooltip).toHaveText('Settings and preferences');
  await page.waitForTimeout(300);
  await expect(tooltip).toHaveCount(1);
});

test('a tooltip stays open while the pointer moves onto it', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=navigation`);
  const item = page.getByTestId('navigation-icons-light').getByTestId('icon-only-navigation');
  const tooltip = page.locator('.env-tooltip');
  await item.hover();
  await expect(tooltip).toHaveText('Home overview');
  await expect(page.locator('.env-tooltip-positioner')).not.toHaveCSS('pointer-events', 'none');
  // Hovering the tooltip itself keeps it, so its text can be read or magnified (WCAG 1.4.13).
  const box = (await tooltip.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await page.waitForTimeout(600);
  await expect(tooltip).toHaveText('Home overview');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
});
