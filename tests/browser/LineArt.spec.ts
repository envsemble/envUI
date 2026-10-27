import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

// LineArt: hairlines in the muted edge color that cover the box, resting on its foot, cropped from
// the side away from where the drawing sits, mirrored right to left, and the system's gray text in forced colors.

/** The box of a drawing's outer rectangle, and of the drawing itself, in the page's pixels. */
const boxes = (art: Locator) =>
  art.evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    const sheet = svg.querySelector('rect')!.getBoundingClientRect();
    return { box: { left: box.left, right: box.right, bottom: box.bottom }, sheet };
  });

test('it covers its box from where it sits, its lines hairlines in the muted edge color', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=line-arts`);
  const end = page.getByTestId('end');
  await expect(end).toHaveCSS('width', '192px');
  await expect(end).toHaveCSS('height', '192px');
  const line = end.locator('line').first();
  await expect(line).toHaveCSS('fill', 'none');
  await expect(line).toHaveCSS('stroke-width', '1px');
  await expect(line).toHaveCSS('vector-effect', 'non-scaling-stroke');
  const muted = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--env-color-border-muted)';
    document.querySelector('.fixture-section')!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(line).toHaveCSS('stroke', muted);

  // The golden rectangle reaches the end and the foot of its box at the end; its start is cropped.
  // At the start, the other way round, its start 43 of the sheet's 480 in; right to left, mirrored.
  const atEnd = await boxes(end);
  const scale = 192 / 330;
  expect(Math.abs(atEnd.sheet.right - atEnd.box.right)).toBeLessThan(1);
  expect(Math.abs(atEnd.sheet.bottom - atEnd.box.bottom)).toBeLessThan(1);
  expect(atEnd.sheet.left).toBeLessThan(atEnd.box.left);
  const atStart = await boxes(page.getByTestId('start'));
  expect(Math.abs(atStart.sheet.left - (atStart.box.left + 43.1 * scale))).toBeLessThan(1);
  expect(atStart.sheet.right).toBeGreaterThan(atStart.box.right);
  const rtl = await boxes(page.getByTestId('rtl'));
  expect(Math.abs(rtl.sheet.left - rtl.box.left)).toBeLessThan(1);
  expect(rtl.sheet.right).toBeGreaterThan(rtl.box.right);

  // Decorative, it is hidden; a label makes it an image.
  await expect(end).toHaveAttribute('aria-hidden', 'true');
  await expect(
    page.getByRole('img', { name: 'A chain of circles between three arcs' }),
  ).toHaveAttribute('data-drawing', 'pappus-chain');

  // In forced colors, the lines take the system's gray text color.
  await page.emulateMedia({ forcedColors: 'active' });
  const grayText = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'GrayText';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(line).toHaveCSS('stroke', grayText);
});

/**
 * Each line's dash offset, in lines' lengths, to a hundredth: 0 draws it whole, 1 or -1 not at all.
 */
const offsets = (art: Locator) =>
  art.evaluate((svg) =>
    [...svg.children].map((line) => {
      const style = getComputedStyle(line);
      const offset = parseFloat(style.strokeDashoffset) / parseFloat(style.strokeDasharray);
      return Math.round(offset * 100) / 100 || 0;
    }),
  );

/**
 * Holds the lines' animations at a time, in ms from their start, or a moment before their ends,
 * so that they don't end.
 */
const holdAt = (art: Locator, time: number | 'end') =>
  art.evaluate((svg, time) => {
    for (const animation of svg.getAnimations({ subtree: true })) {
      animation.pause();
      animation.currentTime =
        time === 'end' ? Number(animation.effect!.getComputedTiming().endTime) - 1 : time;
    }
  }, time);

/** Ends the lines' animations, as the time they take would. */
const finish = (art: Locator) =>
  art.evaluate((svg) => svg.getAnimations({ subtree: true }).forEach((each) => each.finish()));

// The motions are CSS animations of the lines' dash offset, as drawn, which each engine runs.
test(
  'its lines draw themselves in and out, a loop ending each turn where the next begins',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=line-arts`);
    const art = page.getByTestId('moving');
    const ended = page.getByTestId('ended');
    const count = await art.evaluate((svg) => svg.children.length);
    const all = (offset: number) => Array.from({ length: count }, () => offset);

    // A loop draws the lines in from nothing and holds them whole, then draws them out to nothing,
    // where the next turn starts: a whole dash period on, the same picture.
    await page.getByRole('button', { name: 'loop', exact: true }).click();
    await expect(art).toHaveAttribute('data-turn', 'in');
    await expect(art.locator('line').first()).toHaveAttribute('pathLength', '1');
    await holdAt(art, 0);
    expect(await offsets(art)).toEqual(all(1));
    await holdAt(art, 'end');
    expect(await offsets(art)).toEqual(all(0));
    await finish(art);
    await expect(art).toHaveAttribute('data-turn', 'out');
    await holdAt(art, 0);
    expect(await offsets(art)).toEqual(all(0));
    await holdAt(art, 'end');
    expect(await offsets(art)).toEqual(all(-1));
    await finish(art);
    await expect(art).toHaveAttribute('data-turn', 'in');
    await holdAt(art, 0);
    expect(await offsets(art)).toEqual(all(1));
    // A loop never ends.
    await expect(ended).toHaveText('');

    // The one-shot motions end where they say, and say so.
    await page.getByRole('button', { name: 'appear', exact: true }).click();
    await expect(art).not.toHaveAttribute('data-turn');
    await holdAt(art, 0);
    expect(await offsets(art)).toEqual(all(1));
    await finish(art);
    await expect(ended).toHaveText('appear');
    expect(await offsets(art)).toEqual(all(0));
    await page.getByRole('button', { name: 'play', exact: true }).click();
    await holdAt(art, 0);
    expect(await offsets(art)).toEqual(all(0));
    await finish(art);
    await expect(ended).toHaveText('appear play');
    expect(await offsets(art)).toEqual(all(-2));
    await page.getByRole('button', { name: 'disappear', exact: true }).click();
    await finish(art);
    await expect(ended).toHaveText('appear play disappear');
    expect(await offsets(art)).toEqual(all(-1));
  },
);

test(
  'with reduced motion, a motion shows where it ends at once, and a loop stays whole',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${fixtureUrl}/?fixture=line-arts`);
    const art = page.getByTestId('moving');
    const ended = page.getByTestId('ended');
    const count = await art.evaluate((svg) => svg.children.length);
    const all = (offset: number) => Array.from({ length: count }, () => offset);

    await page.getByRole('button', { name: 'appear', exact: true }).click();
    await expect(ended).toHaveText('appear');
    expect(await offsets(art)).toEqual(all(0));
    await page.getByRole('button', { name: 'disappear', exact: true }).click();
    await expect(ended).toHaveText('appear disappear');
    expect(await offsets(art)).toEqual(all(-1));
    await page.getByRole('button', { name: 'play', exact: true }).click();
    await expect(ended).toHaveText('appear disappear play');
    expect(await offsets(art)).toEqual(all(-2));
    await page.getByRole('button', { name: 'loop', exact: true }).click();
    await expect(art).toHaveAttribute('data-turn', 'in');
    expect(await art.evaluate((svg) => svg.getAnimations({ subtree: true }).length)).toBe(0);
    expect(await offsets(art)).toEqual(all(0));
  },
);
