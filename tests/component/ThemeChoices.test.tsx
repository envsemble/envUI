import { afterEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/ThemeChoices.fixture.tsx';
import { mount, unmount } from './support/Mount.tsx';

afterEach(() => {
  unmount();
  const root = document.documentElement;
  for (const name of root.getAttributeNames())
    if (name.startsWith('data-env-')) root.removeAttribute(name);
  root.classList.remove('env-theme');
});

test("ThemeToggle shows the application's own icon and keeps its name", async () => {
  mount(fixture);
  const toggle = page.getByTestId('own-toggle');
  await expect.element(toggle).toHaveAccessibleName(/Switch to (dark|light) theme/);
  expect(toggle.element().querySelectorAll('svg')).toHaveLength(1);
  expect(toggle.element().querySelector('[data-testid="own-icon"]')).not.toBeNull();
});

test('ThemeMenuRadioGroup shows the choices it is given, in place of the three, with its class', async () => {
  mount(fixture);
  await page.getByRole('button', { name: 'Appearance' }).click();
  const group = page.getByRole('group', { name: 'Theme' });
  await expect.element(group).toHaveClass(/fixture-theme-group/);
  const items = group.getByRole('menuitemradio');
  expect(items.elements().map((item) => item.textContent)).toEqual([
    'Light',
    'Dark, easier at night',
  ]);
  await expect.element(items.first()).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('menuitemradio', { name: 'Dark, easier at night' }).click();
  await expect.element(page.getByTestId('preference')).toHaveTextContent('dark');
  await expect.element(group).toBeVisible();
});

test("Theme's render element keeps its own style, handler and ref beside the boundary's", async () => {
  mount({ default: fixture.ThemeRenderFixture });
  const region = page.getByRole('region', { name: 'Dark region' });
  await expect.element(region).toHaveAttribute('data-env-theme', 'dark');
  await expect.element(region).toHaveClass('env-theme fixture-region');
  const style = (region.element() as HTMLElement).style;
  expect([style.paddingInline, style.paddingBlock]).toEqual(['1px', '2px']);
  await page.getByRole('button', { name: 'Inside' }).click();
  await expect.element(page.getByTestId('presses')).toHaveTextContent('section theme');
  await expect
    .poll(() => page.getByTestId('refs').element().textContent!.split(' ').sort())
    .toEqual(['section', 'theme']);
});
