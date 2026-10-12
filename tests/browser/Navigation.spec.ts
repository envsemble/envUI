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
