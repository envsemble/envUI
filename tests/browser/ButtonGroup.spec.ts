import { test, expect, type Locator } from '@playwright/test';

async function geometry(group: Locator) {
  return group.evaluate((element) => {
    const groupStyle = getComputedStyle(element);
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {
      root,
      gap: parseFloat(groupStyle.gap),
      buttons: [...element.children]
        .filter((child) => child.matches('.env-button:not([hidden])'))
        .map((button) => {
          const style = getComputedStyle(button);
          const rect = button.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            important: button.classList.contains('env-button-important'),
            icon: button.classList.contains('env-icon-button'),
            corners: [
              style.borderStartStartRadius,
              style.borderStartEndRadius,
              style.borderEndStartRadius,
              style.borderEndEndRadius,
            ].map(parseFloat),
          };
        }),
    };
  });
}

test('mixed buttons connect in rows and columns with variant outer corners', async ({ page }) => {
  // This composition check retains the shared host's intrinsic grid sizing.
  // The focused fixture is used below for independent interaction checks.
  await page.goto('http://127.0.0.1:8766');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      const scope = page.getByTestId(`button-groups-${theme}`);
      for (const orientation of ['horizontal', 'vertical']) {
        const group = scope.getByTestId(orientation);
        await expect(group).toHaveAttribute('role', 'group');
        const { root, gap, buttons } = await geometry(group);
        expect(gap).toBeCloseTo(root * 0.125);
        expect(buttons).toHaveLength(5);
        buttons.forEach((button, index) => {
          const outer = root * (button.important ? 0.5 : 1.25);
          const inner = root * 0.5;
          const first = index === 0;
          const last = index === buttons.length - 1;
          expect(button.corners).toEqual(
            orientation === 'horizontal'
              ? [
                  first ? outer : inner,
                  last ? outer : inner,
                  first ? outer : inner,
                  last ? outer : inner,
                ]
              : [
                  first ? outer : inner,
                  first ? outer : inner,
                  last ? outer : inner,
                  last ? outer : inner,
                ],
          );
          const previous = buttons[index - 1];
          if (orientation === 'horizontal') {
            expect(button.y).toBeCloseTo(buttons[0].y);
            expect(button.height).toBeCloseTo(buttons[0].height);
            if (previous) expect(button.x - previous.x - previous.width).toBeCloseTo(gap, 0);
            if (button.icon) expect(button.width).toBeCloseTo(button.height, 0);
          } else {
            expect(button.x).toBeCloseTo(buttons[0].x);
            expect(button.width).toBeCloseTo(buttons[0].width);
            if (previous) expect(button.y - previous.y - previous.height).toBeCloseTo(gap, 0);
          }
        });
      }
      expect((await geometry(scope.getByTestId('important-end'))).buttons[0].corners).toEqual([
        8, 8, 8, 8,
      ]);
      expect((await geometry(scope.getByTestId('important-top'))).buttons[0].corners).toEqual([
        8, 8, 8, 8,
      ]);
      const scaled = await geometry(scope.getByTestId('scaled'));
      expect(scaled.buttons[0].corners).toEqual([30, 12, 30, 12]);
    }
  }
});

test('single, hidden and removed buttons retain normal corners and RTL follows the row', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:8766/?fixture=button-groups');
  const scope = page.getByTestId('button-groups-light');
  const standaloneRadius = await scope
    .getByTestId('standalone')
    .evaluate((button) => parseFloat(getComputedStyle(button).borderTopLeftRadius));
  expect((await geometry(scope.getByTestId('single'))).buttons[0].corners).toEqual(
    Array(4).fill(standaloneRadius),
  );
  expect((await geometry(scope.getByTestId('single-important'))).buttons[0].corners).toEqual([
    8, 8, 8, 8,
  ]);
  await scope.getByRole('button', { name: 'Toggle end buttons' }).click();
  const dynamic = await geometry(scope.getByTestId('dynamic'));
  expect(dynamic.buttons).toHaveLength(1);
  expect(dynamic.buttons[0].corners).toEqual(Array(4).fill(standaloneRadius));
  await expect(
    scope.getByRole('button', { name: 'Hidden before', includeHidden: true }),
  ).toBeHidden();
  await scope.getByRole('button', { name: 'Toggle end buttons' }).click();
  expect((await geometry(scope.getByTestId('dynamic'))).buttons[0].corners).toEqual([20, 8, 20, 8]);
  const row = scope.getByTestId('horizontal');
  await row.evaluate((element) => element.setAttribute('dir', 'rtl'));
  const rtl = await geometry(row);
  expect(rtl.buttons[0].x).toBeGreaterThan(rtl.buttons[1].x);
  await expect(row.getByRole('button', { name: 'Continue' })).toHaveCSS(
    'border-top-right-radius',
    '20px',
  );
  await expect(row.getByRole('button', { name: 'Continue' })).toHaveCSS(
    'border-top-left-radius',
    '8px',
  );
});

test('grouped actions preserve native focus, activation, links and disabled behavior', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:8766/?fixture=button-groups');
  const scope = page.getByTestId('button-groups-light');
  const action = scope.getByRole('button', { name: 'Native action' });
  await action.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(scope.getByTestId('activations')).toHaveText('2');
  await expect(scope.getByRole('button', { name: 'Disabled action' })).toBeDisabled();
  await expect(scope.getByRole('link', { name: 'Disabled destination' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await scope.getByRole('link', { name: 'Disabled destination' }).click({ force: true });
  await expect(scope.getByTestId('activations')).toHaveText('2');
  const row = scope.getByTestId('horizontal');
  await row.getByRole('button', { name: 'Continue' }).focus();
  await page.keyboard.press('Tab');
  await expect(row.getByRole('button', { name: 'Confirm' })).toBeFocused();
  await expect(row.getByRole('button', { name: 'Confirm' })).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Tab');
  await expect(row.getByRole('button', { name: 'Settings' })).toBeFocused();
  await row.getByRole('link', { name: 'Manage' }).click();
  await expect(page).toHaveURL(/#group-destination$/);
  expect(errors).toEqual([]);
});

test('narrow groups wrap labels and scale their shared corners with text size', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:8766/?fixture=button-groups');
  const scope = page.getByTestId('button-groups-light');
  const row = scope.getByTestId('horizontal');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '150%';
  });
  await row.evaluate((element) => {
    (element as HTMLElement).style.inlineSize = '18rem';
    element.querySelector('.env-button')!.textContent =
      'Continue with this workspace configuration';
  });
  const result = await geometry(row);
  expect(result.buttons[0].corners).toEqual([30, 12, 30, 12]);
  expect(result.buttons[0].height).toBeGreaterThan(60);
  result.buttons.forEach((button) => expect(button.height).toBeCloseTo(result.buttons[0].height));
  const overflow = await row.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow, JSON.stringify(result)).toBeLessThanOrEqual(1);
  const column = await geometry(scope.getByTestId('vertical'));
  expect(column.buttons[0].corners).toEqual([30, 30, 12, 12]);
});

test('documentation demonstrates connected buttons through the public API', async ({ page }) => {
  await page.goto('http://127.0.0.1:8770/#/components/buttons/preview');
  await expect(page.getByRole('group', { name: 'Project actions' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Item actions' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Quick actions' })).toBeVisible();
});
