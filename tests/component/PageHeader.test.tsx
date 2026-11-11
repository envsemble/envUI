import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/PageHeader.fixture.tsx';
import { box, css } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const body = () => document.querySelector<HTMLElement>('.env-scaffold-body')!;
const sticky = () => page.getByTestId('sticky').element() as HTMLElement;

test('moves its actions under the title in a narrow container, at its control size and gutters', async () => {
  const responsive = page.getByTestId('responsive');
  const title = responsive.getByRole('heading', { level: 1 });
  const action = responsive.getByRole('button', { name: 'New task' });
  const description = responsive.getByText('Everything the launch needs', { exact: false });
  // Its actions and toolbar take the control size: sm is 2 rem, the default md 2.5 rem.
  const small = page.getByTestId('small');
  expect(box(small.getByRole('button', { name: 'Invite' })).height).toBeCloseTo(32, 0);
  expect(box(small.getByRole('button', { name: 'Export' })).height).toBeCloseTo(32, 0);
  expect(box(responsive.getByRole('button', { name: 'Share' })).height).toBeCloseTo(40, 0);
  // Wide, the actions sit at the end of the title row.
  expect(box(action).y).toBeLessThan(box(description).y);
  const wideTitle = box(title);
  expect(box(action).x).toBeGreaterThan(wideTitle.x + wideTitle.width);
  await page.getByRole('button', { name: 'Narrow header' }).click();
  // Narrow, they follow the description, from the inline start.
  await expect
    .poll(() => box(action).y)
    .toBeGreaterThanOrEqual(box(description).y + box(description).height);
  expect(box(responsive.getByRole('button', { name: 'Share' })).x).toBeCloseTo(box(title).x, 0);
  // The title wraps rather than being cut short.
  const heading = title.element();
  expect(heading.scrollWidth - heading.clientWidth).toBeLessThanOrEqual(0);
  // A page's gutters follow the window class of the region it sits in.
  const frame = page.getByTestId('frame').element() as HTMLElement;
  const gutter = () => css(page.getByTestId('page'), 'padding-inline-start');
  for (const [width, expected] of [
    ['30rem', '16px'],
    ['37rem', '16px'],
    ['38rem', '24px'],
    ['60rem', '24px'],
  ] as const) {
    frame.style.inlineSize = width;
    await expect.poll(gutter, { message: `${width} wide` }).toBe(expected);
  }
});

test(
  'sticks at the top of the body that scrolls, and what takes focus keeps clear of it',
  { tags: ['engines'] },
  async () => {
    body().scrollTo(0, 600);
    await expect.poll(() => body().scrollTop).toBe(600);
    // It sticks at the body's top, across the page's gutters.
    await expect.poll(() => box(sticky()).y).toBeCloseTo(box(body()).y, 0);
    // It publishes its height on its page, which keeps what scrolls into view clear of it.
    const pageElement = page.getByTestId('page').element() as HTMLElement;
    const published = () => pageElement.style.getPropertyValue('--env-page-header-block-size');
    const height = () => `${sticky().offsetHeight}px`;
    await expect.poll(published).toBe(height());
    // A field scrolled into view as it takes focus lands below the header.
    const field = page.getByTestId('far-field').element() as HTMLElement;
    const clearOfHeader = () => {
      const header = box(sticky());
      return expect.poll(() => box(field).y).toBeGreaterThanOrEqual(header.y + header.height);
    };
    body().scrollTo(0, 0);
    field.focus();
    await clearOfHeader();
    // In a compact page its title wraps over more lines than CSS reckons with; the measured
    // height counts them.
    const before = height();
    (page.getByTestId('frame').element() as HTMLElement).style.inlineSize = '20rem';
    await expect.poll(height).not.toBe(before);
    await expect.poll(published).toBe(height());
    body().scrollTo(0, 0);
    field.blur();
    field.focus();
    await clearOfHeader();
  },
);
