import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

const fixture = `${fixtureUrl}/?fixture=fields`;

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

test('fields and editors take the background of what they sit on', async ({ page }) => {
  await page.goto(fixture);
  // Every field and editor has rendered, the editors included.
  await expect(page.locator('[data-field]')).toHaveCount(2 * 4 * 13);
  await expect(page.locator('.env-rich-text-editor-content [contenteditable]')).toHaveCount(8);
  const painted = await page.evaluate((content) => {
    const found: string[] = [];
    for (const place of document.querySelectorAll<HTMLElement>('[data-testid]'))
      for (const box of place.querySelectorAll<HTMLElement>('[data-field]'))
        for (const element of box.querySelectorAll<HTMLElement>('*')) {
          const { width, height } = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          // Visually hidden inputs, such as a slider's, paint nothing people see.
          if (width < 2 || height < 2 || style.clipPath !== 'none') continue;
          if (content.some((name) => element.classList.contains(name))) continue;
          if (style.backgroundColor !== 'rgba(0, 0, 0, 0)')
            found.push(
              `${place.dataset.testid} ${box.dataset.field} ${element.className} ${style.backgroundColor}`,
            );
        }
    return found;
  }, content);
  expect(painted).toEqual([]);
});

test('a field takes a fill from its container property', async ({ page }) => {
  await page.goto(fixture);
  const card = page.getByTestId('dark-card');
  // Set on the component's root, as its style prop does.
  const set = (root: string, property: string) =>
    card
      .locator(root)
      .evaluate((root, property) => root.style.setProperty(property, 'rgb(1, 2, 3)'), property);
  await set('[data-field="date-picker"] > .env-date-picker', '--env-text-field-container');
  await set('.env-color-picker-button', '--env-color-picker-button-container');
  await expect(card.locator('[data-field="date-picker"] .env-text-field-control')).toHaveCSS(
    'background-color',
    'rgb(1, 2, 3)',
  );
  await expect(card.locator('.env-color-picker-button')).toHaveCSS(
    'background-color',
    'rgb(1, 2, 3)',
  );
});

test('fields associate labels, hints, and validation messages', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  const project = page.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(project).toHaveAccessibleDescription('A descriptive name');
  await expect(
    page.getByRole('textbox', { name: 'Notes', exact: true }),
  ).toHaveAccessibleDescription('Optional supporting details');
  const invalid = page.getByRole('textbox', { name: 'Invalid sample', exact: true });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Please correct this value');
  // The frame is Field's: Field.Root around the control, Field.Description and Field.Error.
  const field = page.locator('.env-field', { has: invalid });
  await expect(field).toHaveAttribute('data-invalid', '');
  await expect(field.locator('> .env-field-error')).toHaveText('Please correct this value');
  await expect(
    page.locator('.env-field', { has: project }).locator('> .env-field-description'),
  ).toHaveText('A descriptive name');
  await expect(page.locator('.env-field', { has: project })).not.toHaveAttribute('data-invalid');
});
