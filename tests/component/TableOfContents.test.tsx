import { beforeEach, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/TableOfContents.fixture.tsx';
import { css, keyboard, nextFrames, shown, waitOnRealTime } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(async () => {
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
  expect(texts(top())).toEqual(['Introduction', 'Usage', 'Short end', 'Last']);
  const nested = navigation.element().querySelectorAll('ol ol a');
  expect(texts(nested)).toEqual(['Install the package', 'Configure']);
  expect(nested[0]!.getAttribute('href')).toBe('#install-the-package');
  expect(document.querySelector('h3#install-the-package')?.textContent).toBe('Install the package');
  await expect.poll(current(navigation)).toBe('Introduction');

  await page.getByRole('button', { name: 'Open a dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add from a dialog' });
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
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(current(navigation)).toBe('Last');
    window.scrollBy(0, -40);
    await expect.poll(current(navigation)).toBe('Short end');
    expect(navigation.element().querySelectorAll('[data-passed]')).toHaveLength(4);
    const links = [
      ...navigation.element().querySelectorAll<HTMLElement>('.env-table-of-contents-link'),
    ];
    expect(new Set(links.map((link) => css(link, 'font-weight'))).size).toBe(1);
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
    await expect.poll(() => heading('configure').getBoundingClientRect().top).toBeCloseTo(72, 0);
    (navigation.getByRole('link', { name: 'Usage' }).element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(heading('usage')).toHaveFocus();
    await expect.poll(current(navigation)).toBe('Usage');
  },
);

test("a link goes through the application's router, which keeps the address, and onNavigate can make the jump itself", async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  mount({ default: fixture.RoutedContentsFixture });
  const routed = contents('Routed');
  const address = location.href;
  const entries = history.length;
  await routed.getByRole('link', { name: 'Second' }).click();
  await expect.poll(() => document.body.dataset.routedTo).toBe('#routed-second');
  await expect.element(heading('routed-second')).toHaveFocus();
  await expect.poll(current(routed)).toBe('Second');
  expect([location.href, history.length]).toEqual([address, entries]);

  const own = routed.getByRole('link', { name: 'Handled by the application' });
  await own.click();
  await expect.element(page.getByTestId('handled')).toHaveTextContent('routed-own');
  await nextFrames();
  await expect.element(own).toHaveFocus();
  expect(heading('routed-own').getBoundingClientRect().top).toBeGreaterThan(window.innerHeight / 2);
  expect(document.body.dataset.routedTo).toBe('#routed-second');
  expect([location.href, history.length]).toEqual([address, entries]);
  delete document.body.dataset.routedTo;
});

test('sections of its own follow the box that scrolls them', { tags: ['engines'] }, async () => {
  const review = contents('Review');
  expect(texts(review.getByRole('link').elements())).toEqual(['Summary', 'Results', 'Costs']);
  await expect.poll(current(review)).toBe('Summary');
  scrollBox('review').scrollTo(0, 20 * 16);
  await expect.poll(current(review)).toBe('Results');
  scrollBox('review').scrollTo(0, scrollBox('review').scrollHeight);
  await expect.poll(current(review)).toBe('Costs');
  window.scrollTo(0, 400);
  await nextFrames();
  expect(current(review)()).toBe('Costs');
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
  const path = navigation.element().querySelector('path')!;
  const [seen, peaks] = await new Promise<[string[], number[]]>((resolve) => {
    const labels: string[] = [];
    const peaks: number[] = [];
    let last = -1;
    let still = 0;
    const sample = () => {
      const label = current(navigation)() ?? '';
      if (labels.at(-1) !== label) labels.push(label);
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
  const outlineDrawnWithinPixels = 2;
  const back = peaks.filter(
    (peak, index) => index > 0 && peak < peaks[index - 1]! - outlineDrawnWithinPixels,
  );
  expect(back).toEqual([]);
  expect(peaks.at(-1)).toBeGreaterThan(peaks[0]!);
  await expect.poll(current(navigation)).toBe('Short end');
  const outline = () => path.getAttribute('d');
  await expect
    .poll(async () => {
      const first = outline();
      await waitOnRealTime(100);
      return first === outline();
    })
    .toBe(true);
  const rested = outline();
  const longerThanAGlide = 400;
  await waitOnRealTime(longerThanAGlide);
  expect(outline()).toBe(rested);
});

test('inside a scaled box, the current section is measured in its own pixels', async () => {
  const scaled = contents('At half size');
  await expect.poll(current(scaled)).toBe('Summary');
  scrollBox('scaled').scrollTo(0, 240);
  await nextFrames();
  expect(current(scaled)()).toBe('Summary');
  scrollBox('scaled').scrollTo(0, 280);
  await expect.poll(current(scaled)).toBe('Results');
});
