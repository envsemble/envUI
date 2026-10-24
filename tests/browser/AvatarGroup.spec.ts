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
  // The group spreads at once under the pointer, so the chip holds still to be pointed at.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const names = page.locator('.env-avatar-group-tooltip > span');
  const chip = scope.getByTestId('decorative').locator('.env-avatar-group-overflow');
  // A count, not text: no dotted underline marks it.
  await expect(chip).not.toHaveClass(/\benv-hover-detail\b/);
  await scope.getByTestId('decorative').hover();
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

  await scope.getByTestId('localized').hover();
  await scope.getByTestId('localized').locator('.env-avatar-group-overflow').hover();
  await expect(names).toHaveText(['3 weitere']);
});

test('pressable avatars are buttons and links named after each person, with name tooltips', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const group = scope.getByRole('group', { name: 'Pressable people light' });
  const buttons = group.getByRole('button');
  await expect(buttons).toHaveCount(4);
  expect(
    await buttons.evaluateAll((items) => items.map((item) => item.getAttribute('aria-label'))),
  ).toEqual(['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Rivera']);
  // At rest a pressable group bunches only as far as leaves each avatar a 24 px target, and the
  // hidden count lies under the last avatar and lets the pointer through to it.
  const jordan = group.getByRole('button', { name: 'Jordan Rivera' });
  await jordan.scrollIntoViewIfNeeded();
  const rest = (await boxes(group)).slice(0, 4);
  for (const [index, box] of rest.slice(1).entries())
    expect(box.x - rest[index]!.x).toBeGreaterThanOrEqual(24);
  const reachable = await jordan.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return element.contains(target);
  });
  expect(reachable).toBe(true);
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
  // The pointer reaches the group first, which spreads it, and then the avatar in its new place.
  await linked.hover();
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

test('without a hovering pointer, avatars overlap by an eighth, line up with small controls and keep their size', async ({
  browser,
}) => {
  // On touch screens, which have no hover to spread a bunched group, the group is a plain row.
  const context = await browser.newContext({ hasTouch: true });
  const page = await context.newPage();
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  // Each avatar is 2 rem and covers an eighth of the one before; later ones lie on top.
  const decorative = await boxes(scope.getByTestId('decorative'));
  expect(decorative.map((box) => box.x - decorative[0]!.x)).toEqual([0, 28, 56, 84]);
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
  // Each avatar's initials end before the next avatar and its ring begin, in both sizes.
  for (const id of ['initials', 'initials-small']) {
    const clearances = await scope
      .getByTestId(id)
      .locator('.env-avatar')
      .evaluateAll((avatars) =>
        avatars.slice(0, -1).flatMap((avatar) => {
          const text = [...avatar.querySelectorAll('*'), avatar]
            .flatMap((element) => [...element.childNodes])
            .find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
          if (!text) return [];
          const range = document.createRange();
          range.selectNodeContents(text);
          const item = avatar.parentElement!.classList.contains('env-avatar-group')
            ? avatar
            : avatar.parentElement!;
          const next = item.nextElementSibling!;
          const ringed = next.matches('.env-avatar, .env-avatar-group-overflow')
            ? next
            : next.querySelector('.env-avatar')!;
          const ring = parseFloat(getComputedStyle(ringed).boxShadow.split(' ').at(-1) ?? '0');
          return [next.getBoundingClientRect().left - ring - range.getBoundingClientRect().right];
        }),
      );
    expect(clearances.length, id).toBeGreaterThan(0);
    for (const clearance of clearances) expect(clearance, id).toBeGreaterThanOrEqual(0);
  }
  const small = await boxes(scope.getByTestId('preview'));
  expect(small.map((box) => box.x - small[0]!.x)).toEqual([0, 21, 42]);

  // Right to left, the avatars run from the right.
  const rtl = await boxes(scope.getByTestId('rtl'));
  expect(rtl.map((box) => rtl[0]!.x + rtl[0]!.width - (box.x + box.width))).toEqual([
    0, 28, 56, 84,
  ]);
  await expect(scope.getByTestId('rtl').locator('.env-avatar-group-overflow')).toHaveText('+2');

  // A narrow row overflows its label rather than squeezing or wrapping the group.
  const narrow = await boxes(scope.getByTestId('narrow-group'));
  expect(new Set(narrow.map((box) => box.top)).size).toBe(1);
  expect(narrow.map((box) => box.width)).toEqual([32, 32, 32, 32]);
  expect((await scope.getByTestId('narrow-group').boundingBox())!.width).toBeCloseTo(116, 0);
  await context.close();
});

test('a group rests bunched, and spreads along an arch under the pointer and with focus inside', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const group = scope.getByTestId('decorative');
  const chip = group.locator('.env-avatar-group-overflow');
  const layout = () =>
    group.evaluate((element) =>
      [...element.querySelectorAll<HTMLElement>(':scope > .env-avatar')].map((avatar) => {
        const style = getComputedStyle(avatar);
        return {
          start: Number.parseFloat(style.marginInlineStart),
          lift: Number.parseFloat(style.translate.split(' ')[1] ?? '0') || 0,
          turn: Number.parseFloat(style.rotate) || 0,
        };
      }),
    );
  await page.mouse.move(0, 0);
  // At rest the avatars overlap by more than an eighth, each a little off the line and turned by
  // its place, the same on every load, and the count waits out of sight.
  const rest = await layout();
  expect(rest.slice(1).every((avatar) => avatar.start < -32 / 8)).toBe(true);
  expect(new Set(rest.map((avatar) => avatar.turn)).size).toBeGreaterThan(1);
  await expect(chip).toHaveCSS('opacity', '0');
  // Under the pointer they spread into a row with gaps, along an arch: the ends lower and turned
  // out, the middle highest, and the count shows.
  await group.hover();
  const spread = await layout();
  expect(spread.slice(1).every((avatar) => avatar.start > 0)).toBe(true);
  expect(spread[0]!.lift).toBeGreaterThan(spread[1]!.lift);
  expect(spread[0]!.turn).toBeLessThan(0);
  await expect(chip).toHaveCSS('opacity', '1');
  // It bunches back once the pointer leaves.
  await page.mouse.move(0, 0);
  await expect(chip).toHaveCSS('opacity', '0');
  expect(await layout()).toEqual(rest);
  // The keyboard reaches the count, which spreads the group and shows it.
  await page.keyboard.press('Tab');
  await expect(chip).toBeFocused();
  await expect(chip).toHaveCSS('opacity', '1');
  expect((await layout()).slice(1).every((avatar) => avatar.start > 0)).toBe(true);
});

