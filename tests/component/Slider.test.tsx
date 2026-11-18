import { beforeEach, expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Slider.fixture.tsx';
import { animationsDone, box, css, keyboard, mouse, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

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
  await expect.poll(() => css(part(0, '.env-slider-control'), 'outline-style')).toBe('solid');

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

function stateOf() {
  const control = part(0, '.env-slider-control');
  return {
    slider: slider(0),
    control,
    input: input(0),
    thumb: part(0, '.env-slider-thumb'),
    ticks: () => css(part(0, '.env-slider-track'), 'opacity', '::after'),
    fillEnd: () => css(part(0, '.env-slider-indicator'), 'opacity', '::after'),
    veil: () => css(control, '--_slider-veil'),
  };
}

const has = (element: Element, attribute: string) => () => element.hasAttribute(attribute);

async function expectRest(state: ReturnType<typeof stateOf>) {
  await expect.poll(has(state.control, 'data-handle')).toBe(false);
  await expect.poll(has(state.control, 'data-ruler')).toBe(false);
  await expect.poll(() => css(state.thumb, 'opacity')).toBe('0');
  await expect.poll(state.ticks).toBe('0');
  await expect.poll(state.fillEnd).toBe('0');
}

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
    await mouse.move(field.x + 2, y, { steps: 4 });
    await expect.poll(() => state.input.getAttribute('aria-valuenow')).toBe('0');
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('0.25');
    await expect.poll(state.ticks).toBe('0.5');
    await expect.poll(state.fillEnd).toBe('1');
    await mouse.move(field.x + field.width * 0.6, y, { steps: 4 });
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    await mouse.up();
    await expect.poll(has(state.control, 'data-dragging')).toBe(false);
    await expectRest(state);
    await mouse.move(field.x + field.width * 0.3, y, { steps: 3 });
    await expectRest(state);
    expect(document.activeElement).toBe(state.input);
    await mouse.move(field.x + field.width * 0.3, field.y - 40);
    await mouse.move(field.x + field.width * 0.3, y);
    await expect.poll(has(state.control, 'data-handle')).toBe(true);
    await expect.poll(() => css(state.thumb, 'opacity')).toBe('1');
    await expect.poll(state.ticks).toBe('0.5');
    await mouse.down();
    await mouse.move(field.x + field.width * 0.9, field.y + field.height * 4, { steps: 3 });
    await expect.poll(state.ticks).toBe('0.5');
    await mouse.up();
    await expectRest(state);
    await mouse.move(field.x + field.width * 0.5, y, { steps: 3 });
    await expect.poll(has(state.control, 'data-ruler')).toBe(true);
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

async function pixelsOf(element: HTMLElement) {
  const shot = await page.screenshot({ element, base64: true, save: false });
  const image = new Image();
  image.src = `data:image/png;base64,${shot}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  const scale = image.width / element.getBoundingClientRect().width;
  return (x: number, y: number) => [
    ...context.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data,
  ];
}

test(
  'the ticks keep their color as the fill passes under them while dragging',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
    const track = part(0, '.env-slider-track');
    const field = box(state.control);
    const y = field.y + field.height / 2;
    const ticks = Number(css(slider(0), '--_slider-ticks'));
    const step = box(track).width / ticks;
    const clear = (name: string) => Number.parseFloat(css(state.control, name));
    const ticksAt = async () => {
      await expect.poll(state.ticks).toBe('0.5');
      await animationsDone(state.control, true);
      const pixel = await pixelsOf(track);
      const middle = box(track).height / 2;
      const [from, to] = [clear('--_slider-clear-start'), clear('--_slider-clear-end')];
      return Array.from({ length: ticks - 1 }, (_, index) => (index + 1) * step - 0.5)
        .filter((x) => x > from + step / 2 && x < to - step / 2)
        .map((x) => pixel(x, middle));
    };
    await mouse.move(field.x + field.width * 0.03, y);
    await mouse.down();
    await mouse.move(field.x + field.width * 0.03 + 2, y);
    const overTrack = await ticksAt();
    await mouse.move(field.x + field.width * 0.97, y, { steps: 6 });
    await expect.poll(() => Number(state.input.getAttribute('aria-valuenow'))).toBeGreaterThan(90);
    const overFill = await ticksAt();
    await mouse.up();
    expect(overTrack.length).toBeGreaterThan(2);
    expect(overFill).toHaveLength(overTrack.length);
    overFill.forEach((color, index) =>
      color.forEach((channel, at) =>
        expect(Math.abs(channel - overTrack[index]![at]!)).toBeLessThanOrEqual(2),
      ),
    );
  },
);

test(
  'keyboard focus shows the handle with the focus ring, faded behind text, and no ticks',
  { tags: ['engines'] },
  async () => {
    const state = stateOf();
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
    state.input.blur();
    await expectRest(state);
  },
);

test('the fill is empty at the minimum, the whole field at the maximum and in proportion between, in either direction', async () => {
  for (const direction of ['ltr', 'rtl'] as const) {
    scope().element().setAttribute('dir', direction);
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
    expect(getComputedStyle(fill, '::before').content).toBe('none');
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
  const field = box(part(0, '.env-slider-control'));
  await mouse.move(field.x + 2, field.y + field.height / 2);
  await mouse.down();
  await mouse.move(field.x + field.width - 2, field.y + field.height / 2, { steps: 5 });
  await mouse.up();
  expect(selected()).not.toMatch(/Opacity|%/);
  expect(input(0).getAttribute('aria-valuetext')).toMatch(/%$/);
});

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
    root.style.marginInline = '320px';
    for (const [direction, end] of [
      ['ltr', 'right'],
      ['ltr', 'left'],
      ['rtl', 'left'],
    ] as const) {
      scope().element().setAttribute('dir', direction);
      const rest = boxesOf(root);
      const { field } = rest;
      const edge = end === 'right' ? field.right : field.left;
      const away = (distance: number) => (end === 'right' ? edge + distance : edge - distance);
      const atEnd = (end === 'right') === (direction === 'ltr') ? '100' : '0';
      const y = rest.field.height / 2 + box(control).y;
      const stretch = () => {
        const now = boxesOf(root).field;
        if (end === 'right') expect(now.left).toBeCloseTo(field.left, 1);
        else expect(now.right).toBeCloseTo(field.right, 1);
        return now.width - field.width;
      };
      const most = Math.min(field.width * 0.06, field.height / 2);
      const value = () => range.getAttribute('aria-valuenow');

      await mouse.move(field.left + field.width / 2, y);
      await mouse.down();
      await mouse.move(away(30), y, { steps: 8 });
      await expect.poll(value).toBe(atEnd);
      await expect.poll(stretch).toBeGreaterThan(2);
      const near = stretch();
      expect(near).toBeLessThan(30);
      await mouse.move(away(280), y, { steps: 8 });
      await expect.poll(stretch).toBeGreaterThan(most * 0.8);
      const far = stretch();
      expect(far).toBeLessThanOrEqual(most);
      expect(value()).toBe(atEnd);
      const now = boxesOf(root);
      expect(now.field.height).toBeLessThan(field.height);
      expect(now.field.height).toBeGreaterThanOrEqual(field.height * 0.97 - 0.01);
      expect(now.field.scaleX).toBeGreaterThan(1.01);
      for (const text of ['label', 'value'] as const) {
        expect(now[text].scaleX).toBeCloseTo(1, 3);
        expect(now[text].scaleY).toBeCloseTo(1, 3);
      }
      const outer = (at: typeof field) => (end === 'right' ? at.right : at.left);
      const atTheEnd = (end === 'right') === (direction === 'ltr') ? 'value' : 'label';
      expect(Math.abs(outer(now[atTheEnd]) - outer(rest[atTheEnd]))).toBeGreaterThan(far * 0.8);

      await mouse.up();
      const springs = control
        .getAnimations()
        .some(
          (animation) => (animation as CSSTransition).transitionProperty === '--_slider-stretch',
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
