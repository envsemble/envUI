import type { Page } from '@playwright/test';

/**
 * The errors a page reports from now on, as a list that fills while the test runs: uncaught
 * exceptions and console errors, and console warnings too with `warnings`, such as React's.
 */
export function collectErrors(page: Page, { warnings = false }: { warnings?: boolean } = {}) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || (warnings && message.type() === 'warning'))
      errors.push(message.text());
  });
  return errors;
}
