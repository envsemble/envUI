import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Forms.fixture.tsx';
import { box, css, keyboard, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

/** Lines of text plus the field's 1 rem inset above and below. */
const linesHigh = (field: Locator, lines: number) =>
  lines * Number.parseFloat(css(field, 'line-height')) + 32;

const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });
const height = (field: Locator) => () => box(field).height;
/** The control a field sits in, and its resize edge. */
const controlOf = (field: Locator) => field.element().closest('.env-text-field-control')!;
const edgeOf = (field: Locator) =>
  page
    .elementLocator(controlOf(field))
    .getByRole('separator', { name: 'Resize text area', exact: true });

test(
  'a growing textarea starts at its rows and grows with its lines, and a ghost one keeps its label in its fill',
  { tags: ['engines'] },
  async () => {
    const one = textbox('One line');
    const three = textbox('Three lines');
    await expect.element(one).toHaveAttribute('data-sizing', 'content');
    expect(box(one).height).toBeCloseTo(linesHigh(one, 1), 0);
    expect(box(three).height).toBeCloseTo(linesHigh(three, 3), 0);
    await one.fill(['First', 'Second'].join('\n'));
    await expect.poll(height(one)).toBeCloseTo(linesHigh(one, 2), 0);
    await one.fill('');
    await expect.poll(height(one)).toBeCloseTo(linesHigh(one, 1), 0);
    // Without rows, a growing field keeps the shared 7.5 rem start; a fixed one given rows is that
    // many lines tall, under it.
    expect(box(textbox('Default lines')).height).toBe(120);
    const two = textbox('Two fixed lines');
    expect(box(two).height).toBeCloseTo(linesHigh(two, 2), 0);

    // A ghost textarea shows a faint fill and no border at rest, the accent frame while focused,
    // and its label inside the fill.
    const field = textbox('Ghost notes');
    const control = controlOf(field);
    const border = control.querySelector(':scope > .env-text-field-border')!;
    expect(control.getAttribute('data-variant')).toBe('ghost');
    expect(css(border, 'border-top-color')).toBe('rgba(0, 0, 0, 0)');
    const rest = css(control, 'background-color');
    expect(rest).not.toBe('rgba(0, 0, 0, 0)');
    (field.element() as HTMLElement).focus();
    await expect.poll(() => css(border, 'border-top-color')).not.toBe('rgba(0, 0, 0, 0)');
    expect(css(control, 'background-color')).toBe(rest);
    // The floated label sits inside the fill, above where the text starts, and opens no notch.
    await expect
      .poll(() => {
        const outer = control.getBoundingClientRect();
        const label = control.querySelector(':scope > label')!.getBoundingClientRect();
        const input = control.querySelector('textarea')!;
        const textTop =
          input.getBoundingClientRect().top + Number.parseFloat(getComputedStyle(input).paddingTop);
        const legend = control.querySelector('.env-text-field-border > legend')!;
        return (
          label.top > outer.top &&
          label.bottom <= textTop &&
          legend.getBoundingClientRect().width === 0
        );
      })
      .toBe(true);
  },
);

test('the resize edge is a named separator that the arrow keys and Home move', async () => {
  const field = textbox('Two fixed lines');
  const edge = edgeOf(field);
  await expect.element(edge).toHaveAttribute('aria-orientation', 'horizontal');
  await expect.element(edge).toHaveAttribute('aria-controls', field.element().id);
  expect(edge.element().getAttribute('aria-description')).toMatch(/Up and Down arrows/);
  const before = box(field).height;
  await expect.element(edge).toHaveAttribute('aria-valuenow', String(Math.round(before)));
  // Without a CSS maximum height, the separator still has a finite maximum above its value.
  expect(Number(edge.element().getAttribute('aria-valuemax'))).toBeGreaterThan(before * 10);
  (edge.element() as HTMLElement).focus();
  await keyboard.press('ArrowDown');
  await expect.poll(height(field)).toBeGreaterThan(before);
  await expect
    .poll(() => Number(edge.element().getAttribute('aria-valuenow')))
    .toBeGreaterThan(Math.round(before));
  await keyboard.press('Home');
  await expect.poll(height(field)).toBeCloseTo(before, 0);
});

test('dragging the resize edge follows the pointer on the content as the page scrolls', async () => {
  // Room below, so the page can scroll whatever the fixture's height.
  document.body.style.paddingBlockEnd = '200vh';
  try {
    const field = textbox('Two fixed lines');
    const edge = edgeOf(field);
    edge.element().scrollIntoView({ block: 'center' });
    const before = box(field).height;
    const handle = box(edge);
    const [x, y] = [handle.x + handle.width / 2, handle.y + handle.height / 2];
    await mouse.move(x, y);
    await mouse.down();
    await mouse.move(x, y + 20, { steps: 4 });
    await expect.poll(height(field)).toBeCloseTo(before + 20, 0);
    // The page scrolls under a pointer held still: the edge follows the pointer down the content.
    const from = scrollY;
    scrollBy(0, 30);
    const scrolled = scrollY - from;
    expect(scrolled).toBeGreaterThan(10);
    await mouse.move(x, y + 21);
    await expect.poll(height(field)).toBeCloseTo(before + 21 + scrolled, 0);
    await mouse.up();
  } finally {
    document.body.style.paddingBlockEnd = '';
  }
});
