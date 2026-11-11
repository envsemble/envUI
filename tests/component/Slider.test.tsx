import { beforeEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Slider.fixture.tsx';
import { animationsDone, box, css, keyboard, mouse, nextFrames } from './Browser.ts';
import { mount } from './Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const scope = () => page.getByTestId('sliders-light');
const sliders = () => scope().element().querySelectorAll<HTMLElement>('.env-slider');
const slider = (index = 0) => sliders()[index]!;
const part = (index: number, name: string) => slider(index).querySelector<HTMLElement>(name)!;
const input = (index = 0) => slider(index).querySelector<HTMLInputElement>('input[type="range"]')!;
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;

test('a slider is a labelled range with a visible value linked to it', async () => {
  const opacity = scope().getByRole('slider', { name: 'Opacity' });
  await expect.element(opacity).toHaveAttribute('aria-valuenow', '40');
  await expect.element(opacity).toHaveAttribute('min', '0');
  await expect.element(opacity).toHaveAttribute('max', '100');
  await expect.element(opacity).toHaveAttribute('aria-valuetext', '40%');
  await expect.element(opacity).toHaveAccessibleDescription('Applies to the selected layer');
  const output = part(0, 'output.env-slider-value');
  expect(output.textContent).toBe('40%');
  expect(output.getAttribute('for')).toBe(opacity.element().id);
  expect(output.getAttribute('aria-live')).toBe('off');
  // The label is inside the slider, which takes the press: pressing it focuses the slider and
  // chooses the value there, as pressing anywhere in the field does.
  await scope().getByText('Opacity', { exact: true }).click({ force: true });
  await expect.element(opacity).toHaveFocus();
  await expect.element(opacity).not.toHaveAttribute('aria-valuenow', '40');
});

test('the keyboard moves the value by steps, large steps and to the ends', async () => {
  const opacity = input(0);
  const state = text('opacity-light');
  const output = part(0, 'output.env-slider-value');
  opacity.focus();
  await keyboard.press('ArrowRight');
  await expect.poll(state).toBe('41');
  expect(output.textContent).toBe('41%');
  expect(opacity.getAttribute('aria-valuetext')).toBe('41%');
  await keyboard.press('ArrowUp');
  await expect.poll(state).toBe('42');
  await keyboard.press('Shift+ArrowRight');
  await expect.poll(state).toBe('52');
  await keyboard.press('PageUp');
  await expect.poll(state).toBe('62');
  await keyboard.press('PageDown');
  await expect.poll(state).toBe('52');
  await keyboard.press('ArrowDown');
  await keyboard.press('ArrowLeft');
  await expect.poll(state).toBe('50');
  await keyboard.press('End');
  await expect.poll(state).toBe('100');
  await keyboard.press('ArrowRight');
  await expect.poll(state).toBe('100');
  await keyboard.press('Home');
  await expect.poll(state).toBe('0');
  await expect.poll(text('commits-light')).toContain('0');
  // Keyboard focus rings the whole field.
  await expect.poll(() => css(part(0, '.env-slider-control'), 'outline-style')).toBe('solid');

  // Steps follow step and the range; the large step is a tenth of the range.
  const scale = input(2);
  scale.focus();
  await keyboard.press('ArrowRight');
  await expect.poll(() => scale.getAttribute('aria-valuenow')).toBe('110');
  await keyboard.press('PageUp');
  await expect.poll(() => scale.getAttribute('aria-valuenow')).toBe('130');
  expect(part(2, 'output.env-slider-value').textContent).toBe('130');
});

test(
  'pressing the track and dragging the thumb set the value and commit it once',
  { tags: ['engines'] },
  async () => {
    const opacity = input(0);
    const track = box(part(0, '.env-slider-track'));
    await mouse.click(track.x + track.width * 0.25, track.y + track.height / 2);
    await expect.poll(() => opacity.getAttribute('aria-valuenow')).toBe('25');
    await expect.poll(text('commits-light')).toBe('25');
    const thumb = part(0, '.env-slider-thumb');
    // The thumb glides to the value pressed, then is centered on it along the track.
    await animationsDone(thumb);
    const thumbBox = box(thumb);
    expect(thumbBox.x + thumbBox.width / 2).toBeCloseTo(track.x + track.width * 0.25, 0);
    await mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
    await mouse.down();
    await mouse.move(track.x + track.width * 0.75, track.y + track.height / 2, { steps: 5 });
    await expect.poll(() => thumb.hasAttribute('data-dragging')).toBe(true);
    await mouse.up();
    await expect.poll(() => opacity.getAttribute('aria-valuenow')).toBe('75');
    await expect.poll(text('opacity-light')).toBe('75');
    await expect.poll(text('commits-light')).toBe('25 75');
    // The fill reaches the value, gliding the last of the way when the value lands after the
    // release, as it can under load.
    const indicator = part(0, '.env-slider-indicator');
    await expect.poll(() => box(indicator).width / track.width).toBeCloseTo(0.75, 2);
  },
);

test(
  'sliders submit their value with a form and restore it on reset',
  { tags: ['engines'] },
  async () => {
    const submitted = text('sliders-submitted-light');
    const submit = scope().getByRole('button', { name: 'Submit sliders' });
    await submit.click();
    // A disabled slider is left out, like other disabled controls.
    await expect.poll(submitted).toBe('volume=30 scale=100');
    const volume = input(1);
    volume.focus();
    await keyboard.press('ArrowRight');
    await expect.poll(() => volume.getAttribute('aria-valuenow')).toBe('35');
    await submit.click();
    await expect.poll(submitted).toBe('volume=35 scale=100');
    await scope().getByRole('button', { name: 'Reset sliders' }).click();
    await expect.poll(() => volume.getAttribute('aria-valuenow')).toBe('30');
    await expect.poll(() => part(1, 'output.env-slider-value').textContent).toBe('30');
    await submit.click();
    await expect.poll(submitted).toBe('volume=30 scale=100');

    await expect.element(scope().getByRole('slider', { name: 'Balance' })).toBeDisabled();
    expect(css(part(3, '.env-slider-control'), 'opacity')).toBe('0.48');
    // The group the label names is disabled too, so its faded label and value are an inactive
    // control's, which WCAG exempts from contrast; an enabled one says nothing.
    expect(slider(3).getAttribute('aria-disabled')).toBe('true');
    expect(slider(0).hasAttribute('aria-disabled')).toBe(false);
  },
);

test('sliders fit a narrow viewport', async () => {
  await page.viewport(390, 900);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  const control = box(part(0, '.env-slider-control'));
  expect(control.x + control.width).toBeLessThanOrEqual(390);
  input(0).focus();
  await keyboard.press('End');
  await expect.poll(() => input(0).getAttribute('aria-valuenow')).toBe('100');
  const thumb = box(part(0, '.env-slider-thumb'));
  // At the end of the range the thumb stays inside the control.
  expect(thumb.x + thumb.width).toBeLessThanOrEqual(control.x + control.width + 0.5);
});

test('coarse pointers get the touch height, the whole field taking the finger', async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 900);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    await expect.poll(() => css(part(0, '.env-slider-control'), 'height')).toBe('44px');
    expect(css(part(0, '.env-slider-control'), 'touch-action')).toBe('none');
  } finally {
    await commands.emulateTouch(false);
  }
});

