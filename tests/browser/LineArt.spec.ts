import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

// LineArt: hairlines in the muted edge color that cover the box, cropped from the side away from
// where the drawing sits, mirrored right to left, and the system's gray text in forced colors.

/** The box of a drawing's outer rectangle, and of the drawing itself, in the page's pixels. */
const boxes = (art: Locator) =>
  art.evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    const sheet = svg.querySelector('rect')!.getBoundingClientRect();
    return { box: { left: box.left, right: box.right }, sheet };
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

  // The golden rectangle's end, 14 of the sheet's 480 from its edge, stays in view at the end;
  // its start is cropped. At the start, the other way round; right to left, mirrored.
  const atEnd = await boxes(end);
  const scale = 192 / 330;
  expect(Math.abs(atEnd.sheet.right - (atEnd.box.right - 14 * scale))).toBeLessThan(1);
  expect(atEnd.sheet.left).toBeLessThan(atEnd.box.left);
  const atStart = await boxes(page.getByTestId('start'));
  expect(Math.abs(atStart.sheet.left - (atStart.box.left + 29.1 * scale))).toBeLessThan(1);
  expect(atStart.sheet.right).toBeGreaterThan(atStart.box.right);
  const rtl = await boxes(page.getByTestId('rtl'));
  expect(Math.abs(rtl.sheet.left - (rtl.box.left + 14 * scale))).toBeLessThan(1);
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
