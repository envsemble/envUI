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

/**
 * Each item's center and its own width, which a turn doesn't change, and its place in the row it
 * keeps, before any move.
 */
async function places(group: Locator) {
  await expect(group).toBeVisible();
  return group.locator(':scope > *').evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return {
        center: box.x + box.width / 2,
        width: (item as HTMLElement).offsetWidth,
        left: (item as HTMLElement).offsetLeft,
      };
    }),
  );
}

/** Whether the pointer reaches each avatar and the chip at its center, rather than the group. */
function hits(group: Locator) {
  return group.evaluate((element) =>
    [...element.children].map((item) => {
      const box = item.getBoundingClientRect();
      return item.contains(
        document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
      );
    }),
  );
}

/**
 * The group without its cover, and its items taking the pointer, to check what lies over what in
 * the pile.
 */
const uncovered =
  '.env-avatar-group::before { display: none; } .env-avatar-group > * { pointer-events: auto; }';

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
  // At rest the pile is one target: no avatar or count can be pressed or hovered anywhere over it,
  // only the group, which the pointer spreads.
  await group.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  expect(await hits(group)).toEqual([false, false, false, false, false]);
  // Spread, each avatar is a whole target of at least 24 px that nothing covers.
  await group.hover();
  expect(await hits(group)).toEqual([true, true, true, true, true]);
  const spread = (await boxes(group)).slice(0, 4);
  for (const [index, box] of spread.slice(1).entries())
    expect(box.x - (spread[index]!.x + spread[index]!.width)).toBeGreaterThan(0);
  for (const box of spread) expect(box.width).toBeGreaterThanOrEqual(24);
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

test('nothing rings the avatars or the count, which cast a faint shadow, and a chosen avatar’s gap takes the surface color', async ({
  page,
}) => {
  await page.goto(fixture);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`avatar-groups-${theme}`);
    await expect(scope.getByTestId('on-custom')).toBeVisible();
    const groups = await scope
      .locator('[data-testid^="on-"], [data-testid="decorative"]')
      .evaluateAll((groups) =>
        groups.map((group) => {
          const surface = group.closest('[data-surface]') ?? group.closest('.fixture-section')!;
          const background = getComputedStyle(surface).backgroundColor;
          const chosen = group.querySelector('.env-avatar[data-selected]');
          return {
            group: group.getAttribute('data-testid'),
            // Each casts one faint shadow, 1px down and 2px soft, and no ring.
            ringed: [...group.querySelectorAll('.env-avatar:not([data-selected])')]
              .concat([...group.querySelectorAll('.env-avatar-group-overflow')])
              .some(
                (element) =>
                  !/^(?:rgba?|color|oklch|hsla?)\([^)]*\) 0px 1px 2px 0px$/.test(
                    getComputedStyle(element).boxShadow,
                  ),
              ),
            // The chosen look: the gap in the surface color, then the accent ring.
            gap: chosen
              ? getComputedStyle(chosen).boxShadow.match(
                  /^(?:rgba?|color|oklch|hsla?)\([^)]*\)/,
                )?.[0] === background
              : null,
          };
        }),
      );
    expect(groups).toEqual([
      { group: 'decorative', ringed: false, gap: null },
      ...['on-pane', 'on-row', 'on-custom'].map((group) => ({ group, ringed: false, gap: true })),
    ]);
  }
});

