import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Graphic.fixture.tsx';
import { box, css } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(async () => {
  mount(fixture);
  // The files are data URLs: wait until every picture has decoded, so a box that followed the
  // file would show.
  await expect
    .poll(() => [...document.querySelectorAll('img')].every((image) => image.complete))
    .toBe(true);
  await document.fonts.ready;
});

type Box = ReturnType<typeof box>;

/** A length in px, such as var(--env-picture-size-md), resolved where the fixture is. */
function length(value: string) {
  const probe = document.createElement('div');
  probe.style.inlineSize = value;
  page.getByTestId('graphics').element().append(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}

/** Whether one box is the size of another and centered on it. */
function expectSameBox(inner: Box, outer: Box, label?: string) {
  expect(Math.abs(inner.width - outer.width), label).toBeLessThan(0.5);
  expect(Math.abs(inner.height - outer.height), label).toBeLessThan(0.5);
  expect(Math.abs(inner.x + inner.width / 2 - (outer.x + outer.width / 2)), label).toBeLessThan(
    0.5,
  );
  expect(Math.abs(inner.y + inner.height / 2 - (outer.y + outer.height / 2)), label).toBeLessThan(
    0.5,
  );
}

/** Whether a box is a square of the given side. */
function expectSize(found: Box, side: number, label?: string) {
  expect(Math.abs(found.width - side), label).toBeLessThan(0.5);
  expect(Math.abs(found.height - side), label).toBeLessThan(0.5);
}

const byTestId = (testId: string) => page.getByTestId(testId).element();
const child = (testId: string, selector: string) => byTestId(testId).querySelector(selector)!;

test("a graphic is its step's size whatever the file, with the picture contained and centered in it", () => {
  const steps = {
    icon: 'var(--env-control-icon-size)',
    sm: 'var(--env-picture-size-sm)',
    md: 'var(--env-picture-size-md)',
    lg: 'var(--env-picture-size-lg)',
    xl: 'var(--env-picture-size-xl)',
  };
  for (const [size, value] of Object.entries(steps)) {
    const expected = length(value);
    for (const kind of ['png', 'svg-file', 'svg']) {
      const label = `${kind} ${size}`;
      const outer = box(byTestId(`${kind}-${size}`));
      const picture = child(`${kind}-${size}`, ':scope > *');
      expectSize(outer, expected, label);
      // The img or svg fills the box, and object-fit or the viewBox contains the picture in it.
      expectSameBox(box(picture), outer, label);
      expect(css(picture, 'object-fit'), label).toBe('contain');
    }
  }
  // The steps above icon are Avatar's, from the same tokens.
  expect(length('var(--env-picture-size-sm)')).toBe(24);
  expect(length('var(--env-picture-size-xl)')).toBe(88);
});

test('the text step is the size of the text around it, and fill takes its container', () => {
  expectSize(
    box(byTestId('png-text')),
    Number.parseFloat(css(byTestId('graphic-text'), 'font-size')),
  );
  const area = box(byTestId('graphic-fill-box'));
  expectSameBox(box(child('graphic-fill-box', '.env-graphic')), area);
  expectSameBox(box(child('graphic-fill-box', '.env-graphic > img')), area);
});

test('fill is a block that takes its height from an aspect, and a step with an aspect is wider', () => {
  const width = length('16rem');
  const aspect = box(byTestId('fill-aspect'));
  expect(Math.abs(aspect.width - width)).toBeLessThan(0.5);
  expect(Math.abs(aspect.height - (width * 9) / 16)).toBeLessThan(0.5);
  expect(css(byTestId('fill-aspect'), 'display')).toBe('grid');
  expect(css(child('fill-aspect', 'img'), 'object-fit')).toBe('cover');
  // A file in the text color has no shape of its own to give, so it is square, never 0 tall.
  expectSize(box(child('fill-mask', '.env-graphic-mask')), width);
  const step = box(byTestId('step-aspect'));
  const lg = length('var(--env-picture-size-lg)');
  expect(Math.abs(step.height - lg)).toBeLessThan(0.5);
  expect(Math.abs(step.width - (lg * 4) / 3)).toBeLessThan(0.5);
});

test("a slot sizes what it holds: an icon slot any child to its icon size, and TopBar's and PageHeader's start a graphic to a picture's, leaving envUI's symbols be", () => {
  const icon = length('var(--env-control-icon-size)');
  for (const testId of ['button-img', 'button-graphic', 'button-svg']) {
    const slot = box(child(testId, '.env-icon'));
    expectSize(slot, icon, testId);
    expectSameBox(box(child(testId, '.env-icon > *')), slot, testId);
  }
  // A list row's start isn't an icon slot, but an icon or a picture in it takes a leading icon's
  // size there.
  const leading = length('var(--env-icon-size-lg)');
  for (const testId of ['list-svg', 'list-img', 'list-graphic'])
    expectSize(box(child(testId, '.env-list-item-start > *')), leading, testId);

  for (const [testId, token] of [
    ['top-bar-graphic', 'var(--env-picture-size-sm)'],
    ['page-header-graphic', 'var(--env-picture-size-md)'],
  ] as const)
    expectSize(box(byTestId(testId)), length(token), testId);
  const symbol = child('top-bar-symbol', '.env-top-bar-start > svg');
  expect(Math.abs(box(symbol).width - Number.parseFloat(css(symbol, 'font-size')))).toBeLessThan(
    0.5,
  );
});
