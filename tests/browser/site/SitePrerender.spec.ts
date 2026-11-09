import { test, expect } from '@playwright/test';
import { siteBuildUrl } from '../helpers/Servers';
import { openSite } from '../helpers/SiteSpecHelpers';
import { displayStorageKeys, drawerWidthKey } from '../../../apps/site/src/display/DisplayStorage';

/**
 * A page of each kind the build pre-renders (scripts/site/PrerenderSite.ts): the home page, a
 * component's, a pattern's and a foundation's, a gallery and a page of the Docs.
 */
const sample = [
  '/',
  '/components/button',
  '/patterns/forms',
  '/foundations/colors',
  '/components',
  '/docs/components/button',
];

/** The drawer widths the reader gave each part, in rem, unlike either's default. */
const storedWidths = { catalogue: 19.5, docs: 24 } as const;

for (const scheme of ['light', 'dark'] as const)
  test(`a pre-rendered page hydrates as it is, in ${scheme}, at a stored scale and drawer width`, async ({
    page,
  }) => {
    test.slow();
    await page.addInitScript(
      ({ keys, scheme, widths }) => {
        localStorage.setItem(keys.theme, scheme);
        localStorage.setItem(keys.scale, 'compact');
        for (const [key, width] of widths) localStorage.setItem(key, String(width));
        // The heading as the page arrived, which hydrating keeps, where rendering anew replaces it.
        addEventListener('DOMContentLoaded', () =>
          Object.assign(window, { arrivedHeading: document.querySelector('h1') }),
        );
      },
      {
        keys: displayStorageKeys,
        scheme,
        widths: Object.entries(storedWidths).map(([area, width]) => [
          drawerWidthKey(area as keyof typeof storedWidths),
          width,
        ]),
      },
    );
    // React reports a page that didn't hydrate as it was pre-rendered (main.tsx), and its warnings.
    const problems: string[] = [];
    page.on('pageerror', (error) => problems.push(`${page.url()}: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning')
        problems.push(`${page.url()}: ${message.text()}`);
    });
    for (const path of sample) {
      await openSite(page, `${siteBuildUrl}${path}`);
      await expect(page.locator('#root'), path).toHaveAttribute('data-site-page');
      expect(
        await page
          .getByRole('heading', { level: 1 })
          .evaluate(
            (heading) =>
              heading === (window as { arrivedHeading?: Element }).arrivedHeading &&
              Object.keys(heading).some((key) => key.startsWith('__reactFiber')),
          ),
        `${path} hydrates the heading it arrived with`,
      ).toBe(true);
      // The stored settings hold: hydrating keeps an attribute the server rendered otherwise.
      const app = page.locator('.site-app');
      await expect.soft(app, path).toHaveAttribute('data-env-theme', scheme);
      await expect.soft(app, path).toHaveAttribute('data-env-scale', 'compact');
      // The home page has no drawer.
      const drawer = page.locator('.env-scaffold-drawer .env-navigation-drawer');
      if (await drawer.count())
        await expect
          .soft(drawer, `${path}: the drawer's stored width`)
          .toHaveCSS(
            '--env-navigation-drawer-width',
            `${storedWidths[path.startsWith('/docs') ? 'docs' : 'catalogue']}rem`,
          );
      // A figure shows its example once the page has hydrated, in place of its skeleton.
      const figure = page.locator('.site-live-example').first();
      if (await figure.count()) await expect(figure.locator('.site-loading')).toHaveCount(0);
    }
    expect(problems).toEqual([]);
  });