test('a group rests as a pile and keeps the spread row as its box', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  await page.mouse.move(0, 0);
  const scope = page.getByTestId('avatar-groups-light');
  // Each 2 rem avatar starts about 0.6 of its size after the one under it, later ones on top,
  // and keeps its size.
  const decorative = await places(scope.getByTestId('decorative'));
  for (const [index, item] of decorative.slice(1, 3).entries())
    expect(item.center - decorative[index]!.center).toBeLessThan(32 * 0.7);
  expect(decorative.map((item) => item.width)).toEqual([32, 32, 32, 32]);
  await page.addStyleTag({ content: uncovered });
  const coveredByNext = await scope
    .getByTestId('decorative')
    .locator('.env-avatar')
    .first()
    .evaluate((avatar) => {
      const box = avatar.getBoundingClientRect();
      const target = document.elementFromPoint(box.right - 3, box.top + box.height / 2)!;
      // Later avatars lie on it.
      return !avatar.contains(target) && avatar.parentElement!.contains(target);
    });
  expect(coveredByNext).toBe(true);

  // Right to left, the pile runs from the right.
  const rtl = await places(scope.getByTestId('rtl'));
  const back = rtl.map((item) => rtl[0]!.center - item.center);
  for (const [index, distance] of back.slice(1).entries())
    expect(distance).toBeGreaterThan(back[index]!);
  expect(back[1]).toBeLessThan(32 * 0.7);
  await expect(scope.getByTestId('rtl').locator('.env-avatar-group-overflow')).toHaveText('+2');

  // A narrow row overflows its label rather than squeezing or wrapping the group, which keeps the
  // room of its spread row: three avatars and the count with gaps of 0.15 of their size.
  const narrow = await places(scope.getByTestId('narrow-group'));
  expect(narrow.map((item) => item.width)).toEqual([32, 32, 32, 32]);
  expect((await scope.getByTestId('narrow-group').boundingBox())!.width).toBeCloseTo(
    4 * 32 + 3 * 32 * 0.15,
    0,
  );
});

test('a group rests bunched, and spreads along an arch under the pointer and with focus inside', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const group = scope.getByTestId('decorative');
  const chip = group.locator('.env-avatar-group-overflow');
  // Each item's center, lift and turn, from its box and its computed transforms.
  const layout = () =>
    group.evaluate((element) =>
      [...element.querySelectorAll<HTMLElement>(':scope > *')].map((item) => {
        const style = getComputedStyle(item);
        const box = item.getBoundingClientRect();
        return {
          center: box.x + box.width / 2,
          lift: Number.parseFloat(style.translate.split(' ')[1] ?? '0') || 0,
          turn: Number.parseFloat(style.rotate) || 0,
        };
      }),
    );
  const steps = (items: { center: number }[]) =>
    items.slice(1).map((item, index) => item.center - items[index]!.center);
  await page.mouse.move(0, 0);
  // At rest the avatars lie in a pile, each starting about 0.6 of its size after the one under
  // it, a little off the line and turned by its place, the same on every load. The count shows,
  // upright and a quarter under the last avatar, its figures clear of it.
  const rest = await layout();
  const restSteps = steps(rest);
  expect(restSteps.slice(0, -1).every((step) => step < 32 * 0.7)).toBe(true);
  // The last avatar's own small nudge moves it by up to a pixel.
  expect(Math.abs(restSteps.at(-1)! - (32 - 32 / 4))).toBeLessThan(1.5);
  expect(new Set(rest.slice(0, -1).map((item) => item.turn)).size).toBeGreaterThan(1);
  expect(rest.at(-1)!.turn).toBe(0);
  await expect(chip).toHaveCSS('opacity', '1');
  const clearance = await chip.evaluate((element) => {
    const last = element.previousElementSibling!.getBoundingClientRect();
    return element.firstElementChild!.getBoundingClientRect().left - last.right;
  });
  expect(clearance).toBeGreaterThanOrEqual(0);
  await page.addStyleTag({ content: uncovered });
  const under = await chip.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const covered = document.elementFromPoint(box.left + 2, box.top + box.height / 2);
    const clear = document.elementFromPoint(box.right - 4, box.top + box.height / 2);
    return { covered: !element.contains(covered), clear: element.contains(clear) };
  });
  expect(under).toEqual({ covered: true, clear: true });
  await page.evaluate(() => document.querySelector('style:last-of-type')?.remove());
  // Under the pointer they spread into a row with gaps, along an arch: the ends lower and turned
  // out, the middle highest. The count stays upright.
  await group.hover();
  const spread = await layout();
  expect(steps(spread).every((step) => step > 32)).toBe(true);
  expect(spread[0]!.lift).toBeGreaterThan(spread[1]!.lift);
  expect(spread[0]!.turn).toBeLessThan(0);
  expect(spread.at(-1)!.turn).toBe(0);
  // It bunches back once the pointer leaves.
  await page.mouse.move(0, 0);
  expect(await layout()).toEqual(rest);
  // The keyboard reaches the count, which spreads the group.
  await page.keyboard.press('Tab');
  await expect(chip).toBeFocused();
  expect(steps(await layout()).every((step) => step > 32)).toBe(true);
});

