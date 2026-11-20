import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import { NavigationRail, Theme } from '@envsemble/envui';
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

test('a rail with labels as tooltips hides each label but names the destination by it, and shows it in a tooltip on hover and keyboard focus', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  const icon = <svg />;
  flushSync(() =>
    root.render(
      <Theme theme="light">
        <NavigationRail
          aria-label="Activity bar"
          visibleLabel={false}
          destinations={[
            { label: 'Explorer', icon, onClick: () => {}, current: true },
            { label: 'Search', icon, onClick: () => {} },
          ]}
        />
      </Theme>,
    ),
  );
  const rail = page.getByRole('navigation', { name: 'Activity bar' });
  const search = rail.getByRole('button', { name: 'Search' });
  await expect.element(search).toBeInTheDocument();
  const label = search.element().querySelector('.env-navigation-rail-label')!;
  expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  const tooltip = () => document.querySelector('[role="tooltip"]');
  await keyboard.press('Shift');
  (rail.getByRole('button', { name: 'Explorer' }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  await expect.element(search).toHaveFocus();
  await expect.poll(() => tooltip()?.textContent).toBe('Search');
  await keyboard.press('Escape');
  await expect.poll(tooltip).toBeNull();
});
