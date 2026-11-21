import { describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as dataDisplay from '../fixture/DataDisplay.fixture.tsx';
import * as fixture from '../fixture/List.fixture.tsx';
import * as rowControls from '../fixture/RowControls.fixture.tsx';
import * as surfaces from '../fixture/Surfaces.fixture.tsx';
import { box, collectErrors, css, keyboard, mouse, nextFrames } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

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

test(
  'first in the file, so nothing has loaded the reorder code: a drag, keys and moves used before it loads still move the row, once each',
  { tags: ['engines', 'once'] },
  async () => {
    await commands.holdModule('reorderController');
    try {
      const errors = collectErrors();
      mount(fixture, { search: 'bare-rows' });
      await commands.moduleRequested('reorderController');
      const from = centre(handle(slides(), 'Roadmap'));
      const target = centre(rows().nth(3));
      await mouse.move(from.x, from.y);
      await mouse.down();
      await mouse.move(from.x, from.y + (target.y + 4 - from.y) / 2, { steps: 4 });
      await mouse.move(from.x, target.y + 4, { steps: 4 });
      await mouse.up();
      const wrapped = page.getByTestId('wrapped-slides');
      const wrappedIntro = handle(wrapped, 'Intro');
      focus(wrappedIntro);
      await keyboard.press('Space');
      await keyboard.press('ArrowDown');
      await keyboard.press('Space');
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
      await expect.poll(order('bare-slides')).toBe('Roadmap,Intro,Budget,Questions');
      await expect.poll(announced(3)).toBe('Intro moved to position 2 of 4.');
      await keyboard.press('Alt+ArrowDown');
      await expect.poll(order('bare-slides')).toBe('Roadmap,Budget,Intro,Questions');
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
    focus(intro);
    await keyboard.press('Space');
    await expect.poll(announced()).toMatch(/^Intro picked up, position 1 of 4\./);
    expect(announcer().querySelectorAll('[role="status"]')).toHaveLength(2);
    await expect.element(rows().nth(0)).toHaveAttribute('data-moving', 'keyboard');
    await pressed(intro, 'true');
    const regions = announcer().querySelectorAll('[role="status"]');
    const atStart = 'Intro is at the start of the list, position 1 of 4.';
    await keyboard.press('ArrowUp');
    await expect.poll(announced()).toBe(atStart);
    const first = regions[0]!.textContent;
    await keyboard.press('ArrowUp');
    await expect.poll(announced()).toBe(atStart);
    await expect.poll(() => regions[0]!.textContent).not.toBe(first);
    await keyboard.press('ArrowDown');
    await expect.poll(announced()).toBe('Intro moved to position 2 of 4.');
    await keyboard.press('ArrowDown');
    await expect.poll(announced()).toBe('Intro moved to position 3 of 4.');
    expect(order('slides')()).toBe('Intro,Roadmap,Budget,Questions');
    await keyboard.press('Space');
    await expect.poll(order('slides')).toBe('Roadmap,Budget,Intro,Questions');
    await expect.poll(announced()).toBe('Intro dropped at position 3 of 4.');
    await isFocused(intro);
    await pressed(intro, 'false');
    await nothingMoving();
    await expect.poll(() => css(rows().nth(2), 'translate')).toBe('none');

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
    await expect.element(rows().nth(1)).not.toHaveAttribute('data-moving');
    await mouse.move(from.x, from.y + 6);
    await expect.poll(announced()).toMatch(/^Roadmap picked up, position 2 of 4\. Drag it/);
    const steps = 8;
    for (let step = 1; step <= steps; step++)
      await mouse.move(from.x, from.y + ((target.y + 4 - from.y) * step) / steps);
    await expect.element(rows().nth(1)).toHaveAttribute('data-moving', 'pointer');
    await expect.poll(announced()).toBe('Roadmap moved to position 4 of 4.');
    const roadmap = box(rows().nth(1));
    expect(Math.abs(roadmap.y + roadmap.height / 2 - (target.y + 4))).toBeLessThan(2);
    await mouse.up();
    await expect.poll(order('slides')).toBe('Intro,Budget,Questions,Roadmap');
    await expect.poll(announced()).toBe('Roadmap dropped at position 4 of 4.');
    await nothingMoving();
    await pressed(handle(slides(), 'Roadmap'), 'false');

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
      const from = centre(intro);
      await mouse.move(from.x, from.y);
      await mouse.down();
      await mouse.move(from.x + 300, from.y + 200, { steps: 4 });
      await mouse.up();
      await isFocused(intro);
      await keyboard.press('Escape');
      await pressed(intro, 'false');
      await nothingMoving();

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
    const frame = box(open);
    await mouse.move(frame.x + 8, frame.y + 8);
    await expect.poll(fill(open)).not.toBe(rest);
    await settled(open);
    const hovered = fill(open)();
    await mouse.move(0, 0);
    await expect.poll(fill(open)).toBe(rest);
    focus(link);
    await keyboard.press('Tab');
    await isFocused(action);
    await expect.poll(fill(open)).toBe(hovered);
    (action.element() as HTMLElement).blur();
    await expect.poll(fill(open)).toBe(rest);
    await mouse.move(frame.x + frame.width / 2, frame.y + frame.height - 6);
    await mouse.down();
    await settled(open);
    const down = fill(open)();
    expect(down).not.toBe(hovered);
    await mouse.up();
    await expect.poll(result).toBe('open roadmap');
    const actionCentre = centre(action);
    await mouse.move(actionCentre.x, actionCentre.y);
    await mouse.down();
    await settled(open);
    expect(fill(open)()).toBe(hovered);
    await mouse.up();
    await expect.poll(result).toBe('more actions');
    await mouse.move(0, 0);
    await expect.poll(fill(open)).toBe(rest);
    const drag = (
      getComputedStyle(link.element()) as CSSStyleDeclaration & { webkitUserDrag?: string }
    ).webkitUserDrag;
    if (drag !== undefined) expect(drag).toBe('none');
    await expect.element(link).toHaveAttribute('draggable', 'false');
  }
});

test('rows are filled tiles joined by small gaps with the outer corners, and a row target reads in the row text color', async () => {
  mount(fixture);
  const [tile, nextTile] = page
    .getByRole('list', { name: 'People', exact: true })
    .getByRole('listitem')
    .elements();
  expect(css(tile!, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
  expect(css(tile!, 'padding-left')).not.toBe('0px');
  expect(css(tile!, 'border-top-left-radius')).not.toBe(css(tile!, 'border-bottom-left-radius'));
  expect(css(nextTile!, 'border-top-width')).toBe('0px');
  expect(box(nextTile!).y).toBeGreaterThan(box(tile!).y + box(tile!).height);

  const plans = page.getByRole('list', { name: 'Plans', exact: true });
  const target = plans.getByRole('button', { name: 'Hiring plan 2027' });
  const row = plans.getByRole('listitem').element();
  await mouse.move(centre(target).x, centre(target).y);
  await expect.poll(() => css(row, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
  expect(css(target, 'color')).toBe(css(row, 'color'));
  expect(css(target, 'text-decoration-line')).toBe('none');
});

test('a titled list is named by its heading, and a control in a row is named and described by the row, once', async () => {
  mount(surfaces);
  const list = page.getByRole('list', { name: 'Remote access', exact: true });
  await expect
    .element(list)
    .toHaveAccessibleDescription('Let your other devices reach this computer.');
  await expect
    .element(page.getByRole('heading', { level: 2, name: 'Remote access', exact: true }))
    .toBeVisible();
  const allow = list.getByRole('switch');
  await expect.element(allow).toHaveAccessibleName('Allow paired devices');
  await expect
    .element(allow)
    .toHaveAccessibleDescription('They can see and steer the agents on this computer.');
  await expect
    .element(list.getByRole('checkbox'))
    .toHaveAccessibleName('Wake this computer for them');
  const [switchRow] = list.getByRole('listitem').elements();
  expect(box(allow.element()).x).toBeGreaterThan(
    box(switchRow!.querySelector('.env-list-item-label')!).x,
  );
});

test(
  "a row's start icon takes the start's icon size and sits centred on the row",
  { tags: ['engines'] },
  async () => {
    mount(surfaces);
    const row = page
      .getByRole('list', { name: 'Paired devices', exact: true })
      .getByRole('listitem')
      .first()
      .element();
    const icon = row.querySelector('.env-list-item-start svg')!;
    const probe = document.createElement('div');
    probe.style.inlineSize = 'var(--env-icon-size-lg)';
    row.append(probe);
    const size = box(probe).width;
    probe.remove();
    expect(box(icon).width).toBe(size);
    expect(box(icon).height).toBe(size);
    const rowBox = box(row);
    const content = box(row.querySelector('.env-list-item-content')!);
    expect(
      Math.abs(box(icon).y + box(icon).height / 2 - (content.y + content.height / 2)),
    ).toBeLessThan(1);
    expect(box(icon).y).toBeGreaterThan(rowBox.y);
  },
);

test("a Switch or Checkbox without a label of its own takes the row's name, and one with a label keeps it", async () => {
  mount(rowControls);
  const list = page.getByRole('list', { name: 'Row controls', exact: true });
  const checkbox = list.getByRole('checkbox');
  await expect.element(checkbox).toHaveAccessibleName('Sync');
  await expect.element(checkbox).toHaveAccessibleDescription('Keep this computer in step.');
  await expect.element(list.getByRole('switch')).toHaveAccessibleName('Mute alerts');
});

test("a field in a row's control, with no name of its own, is named and described by the row", async () => {
  mount(rowControls);
  const list = page.getByRole('list', { name: 'Row fields', exact: true });
  const named = async (field: Locator, name: string, description: string) => {
    await expect.element(field).toHaveAccessibleName(name);
    await expect.element(field).toHaveAccessibleDescription(description);
  };
  await named(list.getByRole('combobox').nth(0), 'Theme', 'Follows the system until set.');
  await named(list.getByRole('radiogroup').nth(0), 'Density', 'How tight the rows sit.');
  await named(list.getByRole('slider'), 'Volume', 'Of the alert sound.');
  await named(list.getByRole('textbox', { name: 'Port' }), 'Port', 'Between 1024 and 65535.');
  await named(list.getByRole('textbox', { name: 'Notes' }), 'Notes', 'Shown to the team.');
  await named(list.getByRole('combobox', { name: 'Owner' }), 'Owner', 'Who gets the alerts.');
  await named(list.getByRole('group', { name: 'Plan' }), 'Plan', 'Billed monthly.');
  await named(list.getByRole('combobox', { name: 'Starts' }), 'Starts', 'The first day.');
  await named(list.getByRole('group', { name: 'Due' }), 'Due', 'The last day.');
  await named(
    list.getByRole('combobox', { name: 'Data region' }),
    'Data region',
    'Changes take a day.',
  );
});

test("a link in an interactive row's description stays clickable above the row target", async () => {
  mount(fixture);
  const edits = page.getByRole('list', { name: 'Edits', exact: true });
  const author = edits.getByRole('link', { name: 'Alex Morgan' });
  const target = edits.getByRole('link', { name: 'Quarterly report' });
  const at = (point: { x: number; y: number }) => document.elementFromPoint(point.x, point.y);
  edits.element().scrollIntoView({ block: 'center' });
  expect(author.element().contains(at(centre(author)))).toBe(true);
  const row = box(edits.getByRole('listitem'));
  expect(target.element().contains(at({ x: row.x + row.width - 8, y: row.y + 8 }))).toBe(true);
});
