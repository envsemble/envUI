import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Sheet.fixture.tsx';
import { box, css, keyboard, mouse, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/**
 * The warnings the file's mounts print: the resizable sheet with a CSS length warns as it mounts,
 * once a page.
 */
const warnings: string[] = [];
const warn = console.warn;
beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(' '));
    warn(...args);
  };
});
afterAll(() => {
  console.warn = warn;
});

beforeEach(() => {
  mount(fixture);
});

const dialog = (name: string) => page.getByRole('dialog', { name, exact: true });
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const center = (target: Element | Locator) => {
  const { x, y, width, height } = box(target);
  return { x: x + width / 2, y: y + height / 2 };
};

/**
 * Waits for an opened sheet's entrance to end. Base UI marks the first frame with
 * data-starting-style, and only once it removes that do the transitions start: a busy engine can
 * read no animations before then, and the sheet would still be sliding in.
 */
async function slidIn(sheet: Locator) {
  await isShown(sheet);
  const element = sheet.element();
  while (element.hasAttribute('data-starting-style'))
    await new Promise((resolve) => requestAnimationFrame(resolve));
  await Promise.all(element.getAnimations().map((animation) => animation.finished));
}

/** Opens a sheet from its trigger and waits for it to slide in. */
async function open(trigger: string, name: string) {
  await page.getByRole('button', { name: trigger, exact: true }).click();
  const sheet = dialog(name);
  await slidIn(sheet);
  return sheet;
}

async function close(sheet: Locator) {
  await keyboard.press('Escape');
  await isHidden(sheet);
}

/** A tap of a finger on an element. */
async function tap(target: Element | Locator) {
  const { x, y } = center(target);
  await commands.touch('touchStart', x, y);
  await commands.touch('touchEnd');
}

