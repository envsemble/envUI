import { beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/AvatarGroup.fixture.tsx';
import {
  addStyle,
  box,
  css,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  stopTimers,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('avatar-groups-light');
const byTestId = (id: string) => scope().getByTestId(id);
const items = (group: Locator) => [...group.element().children] as HTMLElement[];
const chipOf = (group: Locator) =>
  page.elementLocator(group.element().querySelector('.env-avatar-group-overflow')!);
const pressed = () => byTestId('pressed').element().textContent;

/** The left edge, width and top of each avatar and chip in a group, in document order. */
const boxes = (group: Locator) =>
  items(group).map((item) => {
    const { x, width, top } = item.getBoundingClientRect();
    return { x: Math.round(x), width: Math.round(width), top: Math.round(top) };
  });

/**
 * Each item's center and its own width, which a turn doesn't change, and its place in the row it
 * keeps, before any move.
 */
const places = (group: Locator) =>
  items(group).map((item) => {
    const { x, width } = item.getBoundingClientRect();
    return { center: x + width / 2, width: item.offsetWidth, left: item.offsetLeft };
  });

/** Whether the pointer reaches each avatar and the chip at its center, rather than the group. */
const hits = (group: Locator) =>
  items(group).map((item) => {
    const { x, y, width, height } = item.getBoundingClientRect();
    return item.contains(document.elementFromPoint(x + width / 2, y + height / 2));
  });

/**
 * The group without its cover, and its items taking the pointer, to check what lies over what in
 * the pile.
 */
const uncovered =
  '.env-avatar-group::before { display: none; } .env-avatar-group > * { pointer-events: auto; }';

/** The names the open overflow tooltip lists. */
const tooltipNames = () =>
  [...document.querySelectorAll('.env-avatar-group-tooltip > span')].map(
    (name) => name.textContent,
  );
/** Moves the pointer to the middle of an element, as Playwright's hover does. */
async function pointAt(target: Locator | Element, offset?: { x: number; y: number }) {
  const at = box(target);
  await mouse.move(at.x + (offset?.x ?? at.width / 2), at.y + (offset?.y ?? at.height / 2));
}
const away = () => mouse.move(0, 0);
const tooltipText = () => document.querySelector('.env-tooltip')?.textContent ?? null;

test('the overflow chip lists the hidden names on hover and keyboard focus', async () => {
  // The group spreads at once under the pointer, so the chip holds still to be pointed at.
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const chip = chipOf(byTestId('decorative'));
  // A count, not text: no dotted underline marks it.
  expect(chip.element().classList.contains('env-hover-detail')).toBe(false);
  await pointAt(byTestId('decorative'));
  await pointAt(chip);
  await expect.poll(tooltipNames).toEqual(['Jordan Rivera', 'Taylor Kim']);
  // The keys go to the fixture's frame, which nothing in it has focused yet.
  window.focus();
  await keyboard.press('Escape');
  await expect.poll(tooltipNames).toEqual([]);
  await away();

  // The chip is the first tab stop of the page, and focus opens its tooltip too, and brings it in
  // front of the avatar it lies under. It is named by the people it stands for, also for
  // assistive technology.
  await expect.element(chip).toHaveRole('img');
  await expect.element(chip).toHaveAccessibleName('Jordan Rivera, Taylor Kim');
  await keyboard.press('Tab');
  await expect.element(chip).toHaveFocus();
  expect(css(chip, 'outline-style')).toBe('solid');
  expect(css(chip, 'z-index')).toBe('1');
  await expect.poll(tooltipNames).toEqual(['Jordan Rivera', 'Taylor Kim']);
  await keyboard.press('Tab');
  const previewChip = chipOf(byTestId('preview'));
  await expect.element(previewChip).toHaveFocus();
  await expect.poll(tooltipNames).toEqual(['Priya Shah', '9 more']);
  await expect.element(previewChip).toHaveAccessibleName('Priya Shah, 9 more');
  await keyboard.press('Escape');
  await expect.poll(tooltipNames).toEqual([]);
  await expect.element(previewChip).toHaveFocus();

  await pointAt(byTestId('localized'));
  await pointAt(chipOf(byTestId('localized')));
  await expect.poll(tooltipNames).toEqual(['3 weitere']);
});

test('pressable avatars are buttons and links named after each person, with name tooltips', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const group = scope().getByRole('group', { name: 'Pressable people light' });
  const buttons = group.getByRole('button').elements();
  expect(buttons.map((item) => item.getAttribute('aria-label'))).toEqual([
    'Alex Morgan',
    'Sam Lee',
    'Priya Shah',
    'Jordan Rivera',
  ]);
  // At rest the pile is one target: no avatar or count can be pressed or hovered anywhere over it,
  // only the group, which the pointer spreads.
  group.element().scrollIntoView({ block: 'center' });
  await away();
  expect(hits(group)).toEqual([false, false, false, false, false]);
  // Spread, each avatar is a whole target of at least 24 px that nothing covers.
  await pointAt(group);
  await expect.poll(() => hits(group)).toEqual([true, true, true, true, true]);
  const spread = boxes(group).slice(0, 4);
  for (const [index, each] of spread.slice(1).entries())
    expect(each.x - (spread[index]!.x + spread[index]!.width)).toBeGreaterThan(0);
  for (const each of spread) expect(each.width).toBeGreaterThanOrEqual(24);
  const alex = group.getByRole('button', { name: 'Alex Morgan' });
  await pointAt(alex);
  await expect.poll(tooltipText).toBe('Alex Morgan');
  // The hovered avatar comes in front of the one that overlaps it.
  expect(css(alex, 'z-index')).toBe('1');
  const edge = alex.element().getBoundingClientRect();
  expect(
    alex.element().contains(document.elementFromPoint(edge.right - 3, edge.top + edge.height / 2)),
  ).toBe(true);
  await alex.click();
  await expect.poll(pressed).toBe('Alex Morgan');
  await away();
  await expect.poll(tooltipText).toBeNull();

  // Keyboard: each avatar is a tab stop that shows its name and opens with Enter.
  (alex.element() as HTMLElement).focus();
  await keyboard.press('Tab');
  const sam = group.getByRole('button', { name: 'Sam Lee' });
  await expect.element(sam).toHaveFocus();
  expect(css(sam, 'outline-style')).toBe('solid');
  expect(css(sam, 'z-index')).toBe('1');
  await expect.poll(tooltipText).toBe('Sam Lee');
  await keyboard.press('Enter');
  await expect.poll(pressed).toBe('Sam Lee');
  await keyboard.press('Tab');
  await keyboard.press('Space');
  await expect.poll(pressed).toBe('Priya Shah');
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  // The chip after the last avatar counts the fifth person.
  await expect.element(chipOf(group)).toHaveFocus();
  await expect.poll(tooltipNames).toEqual(['Taylor Kim']);
  await keyboard.press('Escape');

  // A person with href is a link, rendered through the application's LinkProvider.
  const linked = byTestId('linked');
  expect(linked.getByRole('link').elements()).toHaveLength(2);
  const link = linked.getByRole('link', { name: 'Sam Lee' });
  await expect.element(link).toHaveAttribute('href', '/people/sam');
  // The pointer reaches the group first, which spreads it, and then the avatar in its new place.
  await pointAt(linked);
  await nextFrames();
  await pointAt(link);
  await expect.poll(tooltipText).toBe('Sam Lee');
  await link.click();
  await expect.poll(() => document.body.dataset.avatarNavigatedTo).toBe('/people/sam');
});

test('a group rests as a pile and keeps the spread row as its box, lining up with small controls in a toolbar', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await away();
  // Each 2 rem avatar starts about 0.6 of its size after the one under it, later ones on top,
  // and keeps its size.
  const decorative = places(byTestId('decorative'));
  for (const [index, item] of decorative.slice(1, 3).entries())
    expect(item.center - decorative[index]!.center).toBeLessThan(32 * 0.7);
  expect(decorative.map((item) => item.width)).toEqual([32, 32, 32, 32]);
  addStyle(uncovered);
  const first = byTestId('decorative').element().querySelector('.env-avatar')!;
  const edge = first.getBoundingClientRect();
  const target = document.elementFromPoint(edge.right - 3, edge.top + edge.height / 2)!;
  // Later avatars lie on it.
  expect(!first.contains(target) && first.parentElement!.contains(target)).toBe(true);

  // Right to left, the pile runs from the right.
  const rtl = places(byTestId('rtl'));
  const back = rtl.map((item) => rtl[0]!.center - item.center);
  for (const [index, distance] of back.slice(1).entries())
    expect(distance).toBeGreaterThan(back[index]!);
  expect(back[1]).toBeLessThan(32 * 0.7);
  expect(chipOf(byTestId('rtl')).element().textContent).toBe('+2');

  // A narrow row overflows its label rather than squeezing or wrapping the group, which keeps the
  // room of its spread row: three avatars and the count with gaps of 0.15 of their size.
  const narrow = byTestId('narrow-group');
  expect(places(narrow).map((item) => item.width)).toEqual([32, 32, 32, 32]);
  expect(box(narrow).width).toBeCloseTo(4 * 32 + 3 * 32 * 0.15, 0);

  // In a small toolbar a standard group is as tall as the 2 rem controls, and a small group
  // sits on the same center line.
  const button = box(byTestId('toolbar').getByRole('button', { name: 'Report settings' }));
  const group = box(byTestId('toolbar-group'));
  const smallGroup = box(byTestId('toolbar-small'));
  expect(button.height).toBeCloseTo(32, 0);
  expect(group.height).toBeCloseTo(32, 0);
  expect(smallGroup.height).toBeCloseTo(24, 0);
  for (const each of [group, smallGroup])
    expect(Math.abs(each.y + each.height / 2 - (button.y + button.height / 2))).toBeLessThan(1);
  // Its own height, which a bunched avatar's slight turn doesn't change.
  for (const item of byTestId('toolbar-group').getByRole('button').elements())
    expect((item as HTMLElement).offsetHeight).toBe(32);
});

