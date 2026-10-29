import { test, expect, type Locator, type Page } from '@playwright/test';
import { siteDevUrl } from './Servers';
import { displayStorageKeys } from '../../apps/site/src/theme/DisplayStorage';

/*
 * The site's animations (apps/site/src/previews/Motion.tsx): a tile plays its own preview while
 * the pointer is on it and rests at its still, the animation's first step, once it leaves; an
 * animated figure on a page plays by itself, with a pause button that holds it where it is; the
 * sidebar's button pauses them all, is stored, and is what a reader who prefers reduced motion
 * starts with.
 */

const tile = (page: Page, name: string) =>
  page.locator('.catalogue-gallery-tile', { has: page.getByRole('link', { name, exact: true }) });

/** Whether the Switch tile's switch is on. */
const switchOn = (tileOf: Locator) =>
  tileOf.locator('input').evaluate((input) => (input as HTMLInputElement).checked);

/** The Slider page's figure of a slider under the pointer, whose value starts at 30, by its own
 * pause button's name, which stays its own however its subject redraws. */
const sliderFigure = (page: Page) =>
  page.locator('.catalogue-motion-stage', {
    has: page.getByRole('button', { name: /the slider under the pointer$/ }),
  });

/** What the Slider page's figure under the pointer shows: the value it is at. */
const figureValue = (page: Page) =>
  sliderFigure(page).locator('.env-slider-value').first().textContent();

