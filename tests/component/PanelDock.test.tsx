import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, onTestFinished, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import { PanelDock, Theme } from '@envsemble/envui';
import * as fixture from '../fixture/PanelDock.fixture.tsx';
import {
  box,
  collectErrors,
  css,
  keyboard,
  mouse,
  nextFrames,
  passTime,
  stopTimers,
} from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** A length in pixels as a number of rem, to a hundredth, as the dock reports heights. */
const inRem = (pixels: number) => Math.round((pixels / 16) * 100) / 100;

const logOf =
  (theme = 'light') =>
  () =>
    page.getByTestId(`dock-log-${theme}`).element().textContent!.split('\n').filter(Boolean);
const lastLog =
  (theme = 'light') =>
  () =>
    logOf(theme)().at(-1);

/** Whether an element is in the page and shows, as Playwright's toBeVisible reads it. */
function visible(element: Element | null | undefined) {
  if (!element?.isConnected) return false;
  const { width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && getComputedStyle(element).visibility !== 'hidden';
}
const isVisible = (get: () => Element | null | undefined) =>
  expect.poll(() => visible(get())).toBe(true);
const isHidden = (get: () => Element | null | undefined) =>
  expect.poll(() => visible(get())).toBe(false);
const isGone = (get: () => Element | null | undefined) =>
  expect.poll(() => get()?.isConnected ?? false).toBe(false);
const attribute = (get: () => Element | null | undefined, name: string) => () =>
  get()?.getAttribute(name) ?? null;
const texts = (locator: Locator) => locator.elements().map((element) => element.textContent);
const holdsFocus = (get: () => Element | null | undefined) => () =>
  get()?.contains(document.activeElement) ?? false;
const focus = (target: Locator | Element) =>
  ((target instanceof Element ? target : target.element()) as HTMLElement).focus();
const button = (scope: Locator, name: string, exact = true) =>
  scope.getByRole('button', { name, exact });

/** The parts of the main dock of a theme. */
function dockOf(theme = 'light') {
  const region = page.getByTestId(`dock-region-${theme}`);
  const root = () => region.element() as HTMLElement;
  return {
    region,
    root,
    frame: () => page.getByTestId(`dock-frame-${theme}`).element() as HTMLElement,
    panel: (id: string) => root().querySelector<HTMLElement>(`section[data-panel-id="${id}"]`),
    within: (id: string) =>
      page.elementLocator(root().querySelector(`section[data-panel-id="${id}"]`)!),
    tabs: region.getByRole('list', { name: 'Hidden panels' }),
    row: () => root().querySelector<HTMLElement>(':scope > .env-panel-dock-row')!,
  };
}

/** The panels in a dock's row, in order. */
function rowOf(scope: Locator) {
  const row = () =>
    scope.element().querySelector<HTMLElement>('.env-panel-dock > .env-panel-dock-row')!;
  return {
    row,
    ids: () =>
      [...row().querySelectorAll<HTMLElement>(':scope > section[data-placement="row"]')].map(
        ({ dataset }) => dataset.panelId,
      ),
  };
}

/** Lets the dock measure itself and hear the application's answers for a few frames. */
async function frames(count = 3) {
  for (let left = count; left > 0; left--)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

/** Presses Tab until the target has focus, at most a few times. */
async function tabTo(target: Locator, presses = 4) {
  for (let count = 0; count < presses; count++) {
    await keyboard.press('Tab');
    if (target.element() === document.activeElement) return;
  }
  await expect.element(target).toHaveFocus();
}

const logText = (name: string) => () => page.getByTestId(`${name}-log-light`).element().textContent;
const dockScope = (name: string) => page.getByTestId(`${name}-dock-light`);
const section = (scope: Locator, id: string) => () =>
  scope.element().querySelector<HTMLElement>(`section[data-panel-id="${id}"]`);

describe('PanelDock', () => {
  beforeEach(async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    mount(fixture);
  });

  test('panels open side by side, minimize to tabs, maximize, restore and close', async () => {
    const errors = collectErrors();
    const dock = dockOf();
    const report = dock.region.getByRole('region', { name: 'Quarterly report' });
    const notes = dock.region.getByRole('region', { name: 'Meeting notes' });
    await expect.element(report).toHaveAttribute('data-panel-id', 'report');
    await expect.element(report).toHaveAttribute('data-mode', 'open');
    await expect.element(notes).toHaveAttribute('data-active', '');
    await expect.element(report).not.toHaveAttribute('data-active');
    // The active panel is in front.
    expect(css(notes, 'z-index')).toBe('2');
    expect(css(report, 'z-index')).toBe('1');

    // The dock fills its positioned frame; open panels sit side by side at its inline end, standing
    // on its bottom edge, and the strip of tabs floats over that edge, in front of them.
    const frameBox = box(dock.frame());
    const rootBox = box(dock.root());
    expect(rootBox.x).toBeCloseTo(frameBox.x + 1, 0);
    expect(rootBox.width).toBeCloseTo(frameBox.width - 2, 0);
    expect(rootBox.height).toBeCloseTo(frameBox.height - 2, 0);
    const reportBox = box(report);
    const notesBox = box(notes);
    const stripBox = box(dock.tabs);
    expect(notesBox.x - (reportBox.x + reportBox.width)).toBeCloseTo(8, 0);
    expect(rootBox.x + rootBox.width - (notesBox.x + notesBox.width)).toBeCloseTo(24, 0);
    expect(reportBox.y + reportBox.height).toBeCloseTo(rootBox.y + rootBox.height, 0);
    expect(notesBox.y + notesBox.height).toBeCloseTo(rootBox.y + rootBox.height, 0);
    expect(stripBox.y + stripBox.height).toBeCloseTo(rootBox.y + rootBox.height, 0);
    expect(stripBox.y).toBeLessThan(notesBox.y + notesBox.height);
    const tabBox = box(dock.tabs.getByRole('listitem').elements()[0]!);
    expect(tabBox.x).toBeGreaterThan(notesBox.x);
    expect(
      document
        .elementFromPoint(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2)
        ?.closest('.env-panel-dock-tab'),
    ).not.toBeNull();
    // The open panels' content keeps the tabs' height clear at its end, so it scrolls out from
    // beneath them, and focus does too.
    const stripHeight = (dock.tabs.element() as HTMLElement).offsetHeight;
    const notesContent = notes.element().querySelector('.env-panel-dock-content')!;
    expect(Number.parseFloat(css(notesContent, 'padding-block-end'))).toBeCloseTo(stripHeight, 0);
    expect(Number.parseFloat(css(notesContent, 'scroll-padding-block-end'))).toBeGreaterThan(
      stripHeight,
    );

    // A minimized panel is a tab with its label, an attention dot described for assistive
    // technology, a tooltip and a close button.
    expect(dock.tabs.getByRole('listitem').elements()).toHaveLength(1);
    const budget = button(dock.tabs, 'Show Budget');
    expect(budget.element().textContent).toBe('Budget');
    await expect.element(budget).toHaveAccessibleDescription('Unsaved changes');
    expect(
      dock.tabs
        .element()
        .querySelector('li[data-panel-id="budget"]')!
        .getAttribute('data-attention'),
    ).toBe('');
    expect(visible(button(dock.tabs, 'Close Budget').element())).toBe(true);
    await budget.hover();
    await expect
      .poll(() => document.querySelector('.env-tooltip')?.textContent)
      .toBe('Budget for the second half');
    await isHidden(() => dock.panel('budget'));
    expect(dock.panel('budget')!.inert).toBe(true);

    // The window controls minimize, maximize and close, with tooltips.
    await button(notes, 'Minimize').hover();
    await expect.poll(() => document.querySelector('.env-tooltip')?.textContent).toBe('Minimize');
    await button(notes, 'Minimize').click();
    await expect.poll(lastLog()).toBe('mode notes minimized');
    await isHidden(() => dock.panel('notes'));
    expect(dock.panel('notes')!.getAttribute('data-mode')).toBe('minimized');
    await expect
      .poll(() => texts(dock.tabs.getByRole('button')))
      .toEqual(['Meeting notes', '', 'Budget', '']);
    // The open panel left moves to the inline end, still standing on the bottom edge beneath the
    // new tab: a tab moves no open panel up.
    const alone = box(report);
    const region = box(dock.root());
    expect(region.x + region.width - (alone.x + alone.width)).toBeCloseTo(24, 0);
    expect(alone.y + alone.height).toBeCloseTo(region.y + region.height, 0);

    await button(report, 'Maximize').click();
    await expect.element(report).toHaveAttribute('data-mode', 'maximized');
    await expect.element(dock.region).toHaveAttribute('data-filled', '');
    const filled = box(report);
    const filledRegion = box(dock.root());
    expect(filled.x).toBeCloseTo(filledRegion.x, 0);
    expect(filled.y).toBeCloseTo(filledRegion.y, 0);
    expect(filled.width).toBeCloseTo(filledRegion.width, 0);
    expect(filled.y + filled.height).toBeCloseTo(box(dock.tabs).y, 0);
    // A maximized panel has no resize handle, and its toggle restores it.
    const resize = report.getByRole('separator', { name: 'Resize Quarterly report' });
    expect(resize.elements()).toHaveLength(0);
    await button(report, 'Restore').click();
    await expect.element(report).toHaveAttribute('data-mode', 'open');
    await expect.element(dock.region).not.toHaveAttribute('data-filled');
    await expect.poll(() => resize.elements().length).toBe(1);

    // A tab brings its panel back to the row and activates it.
    await button(dock.tabs, 'Show Meeting notes').click();
    await isVisible(() => notes.element());
    await expect.element(notes).toHaveAttribute('data-mode', 'open');
    await expect.poll(() => logOf()().slice(-2)).toEqual(['mode notes open', 'activate notes']);
    // Pressing inside a panel activates it.
    await report.getByText('Paragraph 1 of Quarterly report.').click();
    await expect.poll(lastLog()).toBe('activate report');
    await expect.element(report).toHaveAttribute('data-active', '');

    await button(notes, 'Close').click();
    await expect.poll(logOf()).toContain('close notes');
    await isGone(() => dock.panel('notes'));
    await button(dock.tabs, 'Close Budget').click();
    await expect.poll(logOf()).toContain('close budget');
    await expect.poll(() => dock.tabs.query()).toBeNull();
    await expect.element(dock.region).not.toHaveAttribute('data-tabs');

    // The page beneath stays usable around the panels.
    await page.getByRole('button', { name: 'Page action light' }).click();
    await expect.poll(lastLog()).toBe('page');
    expect(errors).toEqual([]);
  });

  test(
    'content keeps its draft, focus and scroll positions through modes and reorders',
    { tags: ['engines'] },
    async () => {
      const errors = collectErrors();
      const dock = dockOf();
      const report = dock.within('report');
      const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
      const draftField = () => draft.element() as HTMLInputElement;
      const content = () =>
        dock.panel('report')!.querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
      const list = () =>
        report.getByRole('list', { name: 'Sections of Quarterly report light' }).element();
      const mounts = () => page.getByTestId('dock-mounts-light').element().textContent;
      const scrolls = () => [content().scrollTop, list().scrollTop];
      expect(mounts()).toBe('report:1 notes:1 budget:1');
      await draft.fill('Unsent changes');
      // Focus inside a panel activates it.
      await expect.poll(attribute(() => dock.panel('report'), 'data-active')).toBe('');
      // Firefox scrolls the typed text into view a frame after it is typed: past that, the draft
      // may scroll out of view without the browser bringing it back.
      await nextFrames();
      content().scrollTop = 120;
      list().scrollTop = 60;

      // The application's shortcuts change the mode while focus stays in the draft.
      await keyboard.press('Alt+KeyX');
      await expect.poll(attribute(() => dock.panel('report'), 'data-mode')).toBe('maximized');
      await expect.element(draft).toHaveFocus();
      expect(draftField().value).toBe('Unsent changes');
      await expect.poll(scrolls).toEqual([120, 60]);
      await keyboard.press('Alt+KeyO');
      await expect.poll(attribute(() => dock.panel('report'), 'data-mode')).toBe('open');
      await expect.element(draft).toHaveFocus();
      await expect.poll(scrolls).toEqual([120, 60]);

      // Minimizing hands focus to the tab; the tab brings the panel back to the draft.
      await keyboard.press('Alt+KeyM');
      const tab = button(dock.tabs, 'Show Quarterly report');
      await expect.element(tab).toHaveFocus();
      await isHidden(() => dock.panel('report'));
      await keyboard.press('Enter');
      await isVisible(() => dock.panel('report'));
      await expect.element(draft).toHaveFocus();
      expect(draftField().value).toBe('Unsent changes');
      await expect.poll(scrolls).toEqual([120, 60]);

      // Focus in a menu the panel opened moves to the tab too when the panel is minimized; the
      // menu closes with Escape, and focus returns to the menu's trigger with the panel.
      const more = button(report, 'More actions for Quarterly report light');
      focus(more);
      await keyboard.press('Enter');
      await expect.element(page.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      await keyboard.press('Escape');
      await expect.poll(() => page.getByRole('menu').elements().length).toBe(0);
      await expect.element(tab).toHaveFocus();
      await keyboard.press('Enter');
      await isVisible(() => dock.panel('report'));
      await expect.element(more).toHaveFocus();
      focus(draft);

      // Reordering moves panels without losing focus, the draft or the scroll positions, also in
      // a panel without focus. The focused draft is in view, so the browser need not reveal it.
      const notesContent = dock
        .panel('notes')!
        .querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
      notesContent.scrollTop = 150;
      content().scrollTop = 0;
      const order = () =>
        [...dock.row().querySelectorAll<HTMLElement>(':scope > section')].map(
          (panel) => panel.dataset.panelId,
        );
      expect(order()).toEqual(['report', 'notes', 'budget']);
      await keyboard.press('Alt+KeyR');
      await expect.poll(order).toEqual(['budget', 'notes', 'report']);
      await expect.element(draft).toHaveFocus();
      await expect.poll(scrolls).toEqual([0, 60]);
      expect(notesContent.scrollTop).toBe(150);
      await keyboard.type(' and more');
      await expect.poll(() => draftField().value).toBe('Unsent changes and more');

      // Maximized and minimized from the window controls, it is the same content.
      await button(report, 'Maximize').click();
      await button(report, 'Minimize').click();
      await button(dock.tabs, 'Show Quarterly report').click();
      await expect.poll(attribute(() => dock.panel('report'), 'data-mode')).toBe('open');
      expect(draftField().value).toBe('Unsent changes and more');
      await expect.element(draft).toHaveFocus();
      expect(mounts()).toBe('report:1 notes:1 budget:1');
      expect(errors).toEqual([]);
    },
  );

  test(
    'the top edge resizes a panel with the pointer and the keyboard',
    { tags: ['engines'] },
    async () => {
      const dock = dockOf();
      const report = dock.within('report');
      const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
      const value = (name: string) => Number(handle.element().getAttribute(name));
      const valueIs = (expected: number | string) =>
        expect.poll(() => handle.element().getAttribute('aria-valuenow')).toBe(String(expected));
      await expect.element(handle).toHaveAttribute('aria-orientation', 'horizontal');
      await expect.element(handle).toHaveAttribute('tabindex', '0');
      await expect.element(handle).toHaveAttribute('aria-controls', report.element().id);
      // Without a height of its own, a panel takes 85% of the room in the dock.
      const room = value('aria-valuemax');
      const start = value('aria-valuenow');
      expect(start).toBe(Math.round(room * 0.85));
      expect(value('aria-valuemin')).toBe(240);
      // The height reads as a share of that room.
      await expect.element(handle).toHaveAttribute('aria-valuetext', '85%');
      expect(box(report).height).toBeCloseTo(start, 0);

      // Dragging reports the new height once, when the drag ends.
      const edge = box(handle);
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
      await mouse.down();
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2 + 100, { steps: 5 });
      await expect.element(report).toHaveAttribute('data-resizing', '');
      await expect.poll(() => Math.round(box(report).height)).toBe(start - 100);
      expect(lastLog()()).not.toMatch(/^height/);
      await mouse.up();
      await expect.element(report).not.toHaveAttribute('data-resizing');
      // It reports the height in rem.
      await expect.poll(lastLog()).toBe(`height report ${inRem(start - 100)}`);
      await valueIs(start - 100);

      // The arrow keys move by 16 px, 64 with Shift; Home and End reach the bounds.
      focus(handle);
      await keyboard.press('ArrowUp');
      await valueIs(start - 84);
      await keyboard.press('Shift+ArrowUp');
      await valueIs(start - 20);
      await keyboard.press('ArrowDown');
      await valueIs(start - 36);
      await expect.poll(lastLog()).toBe(`height report ${inRem(start - 36)}`);
      await keyboard.press('Home');
      await valueIs(240);
      await expect
        .element(handle)
        .toHaveAttribute('aria-valuetext', `${Math.round((240 / room) * 100)}%`);
      expect(box(report).height).toBeCloseTo(240, 0);
      await keyboard.press('End');
      await valueIs(room);
      expect(box(report).height).toBeCloseTo(room, 0);
      // Keys with Alt, Ctrl or ⌘ are the application's.
      await keyboard.press('Control+ArrowDown');
      await valueIs(room);

      // Dragging past a bound stops at it: at its maximum, any way up is past it. The pointer
      // stays near the edge, inside the test's frame, which a drag in Firefox can't leave while
      // other frames share the page.
      await nextFrames();
      const top = box(handle);
      await mouse.move(top.x + top.width / 2, top.y + top.height / 2, { steps: 2 });
      await mouse.down();
      await mouse.move(top.x + top.width / 2, Math.max(1, top.y - 40), { steps: 4 });
      await mouse.up();
      await valueIs(room);

      // A shorter region holds the panel within its room without changing the chosen height.
      const entries = logOf()().length;
      dock.frame().style.blockSize = '30rem';
      // The room is the dock's height, less the gutter: the tabs float over the panels' bottom.
      const shorter = dock.root().clientHeight - 24;
      expect(shorter).toBeLessThan(room);
      await expect.poll(() => value('aria-valuemax')).toBe(shorter);
      await valueIs(shorter);
      expect(box(report).height).toBeCloseTo(shorter, 0);
      expect(logOf()()).toHaveLength(entries);
      dock.frame().style.blockSize = '';
      await valueIs(room);

      // A panel's own bounds hold its height: its default 85% stops at its maxHeight.
      const notesHandle = dock
        .within('notes')
        .getByRole('separator', { name: 'Resize Meeting notes' });
      await expect.element(notesHandle).toHaveAttribute('aria-valuemin', '200');
      await expect.element(notesHandle).toHaveAttribute('aria-valuemax', '400');
      await expect.element(notesHandle).toHaveAttribute('aria-valuenow', '400');
      focus(notesHandle);
      await keyboard.press('Home');
      await expect.element(notesHandle).toHaveAttribute('aria-valuenow', '200');
      expect(box(dock.panel('notes')!).height).toBeCloseTo(200, 0);
    },
  );

  test('open panels share the row down to their minimum width, then the row scrolls', async () => {
    const dock = dockOf();
    const report = () => dock.panel('report')!;
    const notes = () => dock.panel('notes')!;
    // With room, open panels take their preferred width: 32 rem, or the panel's own.
    dock.frame().style.inlineSize = '1100px';
    await expect.poll(() => Math.round(box(report()).width)).toBe(512);
    expect(Math.round(box(notes()).width)).toBe(448);
    expect(dock.row().hasAttribute('data-overflowing')).toBe(false);
    expect(css(dock.row(), 'pointer-events')).toBe('none');
    // Short of room, they shrink in proportion to their preferred widths.
    dock.frame().style.inlineSize = '700px';
    const shortfall = 512 + 448 - (700 - 2 - 48 - 8);
    await expect.poll(() => box(report()).width).toBeCloseTo(512 - (shortfall * 512) / 960, 0);
    expect(box(notes()).width).toBeCloseTo(448 - (shortfall * 448) / 960, 0);

    // Past their minimum widths, 20 rem or the panel's own, the row scrolls sideways and keeps
    // the newest panel in view.
    await page.getByRole('button', { name: 'Open document light' }).click();
    const newest = dock.region.getByRole('region', { name: 'Roadmap 1' });
    await isVisible(() => newest.query());
    await expect.poll(() => dock.row().getAttribute('data-overflowing')).toBe('');
    for (const [panel, width] of [
      [report(), 320],
      [notes(), 288],
      [newest.element(), 320],
    ] as const)
      expect(Math.round(box(panel).width)).toBe(width);
    const rootBox = box(dock.root());
    const newestBox = box(newest);
    expect(newestBox.x + newestBox.width).toBeCloseTo(rootBox.x + rootBox.width - 24, 0);
    expect(box(report()).x).toBeLessThan(rootBox.x);
    // An overflowing row takes the pointer, so its scrollbar works; otherwise presses pass through.
    expect(css(dock.row(), 'pointer-events')).toBe('auto');
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.region.getByRole('region', { name: 'Release checklist 2' });
    const latestEnd = () => {
      const region = box(dock.root());
      const latestBox = box(latest);
      return Math.round(latestBox.x + latestBox.width - (region.x + region.width - 24));
    };
    await expect.poll(latestEnd).toBe(0);
    // The newest panel stays in view as the region narrows further.
    dock.frame().style.inlineSize = '660px';
    await expect.poll(latestEnd).toBe(0);
    // Focus in a panel out of view scrolls the row to it; the page itself never scrolls sideways.
    focus(button(dock.within('report'), 'Edit Quarterly report light'));
    await expect
      .poll(() => box(button(dock.within('report'), 'Minimize')).x)
      .toBeGreaterThan(rootBox.x);
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
  });

  test('a narrow dock shows one panel at a time across the region', async () => {
    const errors = collectErrors();
    const dock = dockOf();
    const report = () => dock.panel('report');
    const notes = () => dock.panel('notes');
    expect(dock.root().hasAttribute('data-stacked')).toBe(false);
    dock.frame().style.inlineSize = '24rem';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBe('');
    await expect.poll(logOf()).toEqual(['stacked true']);
    // The active panel fills the region above the tabs; the other open panel waits as a tab.
    const rootBox = box(dock.root());
    const sheet = box(notes()!);
    expect(sheet.x).toBeCloseTo(rootBox.x, 0);
    expect(sheet.y).toBeCloseTo(rootBox.y, 0);
    expect(sheet.width).toBeCloseTo(rootBox.width, 0);
    expect(sheet.y + sheet.height).toBeCloseTo(box(dock.tabs).y, 0);
    await isHidden(report);
    expect(report()!.getAttribute('data-mode')).toBe('open');
    expect(texts(dock.tabs.getByRole('button', { name: /^Show/ }))).toEqual([
      'Quarterly report',
      'Budget',
    ]);
    // A sheet already fills the region: no Maximize, and no resize handle.
    const notesPanel = dock.within('notes');
    expect(notesPanel.getByRole('button', { name: 'Maximize' }).elements()).toHaveLength(0);
    expect(visible(button(notesPanel, 'Minimize').element())).toBe(true);
    expect(
      notesPanel.getByRole('separator', { name: /^Resize Meeting notes/ }).elements(),
    ).toHaveLength(0);
    // While a panel covers the region, the page beneath takes no presses.
    const action = box(page.getByRole('button', { name: 'Page action light' }));
    expect(
      document
        .elementFromPoint(action.x + action.width / 2, action.y + action.height / 2)
        ?.closest('.env-panel-dock'),
    ).not.toBeNull();

    // Another panel's tab brings it across the region and focus into it.
    await button(dock.tabs, 'Show Quarterly report').click();
    await isVisible(report);
    await isHidden(notes);
    await expect.poll(lastLog()).toBe('activate report');
    await expect.poll(holdsFocus(report)).toBe(true);
    // Minimizing the shown panel shows the one before it.
    await button(dock.within('report'), 'Minimize').click();
    await isVisible(notes);
    await expect.element(button(dock.tabs, 'Show Quarterly report')).toHaveFocus();

    // A newly opened panel takes the region; tabs that overflow their strip scroll sideways with a
    // vertical wheel.
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    await isVisible(() => dock.region.getByRole('region', { name: 'Release checklist 2' }).query());
    const strip = () => dock.tabs.element();
    await expect.poll(() => strip().scrollWidth > strip().clientWidth).toBe(true);
    const tab = box(dock.tabs.getByRole('listitem').elements()[0]!);
    await mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await mouse.wheel(0, 120);
    await expect.poll(() => strip().scrollLeft).toBeGreaterThan(0);
    await button(dock.tabs, 'Close Roadmap 1').click();
    await button(dock.region.getByRole('region', { name: 'Release checklist 2' }), 'Close').click();
    await isVisible(notes);

    // Wide again, open panels sit side by side.
    dock.frame().style.inlineSize = '';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBeNull();
    await expect.poll(lastLog()).toBe('stacked false');
    await isVisible(notes);
    expect(visible(button(dock.within('notes'), 'Maximize').element())).toBe(true);

    // A phone stacks the dock without overflowing the page.
    await page.viewport(360, 740);
    await expect.poll(attribute(dock.root, 'data-stacked')).toBe('');
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
    expect(errors).toEqual([]);
  });

  test('the keyboard alone reaches, minimizes, restores and closes panels', async () => {
    await commands.emulateMedia({ reducedMotion: null });
    const errors = collectErrors();
    const dock = dockOf();
    const report = dock.within('report');
    focus(page.getByRole('button', { name: 'Page action light' }));
    // Each panel's resize handle comes first, then its header: the application's actions and the
    // window controls, then its content.
    const minimize = button(report, 'Minimize');
    await tabTo(report.getByRole('separator', { name: 'Resize Quarterly report' }), 1);
    await tabTo(button(report, 'Edit Quarterly report light'), 1);
    await tabTo(button(report, 'More actions for Quarterly report light'), 1);
    await tabTo(minimize, 1);
    expect(css(minimize, 'outline-style')).toBe('solid');
    await tabTo(button(report, 'Maximize'), 1);
    await tabTo(button(report, 'Close'), 1);
    await tabTo(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }), 2);

    // Enter on Minimize hands focus to the tab; Enter there brings the panel back.
    await keyboard.press('Shift+Tab');
    await expect.element(button(report, 'Close')).toHaveFocus();
    await keyboard.press('Shift+Tab');
    await keyboard.press('Shift+Tab');
    await expect.element(minimize).toHaveFocus();
    await keyboard.press('Enter');
    const tab = button(dock.tabs, 'Show Quarterly report');
    await expect.element(tab).toHaveFocus();
    expect(css(tab, 'outline-style')).toBe('solid');
    // The tab's close button follows it.
    await keyboard.press('Tab');
    await expect.element(button(dock.tabs, 'Close Quarterly report')).toHaveFocus();
    await keyboard.press('Shift+Tab');
    await keyboard.press('Space');
    await isVisible(() => dock.panel('report'));
    // Focus returns to the content that last had it, not to the control that minimized it.
    await expect
      .element(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }))
      .toHaveFocus();

    // Closing a tab moves focus to the tab in its place.
    focus(button(dock.tabs, 'Close Budget'));
    await keyboard.press('Enter');
    await expect.poll(lastLog()).toBe('close budget');
    await expect.poll(() => dock.tabs.query()).toBeNull();
    // Closing the focused panel moves focus to the panel that remains, which becomes active.
    focus(button(report, 'Close'));
    await keyboard.press('Enter');
    await expect.poll(() => logOf()().slice(-2)).toEqual(['close report', 'activate notes']);
    await expect.poll(holdsFocus(() => dock.panel('notes'))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('a right-to-left dock mirrors to its inline end', async () => {
    const dock = dockOf();
    dock.frame().setAttribute('dir', 'rtl');
    const rootBox = box(dock.root());
    const report = box(dock.panel('report')!);
    const notes = box(dock.panel('notes')!);
    const tab = box(dock.tabs.getByRole('listitem'));
    expect(notes.x + notes.width).toBeLessThanOrEqual(report.x);
    expect(notes.x - rootBox.x).toBeCloseTo(24, 0);
    expect(tab.x - rootBox.x).toBeCloseTo(24, 0);
    // The header's title keeps the wider padding at its start, on the right.
    const header = dock.panel('report')!.querySelector('.env-panel-dock-header')!;
    expect(css(header, 'padding-right')).toBe('24px');
    expect(css(header, 'padding-left')).toBe('12px');
    // An overflowing row keeps the newest panel in view at the inline end, on the left.
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.region.getByRole('region', { name: 'Release checklist 2' });
    await expect.poll(() => dock.row().getAttribute('data-overflowing')).toBe('');
    await expect.poll(() => Math.round(box(latest).x - rootBox.x)).toBe(24);
    // Resizing is unchanged: up still grows the panel.
    const handle = dock
      .within('report')
      .getByRole('separator', { name: 'Resize Quarterly report' });
    const height = Number(handle.element().getAttribute('aria-valuenow'));
    focus(handle);
    await keyboard.press('ArrowDown');
    await expect.element(handle).toHaveAttribute('aria-valuenow', String(height - 16));
  });

  test('coarse pointers get a taller resize band, touch-sized tabs and controls', async () => {
    // A touch screen is a coarse pointer in every engine.
    await commands.emulateTouch(true);
    try {
      await page.viewport(1024, 900);
      mount(fixture);
      expect(matchMedia('(pointer: coarse)').matches).toBe(true);
      const dock = dockOf();
      const report = dock.within('report');
      const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
      await expect.poll(() => css(handle, 'height')).toBe('24px');
      expect(css(handle, 'opacity', '::after')).toBe('1');
      // The header's small controls grow to the touch height, as every button does, so a press on
      // one never reaches the next.
      const minimize = button(report, 'Minimize');
      expect(css(minimize, 'height')).toBe('44px');
      expect(css(minimize, 'width')).toBe('44px');
      // A tab holds its buttons at the touch height inside its top hairline.
      expect(css(dock.tabs.getByRole('listitem'), 'height')).toBe('45px');
      for (const name of ['Show Budget', 'Close Budget'])
        await expect.poll(() => box(button(dock.tabs, name)).height).toBe(44);
      expect(css(button(dock.tabs, 'Close Budget'), 'width')).toBe('44px');
    } finally {
      await commands.emulateTouch(false);
    }
  });

  test('a drag ends when the application maximizes its panel or the dock stacks meanwhile', async () => {
    const dock = dockOf();
    const report = dock.within('report');
    const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
    const content = () =>
      dock.panel('report')!.querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
    const start = Number(handle.element().getAttribute('aria-valuenow'));
    const dragDown = async () => {
      const edge = box(handle);
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
      await mouse.down();
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2 + 60, { steps: 3 });
      await expect.element(report).toHaveAttribute('data-resizing', '');
    };

    // The application's shortcut maximizes the panel while its edge is held; focus stays in the
    // draft, as a drag leaves focus where it is.
    focus(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }));
    await dragDown();
    await keyboard.press('Alt+KeyX');
    await expect.element(report).toHaveAttribute('data-mode', 'maximized');
    await expect.element(report).not.toHaveAttribute('data-resizing');
    await expect.poll(() => css(content(), 'pointer-events')).toBe('auto');
    await mouse.up();
    await keyboard.press('Alt+KeyO');
    await expect.element(report).toHaveAttribute('data-mode', 'open');
    // The drag ended without a height, as a cancelled one does.
    await expect.poll(() => Number(handle.element().getAttribute('aria-valuenow'))).toBe(start);
    expect(box(report).height).toBeCloseTo(start, 0);

    // The dock stacks while the edge is held.
    await dragDown();
    dock.frame().style.inlineSize = '24rem';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBe('');
    await expect.element(report).not.toHaveAttribute('data-resizing');
    await expect.poll(() => css(content(), 'pointer-events')).toBe('auto');
    await mouse.up();
    dock.frame().style.inlineSize = '';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBeNull();
    await expect.poll(() => Number(handle.element().getAttribute('aria-valuenow'))).toBe(start);
    expect(logOf()().filter((entry) => entry.startsWith('height'))).toEqual([]);
  });

  test('focus stays where it was when the application hides a panel, and in a panel whose focused edge or Maximize control goes', async () => {
    const dock = dockOf();
    const report = dock.within('report');
    const panel = () => dock.panel('report');
    // A button that removes itself as it is pressed leaves focus nowhere, without a blur.
    await button(report, 'Dismiss tip of Quarterly report light').click();
    await expect.poll(attribute(panel, 'data-active')).toBe('');
    const action = page.getByRole('button', { name: 'Page action light' });
    focus(action);
    await keyboard.press('Alt+KeyM');
    await expect.poll(attribute(panel, 'data-mode')).toBe('minimized');
    await expect.element(action).toHaveFocus();
    // Focus in the panel still moves to its tab.
    await button(dock.tabs, 'Show Quarterly report').click();
    focus(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }));
    await keyboard.press('Alt+KeyM');
    await expect.element(button(dock.tabs, 'Show Quarterly report')).toHaveFocus();
    await keyboard.press('Enter');
    await expect.poll(attribute(panel, 'data-mode')).toBe('open');

    // A maximized panel has no resize handle.
    focus(report.getByRole('separator', { name: 'Resize Quarterly report' }));
    await keyboard.press('Alt+KeyX');
    await expect.poll(attribute(panel, 'data-mode')).toBe('maximized');
    await expect.poll(holdsFocus(panel)).toBe(true);
    await keyboard.press('Alt+KeyO');
    await expect.poll(attribute(panel, 'data-mode')).toBe('open');

    // A stacked dock leaves out Maximize.
    const maximize = button(report, 'Maximize');
    focus(maximize);
    dock.frame().style.inlineSize = '24rem';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBe('');
    await expect.poll(() => maximize.elements().length).toBe(0);
    await isVisible(panel);
    await expect.poll(holdsFocus(panel)).toBe(true);
  });

  test(
    'a panel brought back, or a control that takes focus beneath the sticky header, shows the element its focus goes to',
    { tags: ['engines'] },
    async () => {
      const dock = dockOf();
      const report = dock.within('report');
      const panel = () => dock.panel('report')!;
      const content = () => panel().querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
      const header = () => panel().querySelector('.env-panel-dock-header')!;
      const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
      const tab = button(dock.tabs, 'Show Quarterly report');
      const bringBack = async (target: Locator) => {
        await keyboard.press('Alt+KeyM');
        await expect.element(tab).toHaveFocus();
        await keyboard.press('Enter');
        await expect.element(target).toHaveFocus();
      };

      // A control that takes focus beneath the sticky header comes out below it: the content
      // scrolls until the tip lies entirely beneath the header.
      const tip = button(report, 'Dismiss tip of Quarterly report light');
      const tipTop = box(tip).y;
      const headerBox = box(header());
      content().scrollTop += tipTop - (headerBox.y + (headerBox.height - box(tip).height) / 2);
      const [headerBefore, tipBefore] = [box(header()), box(tip)];
      expect(tipBefore.y).toBeGreaterThanOrEqual(headerBefore.y);
      expect(tipBefore.y + tipBefore.height).toBeLessThanOrEqual(
        headerBefore.y + headerBefore.height,
      );
      focus(tip);
      await expect
        .poll(() => box(tip).y - (box(header()).y + box(header()).height))
        .toBeGreaterThanOrEqual(0);

      // The content scrolls on, leaving the focused draft out of sight; brought back, the draft
      // shows, and where it then shows in the window, the page stays.
      focus(draft);
      content().scrollTop = content().scrollHeight;
      const pageTop = scrollY;
      await bringBack(draft);
      expect(scrollY).toBe(pageTop);
      const [contentBox, draftBox] = [box(content()), box(draft)];
      expect(draftBox.y + draftBox.height).toBeGreaterThan(box(header()).y + box(header()).height);
      expect(draftBox.y).toBeLessThan(contentBox.y + contentBox.height);
      // Where some of it shows, the scroll position people left stays.
      content().scrollTop = 100;
      await bringBack(draft);
      expect(content().scrollTop).toBe(100);

      // Inside a list that scrolls, the list scrolls back to the element; the content around it
      // stays where it was.
      const chat = report.getByRole('list', { name: 'Chat about Quarterly report light' });
      const quote = button(chat, 'Quote message 1 of Quarterly report light');
      focus(quote);
      chat.element().scrollTop = chat.element().scrollHeight;
      const contentTop = content().scrollTop;
      await bringBack(quote);
      const [chatBox, quoteBox] = [box(chat), box(quote)];
      expect(quoteBox.y).toBeGreaterThanOrEqual(chatBox.y - 1);
      expect(quoteBox.y + quoteBox.height).toBeLessThanOrEqual(chatBox.y + chatBox.height + 1);
      expect(content().scrollTop).toBe(contentTop);

      // Beside the view, in a row that scrolls sideways, the row scrolls back to it.
      const tags = report.getByRole('group', { name: 'Tags of Quarterly report light' });
      const first = button(tags, 'Finance tag of Quarterly report light');
      focus(first);
      tags.element().scrollLeft = tags.element().scrollWidth;
      await bringBack(first);
      const [tagsBox, firstBox] = [box(tags), box(first)];
      expect(firstBox.x).toBeGreaterThanOrEqual(tagsBox.x - 1);
      expect(firstBox.x + firstBox.width).toBeLessThanOrEqual(tagsBox.x + tagsBox.width + 1);
    },
  );

  test(
    'focus scrolls the page only where the window leaves the element out: a panel brought back, and a tab',
    { tags: ['engines'] },
    async () => {
      const dock = dockOf();

      const content = () =>
        dock.panel('report')!.querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
      const draft = dock.region.getByRole('textbox', { name: 'Draft of Quarterly report light' });
      const tab = button(dock.tabs, 'Show Quarterly report');

      // Some of the tab shows in the window, so the page stays as the panel minimizes.
      focus(draft);
      const pageTop = scrollY;
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      expect(scrollY).toBe(pageTop);
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();
      // Out of the window entirely, the tab comes into view at its bottom edge.
      await page.viewport(1280, 560);
      scrollTo(0, 0);
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      const tabBox = box(tab);
      expect(Math.abs(tabBox.y + tabBox.height - 560)).toBeLessThan(2);
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();

      // A panel brought back scrolls the page only to an element its focus returns to outside
      // the window.
      await page.viewport(1440, 300);
      mount(fixture);
      focus(draft);
      content().scrollTop = content().scrollHeight;
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      // The window shows only the bottom of the dock, below where the draft comes back.
      scrollTo(0, dock.frame().getBoundingClientRect().bottom + scrollY - innerHeight);
      const shortTop = scrollY;
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();
      // The content scrolls to the draft, and the page as little as shows it: the part of the
      // draft below the sticky header comes out at the window's top. WebKit may already have
      // scrolled the hidden content to the draft's caret, which leaves the field's top edge
      // beneath the header.
      await expect.poll(() => content().scrollTop).toBeLessThan(200);
      expect(scrollY).toBeLessThan(shortTop);
      const shownTop = Math.max(
        box(draft).y,
        box(content()).y + (Number.parseFloat(css(content(), 'scroll-padding-top')) || 0),
      );
      expect(Math.abs(shownTop)).toBeLessThan(2);
    },
  );

  test('open panels leave the controls of a maximized one in view after the dock stacks and widens', async () => {
    const dock = dockOf();
    const report = dock.within('report');
    const notes = dock.within('notes');
    // The room of an open panel is the dock's height below the row's padding; the tabs float over
    // it.
    const room = () =>
      String(
        Math.floor(dock.root().clientHeight - Number.parseFloat(css(dock.row(), 'padding-top'))),
      );
    const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
    await button(notes, 'Maximize').click();
    await expect.element(notes).toHaveAttribute('data-mode', 'maximized');
    await expect.poll(() => handle.element().getAttribute('aria-valuemax')).toBe(room());
    dock.frame().style.inlineSize = '24rem';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBe('');
    dock.frame().style.inlineSize = '';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBeNull();
    await expect.poll(() => handle.element().getAttribute('aria-valuemax')).toBe(room());
    const [panel, minimize] = [box(report), box(button(notes, 'Minimize'))];
    expect(panel.y).toBeGreaterThanOrEqual(minimize.y + minimize.height);
  });

  test('content that scrolls itself as panels reorder keeps its own scroll position, at its end or back at its start', async () => {
    const report = () => dockOf().within('report');
    const chat = () =>
      report().getByRole('list', { name: 'Chat about Quarterly report light' }).element();
    const list = () =>
      report().getByRole('list', { name: 'Sections of Quarterly report light' }).element();
    const draft = page
      .getByTestId('dock-region-light')
      .getByRole('textbox', { name: 'Draft of Quarterly report light' });
    const atNewest = () => chat().scrollHeight - chat().clientHeight - chat().scrollTop;
    await expect.poll(atNewest).toBeLessThanOrEqual(1);
    list().scrollTop = 60;
    // The application reorders the panels and adds a message in the same update; the chat
    // scrolls to the new message, and the dock puts back only the positions the move lost.
    focus(draft);
    await keyboard.press('Alt+KeyN');
    await expect.poll(() => chat().querySelectorAll('li')).toHaveLength(9);
    await expect.poll(atNewest).toBeLessThanOrEqual(1);
    expect(list().scrollTop).toBe(60);
    // Afresh, the application reorders the panels and rewinds the chat in the same update: the
    // chat stays at its start, which the dock does not take for a position the move lost.
    mount(fixture);
    await expect.poll(() => chat().scrollTop).toBeGreaterThan(0);
    list().scrollTop = 60;
    focus(draft);
    await keyboard.press('Alt+KeyT');
    await expect
      .poll(() => dockOf().row().querySelector<HTMLElement>(':scope > section')?.dataset.panelId)
      .toBe('budget');
    expect(chat().scrollTop).toBe(0);
    expect(list().scrollTop).toBe(60);
  });

  test('the default surface, not a line, sets the header apart once the content scrolls beneath it, also where a form holds the header', async () => {
    await commands.emulateMedia({ reducedMotion: null });
    for (const theme of ['light', 'dark']) {
      const panel = dockOf(theme).panel('report')!;
      const content = panel.querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
      const header = panel.querySelector('.env-panel-dock-header')!;
      const [panelColor, scrolled] = [
        'var(--env-color-bg-raised)',
        'var(--env-color-bg-default)',
      ].map((value) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = value;
        panel.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      });
      expect(scrolled).not.toBe(panelColor);
      expect(css(header, 'background-color')).toBe(panelColor);
      content.scrollTop = 40;
      await expect.poll(() => css(header, 'background-color'), { message: theme }).toBe(scrolled);
      expect(css(header, 'box-shadow')).toBe('none');
      expect(css(header, 'border-bottom-width')).toBe('0px');
      content.scrollTop = 0;
      await expect.poll(() => css(header, 'background-color')).toBe(panelColor);
    }
    // The fill fades in, and with reduced motion appears at once.
    const header = dockOf().panel('report')!.querySelector('.env-panel-dock-header')!;
    expect(css(header, 'transition-duration')).toBe('0.12s');
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => css(header, 'transition-duration')).toBe('0s');

    // The scrolled fill sets apart a header that a form in the content holds, which still sticks
    // to the top of the content.
    const first = page
      .getByTestId('passive-dock-light')
      .element()
      .querySelector('section[data-panel-id="first"]')!;
    const content = first.querySelector<HTMLElement>(':scope > .env-panel-dock-content')!;
    const formHeader = content.querySelector(':scope > form > .env-panel-dock-header')!;
    const resting = css(formHeader, 'background-color');
    content.scrollTop = 40;
    await expect.poll(() => formHeader.hasAttribute('data-scrolled')).toBe(true);
    await expect.poll(() => css(formHeader, 'background-color')).not.toBe(resting);
    expect(Math.abs(box(formHeader).y - box(content).y)).toBeLessThan(1);
    content.scrollTop = 0;
    await expect.poll(() => css(formHeader, 'background-color')).toBe(resting);
  });

  test('a stacked dock shows the panel of a tab pressed, also without onActivate', async () => {
    const passive = page.getByTestId('passive-dock-light');
    const first = section(passive, 'first');
    const second = section(passive, 'second');
    expect(passive.element().querySelector('.env-panel-dock')!.getAttribute('data-stacked')).toBe(
      '',
    );
    // The active panel shows first; the application never activates another.
    await isVisible(first);
    await isHidden(second);
    await button(passive, 'Show Second note light').click();
    await isVisible(second);
    await isHidden(first);
    await expect.poll(holdsFocus(second)).toBe(true);
    await button(passive, 'Show First note light').click();
    await isVisible(first);
    await isHidden(second);
    // A panel that opens shows in place of the panel a tab showed, also beside an active one.
    await button(passive, 'Show Second note light').click();
    await isVisible(second);
    await page.getByRole('button', { name: 'Add note light' }).click();
    await isVisible(section(passive, 'third'));
    await isHidden(second);
    await isHidden(first);
  });

  test('a panel that opens fills a stacked dock, also after a tab showed another', async () => {
    const loose = page.getByTestId('loose-dock-light');
    const panel = (id: string) => section(loose, id);
    expect(loose.element().querySelector('.env-panel-dock')!.getAttribute('data-stacked')).toBe('');
    // Without an active panel, the newest fills the dock; a tab shows its own panel instead.
    await isVisible(panel('why'));
    await button(loose, 'Show Ex light').click();
    await isVisible(panel('ex'));
    await isHidden(panel('why'));
    // A panel that opens afterwards fills the dock.
    await page.getByRole('button', { name: 'Open note light' }).click();
    await isVisible(panel('zed-2'));
    expect(panel('zed-2')()!.hasAttribute('inert')).toBe(false);
    await isHidden(panel('ex'));
    expect(visible(button(loose, 'Show Ex light').element())).toBe(true);

    // A tab pressed while panels sit side by side leaves the newest to fill the dock once it
    // stacks: Ex comes back from its tab, then people work in Why.
    loose.element().style.inlineSize = '60rem';
    const dock = () => loose.element().querySelector('.env-panel-dock')!;
    await expect.poll(attribute(dock, 'data-stacked')).toBeNull();
    await button(page.elementLocator(panel('ex')()!), 'Minimize').click();
    await button(loose, 'Show Ex light').click();
    await expect.poll(attribute(panel('ex'), 'data-placement')).toBe('row');
    await page
      .elementLocator(panel('why')()!)
      .getByRole('textbox', { name: 'Words of Why light' })
      .click();
    loose.element().style.inlineSize = '';
    await expect.poll(attribute(dock, 'data-stacked')).toBe('');
    await isVisible(panel('why'));
    await isHidden(panel('ex'));
  });

  test('a dock that minimizes rather than scrolls asks for its least recently active panel, brings back what it minimized as the region widens, and never alternates', async () => {
    const errors = collectErrors();
    const scope = dockScope('minimizing');
    const log = logText('minimizing');
    const { row, ids } = rowOf(scope);
    const minimize = (id: string) =>
      button(page.elementLocator(section(scope, id)()!), 'Minimize').click();
    // Three panels do not fit side by side at their minimum widths: the least recently active one
    // that is not active waits as a tab, and the others share the row without scrolling it.
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect.poll(log).toBe('plan minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    expect(visible(button(scope, 'Show Plan light').element())).toBe(true);
    // Brought back, that panel is active, and the next least recently active one makes room.
    await button(scope, 'Show Plan light').click();
    await expect.poll(ids).toEqual(['plan', 'retro']);
    await expect.poll(log).toBe('plan minimized,plan open,review minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    // With room for all three, the dock brings back the panel it minimized.
    scope.element().style.inlineSize = '80rem';
    await expect.poll(ids).toEqual(['plan', 'review', 'retro']);
    await expect.poll(log).toBe('plan minimized,plan open,review minimized,review open');

    // Afresh: room that people free does not bring the panel back.
    mount(fixture);
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect.poll(log).toBe('plan minimized');
    await minimize('review');
    await expect.poll(ids).toEqual(['retro']);
    await frames();
    expect(log()).toBe('plan minimized,review minimized');
    // A wider region does, while the panel people minimized stays a tab, also where it would fit.
    scope.element().style.inlineSize = '80rem';
    await expect.poll(ids).toEqual(['plan', 'retro']);
    await frames();
    expect(log()).toBe('plan minimized,review minimized,plan open');
    // Narrowed again, the least recently active panel makes room once more.
    await button(scope, 'Show Review light').click();
    await expect.poll(ids).toEqual(['plan', 'review', 'retro']);
    scope.element().style.inlineSize = '';
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect
      .poll(log)
      .toBe('plan minimized,review minimized,plan open,review open,plan minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);

    // Open panels take 420 px at the least, minimized ones less: the panel minimized to make room
    // stays a tab, as it would not fit at its width while open. Only a region wide enough for it
    // brings it back.
    const wider = dockScope('wider');
    const widerIds = rowOf(wider).ids;
    await expect.poll(widerIds).toEqual(['p1']);
    await frames();
    expect(logText('wider')()).toBe('p0 minimized');
    expect(visible(button(wider, 'Show P0').element())).toBe(true);
    wider.element().style.inlineSize = '60rem';
    await expect.poll(widerIds).toEqual(['p0', 'p1']);
    await frames();
    expect(logText('wider')()).toBe('p0 minimized,p0 open');
    expect(errors).toEqual([]);
  });

  test('a dock that minimizes asks for nothing where minimizing would not help: stacked, as it first shows or as the application narrows it, a lone panel or one wider than the row', async () => {
    const stacking = dockScope('stacking');
    expect(stacking.element().querySelector('.env-panel-dock')!.getAttribute('data-stacked')).toBe(
      '',
    );
    await frames();
    expect(logText('stacking')()).toBe('');
    await isVisible(section(stacking, 'three'));
    // openLabel names the tabs' buttons.
    expect(visible(button(stacking, 'Bring back One').element())).toBe(true);

    for (const [name, panels] of [
      ['lone', ['solo']],
      // The active panel alone is wider than the row, so the others stay and the row scrolls.
      ['wide', ['draft', 'outline', 'canvas']],
    ] as const) {
      const { row, ids } = rowOf(dockScope(name));
      await expect.poll(() => row().getAttribute('data-overflowing'), { message: name }).toBe('');
      await frames();
      expect(logText(name)(), name).toBe('');
      expect(ids(), name).toEqual(panels);
    }

    // The application's own state narrows the region below stackBelow, as a sidebar opening
    // does, in the same update that renders the dock.
    const squeezed = dockScope('squeezed');
    await expect.poll(rowOf(squeezed).ids).toEqual(['p0', 'p1']);
    await page.getByRole('button', { name: 'Narrow squeezed light' }).click();
    await expect
      .poll(() => squeezed.element().querySelector('.env-panel-dock')!.getAttribute('data-stacked'))
      .toBe('');
    await frames();
    expect(logText('squeezed')()).toBe('');
  });

  test('a dock that minimizes never takes back the panel people brought back, nor the one that holds focus', async () => {
    const protective = dockScope('protective');
    const { row, ids } = rowOf(protective);
    // The row fits one panel. The application marks Alpha active and activates no other.
    await expect.poll(ids).toEqual(['alpha']);
    await button(protective, 'Show Beta').click();
    await expect.poll(ids).toEqual(['alpha', 'beta']);
    await frames();
    // Neither the active panel nor the one brought back makes room: the row scrolls instead.
    expect(logText('protective')()).toBe('beta open');
    expect(ids()).toEqual(['alpha', 'beta']);
    await expect.poll(() => row().getAttribute('data-overflowing')).toBe('');
    // Focus goes with the panel brought back.
    await expect.poll(() => document.activeElement).toBe(section(protective, 'beta')());

    const typing = dockScope('typing');
    const typingIds = rowOf(typing).ids;
    const field = typing.getByRole('textbox', { name: 'Notes of Draft' });
    await field.click();
    await keyboard.type('Hello');
    // The application opens notes while people type in the draft, as when messages arrive.
    await keyboard.press('Alt+KeyO');
    await expect.poll(typingIds).toEqual(['draft', 'note-1']);
    await keyboard.press('Alt+KeyO');
    await expect.poll(logText('typing')).toBe('note-1 minimized');
    await expect.poll(typingIds).toEqual(['draft', 'note-2']);
    await expect.element(field).toHaveFocus();
    await expect.element(field).toHaveValue('Hello');
  });

  test('a dock that minimizes leaves a panel the application opens again until the region resizes', async () => {
    const scope = dockScope('reopening');
    const log = logText('reopening');
    // The application opens each panel the dock minimized again itself: the dock asks once for
    // each, then leaves the row to scroll.
    const once = 'p0 minimized,p0 reopened,p1 minimized,p1 reopened';
    await expect.poll(log).toBe(once);
    await frames(10);
    expect(log()).toBe(once);
    expect(rowOf(scope).ids()).toEqual(['p0', 'p1', 'p2']);
    // Once the region changes size, the dock asks again, once for each.
    scope.element().style.inlineSize = '50rem';
    await expect.poll(log).toBe(`${once},${once}`);
    await frames(10);
    expect(log()).toBe(`${once},${once}`);
  });

  test('a dock that minimizes asks for the next panel when the application keeps one open', async () => {
    // Mounted again on a clock that moves only as the test moves it: its timers and
    // performance.now(), by which the dock times an answer.
    stopTimers('performance');
    mount(fixture);
    const scope = dockScope('keeping');
    const log = logText('keeping');
    const { row, ids } = rowOf(scope);
    // Asked once for the pinned panel, which the application keeps without an answer for 5
    // seconds, the dock minimizes the next.
    await expect.poll(log).toBe('pinned minimized');
    await passTime(4_900);
    expect(log()).toBe('pinned minimized');
    await passTime(200);
    await expect.poll(log).toBe('pinned minimized,inbox minimized');
    await expect.poll(ids).toEqual(['pinned', 'today']);
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    await frames();
    expect(log()).toBe('pinned minimized,inbox minimized');
    // So it does here.
    expect(visible(button(scope, 'Return to Inbox').element())).toBe(true);
  });

  test('a dock that minimizes waits for an answer that comes later, as in a transition', async () => {
    // Mounted again on a clock that moves only as the test moves it: its timers and
    // performance.now(), by which the dock times an answer.
    stopTimers('performance');
    mount(fixture);
    const scope = dockScope('late');
    const log = logText('late');
    const { ids } = rowOf(scope);
    // The application answers a second later: the dock asks for nothing else meanwhile, and one
    // panel makes room. Half a second after the row settles, it has asked nothing more.
    await expect.poll(log).toBe('p0 minimized');
    await passTime(1_000);
    await expect.poll(ids).toEqual(['p1', 'p2']);
    await passTime(500);
    expect(log()).toBe('p0 minimized');
    expect(ids()).toEqual(['p1', 'p2']);
    // With room for it again, the panel comes back, also with an answer that comes later.
    scope.element().style.inlineSize = '88rem';
    await expect.poll(log).toBe('p0 minimized,p0 open');
    await passTime(1_000);
    await expect.poll(ids).toEqual(['p0', 'p1', 'p2']);
  });

  test('the dock and its window controls take their names from EnvUIProvider, and a header can leave the controls out', async () => {
    const scope = page.getByTestId('translated-dock');
    const entwurf = page.elementLocator(
      scope.element().querySelector('section[data-panel-id="entwurf"]')!,
    );
    const notizen = page.elementLocator(
      scope.element().querySelector('section[data-panel-id="notizen"]')!,
    );
    for (const name of ['Minimieren', 'Maximieren', 'Schließen'])
      expect(visible(button(entwurf, name).element())).toBe(true);
    expect(
      visible(entwurf.getByRole('separator', { name: 'Größe von Entwurf ändern' }).element()),
    ).toBe(true);
    const tabs = scope.getByRole('list', { name: 'Ausgeblendete Bereiche' });
    expect(visible(button(tabs, 'Plan anzeigen').element())).toBe(true);
    expect(visible(button(tabs, 'Plan schließen').element())).toBe(true);
    // controls={false} leaves the window controls out and keeps the application's actions.
    expect(button(notizen, 'Minimieren').elements()).toHaveLength(0);
    expect(visible(button(notizen, 'Notizen bearbeiten').element())).toBe(true);
    // The application's actions and the window controls are ghost buttons; the tab's close button
    // is a ghost IconButton with a cross.
    for (const control of [
      button(entwurf, 'Entwurf bearbeiten'),
      button(entwurf, 'Minimieren'),
      button(entwurf, 'Schließen'),
      button(tabs, 'Plan schließen'),
    ])
      await expect.element(control).toHaveAttribute('data-variant', 'ghost');
    // Maximize reads Restore in the provider's words once the panel fills the region.
    await button(entwurf, 'Maximieren').click();
    await isVisible(() => button(entwurf, 'Wiederherstellen').query());
  });
});

// The fixture's clock stands still here until the test moves it, so the application's answer, a
// second after the dock asks, comes only after the panel has closed, however long the steps take.
test('a panel that closes while the dock awaits its answer leaves the others open', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  stopTimers();
  mount(fixture);
  const scope = dockScope('late');
  const log = logText('late');
  const first = section(scope, 'p0');
  // Asked to minimize, the panel closes before the application answers.
  await expect.poll(log).toBe('p0 minimized');
  await button(page.elementLocator(first()!), 'Close').click();
  await isGone(first);
  // The answer comes and renders the dock again; it asks for nothing else.
  const commits = () => Number(scope.element().dataset.commits);
  const before = commits();
  await passTime(1500);
  await expect.poll(commits).toBeGreaterThan(before);
  expect(log()).toBe('p0 minimized');
  expect(rowOf(scope).ids()).toEqual(['p1', 'p2']);
});

