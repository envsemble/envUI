import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

/** Lines of text plus the field's 1 rem inset above and below. */
async function linesHigh(field: Locator, lines: number) {
  const lineHeight = await field.evaluate((element) =>
    parseFloat(getComputedStyle(element).lineHeight),
  );
  return lines * lineHeight + 32;
}

test(
  'a growing textarea starts at its rows and grows with its lines',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=forms`);
    const height = async (field: Locator) => (await field.boundingBox())!.height;
    const one = page.getByRole('textbox', { name: 'One line', exact: true });
    const three = page.getByRole('textbox', { name: 'Three lines', exact: true });
    await expect(one).toHaveAttribute('data-sizing', 'content');
    expect(await height(one)).toBeCloseTo(await linesHigh(one, 1), 0);
    expect(await height(three)).toBeCloseTo(await linesHigh(three, 3), 0);
    await one.fill(['First', 'Second'].join('\n'));
    await expect.poll(() => height(one)).toBeCloseTo(await linesHigh(one, 2), 0);
    await one.fill('');
    await expect.poll(() => height(one)).toBeCloseTo(await linesHigh(one, 1), 0);
    // Without rows, a growing field keeps the shared 7.5 rem start; a fixed one given rows is that
    // many lines tall, under it.
    expect(await height(page.getByRole('textbox', { name: 'Default lines', exact: true }))).toBe(
      120,
    );
    const two = page.getByRole('textbox', { name: 'Two fixed lines', exact: true });
    expect(await height(two)).toBeCloseTo(await linesHigh(two, 2), 0);
  },
);

test('a ghost textarea shows a faint fill and no border at rest, the accent frame while focused, and its label inside the fill', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const field = page.getByRole('textbox', { name: 'Ghost notes', exact: true });
  const control = page.locator('.env-text-field-control', { has: field });
  const border = control.locator(':scope > .env-text-field-border');
  await expect(control).toHaveAttribute('data-variant', 'ghost');
  await expect(border).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(control).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const rest = await control.evaluate((element) => getComputedStyle(element).backgroundColor);
  await field.focus();
  await expect(border).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  await expect(control).toHaveCSS('background-color', rest);
  // The floated label sits inside the fill, above where the text starts, and opens no notch.
  await expect
    .poll(() =>
      control.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const label = element.querySelector(':scope > label')!.getBoundingClientRect();
        const input = element.querySelector('textarea')!;
        const textTop =
          input.getBoundingClientRect().top + Number.parseFloat(getComputedStyle(input).paddingTop);
        const legend = element.querySelector('.env-text-field-border > legend')!;
        return (
          label.top > box.top &&
          label.bottom <= textTop &&
          legend.getBoundingClientRect().width === 0
        );
      }),
    )
    .toBe(true);
});

test('the resize edge is a named separator that the arrow keys and Home move', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const field = page.getByRole('textbox', { name: 'Two fixed lines', exact: true });
  const edge = page
    .locator('.env-text-field-control', { has: field })
    .getByRole('separator', { name: 'Resize text area', exact: true });
  await expect(edge).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(edge).toHaveAttribute('aria-controls', (await field.getAttribute('id'))!);
  await expect(edge).toHaveAttribute('aria-description', /Up and Down arrows/);
  const before = (await field.boundingBox())!.height;
  await expect(edge).toHaveAttribute('aria-valuenow', String(Math.round(before)));
  // Without a CSS maximum height, the separator still has a finite maximum above its value.
  expect(Number(await edge.getAttribute('aria-valuemax'))).toBeGreaterThan(before * 10);
  await edge.focus();
  await page.keyboard.press('ArrowDown');
  await expect.poll(async () => (await field.boundingBox())!.height).toBeGreaterThan(before);
  await expect
    .poll(async () => Number(await edge.getAttribute('aria-valuenow')))
    .toBeGreaterThan(Math.round(before));
  await page.keyboard.press('Home');
  await expect.poll(async () => (await field.boundingBox())!.height).toBeCloseTo(before, 0);
});