test('a slider is a field: as tall as the fields, with their corners, its label and value inside', () => {
  const root = slider(0);
  const control = part(0, '.env-slider-control');
  const field = box(control);
  // As tall as a field of the control height, with the same rounded ends, and no outline.
  const probe = document.createElement('div');
  probe.style.blockSize = 'var(--env-control-height)';
  scope().element().append(probe);
  expect(field.height).toBeCloseTo(probe.getBoundingClientRect().height, 0);
  probe.remove();
  // The fields' corners: the capped full corner, which the browser draws as rounded ends.
  const full = document.createElement('div');
  full.style.blockSize = 'var(--env-radius-full)';
  control.append(full);
  const radius = full.getBoundingClientRect().height;
  full.remove();
  expect(Math.abs(Number.parseFloat(css(control, 'border-top-left-radius')) - radius)).toBeLessThan(
    0.5,
  );
  expect(css(control, 'box-shadow')).toBe('none');
  expect(css(control, 'border-top-style')).toBe('none');
  // The label sits inside at the start and the value at the end, in a field's type, and the value
  // with numbers of one width.
  const labelPart = part(0, '.env-slider-label');
  const value = part(0, '.env-slider-value');
  const label = box(labelPart);
  const valueBox = box(value);
  expect(label.x).toBeGreaterThan(field.x);
  expect(label.y).toBeGreaterThan(field.y);
  expect(label.y + label.height).toBeLessThan(field.y + field.height);
  expect(valueBox.x + valueBox.width).toBeLessThan(field.x + field.width);
  expect(valueBox.x).toBeGreaterThan(label.x + label.width);
  const paragraph = document.createElement('p');
  paragraph.className = 'env-text';
  root.append(paragraph);
  const type = [css(paragraph, 'font-family'), css(paragraph, 'font-size')];
  paragraph.remove();
  for (const text of [value, labelPart])
    expect([css(text, 'font-family'), css(text, 'font-size')]).toEqual(type);
  expect(css(value, 'font-variant-numeric')).toBe('tabular-nums');
  expect(value.classList.contains('env-text')).toBe(true);
  // The fill runs from the slider's own start to the value, 40% of the whole field.
  const fill = box(part(0, '.env-slider-indicator'));
  expect(Math.abs(fill.x - field.x)).toBeLessThanOrEqual(0.5);
  expect(fill.width / field.width).toBeCloseTo(0.4, 2);
  // The text never dims: the handle and the fill's end fade under it instead, as the tests of the
  // states below show.
  for (const text of [part(0, '.env-slider-header'), labelPart, value]) {
    expect(css(text, 'opacity')).toBe('1');
    expect(css(text, 'mask-image')).toBe('none');
  }
  // Ten parts of 0 to 100 by large steps of 10; a range of few steps is cut at every step.
  expect(css(root, '--env-slider-ticks')).toBe('10');
});

