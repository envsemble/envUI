import type { Page } from '@playwright/test';

/**
 * Holds back the module an option loads where it is used, as a slow network would, matched by its
 * file: `requested` resolves once the page has asked for it, and `release` lets it load, once the
 * page has asked, and holds it back again on the next request, as after a reload.
 */
export async function holdOptionModule(page: Page, file: RegExp) {
  let held = Promise.withResolvers<() => void>();
  await page.route(file, async (route) => {
    const { promise, resolve } = Promise.withResolvers<void>();
    held.resolve(resolve);
    await promise;
    await route.continue();
  });
  return {
    requested: async () => {
      await held.promise;
    },
    release: async () => {
      (await held.promise)();
      held = Promise.withResolvers();
    },
  };
}

/**
 * Makes the module an option loads fail to load, as offline, until `restore` is called. Call it
 * before the page loads; `failed` resolves once the page has seen the module fail, and `remount`
 * mounts the fixture afresh (App.tsx).
 */
export async function failOptionModule(page: Page, file: RegExp) {
  let failing = true;
  await page.route(file, (route) => (failing ? route.abort() : route.continue()));
  const seen = page.waitForEvent('requestfailed', (request) => file.test(request.url()));
  return {
    failed: async () => {
      await seen;
      // The import's rejection reaches the component once the page has handled the failure.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
    },
    restore: () => {
      failing = false;
    },
    remount: () => page.evaluate(() => window.dispatchEvent(new Event('fixture-remount'))),
  };
}
