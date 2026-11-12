import { describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as dataDisplay from '../fixture/DataDisplay.fixture.tsx';
import * as fixture from '../fixture/List.fixture.tsx';
import { box, collectErrors, css, keyboard, mouse, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** The live regions a reorderable list announces through, one at a time: the nth list's. */
const announcer = (index = 0) => document.querySelectorAll('.env-list-announcer')[index]!;
const announced =
  (index = 0) =>
  () =>
    announcer(index).textContent;
const order = (testId: string) => () => page.getByTestId(`${testId}-order`).element().textContent;
const slides = () => page.getByTestId('slides');
const rows = () => slides().getByRole('listitem');
const handle = (list: Locator, name: string) =>
  list.getByRole('button', { name: `Reorder ${name}` });
const focus = (locator: Locator) => (locator.element() as HTMLElement).focus();
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const pressed = (locator: Locator, value: 'true' | 'false') =>
  expect.element(locator).toHaveAttribute('aria-pressed', value);
const nothingMoving = () =>
  expect.poll(() => slides().element().querySelectorAll('[data-moving]').length).toBe(0);

function centre(locator: Locator) {
  const { x, y, width, height } = box(locator);
  return { x: x + width / 2, y: y + height / 2 };
}

// First in the file: the frame keeps a module once it has loaded it, so the module must not have
// loaded before this test holds it back.
test(
  'a drag, keys and moves used before the reorder code has loaded still move the row, once each',
  { tags: ['engines'] },
  async () => {
    // The list loads the code that moves its rows as it renders: hold it back, as a slow network
    // would, while people already drag and press. Each list takes one of the ways.
    await commands.holdModule('reorderController');
    try {
      const errors = collectErrors();
      mount(fixture, { search: 'bare-rows' });
      await commands.moduleRequested('reorderController');
      // A drag on the slides.
      const from = centre(handle(slides(), 'Roadmap'));
      const target = centre(rows().nth(3));
      await mouse.move(from.x, from.y);
      await mouse.down();
      await mouse.move(from.x, from.y + (target.y + 4 - from.y) / 2, { steps: 4 });
      await mouse.move(from.x, target.y + 4, { steps: 4 });
      await mouse.up();
      // Space lifts, ↓ moves and Space drops, on the handle of a row component that passes its
      // props on: the handle's own press of Space doesn't follow.
      const wrapped = page.getByTestId('wrapped-slides');
      const wrappedIntro = handle(wrapped, 'Intro');
      focus(wrappedIntro);
      await keyboard.press('Space');
      await keyboard.press('ArrowDown');
      await keyboard.press('Space');
      // Two moves on a row target of a component that drops List.Root's props, so its rows have
      // no handles, and Alt+↓ names the row by its text.
      const bare = page.getByTestId('bare-slides');
      expect(bare.getByRole('button').elements()).toHaveLength(0);
      focus(bare.getByRole('link', { name: 'Intro' }));
      await keyboard.press('Alt+ArrowDown');
      await keyboard.press('Alt+ArrowDown');
      expect(order('slides')()).toBe('Intro,Roadmap,Budget,Questions');
      expect(order('wrapped-slides')()).toBe('Intro,Roadmap,Budget,Questions');
      expect(order('bare-slides')()).toBe('Intro,Roadmap,Budget,Questions');

      await commands.releaseModule('reorderController');
      await expect.poll(order('slides')).toBe('Intro,Budget,Questions,Roadmap');
      await expect.poll(announced(0)).toBe('Roadmap dropped at position 4 of 4.');
      await nothingMoving();
      await expect.poll(order('wrapped-slides')).toBe('Roadmap,Intro,Budget,Questions');
      await expect.poll(announced(2)).toBe('Intro dropped at position 2 of 4.');
      await pressed(wrappedIntro, 'false');
      // The second move came before the rows had moved, so it would read the old order: it is
      // dropped.
      await expect.poll(order('bare-slides')).toBe('Roadmap,Intro,Budget,Questions');
      await expect.poll(announced(3)).toBe('Intro moved to position 2 of 4.');
      await keyboard.press('Alt+ArrowDown');
      await expect.poll(order('bare-slides')).toBe('Roadmap,Budget,Intro,Questions');
      // Development reports the rows without handles once.
      expect(errors.filter((text) => text.includes('no drag handle'))).toEqual([
        expect.stringMatching(
          /^envUI: 4 rows of a List\.Root with onReorder have no drag handle\./,
        ),
      ]);
    } finally {
      await commands.unrouteModule('reorderController');
    }
  },
);

describe('List', () => {
  test('moves a row by keyboard from its handle, announcing each step', async () => {
    mount(fixture);
    const intro = handle(slides(), 'Intro');
    await expect.element(intro).toHaveAttribute('aria-pressed', 'false');
    // Space lifts the row; ↓ moves it, and the others make room; Space drops it.
    focus(intro);
    await keyboard.press('Space');
    await expect.poll(announced()).toMatch(/^Intro picked up, position 1 of 4\./);
    expect(announcer().querySelectorAll('[role="status"]')).toHaveLength(2);
    await expect.element(rows().nth(0)).toHaveAttribute('data-moving', 'keyboard');
    await pressed(intro, 'true');
    // The start of the list stops it, and says so each time.
    const regions = announcer().querySelectorAll('[role="status"]');
    const atStart = 'Intro is at the start of the list, position 1 of 4.';
    await keyboard.press('ArrowUp');
    await expect.poll(announced()).toBe(atStart);
    const first = regions[0]!.textContent;
    await keyboard.press('ArrowUp');
    await expect.poll(announced()).toBe(atStart);
    // The repeat goes to the other region, so it is announced again.
    await expect.poll(() => regions[0]!.textContent).not.toBe(first);
    await keyboard.press('ArrowDown');
    await expect.poll(announced()).toBe('Intro moved to position 2 of 4.');
    await keyboard.press('ArrowDown');
    await expect.poll(announced()).toBe('Intro moved to position 3 of 4.');
    // Nothing moves until the drop.
    expect(order('slides')()).toBe('Intro,Roadmap,Budget,Questions');
    await keyboard.press('Space');
    await expect.poll(order('slides')).toBe('Roadmap,Budget,Intro,Questions');
    await expect.poll(announced()).toBe('Intro dropped at position 3 of 4.');
    // Focus stays on the handle of the row that moved, and the rows are at rest.
    await isFocused(intro);
    await pressed(intro, 'false');
    await nothingMoving();
    await expect.poll(() => css(rows().nth(2), 'translate')).toBe('none');

    // Escape puts a lifted row back where it was.
    await keyboard.press('Enter');
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowUp');
    await expect.poll(announced()).toBe('Intro moved to position 1 of 4.');
    await keyboard.press('Escape');
    await expect.poll(announced()).toBe('Move cancelled. Intro is back at position 3 of 4.');
    expect(order('slides')()).toBe('Roadmap,Budget,Intro,Questions');
    await isFocused(intro);
  });

  test('Alt+↑ and Alt+↓ on a row target move it one place at once', async () => {
    mount(fixture);
    const link = slides().getByRole('link', { name: 'Budget' });
    focus(link);
    await keyboard.press('Alt+ArrowUp');
    await expect.poll(order('slides')).toBe('Intro,Budget,Roadmap,Questions');
    await expect.poll(announced()).toBe('Budget moved to position 2 of 4.');
    await isFocused(link);
    await keyboard.press('Alt+ArrowUp');
    await keyboard.press('Alt+ArrowUp');
    // The first place is as far as it goes, and the list says so.
    await expect.poll(order('slides')).toBe('Budget,Intro,Roadmap,Questions');
    await expect.poll(announced()).toBe('Budget is at the start of the list, position 1 of 4.');
    await keyboard.press('Alt+ArrowDown');
    await expect.poll(order('slides')).toBe('Intro,Budget,Roadmap,Questions');
  });

  test('drags a row by its handle with the pointer', { tags: ['engines'] }, async () => {
    mount(fixture);
    const from = centre(handle(slides(), 'Roadmap'));
    const target = centre(rows().nth(3));
    await mouse.move(from.x, from.y);
    await mouse.down();
    // A press that doesn't move is no drag.
    await expect.element(rows().nth(1)).not.toHaveAttribute('data-moving');
    // Once it drags, the announcement says how to move it with the pointer.
    await mouse.move(from.x, from.y + 6);
    await expect.poll(announced()).toMatch(/^Roadmap picked up, position 2 of 4\. Drag it/);
    const steps = 8;
    for (let step = 1; step <= steps; step++)
      await mouse.move(from.x, from.y + ((target.y + 4 - from.y) * step) / steps);
    await expect.element(rows().nth(1)).toHaveAttribute('data-moving', 'pointer');
    // The row follows the pointer, the rows it passed make room, and the move is announced.
    await expect.poll(announced()).toBe('Roadmap moved to position 4 of 4.');
    const roadmap = box(rows().nth(1));
    expect(Math.abs(roadmap.y + roadmap.height / 2 - (target.y + 4))).toBeLessThan(2);
    await mouse.up();
    await expect.poll(order('slides')).toBe('Intro,Budget,Questions,Roadmap');
    await expect.poll(announced()).toBe('Roadmap dropped at position 4 of 4.');
    // The click that ends the drag doesn't lift the row again.
    await nothingMoving();
    await pressed(handle(slides(), 'Roadmap'), 'false');

    // A press on the handle without dragging lifts the row for the arrow keys; another drops it.
    const intro = handle(slides(), 'Intro');
    await intro.click();
    await pressed(intro, 'true');
    await expect.poll(announced()).toMatch(/^Intro picked up, position 1 of 4\./);
    await isFocused(intro);
    await keyboard.press('ArrowDown');
    await intro.click();
    await expect.poll(order('slides')).toBe('Budget,Intro,Questions,Roadmap');
    await pressed(intro, 'false');
  });

  test(
    'a press on a lifted row released off its handle keeps the row on its handle',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const intro = handle(slides(), 'Intro');
      await intro.click();
      await pressed(intro, 'true');
      // Pressed again, dragged off and released elsewhere: no click reaches the handle, and
      // WebKit has taken focus from it as it was pressed.
      const from = centre(intro);
      await mouse.move(from.x, from.y);
      await mouse.down();
      await mouse.move(from.x + 300, from.y + 200, { steps: 4 });
      await mouse.up();
      await isFocused(intro);
      await keyboard.press('Escape');
      await pressed(intro, 'false');
      await nothingMoving();

      // Should a row stay lifted as another handle takes its keys, that handle moves its own row.
      await intro.click();
      const budget = handle(slides(), 'Budget').element();
      const key = (name: string) =>
        budget.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
      key(' ');
      await pressed(intro, 'false');
      await pressed(handle(slides(), 'Budget'), 'true');
      key('ArrowDown');
      key('Enter');
      await expect.poll(order('slides')).toBe('Intro,Roadmap,Questions,Budget');
    },
  );

  test('a press lifts and drops a row without a pointer drag, as voice control does', async () => {
    mount(fixture);
    const budget = handle(slides(), 'Budget');
    // A click with no pointer events before it, as assistive technology sends one.
    const click = () => budget.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    click();
    await pressed(budget, 'true');
    await isFocused(budget);
    await keyboard.press('ArrowUp');
    click();
    await expect.poll(order('slides')).toBe('Intro,Budget,Roadmap,Questions');
  });

  test('in right-to-left text the handle leads at the right and the keys move the same way', async () => {
    mount(fixture);
    const list = page.getByTestId('slides-rtl');
    const intro = handle(list, 'Intro');
    const row = box(list.getByRole('listitem').nth(0));
    expect(box(intro).x).toBeGreaterThan(row.x + row.width / 2);
    focus(intro);
    await keyboard.press('Space');
    await keyboard.press('ArrowDown');
    await keyboard.press('Space');
    await expect.poll(order('slides-rtl')).toBe('Roadmap,Intro,Budget,Questions');
  });
});

/**
 * Waits two frames, so a state change has started its transitions, and then until the element's
 * own transitions have finished: what it shows then is where it settles.
 */
async function settled(element: Locator) {
  await nextFrames();
  await expect
    .poll(
      () =>
        element
          .element()
          .getAnimations()
          .filter((animation) => animation.playState === 'running').length,
    )
    .toBe(0);
}

test('interactive rows react to hover, presses and focus, and open from anywhere', async () => {
  // With motion, as pressed controls shrink: a press on the row still follows its link.
  mount(dataDisplay);
  for (const theme of ['light', 'dark']) {
    const list = page.getByRole('list', { name: `Rows ${theme}` });
    const all = list.getByRole('listitem').elements();
    const [open, plain] = [page.elementLocator(all[0]!), page.elementLocator(all.at(-1)!)];
    open.element().scrollIntoView({ block: 'center' });
    const link = open.getByRole('link', { name: 'Roadmap' });
    const action = open.getByRole('button', { name: 'More actions' });
    const fill = (row: Locator) => () => css(row, 'background-color');
    const result = () => page.getByTestId(`row-result-${theme}`).element().textContent;
    const rest = fill(open)();
    expect(fill(plain)()).toBe(rest);
    expect(css(open, 'position')).toBe('relative');
    const plainCentre = centre(plain);
    await mouse.move(plainCentre.x, plainCentre.y);
    await settled(plain);
    expect(fill(plain)()).toBe(rest);
    // The row reacts to the pointer anywhere on it, and to keyboard focus inside it.
    const frame = box(open);
    await mouse.move(frame.x + 8, frame.y + 8);
    await expect.poll(fill(open)).not.toBe(rest);
    await settled(open);
    const hovered = fill(open)();
    await mouse.move(0, 0);
    await expect.poll(fill(open)).toBe(rest);
    // Keyboard focus inside the row highlights it (the action: WebKit's Tab skips links).
    focus(link);
    await keyboard.press('Tab');
    await isFocused(action);
    await expect.poll(fill(open)).toBe(hovered);
    (action.element() as HTMLElement).blur();
    await expect.poll(fill(open)).toBe(rest);
    // A press beside the title follows the link that covers the row, and the row shows it.
    await mouse.move(frame.x + frame.width / 2, frame.y + frame.height - 6);
    await mouse.down();
    await settled(open);
    const down = fill(open)();
    expect(down).not.toBe(hovered);
    await mouse.up();
    await expect.poll(result).toBe('open roadmap');
    // The action keeps its own press: the row does not darken, and stays plain once the pointer
    // leaves, though a click may leave focus on the action.
    const actionCentre = centre(action);
    await mouse.move(actionCentre.x, actionCentre.y);
    await mouse.down();
    await settled(open);
    expect(fill(open)()).toBe(hovered);
    await mouse.up();
    await expect.poll(result).toBe('more actions');
    await mouse.move(0, 0);
    await expect.poll(fill(open)).toBe(rest);
    // The covering link is not dragged as a link where the engine supports it.
    const drag = (
      getComputedStyle(link.element()) as CSSStyleDeclaration & { webkitUserDrag?: string }
    ).webkitUserDrag;
    if (drag !== undefined) expect(drag).toBe('none');
    await expect.element(link).toHaveAttribute('draggable', 'false');
  }
});
