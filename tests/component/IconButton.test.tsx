import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Layout.fixture.tsx';
import { box, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test('icon-only buttons keep their square size where their container is squeezed', () => {
  mount(fixture);
  for (const theme of ['light', 'dark']) {
    const row = page.getByTestId(`layout-${theme}`).getByTestId('shrink-row');
    const button = row.getByRole('button', { name: `Squeezed next ${theme}` });
    expect(shown(button)).toBe(true);
    // The slot around the button is squeezed below the button's size; the button is not.
    expect(box(row.element().querySelector('.fixture-shrink-slot')!).width).toBeLessThan(40);
    const { width, height } = box(button);
    expect(width).toBeCloseTo(40, 0);
    expect(height).toBeCloseTo(40, 0);
    const icon = box(button.element().querySelector('svg')!);
    expect(icon.width).toBeGreaterThan(0);
    expect(icon.height).toBeGreaterThan(0);
  }
});
