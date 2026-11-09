import { test, expect, type Page } from '@playwright/test';
import { siteBuildUrl } from '../helpers/Servers';
import { openSite } from '../helpers/SiteSpecHelpers';
import { displayStorageKeys, drawerWidthKey } from '../../../apps/site/src/display/DisplayStorage';

/**
 * A page of each kind the build pre-renders (scripts/site/PrerenderSite.ts): the home page, a
 * component's, a pattern's and a foundation's, a gallery, and the Docs' component page, token
 * reference, changelog and foundation guide, the last three with parts that load on their own.
 */
const sample = [
  '/',
  '/components/button',
  '/patterns/forms',
  '/foundations/colors',
  '/components',
  '/docs/components/button',
  '/docs/tokens',
  '/docs/changelog',
  '/docs/foundations/colors',
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
    const problems = watchProblems(page);
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
      // The stored settings hold on the root, where the head's scripts put them, and the frame
      // takes the root's look, a theme of no attributes of its own, before and after hydrating.
      const root = page.locator('html');
      await expect.soft(root, path).toHaveAttribute('data-env-theme', scheme);
      await expect.soft(root, path).toHaveAttribute('data-env-scale', 'compact');
      await expect.soft(page.locator('.site-app'), path).not.toHaveAttribute('data-env-theme');
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

/** React's reports of a page that didn't hydrate as it was pre-rendered, and its other problems. */
function watchProblems(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`${page.url()}: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      problems.push(`${page.url()}: ${message.text()}`);
  });
  return problems;
}

/** The text color of the page's first inline code. */
const codeColor = (page: Page) =>
  page
    .locator('.env-code')
    .first()
    .evaluate((code) => getComputedStyle(code).color);

test.describe('a reader with nothing stored, in dark at high contrast and reduced motion, on a phone', () => {
  test.use({
    colorScheme: 'dark',
    contrast: 'more',
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });

  test("a section's address hydrates as it is, its code in the reader's theme from the first paint", async ({
    page,
  }) => {
    const path = '/docs/components/button#customize';
    // The page as it arrives, without the site's script: its code in the system's dark theme at
    // high contrast already (Code.css), as the head's script themed the root.
    const bare = await page.context().newPage();
    await bare.route('**/assets/*.js', (route) => route.abort());
    await bare.goto(`${siteBuildUrl}${path}`);
    await expect(bare.locator('html')).toHaveAttribute('data-env-theme', 'dark');
    await expect(bare.locator('#root')).toBeVisible();
    const arrived = await codeColor(bare);
    expect(arrived).toBe('rgb(240, 243, 246)');
    await bare.close();

    const problems = watchProblems(page);
    await openSite(page, `${siteBuildUrl}${path}`);
    await expect(page.locator('#root')).toHaveAttribute('data-site-page', 'docs/components/button');
    await expect(page.locator('html')).toHaveAttribute('data-env-theme', 'dark');
    // Hydrated, the code keeps its colors, and the address's section is at the top.
    expect(await codeColor(page)).toBe(arrived);
    const section = page.locator('#customize');
    await expect
      .poll(() =>
        section.evaluate(
          (heading) =>
            heading.getBoundingClientRect().top -
            document.getElementById('site-main')!.getBoundingClientRect().top,
        ),
      )
      .toBeLessThan(120);
    expect(problems).toEqual([]);
  });
});

test("a campaign's query keeps the pre-rendered page in view, and an old address's query hides it", async ({
  page,
}) => {
  // Without the site's script, only the head's check decides what shows.
  await page.route('**/assets/*.js', (route) => route.abort());
  for (const [query, shown] of [
    ['?utm_source=newsletter&fbclid=1', true],
    ['?scale=compact', true],
    ['?section=variants', false],
    ['?document=forms', false],
  ] as const) {
    await page.goto(`${siteBuildUrl}/components/button${query}`);
    await expect(page.locator('#root'), query).toBeVisible({ visible: shown });
  }
  // Each page names its one address.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://envui.envsemble.com/components/button',
  );
});