test('a group rests bunched, and spreads along an arch under the pointer and with focus inside, never changing its box', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const group = byTestId('decorative');
  const chip = chipOf(group);
  // Each item's center, lift and turn, from its box and its computed transforms.
  const layout = () =>
    items(group).map((item) => {
      const style = getComputedStyle(item);
      const { x, width } = item.getBoundingClientRect();
      return {
        center: x + width / 2,
        lift: Number.parseFloat(style.translate.split(' ')[1] ?? '0') || 0,
        turn: Number.parseFloat(style.rotate) || 0,
      };
    });
  const steps = (each: { center: number }[]) =>
    each.slice(1).map((item, index) => item.center - each[index]!.center);
  await away();
  // At rest the avatars lie in a pile, each starting about 0.6 of its size after the one under
  // it, a little off the line and turned by its place, the same on every load. The count shows,
  // upright and a quarter under the last avatar, its figures clear of it.
  const rest = layout();
  const restSteps = steps(rest);
  expect(restSteps.slice(0, -1).every((step) => step < 32 * 0.7)).toBe(true);
  // The last avatar's own small nudge moves it by up to a pixel.
  expect(Math.abs(restSteps.at(-1)! - (32 - 32 / 4))).toBeLessThan(1.5);
  expect(new Set(rest.slice(0, -1).map((item) => item.turn)).size).toBeGreaterThan(1);
  expect(rest.at(-1)!.turn).toBe(0);
  expect(css(chip, 'opacity')).toBe('1');
  const last = chip.element().previousElementSibling!.getBoundingClientRect();
  expect(
    chip.element().firstElementChild!.getBoundingClientRect().left - last.right,
  ).toBeGreaterThanOrEqual(0);
  addStyle(uncovered);
  const count = box(chip);
  const covered = document.elementFromPoint(count.x + 2, count.y + count.height / 2);
  const clear = document.elementFromPoint(count.x + count.width - 4, count.y + count.height / 2);
  expect({
    covered: !chip.element().contains(covered),
    clear: chip.element().contains(clear),
  }).toEqual({
    covered: true,
    clear: true,
  });
  document.querySelector('style[data-test-style]')!.remove();
  // Under the pointer they spread into a row with gaps, along an arch: the ends lower and turned
  // out, the middle highest. The count stays upright.
  await pointAt(group);
  await expect.poll(() => steps(layout()).every((step) => step > 32)).toBe(true);
  const spread = layout();
  expect(spread[0]!.lift).toBeGreaterThan(spread[1]!.lift);
  expect(spread[0]!.turn).toBeLessThan(0);
  expect(spread.at(-1)!.turn).toBe(0);
  // It bunches back once the pointer leaves.
  await away();
  await expect.poll(layout).toEqual(rest);
  // The keyboard reaches the count, which spreads the group.
  await keyboard.press('Tab');
  await expect.element(chip).toHaveFocus();
  await expect.poll(() => steps(layout()).every((step) => step > 32)).toBe(true);
  (document.activeElement as HTMLElement).blur();

  // Spreading never changes the group's box, so a narrow row never wraps it under the pointer.
  // The group's layout box and those around it, and the items' extent within it.
  const measure = (each: Locator) => {
    const element = each.element() as HTMLElement;
    const around = (element.closest('.env-list-item') ?? element.parentElement!) as HTMLElement;
    const outer = element.getBoundingClientRect();
    const rects = [...element.children].map((child) => child.getBoundingClientRect());
    return {
      box: [element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight],
      around: [around.offsetWidth, around.offsetHeight],
      start: Math.round(Math.min(...rects.map((rect) => rect.left)) - outer.left),
      end: Math.round(outer.right - Math.max(...rects.map((rect) => rect.right))),
    };
  };
  for (const id of ['decorative', 'pressable', 'preview', 'in-row']) {
    const each = byTestId(id);
    each.element().scrollIntoView({ block: 'center' });
    await away();
    await nextFrames();
    const before = measure(each);
    await pointAt(each);
    await nextFrames();
    const hovered = measure(each);
    expect(hovered.box).toEqual(before.box);
    expect(hovered.around).toEqual(before.around);
    // Spread, the items stay within the box, which kept the room for them; turned ends reach a
    // little past.
    expect(hovered.start).toBeGreaterThanOrEqual(-3);
    expect(hovered.end).toBeGreaterThanOrEqual(-3);
    // Focus inside spreads it the same way.
    await away();
    const focusable = each.element().querySelectorAll<HTMLElement>('[tabindex="0"], button, a');
    focusable[focusable.length - 1]!.focus();
    expect(measure(each).box).toEqual(before.box);
    (document.activeElement as HTMLElement | null)?.blur();
  }
  // A group as wide as its content is exactly the spread row. At rest it gathers at the start of
  // that room, or at its end with align="end".
  const inRow = byTestId('in-row');
  await pointAt(inRow);
  await expect.poll(() => Math.abs(measure(inRow).start)).toBeLessThanOrEqual(3);
  expect(Math.abs(measure(inRow).end)).toBeLessThanOrEqual(3);
  await away();
  await expect.poll(() => measure(inRow).start).toBeGreaterThan(32);
  expect(Math.abs(measure(inRow).end)).toBeLessThanOrEqual(3);
  expect(Math.abs(measure(byTestId('decorative')).start)).toBeLessThanOrEqual(3);
});