describe('Sheet', () => {
  test('opens at its edge in either direction, sliding from that edge, at the bottom as tall as its content, and across a compact window', async () => {
    const width = innerWidth;
    const offset = (sheet: Locator, axis = 'x') => css(sheet, `--env-sheet-offset-${axis}`);

    const end = await open('Open filters', 'Filters');
    const endBox = box(end);
    expect(endBox.x + endBox.width).toBeCloseTo(width, 0);
    expect(endBox.width).toBeCloseTo(24 * 16, 0);
    expect(offset(end)).toBe('2rem');
    await close(end);

    // Named by aria-label, without a title; its width a CSS length.
    const start = await open('Open navigation', 'Navigation');
    const startBox = box(start);
    expect(startBox.x).toBeCloseTo(0, 0);
    expect(startBox.width).toBeCloseTo(18 * 16, 0);
    expect(offset(start)).toBe('-2rem');
    expect(start.getByRole('heading').elements()).toHaveLength(0);
    await close(start);

    // In right-to-left text the end is the left edge, and the sheet slides in from it.
    const rtl = await open('Open details rtl', 'Details');
    expect(rtl.element().closest('[dir]')!.getAttribute('dir')).toBe('rtl');
    expect(box(rtl).x).toBeCloseTo(0, 0);
    expect(offset(rtl)).toBe('-2rem');
    await close(rtl);

    // A bottom sheet: at most 40 rem wide, centered, flush with the bottom edge and shorter than
    // the window.
    await page.viewport(900, 700);
    const bottom = await open('Open choices', 'Choices');
    const bottomBox = box(bottom);
    expect(bottomBox.width).toBeCloseTo(40 * 16, 0);
    expect(bottomBox.x + bottomBox.width / 2).toBeCloseTo(450, 0);
    expect(bottomBox.y + bottomBox.height).toBeCloseTo(700, 0);
    expect(bottomBox.height).toBeLessThan(350);
    expect(css(bottom, 'border-start-start-radius')).not.toBe('0px');
    expect(css(bottom, 'border-end-start-radius')).toBe('0px');
    expect(offset(bottom, 'y')).toBe('2rem');
    await close(bottom);

    // A md side sheet takes the whole width of a compact window.
    await page.viewport(400, 700);
    const compact = await open('Open filters', 'Filters');
    expect(box(compact).width).toBeCloseTo(400, 0);
  });

  test(
    'a mouse drag toward its edge never moves or closes the sheet',
    { tags: ['engines'] },
    async () => {
      for (const [trigger, name, toward] of [
        ['Open filters', 'Filters', 1],
        ['Open details rtl', 'Details', -1],
      ] as const) {
        const sheet = await open(trigger, name);
        const rest = box(sheet);
        // Press on the heading's text, away from the controls, and drag well past the distance
        // that would close it by touch, toward the edge.
        const heading = box(sheet.getByRole('heading', { name }));
        const start = { x: heading.x + 4, y: heading.y + heading.height / 2 };
        await mouse.move(start.x, start.y);
        await mouse.down();
        for (let step = 1; step <= 12; step += 1)
          await mouse.move(start.x + toward * 20 * step, start.y);
        expect(sheet.element().hasAttribute('data-swiping')).toBe(false);
        expect(box(sheet).x).toBeCloseTo(rest.x, 0);
        await mouse.up();
        expect(shown(sheet)).toBe(true);
        expect(box(sheet).x).toBeCloseTo(rest.x, 0);
        await keyboard.press('Escape');
        await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
      }
    },
  );

  test('a finger swipe toward its edge moves the sheet with it and closes it', async () => {
    await commands.emulateTouch(true);
    try {
      await tap(page.getByRole('button', { name: 'Open filters' }));
      const sheet = dialog('Filters');
      await slidIn(sheet);
      const rest = box(sheet);
      const heading = box(sheet.getByRole('heading', { name: 'Filters' }));
      const start = { x: Math.round(heading.x + 4), y: Math.round(heading.y + heading.height / 2) };
      await commands.touch('touchStart', start.x, start.y);
      for (let step = 1; step <= 6; step += 1)
        await commands.touch('touchMove', start.x + 9 * step, start.y);
      await expect.element(sheet).toHaveAttribute('data-swiping');
      await expect.poll(() => box(sheet).x - rest.x).toBeGreaterThan(10);
      for (let step = 7; step <= 30; step += 1)
        await commands.touch('touchMove', start.x + 9 * step, start.y);
      await commands.touch('touchEnd');
      await isHidden(sheet);
    } finally {
      await commands.emulateTouch(false);
    }
  });

  // Touch input goes through Chromium's DevTools protocol, so this runs in Chromium alone.
  test('opened by touch, it focuses the sheet, not a field inside; by keyboard, the field', async () => {
    await commands.emulateTouch(true);
    try {
      // Its first element that takes Tab is a field; a field focused by touch opens the keyboard.
      const trigger = page.getByRole('button', { name: 'Open search' });
      await tap(trigger);
      const sheet = dialog('Search');
      await isFocused(sheet);
      await expect.element(sheet.getByRole('textbox', { name: 'Query' })).not.toHaveFocus();
      await close(sheet);
      (trigger.element() as HTMLElement).focus();
      await keyboard.press('Enter');
      await isFocused(sheet.getByRole('textbox', { name: 'Query' }));
    } finally {
      await commands.emulateTouch(false);
    }
  });

  test("a sheet the application opens reports why it closes and sends focus where it says; sheets take the navigation's fill and no edge, but one at high contrast", async () => {
    await page.getByRole('button', { name: 'Open controlled' }).click();
    const controlled = dialog('Controlled');
    await isShown(controlled);
    expect(box(controlled).width).toBeCloseTo(44 * 16, 0);
    // closeButton={false} leaves out the close button; Escape still closes it.
    expect(controlled.getByRole('button', { name: 'Close' }).elements()).toHaveLength(0);
    await close(controlled);
    expect(page.getByTestId('sheet-reason').element().textContent).toBe('escape-key');
    await isFocused(page.getByTestId('sheet-main'));

    // The navigation's fill, the default surface, which a Drawer has at the window's edge.
    const probe = document.createElement('div');
    probe.style.background = 'var(--env-color-bg-default)';
    document.querySelector('.env-theme')!.append(probe);
    const navigation = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const filters = await open('Open filters', 'Filters');
    expect(css(filters, 'background-color')).toBe(navigation);
    // No edge of its own.
    expect(css(filters, 'border-inline-start-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(filters, 'box-shadow')).toBe('none');
    await close(filters);
    const sheet = await open('Open navigation', 'Navigation');
    expect(css(sheet, 'background-color')).toBe(navigation);
    expect(css(sheet.getByRole('navigation', { name: 'Sections' }), 'background-color')).toBe(
      navigation,
    );
    await close(sheet);

    // At high contrast its edge returns.
    await commands.emulateMedia({ contrast: 'more' });
    mount(fixture);
    const contrasted = await open('Open filters', 'Filters');
    expect(css(contrasted, 'border-inline-start-color')).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('a sheet too short for its content scrolls its body and keeps its heading and actions in view; one with room keeps its actions at its foot', async () => {
    // However little its body holds, a side sheet keeps its actions at its foot.
    const filters = await open('Open filters', 'Filters');
    const apply = box(filters.getByRole('button', { name: 'Apply' }));
    const filtersBox = box(filters);
    expect(filtersBox.y + filtersBox.height - (apply.y + apply.height)).toBeCloseTo(
      Number.parseFloat(css(filters, 'padding-bottom')),
      0,
    );
    await close(filters);

    await page.viewport(900, 400);
    for (const side of ['end', 'bottom']) {
      const sheet = await open(`Open long ${side}`, `Long ${side}`);
      const body = sheet.element().querySelector<HTMLElement>('.env-sheet-body')!;
      const parts = () => ({
        sheet: box(sheet),
        title: box(sheet.getByRole('heading', { name: `Long ${side}` })),
        action: box(sheet.getByRole('button', { name: 'Show 5 projects' })),
      });
      const before = parts();
      // The sheet keeps to the window, with its actions inside it.
      expect(before.sheet.y + before.sheet.height).toBeLessThanOrEqual(400.5);
      expect(before.action.y + before.action.height).toBeLessThanOrEqual(
        before.sheet.y + before.sheet.height,
      );
      expect(body.scrollHeight > body.clientHeight).toBe(true);
      const element = sheet.element();
      expect(element.scrollHeight - element.clientHeight).toBe(0);
      // Scrolled to its end, the body moves under them; the heading and the actions stay.
      body.scrollTo({ top: body.scrollHeight });
      expect(body.scrollTop).toBeGreaterThan(0);
      const after = parts();
      expect(after.title.y).toBeCloseTo(before.title.y, 0);
      expect(after.action.y).toBeCloseTo(before.action.y, 0);
      await close(sheet);
    }
  });
});

describe('Sheet resizable', () => {
  test('a resizable sheet ignores a CSS length as its width, and warns of it while developing', async () => {
    const sheet = await open('Open resizable css width', 'Resizable css width');
    await expect
      .element(sheet.getByRole('separator', { name: 'Resize' }))
      .toHaveAttribute('aria-valuetext', '24 rem');
    expect(box(sheet).width).toBeCloseTo(24 * 16, 0);
    expect(warnings.filter((text) => text.includes('resizable Sheet ignores'))).toEqual([
      expect.stringContaining('width="min(30rem, 90%)"'),
    ]);
  });

  test('a side sheet resizes by its inner edge, by keys and pointer, and a drag never closes it', async () => {
    const sheet = await open('Open resizable', 'Resizable');
    const handle = sheet.getByRole('separator', { name: 'Resize' });
    const valueText = () => handle.element().getAttribute('aria-valuetext');
    expect(valueText()).toBe('24 rem');
    const width = () => box(sheet).width;
    expect(width()).toBeCloseTo(24 * 16, 0);
    // The handle runs down the sheet's start edge, inside its edge, toward the page.
    const sheetBox = box(sheet);
    const handleBox = box(handle);
    expect(handleBox.x).toBeCloseTo(sheetBox.x + 1, 0);
    expect(handleBox.height).toBeGreaterThanOrEqual(sheetBox.height - 1);
    // The same handle as between Panes, as wide as their gap: a grip of three dots, never a line,
    // which would stick to the middle of the sheet should the sheet itself scroll.
    expect(handle.element().hasAttribute('data-grip')).toBe(true);
    expect(css(handle, 'background-image', '::after').match(/radial-gradient/g)).toHaveLength(3);
    expect(css(handle, 'position', '::after')).toBe('sticky');
    expect(parseFloat(css(handle, 'height', '::after'))).toBeLessThan(20);
    expect(handleBox.width).toBeCloseTo(16, 0);

    // At the end edge, it grows as its start edge moves toward the start. Keyboard focus rings it.
    (handle.element() as HTMLElement).focus();
    await keyboard.press('ArrowLeft');
    await expect.poll(valueText).toBe('25 rem');
    await expect.poll(() => css(handle, 'outline-style')).toBe('solid');
    expect(width()).toBeCloseTo(25 * 16, 0);
    await keyboard.press('Home');
    await expect.poll(valueText).toBe('16 rem');

    const grip = center(handle);
    await mouse.move(grip.x, grip.y);
    await mouse.down();
    await mouse.move(grip.x - 64, grip.y, { steps: 4 });
    await expect.poll(valueText).toBe('20 rem');
    // Toward the sheet's own edge, the way a swipe closes it, the drag stops at the least width.
    await mouse.move(grip.x + 400, grip.y, { steps: 6 });
    await mouse.up();
    await expect.poll(valueText).toBe('16 rem');
    expect(shown(sheet)).toBe(true);
    const moved = center(handle);
    await mouse.dblclick(moved.x, moved.y);
    await expect.poll(valueText).toBe('24 rem');
  });

  test(
    'a controlled sheet reports its width, keeps to the window and its handle to its height',
    { tags: ['engines'] },
    async () => {
      await page.viewport(640, 600);
      const sheet = await open('Open kept width', 'Kept width');
      const handle = sheet.getByRole('separator');
      const committed = () => page.getByTestId('sheet-committed').element().textContent;
      // A start sheet's handle is on its end edge; it starts at the width the application keeps.
      const sheetBox = box(sheet);
      expect(sheetBox.x).toBeCloseTo(0, 0);
      expect(sheetBox.width).toBeCloseTo(30 * 16, 0);
      const handleBox = box(handle);
      expect(handleBox.x + handleBox.width).toBeCloseTo(sheetBox.width - 1, 0);
      (handle.element() as HTMLElement).focus();
      await keyboard.press('ArrowRight');
      await expect.poll(committed).toBe('31');
      // End goes no further than the window: 640 pixels are 40 rem.
      await keyboard.press('End');
      await expect.poll(committed).toBe('40');
      expect(box(sheet).width).toBeCloseTo(640, 0);
      await keyboard.press('Shift+ArrowLeft');
      await expect.poll(() => page.getByTestId('sheet-width').element().textContent).toBe('35');

      // Its body scrolled to its end, the handle still runs along the whole edge.
      const body = sheet.element().querySelector('.env-sheet-body')!;
      body.scrollTo({ top: body.scrollHeight });
      const scrolled = box(sheet);
      const edge = box(handle);
      const hit = document.elementFromPoint(
        edge.x + edge.width / 2,
        scrolled.y + scrolled.height - 4,
      );
      expect(hit?.getAttribute('role')).toBe('separator');
    },
  );

  test('in right-to-left text an end sheet grows to the right; a bottom sheet has no handle', async () => {
    const sheet = await open('Open resizable rtl', 'Resizable rtl');
    const handle = sheet.getByRole('separator');
    const sheetBox = box(sheet);
    expect(sheetBox.x).toBeCloseTo(0, 0);
    const handleBox = box(handle);
    expect(handleBox.x + handleBox.width).toBeCloseTo(sheetBox.width - 1, 0);
    (handle.element() as HTMLElement).focus();
    await keyboard.press('ArrowRight');
    await expect.poll(() => handle.element().getAttribute('aria-valuetext')).toBe('25 rem');
    await close(sheet);

    const bottom = await open('Open bottom resizable', 'Bottom resizable');
    expect(bottom.getByRole('separator').elements()).toHaveLength(0);
    expect(bottom.element().hasAttribute('data-resizable')).toBe(false);
  });
});
