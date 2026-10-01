import { test, expect } from '@playwright/test';

test('navigation owns official icon fill without a second icon, including wrapped symbols', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('http://127.0.0.1:8766');
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

test('FeatureCard responds to its own width without consumer containment CSS', async ({ page }) => {
  await page.goto('http://127.0.0.1:8766');
  for (const name of ['icon', 'plain']) {
    const card = page.getByTestId(`standalone-feature-${name}`);
    const copy = card.locator('.env-feature-card-copy');
    const action = card.locator('.env-feature-card-action');
    const button = action.getByRole('button');
    await expect
      .poll(() => card.evaluate((element) => getComputedStyle(element).containerType))
      .toBe('inline-size');
    for (const [width, stacked] of [
      ['24rem', true],
      ['60rem', false],
    ] as const) {
      await card.evaluate((element, value) => {
        (element as HTMLElement).style.width = value;
      }, width);
      const copyRect = (await copy.boundingBox())!;
      const actionRect = (await action.boundingBox())!;
      const buttonRect = (await button.boundingBox())!;
      if (stacked) {
        expect(actionRect.y).toBeGreaterThanOrEqual(copyRect.y + copyRect.height);
        const layoutRect = (await card.locator('.env-feature-card-layout').boundingBox())!;
        expect(Math.abs(buttonRect.width - layoutRect.width)).toBeLessThan(1);
      } else {
        expect(actionRect.x).toBeGreaterThanOrEqual(copyRect.x + copyRect.width);
        expect(
          Math.abs(actionRect.y + actionRect.height / 2 - copyRect.y - copyRect.height / 2),
        ).toBeLessThan(1);
      }
    }
  }
});
