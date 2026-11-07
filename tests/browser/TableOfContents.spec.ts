import { expect, test, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const url = `${fixtureUrl}/?fixture=table-of-contents`;
const current = (contents: Locator) => contents.locator('[aria-current="location"]');

/** The shape's width beside each entry's middle, in px, from the points its outline fills. */
const widths = (contents: Locator) =>
  contents.locator('svg').evaluate((svg) => {
    const path = svg.querySelector('path')!;
    const full = parseFloat(getComputedStyle(svg).width);
    return Array.from(
      svg.parentElement!.querySelectorAll<HTMLElement>('.env-table-of-contents-link'),
      (link) => {
        const y = link.offsetTop + link.offsetHeight / 2;
        let filled = 0;
        for (let x = 0.125; x < full; x += 0.25) {
          if (path.isPointInFill(new DOMPoint(x, y))) filled += 0.25;
        }
        return filled;
      },
    );
  });

/** The entry the shape is widest beside. */
const widest = async (contents: Locator) => {
  const each = await widths(contents);
  return each.indexOf(Math.max(...each));
};

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

test('keeps its headings while a modal popup hides the page behind it', async ({ page }) => {
  await page.goto(url);
  const contents = page.getByRole('navigation', { name: 'On this page', includeHidden: true });
  const top = contents.locator(':scope > div > ol > li > a');
  await page.getByRole('button', { name: 'Open a dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add from a dialog' });
  // The page behind the dialog is hidden while it is open; a heading added then still joins the
  // list, and the list stays shown.
  await dialog.getByRole('button', { name: 'Add a section' }).click();
  await expect(top).toHaveText(['Introduction', 'Usage', 'Added later', 'Short end', 'Last']);
  await expect(contents).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(contents).toBeVisible();
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
    // The sections before the current one are marked passed.
    await expect(contents.locator('[data-passed]')).toHaveCount(4);
    // The current section is never set bolder than the rest, so no label rewraps as it moves.
    const weights = await contents
      .locator('.env-table-of-contents-link')
      .evaluateAll((links) => new Set(links.map((link) => getComputedStyle(link).fontWeight)).size);
    expect(weights).toBe(1);
    // Only the current section reads in the text color: the passed ones are as quiet as those
    // still to come, once the labels' color transitions have finished.
    await contents
      .locator('.env-table-of-contents-link')
      .evaluateAll((links) =>
        Promise.all(links.flatMap((link) => link.getAnimations().map((each) => each.finished))),
      );
    const color = (link: Locator) => link.evaluate((element) => getComputedStyle(element).color);
    const quiet = await color(contents.locator('[data-passed]').first());
    expect(quiet).not.toBe(await color(current(contents)));
    expect(quiet).toBe(await color(contents.getByRole('link', { name: 'Last' })));
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
    // Sections rendered anew, the same ids on new elements, still follow the box: a link that
    // writes the address can render the page again, which once left the marks where they were.
    await page.getByRole('button', { name: 'Render the review again' }).click();
    await box.evaluate((element) => element.scrollTo(0, 0));
    await expect(current(review)).toHaveText('Summary');
    await box.evaluate((element) => element.scrollTo(0, 20 * 16));
    await expect(current(review)).toHaveText('Results');
  },
);

test('a smooth scroll to a section moves the marks through the sections on the way, then rests on it', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(url);
  const contents = page.getByRole('navigation', { name: 'On this page' });
  const order = await contents
    .locator('.env-table-of-contents-link')
    .evaluateAll((links) => links.map((link) => link.textContent ?? ''));
  await contents.getByRole('link', { name: 'Short end' }).click();
  // Sampled every frame until the page stops scrolling: the current section only ever moves on,
  // in reading order, the shape's widest point with it, never back up, and the chosen one is
  // current once it rests.
  const [seen, peaks] = await page.evaluate(
    () =>
      new Promise<[string[], number[]]>((resolve) => {
        const labels: string[] = [];
        const peaks: number[] = [];
        const path = document.querySelector('.env-table-of-contents path')!;
        let last = -1;
        let still = 0;
        const sample = () => {
          const label = document.querySelector('[aria-current="location"]')?.textContent ?? '';
          if (labels.at(-1) !== label) labels.push(label);
          // The right edge's widest point, from the outline's first half.
          const points = [...(path.getAttribute('d') ?? '').matchAll(/L([\d.]+) ([\d.]+)/g)];
          const edge = points.slice(0, points.length / 2).map((point) => [+point[1]!, +point[2]!]);
          const widest = Math.max(...edge.map(([x]) => x!));
          peaks.push(edge.find(([x]) => x === widest)?.[1] ?? 0);
          still = window.scrollY === last ? still + 1 : 0;
          last = window.scrollY;
          if (still > 30) resolve([labels, peaks]);
          else requestAnimationFrame(sample);
        };
        sample();
      }),
  );
  const indexes = seen.map((label) => order.indexOf(label));
  expect(indexes).toEqual([...indexes].sort((x, y) => x - y));
  // Within the two pixels the outline is drawn at.
  const back = peaks.filter((peak, index) => index > 0 && peak < peaks[index - 1]! - 2);
  expect(back).toEqual([]);
  expect(peaks.at(-1)).toBeGreaterThan(peaks[0]!);
  await expect(contents.locator('[aria-current="location"]')).toHaveText('Short end');
  // Once it has landed, it rests: no motion of its own while nothing moves.
  const outline = () => contents.locator('path').getAttribute('d');
  await expect
    .poll(async () => {
      const first = await outline();
      await page.evaluate(() => new Promise((done) => setTimeout(done, 100)));
      return first === (await outline());
    })
    .toBe(true);
  // Still after longer than a glide lasts, the slow duration, 240 ms.
  const rested = await outline();
  await page.evaluate(() => new Promise((done) => setTimeout(done, 400)));
  expect(await outline()).toBe(rested);
});