test('a tile plays its preview while the pointer is on it, and rests at its still after', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components`);
  const switchTile = tile(page, 'Switch');
  await switchTile.scrollIntoViewIfNeeded();
  await expect(switchTile.locator('.catalogue-related-canvas[data-fitted]')).toBeVisible();
  // The still is the switch off, and nothing moves at rest.
  expect(await switchOn(switchTile)).toBe(false);
  await page.waitForTimeout(800);
  expect(await switchOn(switchTile)).toBe(false);
  // On the tile, it plays: the switch turns on.
  await switchTile.hover();
  await expect.poll(() => switchOn(switchTile)).toBe(true);
  // Off it, it goes back to the still at once.
  await page.mouse.move(1, 1);
  await expect.poll(() => switchOn(switchTile)).toBe(false);
});

test('an animated figure plays by itself, and its pause button holds it where it is', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = sliderFigure(page);
  await stage.scrollIntoViewIfNeeded();
  // It moves on from its still, the value at 30, by itself.
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe('30');
  const pause = stage.getByRole('button', { name: /^Pause / });
  await pause.click();
  const held = await figureValue(page);
  await page.waitForTimeout(2500);
  expect(await figureValue(page)).toBe(held);
  // Played again, it goes on.
  await stage.getByRole('button', { name: /^Play / }).click();
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe(held);
});

test("the sidebar's pause pauses every animation and is kept, and a figure's own button overrides it", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = sliderFigure(page);
  await stage.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Pause animations' }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), displayStorageKeys.motion)).toBe(
    'paused',
  );
  const held = await figureValue(page);
  await page.waitForTimeout(2500);
  expect(await figureValue(page)).toBe(held);
  // The figure's own button plays it, though the sidebar's pauses the rest.
  await stage.getByRole('button', { name: /^Play / }).click();
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe(held);
  // A tile stays at its still under the pointer while the sidebar's pause holds.
  await page.goto(`${siteDevUrl}/components`);
  const switchTile = tile(page, 'Switch');
  await switchTile.scrollIntoViewIfNeeded();
  await expect(switchTile.locator('.catalogue-related-canvas[data-fitted]')).toBeVisible();
  await switchTile.hover();
  await page.waitForTimeout(1500);
  expect(await switchOn(switchTile)).toBe(false);
  await expect(page.getByRole('button', { name: 'Play animations' })).toBeVisible();
});

test('a reader who prefers reduced motion starts with every animation paused', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = sliderFigure(page);
  await stage.scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play animations' })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await figureValue(page)).toBe('30');
  await context.close();
});

test("the Toast tile's notices stack in place: the first glides from where it was, never past", async ({
  page,
}) => {
  // The tile draws the live region scaled and moved, so this is also the region's glide under a
  // transform: it measures layout pixels, not the drawn boxes, or the notice jumps and overshoots.
  await page.goto(`${siteDevUrl}/components`);
  const toastTile = tile(page, 'Toast');
  await toastTile.scrollIntoViewIfNeeded();
  await expect(
    toastTile.locator('.catalogue-related-canvas[data-fitted] .env-toast'),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await toastTile.hover();
  const { before, tops } = await toastTile.evaluate(
    (element) =>
      new Promise<{ before: number; tops: number[] }>((done) => {
        const first = element.querySelector('.env-toast:not([data-tone="success"])')!;
        // Measured on the canvas, so the view keeping the stack in the stage doesn't count.
        const canvas = element.querySelector('.catalogue-related-canvas')!;
        const at = () => first.getBoundingClientRect().top - canvas.getBoundingClientRect().top;
        const before = at();
        const tops: number[] = [];
        const sample = () => {
          if (element.querySelector('.env-toast[data-tone="success"]')) tops.push(at());
          if (tops.length < 40) requestAnimationFrame(sample);
          else done({ before, tops });
        };
        sample();
      }),
  );
  const end = tops.at(-1)!;
  expect(end).toBeLessThan(before - 5);
  expect(Math.abs(tops[0]! - before)).toBeLessThan(2);
  for (const top of tops) expect(top).toBeGreaterThanOrEqual(end - 0.5);
  for (const top of tops) expect(top).toBeLessThanOrEqual(before + 0.5);
});

/** An animated figure on a page, by the words its pause button's name starts with. */
const figure = (page: Page, words: string) =>
  page.locator('.catalogue-motion-stage', {
    has: page.getByRole('button', { name: new RegExp(`^Pause ${words}`) }),
  });

/** Whether a box lies inside another, to a pixel. */
const inside = (
  box: { x: number; y: number; width: number; height: number },
  frame: { x: number; y: number; width: number; height: number },
) =>
  box.x >= frame.x - 1 &&
  box.y >= frame.y - 1 &&
  box.x + box.width <= frame.x + frame.width + 1 &&
  box.y + box.height <= frame.y + frame.height + 1;

/** How far the page has scrolled: its main region scrolls, never the window. */
const pageScroll = (page: Page) => page.evaluate(() => document.querySelector('main')!.scrollTop);

test("a figure's dialog opens live inside its stage, its scrim over the stage alone", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/dialog`);
  const stage = figure(page, 'the dialog opening');
  await expect(page.locator('.site-loading')).toHaveCount(0);
  await stage.scrollIntoViewIfNeeded();
  const before = (await stage.boundingBox())!;
  const scrolled = await pageScroll(page);
  // The pointer no one sees presses View project, and the dialog opens in the stage.
  const dialog = stage.locator('.env-dialog-popup');
  await expect(dialog).toBeVisible({ timeout: 4000 });
  const frame = (await stage.boundingBox())!;
  expect(inside((await dialog.boundingBox())!, frame)).toBe(true);
  const scrim = (await stage.locator('.env-dialog-backdrop').boundingBox())!;
  expect(Math.abs(scrim.width - frame.width)).toBeLessThan(1.5);
  expect(Math.abs(scrim.height - frame.height)).toBeLessThan(1.5);
  // The figure keeps its height, the page its place, and the page stays in reach.
  expect(frame.height).toBe(before.height);
  expect(await pageScroll(page)).toBe(scrolled);
  await expect(page.locator('.site-contents')).not.toHaveAttribute('aria-hidden', 'true');
  // It closes again as the pointer presses Close.
  await expect(dialog).toHaveCount(0, { timeout: 5000 });
});

