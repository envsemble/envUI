import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Primitives.fixture.tsx';
import { css, keyboard, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

test('carries the theme into the portal and the direction at its trigger, mounted once', async () => {
  // A popup remounted after opening returns focus to where it was, and a menu closes as it opens.
  let removed = 0;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations)
      for (const node of mutation.removedNodes)
        if (node instanceof Element && node.querySelector('[data-testid^="popup-"]')) removed += 1;
  });
  observer.observe(document.body, { childList: true, subtree: true });
  for (const dir of ['ltr', 'rtl'] as const) {
    await page.getByRole('button', { name: `Open ${dir}` }).click();
    const popup = page.getByTestId(`popup-${dir}`);
    await expect.poll(() => shown(popup)).toBe(true);
    expect(removed).toBe(0);
    await expect.element(popup).toHaveClass(/env-popup/);
    await expect.element(popup).toHaveAttribute('data-elevation', '2');
    await expect.element(popup).toHaveAttribute('data-width', 'md');
    expect(popup.element().closest('.env-popup-theme')?.getAttribute('data-env-theme')).toBe(
      'light',
    );
    expect(css(popup, 'direction')).toBe(dir);
    await keyboard.press('Escape');
    await expect.poll(() => shown(popup)).toBe(false);
    removed = 0;
  }
  observer.disconnect();
});

test('takes the direction at its trigger while focus is elsewhere', async () => {
  // Focus stays in a left-to-right region while code opens the right-to-left popup.
  (page.getByRole('button', { name: 'Open ltr' }).element() as HTMLElement).focus();
  page
    .getByRole('button', { name: 'Open rtl' })
    .element()
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const popup = page.getByTestId('popup-rtl');
  await expect.poll(() => shown(popup)).toBe(true);
  expect(css(popup, 'direction')).toBe('rtl');
});
