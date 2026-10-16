import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=avatar-groups`;

/** The left edge and width of each avatar and chip in a group, in document order. */
async function boxes(group: Locator) {
  await expect(group).toBeVisible();
  return group.locator(':scope > *').evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { x: Math.round(box.x), width: Math.round(box.width), top: Math.round(box.top) };
    }),
  );
}

test('an avatar group names everyone and counts the people it does not show', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const decorative = scope.getByTestId('decorative');
  await expect(decorative).toHaveRole('group');
  await expect(decorative).toHaveAccessibleName(
    '5 people: Alex Morgan, Sam Lee, Priya Shah, Jordan Rivera, Taylor Kim',
  );
  // Decorative avatars leave the names to the group.
  await expect(decorative.locator('.env-avatar')).toHaveCount(3);
  await expect(decorative.locator('.env-avatar').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative.getByRole('button')).toHaveCount(0);
  await expect(decorative.locator('.env-avatar-group-overflow')).toHaveText('+2');

  // A preview of twelve counts those it cannot name.
  const preview = scope.getByTestId('preview');
  await expect(preview).toHaveAccessibleName('12 people: Alex Morgan, Sam Lee, Priya Shah, 9 more');
  await expect(preview.locator('.env-avatar')).toHaveCount(2);
  await expect(preview.locator('.env-avatar-group-overflow')).toHaveText('+10');
  await expect(scope.getByTestId('named')).toHaveAccessibleName('Report editors');
  await expect(scope.getByTestId('named').locator('.env-avatar-group-overflow')).toHaveCount(0);
  await expect(scope.getByTestId('localized')).toHaveAccessibleName(
    '4 people: Alex Morgan, 3 weitere',
  );
  await expect(scope.getByTestId('empty')).toHaveCount(0);
  // Missing numbers count and show everyone passed.
  const unknown = scope.getByTestId('unknown-counts');
  await expect(unknown).toHaveAccessibleName('2 people: Alex Morgan, Sam Lee');
  await expect(unknown.locator('.env-avatar')).toHaveCount(2);
  await expect(unknown.locator('.env-avatar-group-overflow')).toHaveCount(0);
  // So do an endless total and a max of null.
  const endless = scope.getByTestId('endless-counts');
  await expect(endless).toHaveAccessibleName('2 people: Alex Morgan, Sam Lee');
  await expect(endless.locator('.env-avatar')).toHaveCount(2);
  await expect(endless.locator('.env-avatar-group-overflow')).toHaveCount(0);
  // formatLabel names the group in another language.
  await expect(scope.getByTestId('german')).toHaveAccessibleName(
    '5 Personen: Alex Morgan, Sam Lee, Priya Shah, Jordan Rivera, Taylor Kim',
  );
});

test('the overflow chip lists the hidden names on hover and keyboard focus', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const names = page.locator('.env-avatar-group-tooltip > span');
  const chip = scope.getByTestId('decorative').locator('.env-avatar-group-overflow');
  await chip.hover();
  await expect(names).toHaveText(['Jordan Rivera', 'Taylor Kim']);
  await page.keyboard.press('Escape');
  await expect(names).toHaveCount(0);
  await page.mouse.move(0, 0);

  // The chip is the first tab stop of the page, and focus opens its tooltip too. It is named by
  // the people it stands for, also for assistive technology.
  await expect(chip).toHaveRole('img');
  await expect(chip).toHaveAccessibleName('Jordan Rivera, Taylor Kim');
  await page.keyboard.press('Tab');
  await expect(chip).toBeFocused();
  await expect(chip).toHaveCSS('outline-style', 'solid');
  await expect(names).toHaveText(['Jordan Rivera', 'Taylor Kim']);
  await page.keyboard.press('Tab');
  const previewChip = scope.getByTestId('preview').locator('.env-avatar-group-overflow');
  await expect(previewChip).toBeFocused();
  await expect(names).toHaveText(['Priya Shah', '9 more']);
  await expect(previewChip).toHaveAccessibleName('Priya Shah, 9 more');
  await page.keyboard.press('Escape');
  await expect(names).toHaveCount(0);
  await expect(previewChip).toBeFocused();

  await scope.getByTestId('localized').locator('.env-avatar-group-overflow').hover();
  await expect(names).toHaveText(['3 weitere']);
});

test('pressable avatars are buttons and links named after each person, with name tooltips', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const group = scope.getByRole('group', { name: 'Pressable people light' });
  const buttons = group.getByRole('button');
  await expect(buttons).toHaveCount(4);
  expect(
    await buttons.evaluateAll((items) => items.map((item) => item.getAttribute('aria-label'))),
  ).toEqual(['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Rivera']);
  const tooltip = page.locator('.env-tooltip');
  const alex = group.getByRole('button', { name: 'Alex Morgan' });
  await alex.hover();
  await expect(tooltip).toHaveText('Alex Morgan');
  // The hovered avatar comes in front of the one that overlaps it.
  await expect(alex).toHaveCSS('z-index', '1');
  const overlap = await alex.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.right - 3, box.top + box.height / 2);
    return element.contains(target);
  });
  expect(overlap).toBe(true);
  await alex.click();
  await expect(scope.getByTestId('pressed')).toHaveText('Alex Morgan');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);

  // Keyboard: each avatar is a tab stop that shows its name and opens with Enter.
  await alex.focus();
  await page.keyboard.press('Tab');
  const sam = group.getByRole('button', { name: 'Sam Lee' });
  await expect(sam).toBeFocused();
  await expect(sam).toHaveCSS('outline-style', 'solid');
  await expect(sam).toHaveCSS('z-index', '1');
  await expect(tooltip).toHaveText('Sam Lee');
  await page.keyboard.press('Enter');
  await expect(scope.getByTestId('pressed')).toHaveText('Sam Lee');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(scope.getByTestId('pressed')).toHaveText('Priya Shah');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  // The chip after the last avatar counts the fifth person.
  await expect(group.locator('.env-avatar-group-overflow')).toBeFocused();
  await expect(page.locator('.env-avatar-group-tooltip > span')).toHaveText(['Taylor Kim']);

  await page.keyboard.press('Escape');

  // A person with href is a link, rendered through the application's LinkProvider.
  const linked = scope.getByTestId('linked');
  await expect(linked.getByRole('link')).toHaveCount(2);
  const link = linked.getByRole('link', { name: 'Sam Lee' });
  await expect(link).toHaveAttribute('href', '/people/sam');
  await link.hover();
  await expect(tooltip).toHaveText('Sam Lee');
  await link.click();
  await expect(page.locator('body')).toHaveAttribute('data-avatar-navigated-to', '/people/sam');
});

test('the ring takes the color of the surface below in both themes', async ({ page }) => {
  await page.goto(fixture);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`avatar-groups-${theme}`);
    await expect(scope.getByTestId('on-custom')).toBeVisible();
    const rings = await scope
      .locator('[data-testid^="on-"], [data-testid="decorative"]')
      .evaluateAll((groups) =>
        groups.map((group) => {
          const surface = group.closest('[data-surface]') ?? group.closest('.fixture-section')!;
          const background = getComputedStyle(surface).backgroundColor;
          const ring = (element: Element) =>
            getComputedStyle(element).boxShadow.match(/^(?:rgba?|color|oklch|hsla?)\([^)]*\)/)?.[0];
          return {
            group: group.getAttribute('data-testid'),
            avatar: ring(group.querySelector('.env-avatar')!) === background,
            chip: ring(group.querySelector('.env-avatar-group-overflow')!) === background,
          };
        }),
      );
    expect(rings).toEqual(
      ['decorative', 'on-pane', 'on-row', 'on-custom'].map((group) => ({
        group,
        avatar: true,
        chip: true,
      })),
    );
  }
});

test('the overflow count keeps 4.5:1 contrast in both themes', async ({ page }) => {
  await page.goto(fixture);
  // Thirteen groups with a chip in each theme.
  await expect(page.locator('.env-avatar-group-overflow')).toHaveCount(26);
  const failures = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const luminance = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const results: string[] = [];
    for (const chip of document.querySelectorAll<HTMLElement>('.env-avatar-group-overflow')) {
      const style = getComputedStyle(chip);
      const background = luminance([style.backgroundColor]);
      const foreground = luminance([style.backgroundColor, style.color]);
      const [lighter, darker] = [background, foreground].sort((a, b) => b - a);
      const ratio = (lighter! + 0.05) / (darker! + 0.05);
      if (ratio < 4.5) {
        const theme = chip.closest('[data-env-theme]')!.getAttribute('data-env-theme');
        const group = chip.closest('.env-avatar-group')!.getAttribute('data-testid');
        results.push(`${theme} ${group} ${chip.textContent}: ${ratio.toFixed(2)}`);
      }
    }
    return results;
  });
  expect(failures).toEqual([]);
});

test('avatars overlap by a quarter, line up with small controls and keep their size', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  // Each avatar is 2 rem and covers a quarter of the one before; later ones lie on top.
  const decorative = await boxes(scope.getByTestId('decorative'));
  expect(decorative.map((box) => box.x - decorative[0]!.x)).toEqual([0, 24, 48, 72]);
  expect(decorative.map((box) => box.width)).toEqual([32, 32, 32, 32]);
  const coveredByNext = await scope
    .getByTestId('decorative')
    .locator('.env-avatar')
    .first()
    .evaluate((avatar) => {
      const box = avatar.getBoundingClientRect();
      const target = document.elementFromPoint(box.right - 3, box.top + box.height / 2)!;
      return avatar.parentElement!.children[1]!.contains(target);
    });
  expect(coveredByNext).toBe(true);
  const small = await boxes(scope.getByTestId('preview'));
  expect(small.map((box) => box.x - small[0]!.x)).toEqual([0, 18, 36]);

  // Right to left, the avatars run from the right.
  const rtl = await boxes(scope.getByTestId('rtl'));
  expect(rtl.map((box) => rtl[0]!.x + rtl[0]!.width - (box.x + box.width))).toEqual([
    0, 24, 48, 72,
  ]);
  await expect(scope.getByTestId('rtl').locator('.env-avatar-group-overflow')).toHaveText('+2');

  // In a small toolbar a standard group is as tall as the 2 rem controls, and a small group
  // sits on the same center line.
  const toolbar = scope.getByTestId('toolbar');
  const button = (await toolbar.getByRole('button', { name: 'Report settings' }).boundingBox())!;
  const group = (await scope.getByTestId('toolbar-group').boundingBox())!;
  const smallGroup = (await scope.getByTestId('toolbar-small').boundingBox())!;
  expect(button.height).toBeCloseTo(32, 0);
  expect(group.height).toBeCloseTo(32, 0);
  expect(smallGroup.height).toBeCloseTo(24, 0);
  for (const box of [group, smallGroup])
    expect(Math.abs(box.y + box.height / 2 - (button.y + button.height / 2))).toBeLessThan(1);
  for (const item of await scope.getByTestId('toolbar-group').getByRole('button').all()) {
    const box = (await item.boundingBox())!;
    expect(Math.round(box.height)).toBe(32);
  }

  // A narrow row overflows its label rather than squeezing or wrapping the group.
  const narrow = await boxes(scope.getByTestId('narrow-group'));
  expect(new Set(narrow.map((box) => box.top)).size).toBe(1);
  expect(narrow.map((box) => box.width)).toEqual([32, 32, 32, 32]);
  expect((await scope.getByTestId('narrow-group').boundingBox())!.width).toBeCloseTo(104, 0);
});

test('on touch screens small pressable avatars sit side by side', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(fixture);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const scope = page.getByTestId('avatar-groups-light');
  const small = await boxes(scope.getByTestId('small-pressable'));
  expect(small.map((box) => box.x - small[0]!.x)).toEqual([0, 24, 48, 72]);
  // Standard pressable avatars keep 1.5 rem uncovered at their usual overlap.
  const standard = await boxes(scope.getByTestId('pressable'));
  expect(standard.map((box) => box.x - standard[0]!.x).slice(0, 3)).toEqual([0, 24, 48]);
  // Decorative avatars keep their overlap.
  const decorative = await boxes(scope.getByTestId('preview'));
  expect(decorative.map((box) => box.x - decorative[0]!.x)).toEqual([0, 18, 36]);
  await scope.getByRole('button', { name: 'Sam Lee' }).first().tap();
  await expect(scope.getByTestId('pressed')).toHaveText('Sam Lee');
  await context.close();
});
