import type { Page } from '@playwright/test';

/**
 * The address of an option's module, named as its source file is: the file itself on a development
 * server, or the chunk a build names after it, such as `reorderController-C-xeEPbo.js`.
 */
const moduleFile = (name: string) => new RegExp(String.raw`/${name}(?:\.tsx?|-[\w-]+\.js)(?:\?|$)`);

/**
 * Holds back the module an option loads where it is used, as a slow network would, matched by its
 * name: `requested` resolves once the page has asked for it, and `release` lets it load, once the
 * page has asked, and holds it back again on the next request, as after a reload.
 */
export async function holdOptionModule(page: Page, name: string) {
  const file = moduleFile(name);
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
 * before the page loads; `failed` resolves once the request has failed, and `remount` mounts the
 * fixture afresh (App.tsx). The import's rejection reaches the component later, by no event a spec
 * can wait for, and later still under load: a spec whose next step needs the component to have
 * handled it polls for what that changes.
 */
export async function failOptionModule(page: Page, name: string) {
  const file = moduleFile(name);
  let failing = true;
  await page.route(file, (route) => (failing ? route.abort() : route.continue()));
  const seen = page.waitForEvent('requestfailed', (request) => file.test(request.url()));
  return {
    failed: async () => {
      await seen;
      // Usually the component has handled the rejection two frames later.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
    },
    restore: () => {
      failing = false;
    },
    // Resolves once the new mount is in the page, so what a spec does next reaches it rather than
    // the elements it replaces.
    remount: async () => {
      const mounts = await page.evaluate(() => {
        const before = Number(document.documentElement.dataset.fixtureMounts);
        window.dispatchEvent(new Event('fixture-remount'));
        return before;
      });
      await page.waitForFunction(
        (before) => Number(document.documentElement.dataset.fixtureMounts) > before,
        mounts,
      );
    },
  };
}