/** The parts of the first slider whose look changes with its state, read from computed styles. */
function stateOf() {
  const control = part(0, '.env-slider-control');
  return {
    slider: slider(0),
    control,
    input: input(0),
    thumb: part(0, '.env-slider-thumb'),
    ticks: () => css(part(0, '.env-slider-track'), 'opacity', '::after'),
    // The fade at the fill's end: a gradient over its last stretch, out of sight at 0.
    fillEnd: () => css(part(0, '.env-slider-indicator'), 'opacity', '::after'),
    veil: () => css(control, '--env-slider-veil'),
  };
}

const has = (element: Element, attribute: string) => () => element.hasAttribute(attribute);

/** Expects the slider at rest: its text and fill only, with no handle, ticks or fade. */
async function expectRest(state: ReturnType<typeof stateOf>) {
  await expect.poll(has(state.control, 'data-handle')).toBe(false);
  await expect.poll(has(state.control, 'data-ruler')).toBe(false);
  await expect.poll(() => css(state.thumb, 'opacity')).toBe('0');
  await expect.poll(state.ticks).toBe('0');
  await expect.poll(state.fillEnd).toBe('0');
}

test('at rest a slider shows its text and fill only, with no handle, ticks or fade', async () => {
  const state = stateOf();
  await expectRest(state);
  // Even where the fill ends under the label, it ends crisply.
  state.input.focus();
  await keyboard.press('Home');
  state.input.blur();
  await expect.poll(state.veil).toBe('1');
  await expectRest(state);
});