/** A dock of the given width as a server renders it, with two open panels and a minimized one. */
const serverDock = (name: string, width: string) =>
  h(
    'div',
    { 'data-testid': name, style: { position: 'relative', inlineSize: width, blockSize: '30rem' } },
    h(PanelDock.Root, {
      panels: [
        { id: 'report', title: 'Quarterly report', mode: 'open' },
        { id: 'notes', title: 'Meeting notes', mode: 'open', active: true },
        { id: 'budget', title: 'Budget', mode: 'minimized' },
      ],
      onModeChange: () => {},
      onClose: () => {},
      children: (panel: { title: string }) => h(PanelDock.Header, { title: panel.title }),
    }),
  );

test(
  'a narrow dock stacks in the server markup and keeps that layout as it hydrates',
  { tags: ['engines'] },
  async () => {
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    const element = h(
      Theme,
      { theme: 'light' },
      serverDock('narrow', '24rem'),
      serverDock('wide', '60rem'),
    );
    // The markup a server sends, in the page before any script runs.
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.append(container);
    onTestFinished(() => container.remove());
    const narrow = page.getByTestId('narrow');
    const wide = page.getByTestId('wide');
    const panel = (scope: Locator, id: string) => () =>
      scope.element().querySelector<HTMLElement>(`section[data-panel-id="${id}"]`);
    const showButtons = (scope: Locator) =>
      scope.getByRole('list', { name: 'Hidden panels' }).getByRole('button', { name: /^Show/ });
    const shownTexts = (scope: Locator) =>
      showButtons(scope)
        .elements()
        .filter((element) => visible(element))
        .map((element) => element.textContent);
    const layout = () => ({
      notes: box(panel(narrow, 'notes')()!),
      tabs: showButtons(narrow)
        .elements()
        .map((element) => element.textContent),
    });

    // Before any script runs, the container query stacks the narrow dock: the active panel fills
    // it above the tabs, the other open panel waits as a tab, and the sheet has no Maximize. The
    // wide dock keeps its panels side by side, with only the minimized one as a tab.
    const dockBox = box(narrow.element().querySelector('.env-panel-dock')!);
    const before = layout();
    expect(before.notes.x).toBeCloseTo(dockBox.x, 0);
    expect(before.notes.y).toBeCloseTo(dockBox.y, 0);
    expect(before.notes.width).toBeCloseTo(dockBox.width, 0);
    expect(visible(panel(narrow, 'report')())).toBe(false);
    expect(shownTexts(narrow)).toEqual(['Quarterly report', 'Budget']);
    const maximize = (scope: Locator) =>
      page.elementLocator(panel(scope, 'notes')()!).getByRole('button', { name: 'Maximize' });
    expect(visible(maximize(narrow).query())).toBe(false);
    expect(visible(panel(wide, 'report')())).toBe(true);
    expect(shownTexts(wide)).toEqual(['Budget']);
    expect(visible(maximize(wide).query())).toBe(true);

    // Hydrating reads the same layout: nothing moves, nothing plays an entrance, and the panel the
    // stacked dock leaves out is inert.
    const errors: string[] = [];
    const root = hydrateRoot(container, element, {
      onRecoverableError: (error) => errors.push(String(error)),
    });
    onTestFinished(() => root.unmount());
    const narrowDock = () => narrow.element().querySelector('.env-panel-dock')!;
    await expect.poll(attribute(narrowDock, 'data-stacked')).toBe('');
    await expect.poll(attribute(narrowDock, 'data-env-ssr-pending')).toBeNull();
    expect(errors).toEqual([]);
    expect(wide.element().querySelector('.env-panel-dock')!.hasAttribute('data-stacked')).toBe(
      false,
    );
    expect(panel(narrow, 'report')()!.inert).toBe(true);
    expect(panel(narrow, 'notes')()!.hasAttribute('data-entering')).toBe(false);
    expect(layout()).toEqual(before);
    expect(texts(showButtons(wide))).toEqual(['Budget']);
  },
);
