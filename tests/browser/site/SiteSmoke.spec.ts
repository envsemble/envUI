import { test, expect, type Page } from '@playwright/test';
import { siteBuildUrl } from '../support/Servers';
import { chooseScheme } from '../support/CatalogueThemes';
import { collectErrors } from '../support/PageErrors';
import { openSite } from '../support/SiteNavigation';

const journeys: { kind: string; path: string; act: (page: Page) => Promise<void> }[] = [
  {
    kind: 'the home page',
    path: '/',
    act: async (page) => {
      await page
        .locator('.site-top-bar .site-wide-only')
        .getByRole('button', { name: /^Search/ })
        .first()
        .click();
      const dialog = page.getByRole('dialog', { name: 'Search envUI' });
      await expect(dialog.locator('.site-loading')).toHaveCount(0);
      await dialog.getByRole('combobox', { name: 'Search envUI' }).fill('button');
      await expect(dialog.locator('[data-item-id="page:button"]')).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(`${siteBuildUrl}/components/button`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    },
  },
  {
    kind: "a component's page",
    path: '/components/checkbox',
    act: async (page) => {
      const example = page.getByRole('group', { name: 'Checkbox example', exact: true });
      const archived = example.getByRole('checkbox', { name: 'Include archived projects' });
      await archived.check();
      await chooseScheme(page, 'dark');
      await expect(example).toHaveAttribute('data-env-theme', 'dark');
      await expect(archived).toBeChecked();
    },
  },
  {
    kind: "another component's page",
    path: '/components/text-field',
    act: async (page) => {
      const next = page
        .getByRole('navigation', { name: 'Previous and next content' })
        .getByRole('link')
        .last();
      const href = (await next.getAttribute('href'))!;
      const heading = page.getByRole('heading', { level: 1 });
      const title = await heading.textContent();
      await next.click();
      await expect(page).toHaveURL(`${siteBuildUrl}${href}`);
      await expect(heading).not.toHaveText(title!);
    },
  },
  {
    kind: "a foundation's page",
    path: '/foundations/colors',
    act: async (page) => {
      const main = page.getByRole('main');
      await expect(main).not.toBeFocused();
      await page
        .getByRole('navigation', { name: 'Foundations' })
        .getByRole('link', { name: 'Typography', exact: true })
        .click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Typography');
      await expect(main).toBeFocused();
    },
  },
  {
    kind: 'a gallery',
    path: '/components',
    act: async (page) => {
      const card = page.locator('.catalogue-gallery-tile').nth(1);
      const href = (await card.locator('.catalogue-gallery-link').getAttribute('href'))!;
      await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      const box = (await card.boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.4);
      await expect(page).toHaveURL(`${siteBuildUrl}${href}`);
    },
  },
  {
    kind: "a component's page in the Docs",
    path: '/docs/components/button',
    act: async (page) => {
      await page
        .getByRole('navigation', { name: 'Design or code' })
        .getByRole('link', { name: 'Design' })
        .click();
      await expect(page).toHaveURL(`${siteBuildUrl}/components/button`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Button');
    },
  },
  {
    kind: 'a guide in the Docs',
    path: '/docs/customizing',
    act: async (page) => {
      await page
        .locator('.site-article')
        .getByRole('link', { name: 'Surface', exact: true })
        .first()
        .click();
      await expect(page).toHaveURL(`${siteBuildUrl}/components/surface`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Surface');
    },
  },
  {
    kind: 'the token reference',
    path: '/docs/tokens',
    act: async (page) => {
      const contents = page.getByRole('navigation', { name: 'On this page' });
      const link = contents.getByRole('link').nth(1);
      const href = (await link.getAttribute('href'))!;
      await link.click();
      await expect(page).toHaveURL(`${siteBuildUrl}/docs/tokens${href}`);
      await expect(contents.locator('[aria-current="location"]')).toHaveAttribute('href', href);
    },
  },
  {
    kind: 'the changelog',
    path: '/docs/changelog',
    act: async (page) => {
      const link = page.locator('.docs-releases a').first();
      const href = (await link.getAttribute('href'))!;
      await link.click();
      await expect(page).toHaveURL(`${siteBuildUrl}${href}`);
      await expect(page.locator(`[id="${href.split('#')[1]}"]`)).toBeInViewport();
    },
  },
];

for (const { kind, path, act } of journeys)
  test(`${kind} hydrates and answers the reader, with nothing wrong on the way`, async ({
    page,
    context,
  }) => {
    const elsewhere: string[] = [];
    await context.route(
      (url) => !url.href.startsWith(siteBuildUrl),
      (route) => {
        elsewhere.push(route.request().url());
        return route.abort();
      },
    );
    const errors = collectErrors(page, { warnings: true });
    await openSite(page, `${siteBuildUrl}${path}`);
    await expect(page.locator('#root')).toHaveAttribute('data-site-page');
    await act(page);
    expect(errors).toEqual([]);
    expect(elsewhere).toEqual([]);
  });

test("an open example's popup comes to rest where the screen draws at a fraction of a pixel", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1536, height: 730 },
    deviceScaleFactor: 1.75,
  });
  const page = await context.newPage();
  await openSite(page, `${siteBuildUrl}/components/select`);
  const room = page.locator('[data-open-example="ProjectVisibility"]');
  await room.getByRole('listbox').waitFor();
  const tops = await room.evaluate(
    (element) =>
      new Promise<number[]>((done) => {
        const seen: number[] = [];
        const frame = () => {
          seen.push(element.querySelector('[role="listbox"]')!.getBoundingClientRect().top);
          if (seen.length < 90) requestAnimationFrame(frame);
          else done(seen);
        };
        frame();
      }),
  );
  expect(new Set(tops.slice(45)).size).toBe(1);
  expect(tops.filter((top, index) => index > 0 && top !== tops[index - 1]).length).toBeLessThan(6);
  await context.close();
});