test(
  'hover shows the handle and the ticks, the handle faded where it sits behind the label',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
    const field = box(state.control);
    const y = field.y + field.height / 2;
    // At 40%, clear of the text: the handle in full and the fill's end crisp.
    await mouse.move(field.x + field.width * 0.5, y);
    await expect.poll(has(state.control, 'data-handle')).toBe(true);
    await expect.poll(has(state.control, 'data-ruler')).toBe(true);
    await expect.poll(state.veil).toBe('0');
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    await expect.poll(state.ticks).toBe('0.35');
    await expect.poll(state.fillEnd).toBe('0');
    // Leave, move the value under the label with the keyboard, and hover again: the handle and the
    // fill's end fade there, while the text stays at full strength.
    await mouse.move(0, 0);
    state.input.focus();
    await keyboard.press('Home');
    state.input.blur();
    await mouse.move(field.x + field.width * 0.5, y);
    await expect.poll(state.veil).toBe('1');
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('0.25');
    await expect.poll(state.fillEnd).toBe('1');
    await expect.poll(state.ticks).toBe('0.35');
    expect(css(part(0, '.env-slider-label'), 'opacity')).toBe('1');
  },
);

test('the ticks fade under the label and the value, as the handle does', async () => {
  await page.viewport(390, 900);
  const state = stateOf();
  const field = box(state.control);
  await mouse.move(field.x + field.width * 0.5, field.y + field.height / 2);
  await expect.poll(state.ticks).toBe('0.35');
  // Each tick is faint, at a quarter, where it sits within half a line of the label or the value,
  // and in full between them: read from the measured clear stretch the mask keeps whole.
  const root = state.slider;
  const track = root.querySelector('.env-slider-track')!.getBoundingClientRect();
  const clearStart = Number.parseFloat(css(state.control, '--env-slider-clear-start'));
  const clearEnd = Number.parseFloat(css(state.control, '--env-slider-clear-end'));
  const parts = Number(css(root, '--env-slider-ticks'));
  const texts = [...root.querySelectorAll('.env-slider-label, .env-slider-value')].map((text) => {
    const at = text.getBoundingClientRect();
    const margin = Number.parseFloat(css(text, 'font-size')) / 2;
    return [at.left - margin - track.left, at.right + margin - track.left];
  });
  expect(css(part(0, '.env-slider-track'), 'mask-image', '::after')).toMatch(/^linear-gradient/);
  const ticks = Array.from({ length: parts - 1 }, (_, index) => {
    const at = (track.width * (index + 1)) / parts;
    return {
      underText: texts.some(([start, end]) => at >= start! && at <= end!),
      faint: at < clearStart || at > clearEnd,
    };
  });
  for (const tick of ticks) expect(tick.faint).toBe(tick.underText);
  expect(ticks.some((tick) => tick.faint)).toBe(true);
  expect(ticks.some((tick) => !tick.faint)).toBe(true);
});

test(
  'a click moves the value to the pointer and leaves the slider at rest under it',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
    const track = box(part(0, '.env-slider-track'));
    await mouse.click(track.x + track.width * 0.7, track.y + track.height / 2);
    await expect.poll(() => state.input.getAttribute('aria-valuenow')).toBe('70');
    await expectRest(state);
  },
);

