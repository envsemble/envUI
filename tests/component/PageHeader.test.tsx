import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/PageHeader.fixture.tsx';
import * as navigation from '../fixture/PageNavigation.fixture.tsx';
import { box, css, keyboard, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

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
  const small = page.getByTestId('small');
  expect(box(small.getByRole('button', { name: 'Invite' })).height).toBeCloseTo(32, 0);
  expect(box(small.getByRole('button', { name: 'Export' })).height).toBeCloseTo(32, 0);
  expect(box(responsive.getByRole('button', { name: 'Share' })).height).toBeCloseTo(40, 0);
  expect(box(action).y).toBeLessThan(box(description).y);
  const wideTitle = box(title);
  expect(box(action).x).toBeGreaterThan(wideTitle.x + wideTitle.width);
  await page.getByRole('button', { name: 'Narrow header' }).click();
  await expect
    .poll(() => box(action).y)
    .toBeGreaterThanOrEqual(box(description).y + box(description).height);
  expect(box(responsive.getByRole('button', { name: 'Share' })).x).toBeCloseTo(box(title).x, 0);
  const heading = title.element();
  expect(heading.scrollWidth - heading.clientWidth).toBeLessThanOrEqual(0);
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
    await expect.poll(() => box(sticky()).y).toBeCloseTo(box(body()).y, 0);
    const pageElement = page.getByTestId('page').element() as HTMLElement;
    const published = () => pageElement.style.getPropertyValue('--_page-header-block-size');
    const height = () => `${sticky().offsetHeight}px`;
    const publishesItsHeight = () =>
      expect.poll(() => [published(), height()]).toSatisfy(([value, size]) => value === size);
    await publishesItsHeight();
    const field = page.getByTestId('far-field').element() as HTMLElement;
    const clearOfHeader = () =>
      expect
        .poll(() => {
          const header = box(sticky());
          return box(field).y - (header.y + header.height);
        })
        .toBeGreaterThanOrEqual(0);
    body().scrollTo(0, 0);
    field.focus();
    await clearOfHeader();
    const before = height();
    (page.getByTestId('frame').element() as HTMLElement).style.inlineSize = '20rem';
    await expect.poll(height).not.toBe(before);
    await publishesItsHeight();
    body().scrollTo(0, 0);
    field.blur();
    field.focus();
    await clearOfHeader();
  },
);

test(
  'in a Scaffold, focus moves to the title of the page navigated to, without a ring, but not on the first load',
  { tags: ['engines'] },
  async () => {
    mount(navigation);
    const title = (name: string) => page.getByRole('heading', { level: 1, name });
    const destination = (name: string) =>
      page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name });
    await expect.element(title('Inbox')).toBeInTheDocument();
    await nextFrames();
    expect(document.activeElement).not.toBe(title('Inbox').element());

    await destination('Settings').click();
    await expect.element(title('Settings')).toHaveFocus();
    expect(css(title('Settings'), 'outline-style')).toBe('none');

    (destination('Inbox').element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(title('Inbox')).toHaveFocus();
    expect(css(title('Inbox'), 'outline-style')).toBe('none');
    await keyboard.press('Tab');
    expect(document.activeElement).not.toBe(title('Inbox').element());

    await destination('Settings').click();
    const name = page.getByRole('textbox', { name: 'Page name' });
    await name.click();
    await keyboard.type(' and more');
    await expect.element(title('Settings and more')).toBeInTheDocument();
    await nextFrames();
    await expect.element(name).toHaveFocus();
    const rename = page.getByRole('button', { name: 'Rename' });
    (rename.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(title('Settings and more!')).toBeInTheDocument();
    await nextFrames();
    await expect.element(rename).toHaveFocus();

    (destination('Archive').element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.element(title('Archive')).toBeInTheDocument();
    await nextFrames();
    await expect.element(destination('Archive')).toHaveFocus();
  },
);

test('children render under the toolbar, inside the header', () => {
  const header = page.getByTestId('extra');
  const row = header.getByTestId('extra-row');
  expect(row.element().parentElement).toBe(header.element());
  const toolbar = header.getByRole('button', { name: 'Filter' });
  expect(box(row).y).toBeGreaterThanOrEqual(box(toolbar).y + box(toolbar).height);
});
