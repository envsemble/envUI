import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/MessageList.fixture.tsx';
import { nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const list = (testId: string) => page.getByTestId(testId).element() as HTMLElement;
const gap = (element: HTMLElement) =>
  element.scrollHeight - element.scrollTop - element.clientHeight;
const atEnd = (testId: string) => () => gap(list(testId)) <= 1;
const add = () => (page.getByTestId('add').element() as HTMLButtonElement).click();

test(
  'a list that follows opens at the end, keeps the latest in view, and offers Jump to latest once the reader scrolls away and more arrives',
  { tags: ['engines'] },
  async () => {
    const following = list('following');
    const jump = page.getByRole('button', { name: 'Jump to latest' });
    expect(following.scrollHeight).toBeGreaterThan(following.clientHeight);
    await expect.poll(atEnd('following')).toBe(true);

    add();
    await expect
      .poll(() => following.querySelector('article:last-of-type')?.textContent)
      .toBe('Message 13');
    await expect.poll(atEnd('following')).toBe(true);
    expect(jump.query()).toBeNull();

    following.scrollTop = 0;
    await nextFrames();
    add();
    await expect.element(jump).toBeVisible();
    expect(following.scrollTop).toBe(0);

    await jump.click();
    await expect.poll(atEnd('following')).toBe(true);
    await expect.poll(() => jump.query()).toBeNull();
    await expect.element(following).toHaveFocus();

    following.scrollTop = 0;
    await nextFrames();
    following.scrollTop = following.scrollHeight;
    await nextFrames();
    expect(atEnd('following')()).toBe(true);
    add();
    await expect.poll(atEnd('following')).toBe(true);
    expect(jump.query()).toBeNull();
  },
);

test('the button takes its label from jumpToLatestLabel', { tags: ['engines'] }, async () => {
  const renamed = list('renamed');
  await expect.poll(atEnd('renamed')).toBe(true);
  renamed.scrollTop = 0;
  await nextFrames();
  add();
  await expect.element(page.getByRole('button', { name: 'Newest' })).toBeVisible();
});
