import { beforeEach, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/TableOfContents.fixture.tsx';
import { css, keyboard, nextFrames, shown, waitOnRealTime } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(async () => {
  // A window shorter than the article's sections, so each can reach the reading line.
  await page.viewport(1280, 720);
  mount(fixture);
});

const contents = (name = 'On this page') =>
  page.getByRole('navigation', { name, includeHidden: true });
const current = (navigation: Locator) => () =>
  navigation.element().querySelector('[aria-current="location"]')?.textContent;
const texts = (elements: Iterable<Element>) => [...elements].map((each) => each.textContent);
const heading = (id: string) => document.getElementById(id)!;
const scrollBox = (testId: string) => page.getByTestId(testId).element();

test('lists the headings of its container, nested by level, and keeps them while a modal popup hides the page behind it', async () => {
  const navigation = contents();
  const top = () => navigation.element().querySelectorAll(':scope > div > ol > li > a');
  // The top level, then each h3 under the h2 above it; the example's heading and the h4 are left
  // out, and a part hidden from assistive technology is no part of the label.
  expect(texts(top())).toEqual(['Introduction', 'Usage', 'Short end', 'Last']);
  const nested = navigation.element().querySelectorAll('ol ol a');
  expect(texts(nested)).toEqual(['Install the package', 'Configure']);
  expect(nested[0]!.getAttribute('href')).toBe('#install-the-package');
  expect(document.querySelector('h3#install-the-package')?.textContent).toBe('Install the package');
  // At the top of the page, before any section has reached the line, the first is current.
  await expect.poll(current(navigation)).toBe('Introduction');

  await page.getByRole('button', { name: 'Open a dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add from a dialog' });
  // The page behind the dialog is hidden while it is open; a heading added then still joins the
  // list in its place, and the list stays shown.
  await dialog.getByRole('button', { name: 'Add a section' }).click();
  await expect
    .poll(() => texts(top()))
    .toEqual(['Introduction', 'Usage', 'Added later', 'Short end', 'Last']);
  expect(shown(navigation)).toBe(true);
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect.poll(() => shown(dialog)).toBe(false);
  expect(shown(navigation)).toBe(true);
});

test(
  'marks the section the reader is in as the page scrolls, the short last ones at the end',
  { tags: ['engines'] },
  async () => {
    const navigation = contents();
    await expect.poll(current(navigation)).toBe('Introduction');
    heading('usage').scrollIntoView({ block: 'start' });
    await expect.poll(current(navigation)).toBe('Usage');
    expect(navigation.element().querySelectorAll('[aria-current]')).toHaveLength(1);
    // The last two sections are too short to reach the line: the end of the page makes the last
    // one current, and a little above it the one before.
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(current(navigation)).toBe('Last');
    window.scrollBy(0, -40);
    await expect.poll(current(navigation)).toBe('Short end');
    // The sections before the current one are marked passed.
    expect(navigation.element().querySelectorAll('[data-passed]')).toHaveLength(4);
    const links = [
      ...navigation.element().querySelectorAll<HTMLElement>('.env-table-of-contents-link'),
    ];
    // The current section is never set bolder than the rest, so no label rewraps as it moves.
    expect(new Set(links.map((link) => css(link, 'font-weight'))).size).toBe(1);
    // Only the current section reads in the text color: the passed ones are as quiet as those
    // still to come, once the labels' color transitions have finished.
    await Promise.all(links.flatMap((link) => link.getAnimations().map((each) => each.finished)));
    const passed = navigation.element().querySelector('[data-passed]')!;
    const currentLink = navigation.element().querySelector('[aria-current="location"]')!;
    const quiet = css(passed, 'color');
    expect(quiet).not.toBe(css(currentLink, 'color'));
    expect(quiet).toBe(css(navigation.getByRole('link', { name: 'Last' }), 'color'));
  },
);

test(
  'a link scrolls its section below the sticky bar, adds it to the address and moves focus',
  { tags: ['engines'] },
  async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    const navigation = contents();
    await navigation.getByRole('link', { name: 'Configure' }).click();
    await expect.poll(() => location.hash).toBe('#configure');
    await expect.poll(current(navigation)).toBe('Configure');
    await expect.element(heading('configure')).toHaveFocus();
    // At once, under reduced motion, and clear of the bar by the heading's scroll margin.
    await expect.poll(() => heading('configure').getBoundingClientRect().top).toBeCloseTo(72, 0);
    // The keyboard does the same.
    (navigation.getByRole('link', { name: 'Usage' }).element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(heading('usage')).toHaveFocus();
    await expect.poll(current(navigation)).toBe('Usage');
  },
);

test('sections of its own follow the box that scrolls them', { tags: ['engines'] }, async () => {
  const review = contents('Review');
  expect(texts(review.getByRole('link').elements())).toEqual(['Summary', 'Results', 'Costs']);
  await expect.poll(current(review)).toBe('Summary');
  scrollBox('review').scrollTo(0, 20 * 16);
  await expect.poll(current(review)).toBe('Results');
  // Costs is too short to reach the line: the end of the box makes it current.
  scrollBox('review').scrollTo(0, scrollBox('review').scrollHeight);
  await expect.poll(current(review)).toBe('Costs');
  // The page's own scrolling leaves it as it is.
  window.scrollTo(0, 400);
  await nextFrames();
  expect(current(review)()).toBe('Costs');
  // Sections rendered anew, the same ids on new elements, still follow the box: a link that
  // writes the address can render the page again, which once left the marks where they were.
  await page.getByRole('button', { name: 'Render the review again' }).click();
  scrollBox('review').scrollTo(0, 0);
  await expect.poll(current(review)).toBe('Summary');
  scrollBox('review').scrollTo(0, 20 * 16);
  await expect.poll(current(review)).toBe('Results');
});

test('a smooth scroll to a section moves the marks through the sections on the way, then rests on it', async () => {
  await commands.emulateMedia({ reducedMotion: 'no-preference' });
  const navigation = contents();
  const order = texts(navigation.element().querySelectorAll('.env-table-of-contents-link'));
  await navigation.getByRole('link', { name: 'Short end' }).click();
  // Sampled every frame until the page stops scrolling: the current section only ever moves on,
  // in reading order, the shape's widest point with it, never back up, and the chosen one is
  // current once it rests.
  const path = navigation.element().querySelector('path')!;
  const [seen, peaks] = await new Promise<[string[], number[]]>((resolve) => {
    const labels: string[] = [];
    const peaks: number[] = [];
    let last = -1;
    let still = 0;
    const sample = () => {
      const label = current(navigation)() ?? '';
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
  });
  const indexes = seen.map((label) => order.indexOf(label));
  expect(indexes).toEqual([...indexes].sort((x, y) => x - y));
  // Within the two pixels the outline is drawn at.
  const back = peaks.filter((peak, index) => index > 0 && peak < peaks[index - 1]! - 2);
  expect(back).toEqual([]);
  expect(peaks.at(-1)).toBeGreaterThan(peaks[0]!);
  await expect.poll(current(navigation)).toBe('Short end');
  // Once it has landed, it rests: no motion of its own while nothing moves.
  const outline = () => path.getAttribute('d');
  await expect
    .poll(async () => {
      const first = outline();
      await waitOnRealTime(100);
      return first === outline();
    })
    .toBe(true);
  // Still after longer than a glide lasts, the medium duration, 160 ms.
  const rested = outline();
  await waitOnRealTime(400);
  expect(outline()).toBe(rested);
});

test('inside a scaled box, the current section is measured in its own pixels', async () => {
  const scaled = contents('At half size');
  await expect.poll(current(scaled)).toBe('Summary');
  // Results reaches the reading line, a quarter down the box, once the box has scrolled 272px of
  // its own: drawn at half size, it once counted as current at 222.
  scrollBox('scaled').scrollTo(0, 240);
  // Nothing changes: the check waits two frames past the scroll.
  await nextFrames();
  expect(current(scaled)()).toBe('Summary');
  scrollBox('scaled').scrollTo(0, 280);
  await expect.poll(current(scaled)).toBe('Results');
});