test('spreading never changes the group’s box, so a narrow row never wraps it under the pointer', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const groups = ['decorative', 'pressable', 'preview', 'in-row'].map((id) =>
    scope.getByTestId(id),
  );
  // The group's layout box and those around it, and the items' extent within it.
  const measure = (group: Locator) =>
    group.evaluate((element) => {
      const item = element.closest('.env-list-item') ?? element.parentElement!;
      const box = element.getBoundingClientRect();
      const items = [...element.children].map((child) => child.getBoundingClientRect());
      return {
        box: [element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight],
        around: [(item as HTMLElement).offsetWidth, (item as HTMLElement).offsetHeight],
        start: Math.round(Math.min(...items.map((rect) => rect.left)) - box.left),
        end: Math.round(box.right - Math.max(...items.map((rect) => rect.right))),
      };
    });
  for (const group of groups) {
    await group.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const rest = await measure(group);
    await group.hover();
    const hovered = await measure(group);
    expect(hovered.box).toEqual(rest.box);
    expect(hovered.around).toEqual(rest.around);
    // Spread, the items stay within the box, which kept the room for them; turned ends reach a
    // little past.
    expect(hovered.start).toBeGreaterThanOrEqual(-3);
    expect(hovered.end).toBeGreaterThanOrEqual(-3);
    // Focus inside spreads it the same way.
    await page.mouse.move(0, 0);
    await group.locator('[tabindex="0"], button, a').last().focus();
    expect((await measure(group)).box).toEqual(rest.box);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  }
  // A group as wide as its content is exactly the spread row. At rest it gathers at the start of
  // that room, or at its end with gather="end".
  const inRow = scope.getByTestId('in-row');
  await inRow.hover();
  const spread = await measure(inRow);
  expect(Math.abs(spread.start)).toBeLessThanOrEqual(3);
  expect(Math.abs(spread.end)).toBeLessThanOrEqual(3);
  await page.mouse.move(0, 0);
  const gathered = await measure(inRow);
  expect(gathered.start).toBeGreaterThan(32);
  expect(Math.abs(gathered.end)).toBeLessThanOrEqual(3);
  expect(Math.abs((await measure(scope.getByTestId('decorative'))).start)).toBeLessThanOrEqual(3);
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
  ).toContain('translate');
  // While the avatars move, the pile stays one target; once they are in place each is its own.
  const group = page.getByTestId('avatar-groups-light').getByTestId('pressable');
  await page.mouse.move(0, 0);
  await group.hover({ position: { x: 4, y: 16 } });
  expect(await hits(group)).toEqual([false, false, false, false, false]);
  await expect.poll(() => hits(group)).toEqual([true, true, true, true, true]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await avatar.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
    '0s',
  );
});

