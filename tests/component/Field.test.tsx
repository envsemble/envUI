import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Field.fixture.tsx';
import { css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

/**
 * Parts that paint a fill as content or by design, not as a field's well: a color picker's area,
 * thumbs and swatch, Select's trigger, a Button, and the indicator of an editor's tabs.
 */
const content = [
  'env-color-picker-area',
  'env-color-picker-thumb',
  'env-color-swatch-sample',
  'env-select-trigger',
  'env-tabs-indicator',
];

test('fields and editors take the background of what they sit on, or a fill from their container property', async () => {
  // Every field and editor has rendered, the editors included.
  await expect.poll(() => document.querySelectorAll('[data-field]').length).toBe(2 * 4 * 13);
  await expect
    .poll(() => document.querySelectorAll('.env-rich-text-editor-content [contenteditable]').length)
    .toBe(8);
  const painted: string[] = [];
  for (const place of document.querySelectorAll<HTMLElement>('[data-testid]'))
    for (const box of place.querySelectorAll<HTMLElement>('[data-field]'))
      for (const element of box.querySelectorAll<HTMLElement>('*')) {
        const { width, height } = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        // Visually hidden inputs, such as a slider's, paint nothing people see.
        if (width < 2 || height < 2 || style.clipPath !== 'none') continue;
        if (content.some((name) => element.classList.contains(name))) continue;
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)')
          painted.push(
            `${place.dataset.testid} ${box.dataset.field} ${element.className} ${style.backgroundColor}`,
          );
      }
  expect(painted).toEqual([]);

  // A fill set on the component's root, as its style prop does, reaches its well.
  const card = page.getByTestId('dark-card').element();
  card
    .querySelector<HTMLElement>('[data-field="date-picker"] > .env-date-picker')!
    .style.setProperty('--env-text-field-container', 'rgb(1, 2, 3)');
  const button = card.querySelector<HTMLElement>('.env-color-picker-button')!;
  button.style.setProperty('--env-color-picker-button-container', 'rgb(1, 2, 3)');
  const well = card.querySelector('[data-field="date-picker"] .env-text-field-control')!;
  await expect.poll(() => css(well, 'background-color')).toBe('rgb(1, 2, 3)');
  await expect.poll(() => css(button, 'background-color')).toBe('rgb(1, 2, 3)');
});
