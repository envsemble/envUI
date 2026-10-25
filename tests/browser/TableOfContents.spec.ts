import { expect, test, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const url = `${fixtureUrl}/?fixture=table-of-contents`;
const current = (contents: Locator) => contents.locator('[aria-current="location"]');

test('lists the headings of its container, nested by level, with ids from their words', async ({
  page,
}) => {
  await page.goto(url);
  const contents = page.getByRole('navigation', { name: 'On this page' });
  // The top level, then each h3 under the h2 above it; the example's heading and the h4 are left
  // out, and a part hidden from assistive technology is no part of the label.
  const top = contents.locator(':scope > div > ol > li > a');
  await expect(top).toHaveText(['Introduction', 'Usage', 'Short end', 'Last']);
  const nested = contents.locator('ol ol a');
  await expect(nested).toHaveText(['Install the package', 'Configure']);
  await expect(nested.first()).toHaveAttribute('href', '#install-the-package');
  await expect(page.locator('h3#install-the-package')).toHaveText('Install the package');
  // At the top of the page, before any section has reached the line, the first is current.
  await expect(current(contents)).toHaveText('Introduction');
  // A heading added later joins the list in its place.
  await page.getByRole('button', { name: 'Add a section' }).click();
  await expect(top).toHaveText(['Introduction', 'Usage', 'Added later', 'Short end', 'Last']);
});

test(
  'marks the section the reader is in as the page scrolls, the short last ones at the end',
  {
    tag: '@engines',
  },
  async ({ page }) => {
    await page.goto(url);
    const contents = page.getByRole('navigation', { name: 'On this page' });
    await expect(current(contents)).toHaveText('Introduction');
    await page.locator('#usage').evaluate((heading) => heading.scrollIntoView({ block: 'start' }));
    await expect(current(contents)).toHaveText('Usage');
    await expect(contents.locator('[aria-current]')).toHaveCount(1);
    // The last two sections are too short to reach the line: the end of the page makes the last
    // one current, and a little above it the one before.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(current(contents)).toHaveText('Last');
    await page.evaluate(() => window.scrollBy(0, -40));
    await expect(current(contents)).toHaveText('Short end');
    // The marker stands beside the current link: its visible stretch is as tall as the link's.
    const marker = contents.locator('.env-table-of-contents-marker');
    await expect(marker).not.toHaveAttribute('data-hidden');
    await expect(marker).toHaveCSS('stroke-dasharray', /^\d/);
  },
);

test(
  'a link scrolls its section below the sticky bar, adds it to the address and moves focus',
  {
    tag: '@engines',
  },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    const contents = page.getByRole('navigation', { name: 'On this page' });
    await contents.getByRole('link', { name: 'Configure' }).click();
    await expect(page).toHaveURL(/#configure$/);
    await expect(current(contents)).toHaveText('Configure');
    const heading = page.locator('#configure');
    await expect(heading).toBeFocused();
    // At once, under reduced motion, and clear of the bar by the heading's scroll margin.
    await expect
      .poll(() => heading.evaluate((element) => element.getBoundingClientRect().top))
      .toBeCloseTo(72, 0);
    // The keyboard does the same.
    await contents.getByRole('link', { name: 'Usage' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#usage')).toBeFocused();
    await expect(current(contents)).toHaveText('Usage');
  },
);

test(
  'sections of its own follow the box that scrolls them',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(url);
    const review = page.getByRole('navigation', { name: 'Review' });
    await expect(review.getByRole('link')).toHaveText(['Summary', 'Results', 'Costs']);
    await expect(current(review)).toHaveText('Summary');
    const box = page.getByTestId('review');
    await box.evaluate((element) => element.scrollTo(0, 20 * 16));
    await expect(current(review)).toHaveText('Results');
    // Costs is too short to reach the line: the end of the box makes it current.
    await box.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await expect(current(review)).toHaveText('Costs');
    // The page's own scrolling leaves it as it is.
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(current(review)).toHaveText('Costs');
  },
);

test('a smooth scroll to a section keeps it current all the way', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(url);
  const contents = page.getByRole('navigation', { name: 'On this page' });
  await contents.getByRole('link', { name: 'Short end' }).click();
  // Sampled every frame until the page stops scrolling: the sections passed on the way never are.
  const seen = await page.evaluate(
    () =>
      new Promise<string[]>((resolve) => {
        const labels = new Set<string>();
        let last = -1;
        let still = 0;
        const sample = () => {
          labels.add(document.querySelector('[aria-current="location"]')?.textContent ?? '');
          still = window.scrollY === last ? still + 1 : 0;
          last = window.scrollY;
          if (still > 10) resolve([...labels]);
          else requestAnimationFrame(sample);
        };
        sample();
      }),
  );
  expect(seen).toEqual(['Short end']);
});
