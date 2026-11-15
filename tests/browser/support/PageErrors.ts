import type { Page } from '@playwright/test';

export function collectErrors(page: Page, { warnings = false }: { warnings?: boolean } = {}) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || (warnings && message.type() === 'warning'))
      errors.push(message.text());
  });
  return errors;
}
