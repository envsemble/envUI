import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/EmptyState.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const part = (testId: string, name: string) =>
  page.getByTestId(testId).element().querySelector<HTMLElement>(`.env-empty-state-${name}`);
const region = (testId: string) => page.getByTestId(testId).element() as HTMLElement;
const middle = (target: Element) => {
  const { x, y, width, height } = box(target);
  return { x: x + width / 2, y: y + height / 2 };
};

test('it fills its region and centres its content there, in a flex row and in a block', () => {
  for (const testId of ['wide', 'narrow']) {
    const root = region(testId).querySelector('.env-empty-state')!;
    expect(box(root).width).toBeCloseTo(box(region(testId)).width, 0);
    expect(box(root).height).toBeCloseTo(box(region(testId)).height, 0);
    const title = middle(part(testId, 'title')!);
    const center = middle(region(testId));
    expect(Math.abs(title.x - center.x)).toBeLessThanOrEqual(1);
    const top = box(part(testId, 'icon')!).y - box(region(testId)).y;
    const actions = part(testId, 'actions')!;
    const bottom =
      box(region(testId)).y + box(region(testId)).height - (box(actions).y + box(actions).height);
    expect(Math.abs(top - bottom)).toBeLessThanOrEqual(1);
  }
});

test('a narrow region takes a smaller icon and title', () => {
  const iconOf = (testId: string) => box(part(testId, 'icon')!.querySelector('.env-icon')!).width;
  expect(iconOf('narrow')).toBeLessThan(iconOf('wide'));
  const fontOf = (testId: string) => parseFloat(css(part(testId, 'heading')!, 'font-size'));
  expect(fontOf('narrow')).toBeLessThan(fontOf('wide'));
});

test('its icon is hidden from assistive technology, and absent parts take no room', () => {
  expect(part('wide', 'icon')!.querySelector('[aria-hidden="true"]')).not.toBeNull();
  expect(part('bare', 'icon')).toBeNull();
  expect(part('bare', 'description')).toBeNull();
  expect(part('bare', 'actions')).toBeNull();
  expect(part('bare', 'title')!.textContent).toBe('Nothing here');
});