test("a figure's right click opens its context menu inside the stage, and the page stays", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/menu`);
  const stage = figure(page, 'the menu opening on a right click');
  await expect(page.locator('.site-loading')).toHaveCount(0);
  await stage.scrollIntoViewIfNeeded();
  const scrolled = await pageScroll(page);
  const menu = stage.locator('.env-menu');
  await expect(menu).toBeVisible({ timeout: 4000 });
  expect(inside((await menu.boundingBox())!, (await stage.boundingBox())!)).toBe(true);
  await expect(menu.locator('.env-menu-item', { hasText: 'Duplicate' })).toBeVisible();
  // A preview's context menu neither hides the page nor locks or moves its scroll.
  await expect(page.locator('.site-contents')).not.toHaveAttribute('aria-hidden', 'true');
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  expect(await pageScroll(page)).toBe(scrolled);
  await expect(menu).toHaveCount(0, { timeout: 4000 });
});

test("a figure's wheel scrolls the box under the pointer smoothly and back, never the page", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/table`);
  const stage = figure(page, 'the rows scrolling');
  // Every figure above has loaded, so the page holds still.
  await expect(page.locator('.site-loading')).toHaveCount(0);
  await stage.scrollIntoViewIfNeeded();
  const scrolled = await pageScroll(page);
  const samples = await stage.evaluate(
    (element) =>
      new Promise<{ top: number; header: number }[]>((done) => {
        const region = element.querySelector('.env-table-region')!;
        const header = element.querySelector('thead th')!;
        const found: { top: number; header: number }[] = [];
        const sample = () => {
          found.push({
            top: region.scrollTop,
            header: header.getBoundingClientRect().top - region.getBoundingClientRect().top,
          });
          if (found.length < 400) requestAnimationFrame(sample);
          else done(found);
        };
        sample();
      }),
  );
  const tops = samples.map((sample) => sample.top);
  const deepest = Math.max(...tops);
  // It scrolls down through the rows a little at a time, and back to the top.
  expect(deepest).toBeGreaterThan(200);
  const steps = tops.slice(1).map((top, index) => Math.abs(top - tops[index]!));
  expect(Math.max(...steps)).toBeLessThan(40);
  expect(tops.slice(tops.indexOf(deepest)).includes(0)).toBe(true);
  // The header stays at the region's top throughout, and the page doesn't move.
  expect(new Set(samples.map((sample) => Math.round(sample.header))).size).toBe(1);
  expect(await pageScroll(page)).toBe(scrolled);
});

/**
 * Runs `run` with a pointer no one sees over a box of the test's own, in a page of the site, so
 * the pointer's module is the site's. `run` is a function body that gets `box`, `pointer` and
 * `at(selector, x, y)`, a point of an element as fractions of its box.
 */
async function withPointer<T>(page: Page, html: string, run: string): Promise<T> {
  await page.goto(`${siteDevUrl}/components`);
  return page.evaluate(
    async ([html, run]) => {
      const module = '/src/previews/VirtualPointer.ts';
      const { VirtualPointer } = await import(/* @vite-ignore */ module);
      const box = document.createElement('div');
      box.setAttribute('inert', '');
      box.style.cssText = 'position: fixed; inset: 0 auto auto 0; width: 600px; z-index: 1000;';
      box.innerHTML = html;
      document.body.append(box);
      const pointer = new VirtualPointer(box);
      const at = (selector: string, x = 0.5, y = 0.5) => {
        const rect = box.querySelector(selector)!.getBoundingClientRect();
        return { x: rect.left + rect.width * x, y: rect.top + rect.height * y };
      };
      const body = new Function('box', 'pointer', 'at', `return (async () => {${run}})();`);
      return body(box, pointer, at);
    },
    [html, run] as const,
  ) as Promise<T>;
}

