import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Navigation.fixture.tsx';
import { keyboard } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test(
  'destinations are tab stops in order, and Enter selects one',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const scope = page.getByTestId('navigation-light');
    const rail = scope.getByRole('navigation', { name: 'Mail rail' });
    rail.element().querySelector<HTMLElement>('.env-navigation-rail-item')!.focus();
    for (const label of ['Drafts', 'Sent', 'Starred']) {
      await keyboard.press('Tab');
      await expect
        .element(rail.getByRole('button', { name: new RegExp(`^${label}`) }))
        .toHaveFocus();
    }
    await keyboard.press('Enter');
    await expect
      .element(rail.getByRole('button', { name: 'Starred' }))
      .toHaveAttribute('aria-current', 'page');
    await expect
      .poll(() => scope.getByTestId('current').element().textContent)
      .toBe('Starred, Labels');
  },
);