test('the spread moves with the motion tokens, and at once with reduced motion', async ({
  page,
}) => {
  await page.goto(fixture);
  const avatar = page
    .getByTestId('avatar-groups-light')
    .getByTestId('decorative')
    .locator('.env-avatar')
    .nth(1);
  expect(
    await avatar.evaluate((element) => getComputedStyle(element).transitionProperty),
  ).toContain('margin-inline-start');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await avatar.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
    '0s',
  );
});

test('on touch screens pressable avatars are touch-sized targets side by side', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(fixture);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const scope = page.getByTestId('avatar-groups-light');
  // A small AvatarButton's halo grows to the 2.75 rem touch target.
  const avatarButton = (await scope.getByTestId('avatar-button-small').boundingBox())!;
  expect(avatarButton.width).toBeGreaterThanOrEqual(44);
  expect(avatarButton.height).toBeGreaterThanOrEqual(44);
  // Each pressable avatar is a target of the touch height, its picture and state layer in the
  // middle, and none covers another.
  const small = await boxes(scope.getByTestId('small-pressable'));
  expect(small.map((box) => box.x - small[0]!.x)).toEqual([0, 44, 88, 132]);
  const standard = await boxes(scope.getByTestId('pressable'));
  expect(standard.map((box) => box.x - standard[0]!.x).slice(0, 4)).toEqual([0, 44, 88, 132]);
  const targets = await scope
    .locator('.env-avatar-group-item')
    .evaluateAll((items) =>
      items.map((item) => [
        item.getBoundingClientRect().width,
        item.getBoundingClientRect().height,
        parseFloat(getComputedStyle(item, '::after').width),
        item.querySelector('.env-avatar')!.getBoundingClientRect().width,
      ]),
    );
  expect(targets.length).toBeGreaterThan(6);
  for (const [width, height, layer, avatar] of targets) {
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
    expect(layer).toBe(avatar);
  }
  // Decorative avatars keep their overlap.
  const decorative = await boxes(scope.getByTestId('preview'));
  expect(decorative.map((box) => box.x - decorative[0]!.x)).toEqual([0, 21, 42]);
  await scope.getByRole('button', { name: 'Sam Lee' }).first().tap();
  await expect(scope.getByTestId('pressed')).toHaveText('Sam Lee');
  await context.close();
});

test('a group lines up with small controls in a toolbar', async ({ page }) => {
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
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
    // Its own height, which a bunched avatar's slight turn doesn't change.
    expect(await item.evaluate((element) => (element as HTMLElement).offsetHeight)).toBe(32);
  }
});

test('with a fine pointer, initials center in what the bunch leaves, and spread in the whole circle', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const group = page.getByTestId('avatar-groups-light').getByTestId('initials');
  const insets = () =>
    group
      .locator(':scope > .env-avatar')
      .evaluateAll((avatars) =>
        avatars.map((avatar) =>
          getComputedStyle(avatar).getPropertyValue('--env-avatar-initials-inset-end').trim(),
        ),
      );
  await page.mouse.move(0, 0);
  // Bunched, each but the last leaves room for the next avatar's larger overlap: 0.4 of 2 rem and
  // the ring, more than the eighth a group without hover overlaps by.
  const rest = await insets();
  const restPx = await group
    .locator(':scope > .env-avatar')
    .first()
    .evaluate((avatar) => {
      const probe = document.createElement('div');
      probe.style.inlineSize = getComputedStyle(avatar).getPropertyValue(
        '--env-avatar-initials-inset-end',
      );
      avatar.append(probe);
      const width = probe.getBoundingClientRect().width;
      probe.remove();
      return width;
    });
  expect(restPx).toBeCloseTo(32 * 0.4 + 2, 0);
  expect(rest.at(-1)).toBe('');
  // Spread, nothing covers them, and the initials center in the whole circle.
  await group.hover();
  await expect.poll(insets).toEqual(rest.map(() => '0rem'));
});

test('a chosen avatar keeps its check over the next one, and a large count chip stays round', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const group = page.getByTestId('avatar-groups-light').getByTestId('selected-xl');
  await page.mouse.move(0, 0);
  const check = group.locator('.env-avatar-check');
  await expect(check).toHaveCount(1);
  // The middle of the check's end, where the next avatar overlaps it, is the check's.
  const onTop = await check.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.right - box.width / 4, box.top + box.height / 2);
    return element.contains(target);
  });
  expect(onTop).toBe(true);
  // The count chip is round at the extra large size, as the avatars are: half its height.
  const chip = group.locator('.env-avatar-group-overflow');
  const { radius, height } = await chip.evaluate((element) => ({
    radius: Number.parseFloat(getComputedStyle(element).borderStartStartRadius),
    height: (element as HTMLElement).offsetHeight,
  }));
  expect(radius).toBeCloseTo(height / 2, 0);
});