test('a script finds a word by its text, in a field and in content, wherever it wraps', async ({
  page,
}) => {
  const result = await withPointer<{ field: string; content: string; missing: boolean }>(
    page,
    '<textarea id="note" rows="3" style="width: 120px; font: 16px monospace; padding: 0; border: 0">Ask Sam Lee to review the copy.</textarea><p id="text" style="width: 120px; font: 16px monospace">See the launch plan first.</p>',
    `
      const module = '/src/previews/VirtualSelection.ts';
      const { textPoint } = await import(/* @vite-ignore */ module);
      const field = box.querySelector('#note');
      const text = box.querySelector('#text');
      // Drags from near the start of the text to near its end select it.
      const drag = (element, words) => {
        pointer.moveTo(textPoint(element, words, 0.1, 0.5));
        pointer.press();
        pointer.moveTo(textPoint(element, words, 0.9, 0.5));
        pointer.release();
      };
      drag(field, 'review the');
      const selected = field.value.slice(field.selectionStart, field.selectionEnd);
      drag(text, 'launch plan');
      const content = [...CSS.highlights.get('catalogue-selection')].map((range) => range.toString()).join('|');
      return { field: selected, content, missing: textPoint(text, 'agenda', 0.5, 0.5) === null };
    `,
  );
  expect(result).toEqual({ field: 'review the', content: 'launch plan', missing: true });
});

test('a right click asks for a context menu, clicks nothing, and holds the page while pressed', async ({
  page,
}) => {
  const result = await withPointer<{ events: string[]; locked: boolean; free: boolean }>(
    page,
    '<button id="target">Row</button>',
    `
      const events = [];
      const types = ['pointerdown', 'mousedown', 'contextmenu', 'pointerup', 'mouseup', 'click'];
      for (const type of types) box.addEventListener(type, (event) => events.push(type + ' ' + event.button));
      const other = new pointer.constructor(box);
      pointer.moveTo(at('#target'));
      pointer.press(2);
      const locked = !other.canPress;
      pointer.release();
      return { events, locked, free: other.canPress };
    `,
  );
  expect(result.events).toEqual([
    'pointerdown 2',
    'mousedown 2',
    'contextmenu 2',
    'pointerup 2',
    'mouseup 2',
  ]);
  expect(result.locked).toBe(true);
  expect(result.free).toBe(true);
});

test('a held key is on every event until it is let go, as Alt with a letter is', async ({
  page,
}) => {
  const events = await withPointer<string[]>(
    page,
    '<button id="target">File</button>',
    `
      const events = [];
      const note = (event) =>
        events.push([event.type, event.key ?? '', event.code ?? '', event.altKey].join(' '));
      const types = ['keydown', 'keyup', 'click'];
      for (const type of types) window.addEventListener(type, note, true);
      pointer.moveTo(at('#target'));
      pointer.keyDown('Alt');
      pointer.key('f');
      pointer.press();
      pointer.release();
      pointer.keyUp('Alt');
      pointer.key('f');
      pointer.keyDown('Shift');
      pointer.leave();
      for (const type of types) window.removeEventListener(type, note, true);
      return events;
    `,
  );
  expect(events).toEqual([
    'keydown Alt AltLeft true',
    'keydown f KeyF true',
    'keyup f KeyF true',
    'click   true',
    'keyup Alt AltLeft false',
    'keydown f KeyF false',
    'keyup f KeyF false',
    'keydown Shift ShiftLeft false',
    // Leaving lets every held key go.
    'keyup Shift ShiftLeft false',
  ]);
});

test('the wheel scrolls the box under the pointer, unless the element takes the turn', async ({
  page,
}) => {
  const result = await withPointer<{ wheeled: number; top: number; taken: number }>(
    page,
    '<div id="list" style="height: 100px; overflow: auto"><div style="height: 500px">Rows</div></div>',
    `
      const list = box.querySelector('#list');
      let wheeled = 0;
      list.addEventListener('wheel', (event) => (wheeled += event.deltaY));
      pointer.moveTo(at('#list'));
      pointer.startWheel('y');
      for (const distance of [20, 60, 120]) pointer.turnWheel(distance);
      pointer.endWheel();
      const top = list.scrollTop;
      const turned = wheeled;
      list.addEventListener('wheel', (event) => event.preventDefault());
      pointer.startWheel('y');
      pointer.turnWheel(-120);
      pointer.endWheel();
      return { wheeled: turned, top, taken: list.scrollTop };
    `,
  );
  expect(result.wheeled).toBe(120);
  expect(result.top).toBe(120);
  expect(result.taken).toBe(120);
});

