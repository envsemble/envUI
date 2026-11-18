import { beforeEach, expect, test, vi } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/CopyButton.fixture.tsx';
import {
  box,
  collectErrors,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  recordClipboard,
  stopTimers,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('copy-buttons-light');
const button = (name: string) => scope().getByRole('button', { name, exact: true });
const text = (locator: Locator) => () => locator.element().textContent;

const tooltips = () =>
  [...document.querySelectorAll('.env-tooltip:not([data-ending-style])')].map(
    (tooltip) => tooltip.textContent,
  );

const copiedResultMs = 2_000;
const tooltipDelayMs = 400;

const movePointerAwayFromTooltips = () => mouse.move(4, 900, { steps: 4 });

function statusOf(locator: Locator) {
  const status = locator.element().nextElementSibling!;
  expect(status.getAttribute('role')).toBe('status');
  return () => status.textContent;
}

const pathOf = (locator: Locator) => locator.element().querySelector('path')!.getAttribute('d');

test('an icon-only copy button copies its text, shows a check and says Copied', async () => {
  const { writes } = recordClipboard('available');
  const copy = button('Copy link light');
  const status = statusOf(copy);
  await copy.hover();
  await expect.poll(tooltips).toEqual(['Copy link light']);
  const restingIcon = pathOf(copy);
  stopTimers();
  await copy.click();
  await expect.poll(() => writes).toEqual(['https://example.com/r/quarterly-report']);
  await expect
    .poll(text(scope().getByTestId('copied')))
    .toBe('https://example.com/r/quarterly-report');
  await expect.element(copy).toHaveAttribute('data-copied', '');
  expect(pathOf(copy)).not.toBe(restingIcon);
  await expect.poll(tooltips).toEqual(['Copied']);
  await expect.poll(status).toBe('Copied');
  await movePointerAwayFromTooltips();
  await passTime(copiedResultMs - 100);
  expect(tooltips()).toEqual(['Copied']);
  await expect.element(copy).toHaveAccessibleName('Copy link light');
  await passTime(200);
  await expect.poll(tooltips).toEqual([]);
  vi.useRealTimers();
  await expect.element(copy).not.toHaveAttribute('data-copied');
  expect(pathOf(copy)).toBe(restingIcon);
  expect(status()).toBe('');

  const height = (name: string) => box(button(name)).height;
  expect(height('Copy report ID light')).toBeCloseTo(32, 0);
  expect(height('Report settings')).toBeCloseTo(32, 0);
  expect(height('Copy standard')).toBeCloseTo(40, 0);
  expect(height('Copy compact')).toBeCloseTo(32, 0);
  expect(height('Copy compact label')).toBeCloseTo(32, 0);
  expect(box(button('Copy compact')).width).toBeCloseTo(32, 0);
  const narrow = box(button('Copy narrow'));
  expect(narrow.width).toBeCloseTo(40, 0);
  expect(narrow.height).toBeCloseTo(40, 0);
});

test('a labelled copy button copies the result of a function from the keyboard and keeps focus', async () => {
  const { writes } = recordClipboard('available');
  const copy = button('Copy ID light');
  stopTimers();
  await copy.hover();
  await passTime(tooltipDelayMs + 200);
  expect(tooltips()).toEqual([]);
  await movePointerAwayFromTooltips();
  vi.useRealTimers();
  (copy.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(tooltips).toEqual(['Copied']);
  expect(writes).toEqual(['RPT-2041']);
  await expect.element(copy).toHaveFocus();
  await keyboard.press('Escape');
  await expect.poll(tooltips).toEqual([]);
  await expect.element(copy).not.toHaveAttribute('data-copied');
  const status = statusOf(copy);
  await keyboard.press('Space');
  await expect.poll(status).toBe('Copied');
  const announced = () => copy.element().nextElementSibling!.querySelector('span');
  announced()!.setAttribute('data-announced', '');
  await keyboard.press('Enter');
  await expect.poll(() => announced()?.hasAttribute('data-announced')).toBe(false);
  await expect.poll(status).toBe('Copied');
  expect(writes).toEqual(['RPT-2041', 'RPT-2041', 'RPT-2041']);
});

test('a promised text keeps the button pending until it resolves, and the Clipboard API receives it', async ({
  skip,
}) => {
  skip(!navigator.userAgent.includes('Chrome'));
  const copy = button('Copy later light');
  await copy.click();
  await expect.element(copy).toHaveAttribute('aria-busy', 'true');
  expect(copy.element().querySelector('.env-spinner')).not.toBeNull();
  await expect.poll(text(scope().getByTestId('copied'))).toBe('Later text');
  await expect.element(copy).not.toHaveAttribute('aria-busy');
  await expect.element(copy).toHaveAttribute('data-copied', '');
  expect(await commands.clipboardText()).toBe('Later text');
  await button('Copy link light').click();
  await expect
    .poll(text(scope().getByTestId('copied')))
    .toBe('https://example.com/r/quarterly-report');
  expect(await commands.clipboardText()).toBe('https://example.com/r/quarterly-report');
});

test(
  'copying falls back to a selection where the Clipboard API is unavailable',
  { tags: ['engines'] },
  async () => {
    const { writes } = recordClipboard('selection');
    const copy = button('Copy link light');
    (copy.element() as HTMLElement).focus();
    await keyboard.press('Enter');
    await expect.poll(tooltips).toEqual(['Copied']);
    expect(writes).toEqual(['https://example.com/r/quarterly-report']);
    await expect.element(copy).toHaveFocus();
    expect(document.querySelectorAll('.env-copy-button-field')).toHaveLength(0);

    await button('Share light').click();
    const dialog = page.getByRole('dialog', { name: 'Share light' });
    const shared = dialog.getByRole('button', { name: 'Copy shared link light' });
    await shared.click();
    await expect.element(shared).toHaveAttribute('data-copied', '');
    expect(writes.at(-1)).toBe('https://example.com/r/shared');
    await expect.element(dialog).toBeInTheDocument();
  },
);

test('a copy button says when nothing could be copied, in its own words if given', async () => {
  recordClipboard('neither');
  const copy = button('Copy link light');
  await copy.click();
  await expect.poll(tooltips).toEqual(['Couldn’t copy']);
  await expect.element(copy).toHaveAttribute('data-failed', '');
  await expect.element(copy).not.toHaveAttribute('data-copied');
  await expect.poll(statusOf(copy)).toBe('Couldn’t copy');
  expect(text(scope().getByTestId('copied'))()).toBe('');
  await keyboard.press('Escape');
  await expect.poll(tooltips).toEqual([]);

  await button('Copy custom light').click();
  await expect.poll(tooltips).toEqual(['Nicht kopiert']);
});

test('a promised text that never arrives fails quietly after the clipboard refused it', async () => {
  const { unhandled } = recordClipboard('refused');
  const errors = collectErrors();
  const copy = button('Copy gone light');
  await copy.click();
  await expect.poll(tooltips).toEqual(['Couldn’t copy']);
  await expect.element(copy).toHaveAttribute('data-failed', '');
  await expect.poll(statusOf(copy)).toBe('Couldn’t copy');
  await nextFrames();
  expect(unhandled).toEqual([]);
  expect(errors).toEqual([]);
});

test("write copies through the application's own clipboard, and its refusal says so", async () => {
  const { writes } = recordClipboard('available');
  const writers = page.getByTestId('writers-light');
  const bridged = writers.getByRole('button', { name: 'Copy through the bridge light' });
  await bridged.click();
  await expect.poll(text(writers.getByTestId('bridged-light'))).toBe('Bridged');
  await expect.element(bridged).toHaveAttribute('data-copied', '');
  await expect.poll(statusOf(bridged)).toBe('Copied');
  expect(text(scope().getByTestId('copied'))()).toBe('Bridged');
  expect(writes).toEqual([]);
  await keyboard.press('Escape');
  await expect.poll(tooltips).toEqual([]);

  const refused = writers.getByRole('button', { name: 'Copy refused by the bridge light' });
  await refused.click();
  await expect.element(refused).toHaveAttribute('data-failed', '');
  await expect.poll(statusOf(refused)).toBe('Couldn’t copy');
  expect(writes).toEqual([]);
});