test(
  'after a drag and release the handle and ticks go until the pointer leaves and comes back',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
    const field = box(state.control);
    const y = field.y + field.height / 2;
    await mouse.move(field.x + field.width * 0.5, y);
    await mouse.down();
    await expect.poll(has(state.control, 'data-dragging')).toBe(true);
    // Dragged under the label, the handle and the fill's end fade there, as on hover.
    await mouse.move(field.x + 2, y, { steps: 4 });
    await expect.poll(() => state.input.getAttribute('aria-valuenow')).toBe('0');
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('0.25');
    await expect.poll(state.ticks).toBe('0.35');
    await expect.poll(state.fillEnd).toBe('1');
    await mouse.move(field.x + field.width * 0.6, y, { steps: 4 });
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    // Released with the pointer still over the slider: back at rest, and moving over it keeps it so.
    await mouse.up();
    await expect.poll(has(state.control, 'data-dragging')).toBe(false);
    await expectRest(state);
    await mouse.move(field.x + field.width * 0.3, y, { steps: 3 });
    await expectRest(state);
    // The slider keeps focus after the release, which a pointer gave it, so no handle.
    expect(document.activeElement).toBe(state.input);
    // Left and hovered again, they show again.
    await mouse.move(field.x + field.width * 0.3, field.y - 40);
    await mouse.move(field.x + field.width * 0.3, y);
    await expect.poll(has(state.control, 'data-handle')).toBe(true);
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    await expect.poll(state.ticks).toBe('0.35');
    // Released outside the slider, it is at rest, and coming back over it shows them again.
    await mouse.down();
    await mouse.move(field.x + field.width * 0.9, field.y + field.height * 4, { steps: 3 });
    await expect.poll(state.ticks).toBe('0.35');
    await mouse.up();
    await expectRest(state);
    await mouse.move(field.x + field.width * 0.5, y, { steps: 3 });
    await expect.poll(has(state.control, 'data-ruler')).toBe(true);
    // A cancelled pointer and a lost capture end the press as a release does.
    for (const end of ['pointercancel', 'lostpointercapture']) {
      await mouse.move(field.x + field.width * 0.5, field.y - 40);
      await mouse.move(field.x + field.width * 0.5, y);
      await mouse.down();
      await expect.poll(has(state.control, 'data-dragging')).toBe(true);
      state.control.dispatchEvent(new PointerEvent(end, { pointerId: 1, bubbles: true }));
      await expect.poll(has(state.control, 'data-dragging')).toBe(false);
      await expectRest(state);
      await mouse.up();
    }
  },
);

test(
  'keyboard focus shows the handle with the focus ring, faded behind text, and no ticks',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
    // Focused as Tab would, which WebKit, like Safari, keeps from range inputs by default.
    state.input.focus();
    await expect.poll(() => css(state.control, 'outline-style')).toBe('solid');
    await expect.poll(has(state.control, 'data-handle')).toBe(true);
    expect(state.control.hasAttribute('data-ruler')).toBe(false);
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    await keyboard.press('Home');
    await expect.poll(() => state.input.getAttribute('aria-valuenow')).toBe('0');
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('0.25');
    await expect.poll(state.fillEnd).toBe('1');
    expect(state.ticks()).toBe('0');
    // Leaving the slider puts it back at rest.
    state.input.blur();
    await expectRest(state);
  },
);

test('a finger shows the handle and the ticks only while it is down', async () => {
  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 900);
    const state = stateOf();
    const field = box(state.control);
    const point = [field.x + field.width * 0.6, field.y + field.height / 2] as const;
    await commands.touch('touchStart', ...point);
    await expect.poll(has(state.control, 'data-handle')).toBe(true);
    await expect.poll(has(state.control, 'data-ruler')).toBe(true);
    await commands.touch('touchEnd');
    await expect.poll(has(state.control, 'data-dragging')).toBe(false);
    await expectRest(state);
  } finally {
    await commands.emulateTouch(false);
  }
});

test('the fill is empty at the minimum, the whole field at the maximum and in proportion between, in either direction', async () => {
  for (const direction of ['ltr', 'rtl'] as const) {
    scope().element().setAttribute('dir', direction);
    // Scale, from 50 to 200 by tens: its minimum isn't 0, so the fill follows the range, not the number.
    const scale = input(2);
    const control = part(2, '.env-slider-control');
    const fill = part(2, '.env-slider-indicator');
    const thumb = part(2, '.env-slider-thumb');
    scale.focus();
    const field = box(control);
    const inset = field.height / 4;
    const start = (x: number, width: number) =>
      direction === 'ltr' ? x - field.x : field.x + field.width - (x + width);
    const value = () => scale.getAttribute('aria-valuenow');
    await keyboard.press('Home');
    await expect.poll(value).toBe('50');
    await expect.poll(has(control, 'data-handle')).toBe(true);
    await expect.poll(() => box(fill).width).toBeLessThanOrEqual(0.5);
    // Nothing paints the fill beyond its box, such as under the rounded start.
    expect(getComputedStyle(fill, '::before').content).toBe('none');
    // The handle keeps clear of the rounded end, inside the field.
    let handle = box(thumb);
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(inset, 0);
    await keyboard.press('End');
    await expect.poll(value).toBe('200');
    await expect
      .poll(() => {
        const full = box(fill);
        return Math.max(Math.abs(full.x - field.x), Math.abs(full.width - field.width));
      })
      .toBeLessThanOrEqual(0.5);
    handle = box(thumb);
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(field.width - inset, 0);
    // 80 is a fifth of the way from 50 to 200: a fifth of the field, from the start, with the handle
    // at the fill's end.
    await keyboard.press('Home');
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowUp');
    await expect.poll(value).toBe('80');
    await expect
      .poll(() => {
        const part = box(fill);
        return Math.max(
          Math.abs(start(part.x, part.width)),
          Math.abs(part.width - field.width / 5),
        );
      })
      .toBeLessThanOrEqual(0.5);
    handle = box(thumb);
    expect(start(handle.x, handle.width) + handle.width / 2).toBeCloseTo(field.width / 5, 0);
  }
});

