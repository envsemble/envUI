import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Disclosure.fixture.tsx';
import { keyboard, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('disclosures');
const details = (title: string) =>
  [...scope().element().querySelectorAll('details')].find((element) =>
    element.querySelector('summary')?.textContent?.includes(title),
  )!;
const summary = (title: string) => details(title).querySelector('summary')!;
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const visible = (text: string) => () => scope().getByText(text).element().checkVisibility();
const isOpen = (title: string) => () => details(title).hasAttribute('open');

test('a disclosure reports each change through onOpenChange, controlled or on its own', async () => {
  const changes = text('disclosure-changes');
  expect(isOpen('Controlled')()).toBe(false);
  await page.elementLocator(summary('Controlled')).click();
  await expect.poll(isOpen('Controlled')).toBe(true);
  await expect.poll(changes).toBe('true');
  await page.elementLocator(summary('Controlled')).click();
  await expect.poll(isOpen('Controlled')).toBe(false);
  await expect.poll(changes).toBe('true false');
  await scope().getByRole('button', { name: 'Open from outside' }).click();
  await expect.poll(isOpen('Controlled')).toBe(true);
  await expect.poll(visible('Controlled details')).toBe(true);
  expect(changes()).toBe('true false');
  const requests = text('disclosure-requests');
  await page.elementLocator(summary('Kept closed')).click();
  await expect.poll(requests).toBe('true');
  expect(isOpen('Kept closed')()).toBe(false);
  expect(visible('Details kept closed')()).toBe(false);
  await page.elementLocator(summary('Kept closed')).click();
  await expect.poll(requests).toBe('true true');
  expect(isOpen('Kept closed')()).toBe(false);
  expect(visible('Details shown at first')()).toBe(true);
  await page.elementLocator(summary('Open at first')).click();
  await expect.poll(isOpen('Open at first')).toBe(false);
});

test('a controlled disclosure whose parent refuses the change never opens, not for a frame', async () => {
  const kept = details('Kept closed');
  const opened: boolean[] = [];
  new MutationObserver(() => opened.push(kept.hasAttribute('open'))).observe(kept, {
    attributes: true,
    attributeFilter: ['open'],
  });
  kept.addEventListener('toggle', () => opened.push(kept.open));
  const requests = text('disclosure-requests');
  await page.elementLocator(summary('Kept closed')).click();
  await expect.poll(requests).toBe('true');
  summary('Kept closed').focus();
  await keyboard.press('Enter');
  await expect.poll(requests).toBe('true true');
  await nextFrames();
  expect(opened).toEqual([]);
  summary('Controlled').focus();
  await keyboard.press('Enter');
  await expect.poll(isOpen('Controlled')).toBe(true);
  await keyboard.press(' ');
  await expect.poll(isOpen('Controlled')).toBe(false);
});
