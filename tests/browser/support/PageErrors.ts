import type { Page } from '@playwright/test';

export const headlessWebglPerformanceNotice =
  /^\[\.WebGL-[^\]]+\]GL Driver Message \([^)]*, Performance,/;

export function collectErrors(page: Page, { warnings = false }: { warnings?: boolean } = {}) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (headlessWebglPerformanceNotice.test(message.text())) return;
    if (message.type() === 'error' || (warnings && message.type() === 'warning'))
      errors.push(message.text());
  });
  return errors;
}
