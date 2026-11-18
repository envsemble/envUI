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

test('the top bar and each navigation form take the default surface color, and background="page" the page', async () => {
  mount(fixture);
  const scope = page.getByTestId('backgrounds').first().element();
  const color = (token: string) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = `var(${token})`;
    scope.append(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  };
  const fill = (selector: string) =>
    getComputedStyle(scope.querySelector(selector)!).backgroundColor;
  for (const part of [
    'env-top-bar',
    'env-navigation-drawer',
    'env-navigation-rail',
    'env-navigation-bar',
  ]) {
    expect(fill(`.${part}[data-background='default']`), part).toBe(color('--env-color-bg-default'));
    expect(fill(`.${part}[data-background='page']`), part).toBe(color('--env-color-bg-page'));
  }
  expect(fill('.env-top-bar:not([data-background="page"])')).toBe(color('--env-color-bg-default'));
});
