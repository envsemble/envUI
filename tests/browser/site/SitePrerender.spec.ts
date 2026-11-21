import { test, expect, type Page } from '@playwright/test';
import { siteBuildUrl } from '../support/Servers';
import { openSite } from '../support/SiteNavigation';
import { headlessWebglPerformanceNotice } from '../support/PageErrors';
import { displayStorageKeys, drawerWidthKey } from '../../../apps/site/src/display/DisplayStorage';

const onePageOfEachPrerenderedKind = [
  '/',
  '/components/button',
  '/foundations/colors',
  '/components',
  '/docs/components/button',
  '/docs/tokens',
  '/docs/changelog',
  '/docs/foundations/colors',
];

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
        addEventListener('DOMContentLoaded', () =>
          Object.assign(window, { arrivedHeading: document.querySelector('h1') }),
        );
      },
      {
        keys: displayStorageKeys,
        scheme,
        widths: Object.entries(storedWidths).map(
          ([area, width]) => [drawerWidthKey(area as keyof typeof storedWidths), width] as const,
        ),
      },
    );
    const problems = watchProblems(page);
    for (const path of onePageOfEachPrerenderedKind) {
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
      const root = page.locator('html');
      await expect.soft(root, path).toHaveAttribute('data-env-theme', scheme);
      await expect.soft(root, path).toHaveAttribute('data-env-scale', 'compact');
      await expect.soft(page.locator('.site-app'), path).not.toHaveAttribute('data-env-theme');
      const drawer = page.locator('.env-scaffold-drawer .env-navigation-drawer');
      if (await drawer.count())
        await expect
          .soft(drawer, `${path}: the drawer's stored width`)
          .toHaveCSS(
            '--env-navigation-drawer-width',
            `${storedWidths[path.startsWith('/docs') ? 'docs' : 'catalogue']}rem`,
          );
      const figure = page.locator('.site-live-example').first();
      if (await figure.count()) await expect(figure.locator('.site-loading')).toHaveCount(0);
    }
    expect(problems).toEqual([]);
  });

function watchProblems(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`${page.url()}: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error' && message.type() !== 'warning') return;
    if (headlessWebglPerformanceNotice.test(message.text())) return;
    problems.push(`${page.url()}: ${message.text()}`);
  });
  return problems;
}

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
    const path = '/docs/components/button#import';
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
    expect(await codeColor(page)).toBe(arrived);
    const section = page.locator('#import');
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

test('settings stored under the keys of before move to their keys now, and still apply', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', 'yes');
    localStorage.setItem('envui-catalogue-theme', 'dark');
    localStorage.setItem('envui-catalogue-scale', 'compact');
    localStorage.setItem('envui-catalogue-drawer-width-site', '25');
  });
  await page.goto(`${siteBuildUrl}/components/button`);
  await expect(page.locator('html')).toHaveAttribute('data-env-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-env-scale', 'compact');
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored).toMatchObject({
    [displayStorageKeys.theme]: 'dark',
    [displayStorageKeys.scale]: 'compact',
    'envui-site-drawer-width-catalogue': '25',
  });
  expect(Object.keys(stored).filter((key) => key.startsWith('envui-catalogue-'))).toEqual([]);
});

test("a campaign's query keeps the pre-rendered page in view, and an old address's query hides it", async ({
  page,
}) => {
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
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://envui.envsemble.com/components/button',
  );
});