test('a slider selects no text when dragged or double-clicked, and its label still names it', async () => {
  for (const name of ['.env-slider-control', '.env-slider-label', '.env-slider-value'])
    expect(css(part(0, name), 'user-select')).toBe('none');
  const selected = () => getSelection()?.toString() ?? '';
  const label = box(part(0, '.env-slider-label'));
  await mouse.dblclick(label.x + label.width / 2, label.y + label.height / 2);
  expect(selected()).toBe('');
  const value = box(part(0, '.env-slider-value'));
  await mouse.dblclick(value.x + value.width / 2, value.y + value.height / 2);
  expect(selected()).toBe('');
  // A drag along it selects none of its text either.
  const field = box(part(0, '.env-slider-control'));
  await mouse.move(field.x + 2, field.y + field.height / 2);
  await mouse.down();
  await mouse.move(field.x + field.width - 2, field.y + field.height / 2, { steps: 5 });
  await mouse.up();
  expect(selected()).not.toMatch(/Opacity|%/);
  expect(input(0).getAttribute('aria-valuetext')).toMatch(/%$/);
});

/**
 * Where a slider's field and its text are on screen, and how much they show scaled: their width and
 * height on screen over those they are laid out at.
 */
function boxesOf(root: HTMLElement) {
  const measure = (selector: string) => {
    const element = root.querySelector(selector)!;
    const { left, right, width, height } = element.getBoundingClientRect();
    const scaleX = width / Number.parseFloat(css(element, 'width'));
    const scaleY = height / Number.parseFloat(css(element, 'height'));
    return { left, right, width, height, scaleX, scaleY };
  };
  return {
    field: measure('.env-slider-control'),
    label: measure('.env-slider-label'),
    value: measure('.env-slider-value'),
  };
}

