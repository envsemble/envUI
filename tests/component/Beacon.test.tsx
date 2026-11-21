import { beforeEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Beacon.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const halo = (testId: string) =>
  page.getByTestId(testId).element().querySelector<HTMLElement>(':scope > .env-beacon-halo')!;

test('it renders what it wraps unchanged, at its own size, and a halo hidden from assistive technology', async () => {
  await expect.element(page.getByRole('button', { name: 'Invite people' }).first()).toBeVisible();
  const wrapped = page.getByTestId('wrapped').element();
  const plain = page.getByTestId('plain').element();
  expect(wrapped.parentElement).toBe(page.getByTestId('beacon').element());
  expect(wrapped.className).toBe(plain.className);
  expect(box(wrapped).width).toBeCloseTo(box(plain).width, 1);
  expect(box(wrapped).height).toBeCloseTo(box(plain).height, 1);
  expect(box(page.getByTestId('beacon')).width).toBeCloseTo(box(wrapped).width, 1);
  expect(box(page.getByTestId('wrapped-card')).width).toBeCloseTo(
    box(page.getByTestId('column')).width,
    1,
  );
  expect(halo('beacon').getAttribute('aria-hidden')).toBe('true');
  expect(css(halo('beacon'), 'pointer-events')).toBe('none');
});

test('the halo surrounds the box from outside, around a child or a placed box alone', () => {
  for (const testId of ['beacon', 'block', 'placed']) {
    const target = page.getByTestId(testId).element().getBoundingClientRect();
    const ring = halo(testId).getBoundingClientRect();
    expect(ring.left).toBeLessThan(target.left);
    expect(ring.top).toBeLessThan(target.top);
    expect(ring.right).toBeGreaterThan(target.right);
    expect(ring.bottom).toBeGreaterThan(target.bottom);
  }
  expect(box(page.getByTestId('placed')).width).toBeCloseTo(120, 1);
});

test('the halo breathes, and holds still with a reduced-motion preference', async () => {
  expect(halo('beacon').getAnimations().length).toBe(1);
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => halo('beacon').getAnimations().length).toBe(0);
  expect(css(halo('beacon'), 'opacity')).toBe('1');
  expect(box(halo('beacon')).width).toBeGreaterThan(box(page.getByTestId('beacon')).width);
});
