import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Graphic.fixture.tsx';
import { box, css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(async () => {
  mount(fixture);
  await expect
    .poll(() => [...document.querySelectorAll('img')].every((image) => image.complete))
    .toBe(true);
  await document.fonts.ready;
});

type Box = ReturnType<typeof box>;

function pxAtFixture(value: string) {
  const probe = document.createElement('div');
  probe.style.inlineSize = value;
  page.getByTestId('graphics').element().append(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}

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

function expectSize(found: Box, side: number, label?: string) {
  expect(Math.abs(found.width - side), label).toBeLessThan(0.5);
  expect(Math.abs(found.height - side), label).toBeLessThan(0.5);
}

const byTestId = (testId: string) => page.getByTestId(testId).element();
const child = (testId: string, selector: string) => byTestId(testId).querySelector(selector)!;

test('fill is a block that takes its height from an aspect, and a step with an aspect is wider', () => {
  const width = pxAtFixture('16rem');
  const aspect = box(byTestId('fill-aspect'));
  expect(Math.abs(aspect.width - width)).toBeLessThan(0.5);
  expect(Math.abs(aspect.height - (width * 9) / 16)).toBeLessThan(0.5);
  expect(css(byTestId('fill-aspect'), 'display')).toBe('grid');
  expect(css(child('fill-aspect', 'img'), 'object-fit')).toBe('cover');
  expectSize(box(child('fill-mask', '.env-graphic-mask')), width);
  const step = box(byTestId('step-aspect'));
  const lg = pxAtFixture('var(--env-picture-size-lg)');
  expect(Math.abs(step.height - lg)).toBeLessThan(0.5);
  expect(Math.abs(step.width - (lg * 4) / 3)).toBeLessThan(0.5);
});

test("a slot sizes what it holds: an icon slot any child to its icon size, a start slot a graphic or one of envUI's symbols to its icon size, and TopBar's and PageHeader's start to a picture's", () => {
  const icon = pxAtFixture('var(--env-control-icon-size)');
  const slot = box(child('button-img', '.env-icon'));
  expectSize(slot, icon, 'button-img');
  expectSameBox(box(child('button-img', '.env-icon > *')), slot, 'button-img');
  for (const testId of ['button-graphic', 'button-svg'])
    expectSize(box(child(testId, '.env-button-start > *')), icon, testId);
  expectSize(
    box(child('list-graphic', '.env-list-item-start > *')),
    pxAtFixture('var(--env-icon-size-lg)'),
    'list-graphic',
  );

  for (const [testId, token] of [
    ['top-bar-graphic', 'var(--env-picture-size-sm)'],
    ['page-header-graphic', 'var(--env-picture-size-md)'],
  ] as const)
    expectSize(box(byTestId(testId)), pxAtFixture(token), testId);
  const symbol = child('top-bar-symbol', '.env-top-bar-start > svg');
  expectSize(box(symbol), pxAtFixture('var(--env-picture-size-sm)'), 'top-bar-symbol');
});