test(
  'dragging past an end holds the value there and stretches the slider toward the pointer, a little, until let go',
  { tags: ['engines'] },
  async () => {
    const root = slider(0);
    const range = input(0);
    const control = part(0, '.env-slider-control');
    // Room beside the slider for the pointer to pass its ends, inside the page, where every engine
    // follows it.
    root.style.marginInline = '320px';
    for (const [direction, end] of [
      ['ltr', 'right'],
      ['ltr', 'left'],
      ['rtl', 'left'],
    ] as const) {
      scope().element().setAttribute('dir', direction);
      const rest = boxesOf(root);
      const { field } = rest;
      // The end the pointer passes, and the value there: the maximum at the end of the reading
      // direction, the minimum at its start.
      const edge = end === 'right' ? field.right : field.left;
      const away = (distance: number) => (end === 'right' ? edge + distance : edge - distance);
      const atEnd = (end === 'right') === (direction === 'ltr') ? '100' : '0';
      const y = rest.field.height / 2 + box(control).y;
      // A stretch is the length the field gains on the pointer's side, its other end staying put.
      const stretch = () => {
        const now = boxesOf(root).field;
        if (end === 'right') expect(now.left).toBeCloseTo(field.left, 1);
        else expect(now.right).toBeCloseTo(field.right, 1);
        return now.width - field.width;
      };
      // Its most: 6% of the length, or half the height where that is less.
      const most = Math.min(field.width * 0.06, field.height / 2);
      const value = () => range.getAttribute('aria-valuenow');

      await mouse.move(field.left + field.width / 2, y);
      await mouse.down();
      await mouse.move(away(30), y, { steps: 8 });
      await expect.poll(value).toBe(atEnd);
      await expect.poll(stretch).toBeGreaterThan(2);
      const near = stretch();
      // It gives less than the pointer travels.
      expect(near).toBeLessThan(30);
      await mouse.move(away(280), y, { steps: 8 });
      await expect.poll(stretch).toBeGreaterThan(near);
      const far = stretch();
      expect(far).toBeLessThanOrEqual(most);
      expect(far).toBeGreaterThan(most * 0.8);
      expect(value()).toBe(atEnd);
      // It thins a little across, by at most 3%.
      const now = boxesOf(root);
      expect(now.field.height).toBeLessThan(field.height);
      expect(now.field.height).toBeGreaterThanOrEqual(field.height * 0.97 - 0.01);
      // The label and the value keep their size, and the text at the end travels with it.
      expect(now.field.scaleX).toBeGreaterThan(1.01);
      for (const text of ['label', 'value'] as const) {
        expect(now[text].scaleX).toBeCloseTo(1, 3);
        expect(now[text].scaleY).toBeCloseTo(1, 3);
      }
      const outer = (at: typeof field) => (end === 'right' ? at.right : at.left);
      const atTheEnd = (end === 'right') === (direction === 'ltr') ? 'value' : 'label';
      expect(Math.abs(outer(now[atTheEnd]) - outer(rest[atTheEnd]))).toBeGreaterThan(far * 0.8);

      // Let go, it springs back to its length, eased rather than at once.
      await mouse.up();
      const springs = control
        .getAnimations()
        .some(
          (animation) => (animation as CSSTransition).transitionProperty === '--env-slider-stretch',
        );
      expect(springs).toBe(true);
      await animationsDone(control);
      expect(Math.abs(stretch())).toBeLessThan(0.05);
      expect(value()).toBe(atEnd);
    }
  },
);

test(
  'a click at the end, the keyboard and a disabled slider stretch nothing',
  { tags: ['engines'] },
  async () => {
    const root = slider(0);
    const { field } = boxesOf(root);
    const control = box(part(0, '.env-slider-control'));
    const y = control.y + control.height / 2;
    const width = (which = root) => boxesOf(which).field.width;
    await mouse.click(field.right - 1, y);
    await expect.poll(() => input(0).getAttribute('aria-valuenow')).toBe('100');
    await nextFrames();
    expect(width()).toBeCloseTo(field.width, 1);
    for (const key of ['End', 'ArrowRight', 'PageUp', 'Home', 'ArrowLeft']) {
      await keyboard.press(key);
      await nextFrames();
      expect(width()).toBeCloseTo(field.width, 1);
    }
    // A disabled slider neither moves nor stretches.
    const balance = slider(3);
    const rest = boxesOf(balance).field;
    const at = box(part(3, '.env-slider-control'));
    await mouse.move(at.x + at.width / 2, at.y + at.height / 2);
    await mouse.down();
    await mouse.move(at.x + at.width + 200, at.y + at.height / 2, { steps: 8 });
    await nextFrames();
    expect(width(balance)).toBeCloseTo(rest.width, 1);
    await mouse.up();
    expect(input(3).getAttribute('aria-valuenow')).toBe('50');
  },
);

test('under reduced motion a drag past the end holds the value but stretches nothing', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  const root = slider(0);
  const rest = boxesOf(root);
  const field = box(part(0, '.env-slider-control'));
  const y = field.y + field.height / 2;
  await mouse.move(field.x + field.width / 2, y);
  await mouse.down();
  await mouse.move(field.x + field.width + 300, y, { steps: 8 });
  await expect.poll(() => input(0).getAttribute('aria-valuenow')).toBe('100');
  await nextFrames();
  const now = boxesOf(root);
  expect(now.field.width).toBeCloseTo(rest.field.width, 1);
  expect(now.field.height).toBeCloseTo(rest.field.height, 1);
  await mouse.up();
});