test(
  "one shape beside the list swells at the reader's place, and a little under the pointer",
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    const contents = page.getByRole('navigation', { name: 'On this page' });
    // Widest beside the current section, at the top of the page the first, running thin away
    // from it; at once under reduced motion.
    await expect.poll(() => widest(contents)).toBe(0);
    await page
      .locator('#configure')
      .evaluate((heading) => heading.scrollIntoView({ block: 'start' }));
    await expect(current(contents)).toHaveText('Configure');
    await expect.poll(() => widest(contents)).toBe(2);
    const each = await widths(contents);
    expect(each[2]).toBeGreaterThan(each[5]! * 3);
    expect(each[1]).toBeGreaterThan(each[0]!);
    // The entry under the pointer swells it a little, less than the reader's place.
    await contents.getByRole('link', { name: 'Last' }).hover();
    await expect.poll(async () => (await widths(contents))[5]).toBeGreaterThan(each[5]! * 1.5);
    expect((await widths(contents))[5]).toBeLessThan(each[2]!);
    // One shape in one color, without a track or a fill: the shape alone marks the reader's place.
    await expect(contents.locator('svg path')).toHaveCount(1);
    await expect(contents.locator('svg linearGradient, svg stop')).toHaveCount(0);
    // Drawn by script, which assistive technology doesn't read.
    await expect(contents.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    // In forced colors, the shape in the system's text color.
    const shape = contents.locator('path');
    const fill = () => shape.evaluate((path) => getComputedStyle(path).fill);
    const before = await fill();
    await page.emulateMedia({ forcedColors: 'active' });
    expect(await fill()).not.toBe(before);
  },
);

test('inside a scaled box, the current section is measured in its own pixels', async ({ page }) => {
  await page.goto(url);
  const scaled = page.getByRole('navigation', { name: 'At half size' });
  const box = page.getByTestId('scaled');
  await expect(current(scaled)).toHaveText('Summary');
  // Results reaches the reading line, a quarter down the box, once the box has scrolled 272px of
  // its own: drawn at half size, it once counted as current at 222.
  await box.evaluate((element) => element.scrollTo(0, 240));
  await expect(current(scaled)).toHaveText('Summary');
  await box.evaluate((element) => element.scrollTo(0, 280));
  await expect(current(scaled)).toHaveText('Results');
});