test('on touch screens a tap spreads the pile, later taps press touch-sized avatars, and a tap outside or a pause bunches it @engines', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto(fixture);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const scope = page.getByTestId('avatar-groups-light');
  // A small AvatarButton's halo grows to the 2.75 rem touch target.
  const avatarButton = (await scope.getByTestId('avatar-button-small').boundingBox())!;
  expect(avatarButton.width).toBeGreaterThanOrEqual(44);
  expect(avatarButton.height).toBeGreaterThanOrEqual(44);

  const group = scope.getByTestId('pressable');
  await group.scrollIntoViewIfNeeded();
  // At rest it is a pile, and the pile is one target: a tap on it presses no one, and spreads it.
  const pile = await boxes(group);
  const rest = await places(group);
  expect(rest[1]!.center - rest[0]!.center).toBeLessThan(32 * 0.7);
  expect(await hits(group)).toEqual([false, false, false, false, false]);
  const first = pile.at(-2)!;
  await page.touchscreen.tap(first.x + first.width / 2, first.top + 22);
  await expect(scope.getByTestId('pressed')).toHaveText('');
  await expect(group).toHaveAttribute('data-spread', '');
  // Spread, each pressable avatar is a target of the touch height, its picture and state layer in
  // the middle, side by side.
  const standard = await places(group);
  expect(standard.map((item) => item.left - standard[0]!.left).slice(0, 4)).toEqual([
    0, 44, 88, 132,
  ]);
  for (const item of standard)
    expect(item.center - item.width / 2 - item.left).toBeCloseTo(
      standard[0]!.center - standard[0]!.width / 2 - standard[0]!.left,
      0,
    );
  expect(await hits(group)).toEqual([true, true, true, true, true]);
  const targets = await group
    .locator('.env-avatar-group-item')
    .evaluateAll((items) =>
      items.map((item) => [
        item.getBoundingClientRect().width,
        item.getBoundingClientRect().height,
        parseFloat(getComputedStyle(item, '::after').width),
        item.querySelector<HTMLElement>('.env-avatar')!.offsetWidth,
      ]),
    );
  expect(targets).toHaveLength(4);
  for (const [width, height, layer, avatar] of targets) {
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
    expect(layer).toBe(avatar);
  }
  // The next tap presses the avatar under it, and the group stays spread.
  await group.getByRole('button', { name: 'Sam Lee' }).tap();
  await expect(scope.getByTestId('pressed')).toHaveText('Sam Lee');
  await expect(group).toHaveAttribute('data-spread', '');
  // A tap outside bunches it.
  await page.touchscreen.tap(380, 10);
  await expect(group).not.toHaveAttribute('data-spread');
  expect(await hits(group)).toEqual([false, false, false, false, false]);
  // So does a pause of five seconds without a tap in it.
  await page.touchscreen.tap(first.x + first.width / 2, first.top + 22);
  await expect(group).toHaveAttribute('data-spread', '');
  await page.clock.runFor(4900);
  await expect(group).toHaveAttribute('data-spread', '');
  await page.clock.runFor(200);
  await expect(group).not.toHaveAttribute('data-spread');

  // A small pressable group spreads into touch targets too.
  const small = scope.getByTestId('small-pressable');
  await small.scrollIntoViewIfNeeded();
  await small.tap({ position: { x: 8, y: 12 } });
  await expect(small).toHaveAttribute('data-spread', '');
  const smallSpread = await places(small);
  expect(smallSpread.map((item) => item.left - smallSpread[0]!.left).slice(0, 3)).toEqual([
    0, 44, 88,
  ]);
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

test('a chosen avatar keeps its check over the next one, and the count is a rounded square', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const group = page.getByTestId('avatar-groups-light').getByTestId('selected-xl');
  await page.mouse.move(0, 0);
  await page.addStyleTag({ content: uncovered });
  const check = group.locator('.env-avatar-check');
  await expect(check).toHaveCount(1);
  // The middle of the check's end, where the next avatar overlaps it, is the check's.
  const onTop = await check.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const target = document.elementFromPoint(box.right - box.width / 4, box.top + box.height / 2);
    return element.contains(target);
  });
  expect(onTop).toBe(true);
  // The count is a rounded square as tall as the avatars, its corners from the corner scale: the
  // extra large step at the extra large size, the small one at the standard size.
  const corners = (locator: Locator, token: string) =>
    locator.evaluate((element, token) => {
      const probe = document.createElement('div');
      probe.style.borderRadius = `var(${token})`;
      element.append(probe);
      const expected = getComputedStyle(probe).borderStartStartRadius;
      probe.remove();
      return {
        radius: getComputedStyle(element).borderStartStartRadius,
        expected,
        height: (element as HTMLElement).offsetHeight,
      };
    }, token);
  const xl = await corners(group.locator('.env-avatar-group-overflow'), '--env-radius-xl');
  expect(xl.radius).toBe(xl.expected);
  expect(xl.height).toBe(88);
  expect(Number.parseFloat(xl.radius)).toBeLessThan(xl.height / 2);
  const md = await corners(
    page
      .getByTestId('avatar-groups-light')
      .getByTestId('decorative')
      .locator('.env-avatar-group-overflow'),
    '--env-radius-sm',
  );
  expect(md).toEqual({ radius: md.expected, expected: md.expected, height: 32 });
});

test('the count is set as initials are, in a neutral fill, and comes in front with keyboard focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(fixture);
  const scope = page.getByTestId('avatar-groups-light');
  const type = (locator: Locator) =>
    locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.fontFamily, style.fontWeight, style.fontSize, style.letterSpacing];
    });
  const chip = scope.getByTestId('decorative').locator('.env-avatar-group-overflow');
  // The same type as the initials of an avatar of its size.
  expect(await type(chip)).toEqual(
    await type(scope.getByTestId('initials').locator('.env-avatar').first()),
  );
  await expect(chip).toHaveCSS('font-variant-numeric', 'tabular-nums');
  // Focused, it comes in front of the avatar it lies under.
  await chip.focus();
  await expect(chip).toHaveCSS('z-index', '1');
});