test('the spread moves with the motion tokens, and at once with reduced motion', async () => {
  const avatar = byTestId('decorative').element().querySelectorAll('.env-avatar')[1]!;
  expect(css(avatar, 'transition-property')).toContain('translate');
  // While the avatars move, the pile stays one target; once they are in place each is its own.
  const group = byTestId('pressable');
  await away();
  await pointAt(group, { x: 4, y: 16 });
  expect(hits(group)).toEqual([false, false, false, false, false]);
  await expect.poll(() => hits(group)).toEqual([true, true, true, true, true]);
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  expect(css(avatar, 'transition-duration')).toBe('0s');
});

test('on touch screens a tap spreads the pile, later taps press touch-sized avatars, and a tap outside or a pause bunches it', async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 844);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    // Mounted afresh on the touch screen, as a page loads on one.
    mount(fixture);
    const tap = async (x: number, y: number) => {
      await commands.touch('touchStart', x, y);
      await commands.touch('touchEnd');
    };
    const tapOn = (target: Locator, offset?: { x: number; y: number }) => {
      const at = box(target);
      return tap(at.x + (offset?.x ?? at.width / 2), at.y + (offset?.y ?? at.height / 2));
    };
    const spread = (group: Locator) => () => group.element().hasAttribute('data-spread');
    // A small AvatarButton's halo grows to the 2.75 rem touch target.
    const avatarButton = box(byTestId('avatar-button-small'));
    expect(avatarButton.width).toBeGreaterThanOrEqual(44);
    expect(avatarButton.height).toBeGreaterThanOrEqual(44);

    const group = byTestId('pressable');
    group.element().scrollIntoView({ block: 'center' });
    // At rest it is a pile, and the pile is one target: a tap on it presses no one, and spreads it.
    const pile = boxes(group);
    const rest = places(group);
    expect(rest[1]!.center - rest[0]!.center).toBeLessThan(32 * 0.7);
    expect(hits(group)).toEqual([false, false, false, false, false]);
    const first = pile.at(-2)!;
    await tap(first.x + first.width / 2, first.top + 22);
    await expect.poll(spread(group)).toBe(true);
    expect(pressed()).toBe('');
    // Spread, each pressable avatar is a target of the touch height, its picture and state layer
    // in the middle, side by side.
    const standard = places(group);
    expect(standard.map((item) => item.left - standard[0]!.left).slice(0, 4)).toEqual([
      0, 44, 88, 132,
    ]);
    for (const item of standard)
      expect(item.center - item.width / 2 - item.left).toBeCloseTo(
        standard[0]!.center - standard[0]!.width / 2 - standard[0]!.left,
        0,
      );
    expect(hits(group)).toEqual([true, true, true, true, true]);
    const targets = [...group.element().querySelectorAll('.env-avatar-group-item')].map((item) => [
      item.getBoundingClientRect().width,
      item.getBoundingClientRect().height,
      parseFloat(getComputedStyle(item, '::after').width),
      item.querySelector<HTMLElement>('.env-avatar')!.offsetWidth,
    ]);
    expect(targets).toHaveLength(4);
    for (const [width, height, layer, avatar] of targets) {
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
      expect(layer).toBe(avatar);
    }
    // The next tap presses the avatar under it, and the group stays spread.
    await tapOn(group.getByRole('button', { name: 'Sam Lee' }));
    await expect.poll(pressed).toBe('Sam Lee');
    expect(spread(group)()).toBe(true);
    // A tap outside bunches it.
    await tap(380, 10);
    await expect.poll(spread(group)).toBe(false);
    expect(hits(group)).toEqual([false, false, false, false, false]);
    // So does a pause of five seconds without a tap in it.
    stopTimers();
    await tap(first.x + first.width / 2, first.top + 22);
    await expect.poll(spread(group)).toBe(true);
    await passTime(4900);
    expect(spread(group)()).toBe(true);
    await passTime(200);
    expect(spread(group)()).toBe(false);
    vi.useRealTimers();

    // A small pressable group spreads into touch targets too.
    const small = byTestId('small-pressable');
    small.element().scrollIntoView({ block: 'center' });
    await tapOn(small, { x: 8, y: 12 });
    await expect.poll(spread(small)).toBe(true);
    const smallSpread = places(small);
    expect(smallSpread.map((item) => item.left - smallSpread[0]!.left).slice(0, 3)).toEqual([
      0, 44, 88,
    ]);
  } finally {
    await commands.emulateTouch(false);
  }
});