test("a drag across text selects whole words, in a field and in content, and keeps the reader's own selection", async ({
  page,
}) => {
  const result = await withPointer<{
    field: number[];
    painted: string | null;
    typed: string;
    content: string;
    kept: boolean;
    cleared: number;
  }>(
    page,
    '<input id="name" value="Quarterly report draft" style="width: 400px; font: 16px monospace; padding: 0 4px; border: 0"><p id="text" style="font: 16px monospace; margin: 8px 0">Website refresh launch</p>',
    `
      const heading = document.querySelector('h1');
      const reader = document.createRange();
      reader.selectNodeContents(heading);
      getSelection().removeAllRanges();
      getSelection().addRange(reader);
      const readerText = getSelection().toString();
      const field = box.querySelector('#name');
      const text = box.querySelector('#text');
      const character = (() => {
        const canvas = document.createElement('canvas').getContext('2d');
        canvas.font = '16px monospace';
        return canvas.measureText('x').width;
      })();
      // From inside "report" to past the space after it, in the field: "report", without the space.
      const edge = field.getBoundingClientRect();
      const y = edge.top + edge.height / 2;
      pointer.moveTo({ x: edge.left + 4 + character * 11.6, y });
      pointer.press();
      pointer.moveTo({ x: edge.left + 4 + character * 13, y });
      pointer.moveTo({ x: edge.left + 4 + character * 16.8, y });
      pointer.release();
      const selected = [field.selectionStart, field.selectionEnd];
      const painted = document.querySelector('.catalogue-field-selection span')?.textContent ?? null;
      // Typing goes over the selection.
      for (const letter of 'summary') pointer.type('#name', letter);
      const typed = field.value;
      // From inside "refresh" to inside "launch", in content: both words whole.
      const line = text.getBoundingClientRect();
      const middle = line.top + line.height / 2;
      pointer.moveTo({ x: line.left + character * 9.6, y: middle });
      pointer.press();
      pointer.moveTo({ x: line.left + character * 15, y: middle });
      pointer.moveTo({ x: line.left + character * 19.4, y: middle });
      pointer.release();
      const highlight = CSS.highlights.get('catalogue-selection');
      const content = [...highlight].map((range) => range.toString()).join('|');
      const kept = getSelection().toString() === readerText;
      // A press elsewhere leaves nothing selected.
      pointer.moveTo({ x: line.left + 2, y: middle });
      pointer.press();
      pointer.release();
      return { field: selected, painted, typed, content, kept, cleared: highlight.size };
    `,
  );
  expect(result.field).toEqual([10, 16]);
  expect(result.painted).toBe('report');
  expect(result.typed).toBe('Quarterly summary draft');
  expect(result.content).toBe('refresh launch');
  expect(result.kept).toBe(true);
  expect(result.cleared).toBe(0);
});

test(
  "an animated figure's stage holds its own height: stages side by side don't hold each other up, and a stage in a column isn't measured at its content's width",
  { tag: '@engines' },
  async ({ page }) => {
    const heights = () =>
      page
        .locator('.catalogue-motion-stage')
        .evaluateAll((stages) =>
          stages.map((stage) => [
            Math.round(stage.getBoundingClientRect().height),
            Math.round(
              stage.querySelector('.catalogue-motion-subject')?.getBoundingClientRect().height ?? 0,
            ),
          ]),
        );
    // RelativeTime's overview: two stages in one row, wide enough to sit side by side, which used
    // to climb each other's height in Firefox, a little every frame.
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto(`${siteDevUrl}/components/relative-time`);
    await expect(page.locator('.catalogue-motion-stage').first()).toBeVisible();
    await page.waitForTimeout(1500);
    const before = await heights();
    await page.waitForTimeout(1500);
    expect(await heights()).toEqual(before);
    for (const [stage] of before) expect(stage).toBeLessThan(400);
    // Alert's figures sit in a column: each stage stays about as tall as what it shows.
    await page.goto(`${siteDevUrl}/components/alert`);
    await expect(page.locator('.catalogue-motion-stage').first()).toBeVisible();
    await page.waitForTimeout(2000);
    for (const [stage, subject] of await heights()) expect(stage).toBeLessThan(subject + 200);
  },
);
