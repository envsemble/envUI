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

const inRem = (pixels: number) => Math.round((pixels / 16) * 100) / 100;

const logOf =
  (theme = 'light') =>
  () =>
    page.getByTestId(`dock-log-${theme}`).element().textContent!.split('\n').filter(Boolean);
const lastLog =
  (theme = 'light') =>
  () =>
    logOf(theme)().at(-1);

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

async function frames(count = 3) {
  for (let left = count; left > 0; left--)
    await new Promise((resolve) => requestAnimationFrame(resolve));
}

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
    expect(css(notes, 'z-index')).toBe('2');
    expect(css(report, 'z-index')).toBe('1');

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
    const stripHeight = (dock.tabs.element() as HTMLElement).offsetHeight;
    const notesContent = notes.element().querySelector('.env-panel-dock-content')!;
    expect(Number.parseFloat(css(notesContent, 'padding-block-end'))).toBeCloseTo(stripHeight, 0);
    expect(Number.parseFloat(css(notesContent, 'scroll-padding-block-end'))).toBeGreaterThan(
      stripHeight,
    );

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

    await button(notes, 'Minimize').hover();
    await expect.poll(() => document.querySelector('.env-tooltip')?.textContent).toBe('Minimize');
    await button(notes, 'Minimize').click();
    await expect.poll(lastLog()).toBe('mode notes minimized');
    await isHidden(() => dock.panel('notes'));
    expect(dock.panel('notes')!.getAttribute('data-mode')).toBe('minimized');
    await expect
      .poll(() => texts(dock.tabs.getByRole('button')))
      .toEqual(['Meeting notes', '', 'Budget', '']);
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
    const resize = report.getByRole('separator', { name: 'Resize Quarterly report' });
    expect(resize.elements()).toHaveLength(0);
    await button(report, 'Restore').click();
    await expect.element(report).toHaveAttribute('data-mode', 'open');
    await expect.element(dock.region).not.toHaveAttribute('data-filled');
    await expect.poll(() => resize.elements().length).toBe(1);

    await button(dock.tabs, 'Show Meeting notes').click();
    await isVisible(() => notes.element());
    await expect.element(notes).toHaveAttribute('data-mode', 'open');
    await expect.poll(() => logOf()().slice(-2)).toEqual(['mode notes open', 'activate notes']);
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
      await expect.poll(attribute(() => dock.panel('report'), 'data-active')).toBe('');
      await nextFrames();
      content().scrollTop = 120;
      list().scrollTop = 60;

      await keyboard.press('Alt+KeyX');
      await expect.poll(attribute(() => dock.panel('report'), 'data-mode')).toBe('maximized');
      await expect.element(draft).toHaveFocus();
      expect(draftField().value).toBe('Unsent changes');
      await expect.poll(scrolls).toEqual([120, 60]);
      await keyboard.press('Alt+KeyO');
      await expect.poll(attribute(() => dock.panel('report'), 'data-mode')).toBe('open');
      await expect.element(draft).toHaveFocus();
      await expect.poll(scrolls).toEqual([120, 60]);

      await keyboard.press('Alt+KeyM');
      const tab = button(dock.tabs, 'Show Quarterly report');
      await expect.element(tab).toHaveFocus();
      await isHidden(() => dock.panel('report'));
      await keyboard.press('Enter');
      await isVisible(() => dock.panel('report'));
      await expect.element(draft).toHaveFocus();
      expect(draftField().value).toBe('Unsent changes');
      await expect.poll(scrolls).toEqual([120, 60]);

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
      const room = value('aria-valuemax');
      const start = value('aria-valuenow');
      expect(start).toBe(Math.round(room * 0.85));
      expect(value('aria-valuemin')).toBe(240);
      await expect.element(handle).toHaveAttribute('aria-valuetext', '85%');
      expect(box(report).height).toBeCloseTo(start, 0);

      const edge = box(handle);
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
      await mouse.down();
      await mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2 + 100, { steps: 5 });
      await expect.element(report).toHaveAttribute('data-resizing', '');
      await expect.poll(() => Math.round(box(report).height)).toBe(start - 100);
      expect(lastLog()()).not.toMatch(/^height/);
      await mouse.up();
      await expect.element(report).not.toHaveAttribute('data-resizing');
      await expect.poll(lastLog()).toBe(`height report ${inRem(start - 100)}`);
      await valueIs(start - 100);

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
      await keyboard.press('Control+ArrowDown');
      await valueIs(room);

      await nextFrames();
      const top = box(handle);
      await mouse.move(top.x + top.width / 2, top.y + top.height / 2, { steps: 2 });
      await mouse.down();
      await mouse.move(top.x + top.width / 2, Math.max(1, top.y - 40), { steps: 4 });
      await mouse.up();
      await valueIs(room);

      const entries = logOf()().length;
      dock.frame().style.blockSize = '30rem';
      const shorter = dock.root().clientHeight - 24;
      expect(shorter).toBeLessThan(room);
      await expect.poll(() => value('aria-valuemax')).toBe(shorter);
      await valueIs(shorter);
      expect(box(report).height).toBeCloseTo(shorter, 0);
      expect(logOf()()).toHaveLength(entries);
      dock.frame().style.blockSize = '';
      await valueIs(room);

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
    dock.frame().style.inlineSize = '1100px';
    await expect.poll(() => Math.round(box(report()).width)).toBe(512);
    expect(Math.round(box(notes()).width)).toBe(448);
    expect(dock.row().hasAttribute('data-overflowing')).toBe(false);
    expect(css(dock.row(), 'pointer-events')).toBe('none');
    dock.frame().style.inlineSize = '700px';
    const shortfall = 512 + 448 - (700 - 2 - 48 - 8);
    await expect.poll(() => box(report()).width).toBeCloseTo(512 - (shortfall * 512) / 960, 0);
    expect(box(notes()).width).toBeCloseTo(448 - (shortfall * 448) / 960, 0);

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
    expect(css(dock.row(), 'pointer-events')).toBe('auto');
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.region.getByRole('region', { name: 'Release checklist 2' });
    const latestEnd = () => {
      const region = box(dock.root());
      const latestBox = box(latest);
      return Math.round(latestBox.x + latestBox.width - (region.x + region.width - 24));
    };
    await expect.poll(latestEnd).toBe(0);
    dock.frame().style.inlineSize = '660px';
    await expect.poll(latestEnd).toBe(0);
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
    const notesPanel = dock.within('notes');
    expect(notesPanel.getByRole('button', { name: 'Maximize' }).elements()).toHaveLength(0);
    expect(visible(button(notesPanel, 'Minimize').element())).toBe(true);
    expect(
      notesPanel.getByRole('separator', { name: /^Resize Meeting notes/ }).elements(),
    ).toHaveLength(0);
    const action = box(page.getByRole('button', { name: 'Page action light' }));
    expect(
      document
        .elementFromPoint(action.x + action.width / 2, action.y + action.height / 2)
        ?.closest('.env-panel-dock'),
    ).not.toBeNull();

    await button(dock.tabs, 'Show Quarterly report').click();
    await isVisible(report);
    await isHidden(notes);
    await expect.poll(lastLog()).toBe('activate report');
    await expect.poll(holdsFocus(report)).toBe(true);
    await button(dock.within('report'), 'Minimize').click();
    await isVisible(notes);
    await expect.element(button(dock.tabs, 'Show Quarterly report')).toHaveFocus();

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

    dock.frame().style.inlineSize = '';
    await expect.poll(attribute(dock.root, 'data-stacked')).toBeNull();
    await expect.poll(lastLog()).toBe('stacked false');
    await isVisible(notes);
    expect(visible(button(dock.within('notes'), 'Maximize').element())).toBe(true);

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
    const minimize = button(report, 'Minimize');
    await tabTo(report.getByRole('separator', { name: 'Resize Quarterly report' }), 1);
    await tabTo(button(report, 'Edit Quarterly report light'), 1);
    await tabTo(button(report, 'More actions for Quarterly report light'), 1);
    await tabTo(minimize, 1);
    expect(css(minimize, 'outline-style')).toBe('solid');
    await tabTo(button(report, 'Maximize'), 1);
    await tabTo(button(report, 'Close'), 1);
    await tabTo(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }), 2);

    await keyboard.press('Shift+Tab');
    await expect.element(button(report, 'Close')).toHaveFocus();
    await keyboard.press('Shift+Tab');
    await keyboard.press('Shift+Tab');
    await expect.element(minimize).toHaveFocus();
    await keyboard.press('Enter');
    const tab = button(dock.tabs, 'Show Quarterly report');
    await expect.element(tab).toHaveFocus();
    expect(css(tab, 'outline-style')).toBe('solid');
    await keyboard.press('Tab');
    await expect.element(button(dock.tabs, 'Close Quarterly report')).toHaveFocus();
    await keyboard.press('Shift+Tab');
    await keyboard.press('Space');
    await isVisible(() => dock.panel('report'));
    await expect
      .element(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }))
      .toHaveFocus();

    focus(button(dock.tabs, 'Close Budget'));
    await keyboard.press('Enter');
    await expect.poll(lastLog()).toBe('close budget');
    await expect.poll(() => dock.tabs.query()).toBeNull();
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
    const header = dock.panel('report')!.querySelector('.env-panel-dock-header')!;
    expect(css(header, 'padding-right')).toBe('24px');
    expect(css(header, 'padding-left')).toBe('12px');
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.region.getByRole('region', { name: 'Release checklist 2' });
    await expect.poll(() => dock.row().getAttribute('data-overflowing')).toBe('');
    await expect.poll(() => Math.round(box(latest).x - rootBox.x)).toBe(24);
    const handle = dock
      .within('report')
      .getByRole('separator', { name: 'Resize Quarterly report' });
    const height = Number(handle.element().getAttribute('aria-valuenow'));
    focus(handle);
    await keyboard.press('ArrowDown');
    await expect.element(handle).toHaveAttribute('aria-valuenow', String(height - 16));
  });

  test('coarse pointers get a taller resize band, touch-sized tabs and controls', async () => {
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
      const minimize = button(report, 'Minimize');
      expect(css(minimize, 'height')).toBe('44px');
      expect(css(minimize, 'width')).toBe('44px');
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

    focus(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }));
    await dragDown();
    await keyboard.press('Alt+KeyX');
    await expect.element(report).toHaveAttribute('data-mode', 'maximized');
    await expect.element(report).not.toHaveAttribute('data-resizing');
    await expect.poll(() => css(content(), 'pointer-events')).toBe('auto');
    await mouse.up();
    await keyboard.press('Alt+KeyO');
    await expect.element(report).toHaveAttribute('data-mode', 'open');
    await expect.poll(() => Number(handle.element().getAttribute('aria-valuenow'))).toBe(start);
    expect(box(report).height).toBeCloseTo(start, 0);

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
    await button(report, 'Dismiss tip of Quarterly report light').click();
    await expect.poll(attribute(panel, 'data-active')).toBe('');
    const action = page.getByRole('button', { name: 'Page action light' });
    focus(action);
    await keyboard.press('Alt+KeyM');
    await expect.poll(attribute(panel, 'data-mode')).toBe('minimized');
    await expect.element(action).toHaveFocus();
    await button(dock.tabs, 'Show Quarterly report').click();
    focus(report.getByRole('textbox', { name: 'Draft of Quarterly report light' }));
    await keyboard.press('Alt+KeyM');
    await expect.element(button(dock.tabs, 'Show Quarterly report')).toHaveFocus();
    await keyboard.press('Enter');
    await expect.poll(attribute(panel, 'data-mode')).toBe('open');

    focus(report.getByRole('separator', { name: 'Resize Quarterly report' }));
    await keyboard.press('Alt+KeyX');
    await expect.poll(attribute(panel, 'data-mode')).toBe('maximized');
    await expect.poll(holdsFocus(panel)).toBe(true);
    await keyboard.press('Alt+KeyO');
    await expect.poll(attribute(panel, 'data-mode')).toBe('open');

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

      focus(draft);
      content().scrollTop = content().scrollHeight;
      const pageTop = scrollY;
      await bringBack(draft);
      expect(scrollY).toBe(pageTop);
      const [contentBox, draftBox] = [box(content()), box(draft)];
      expect(draftBox.y + draftBox.height).toBeGreaterThan(box(header()).y + box(header()).height);
      expect(draftBox.y).toBeLessThan(contentBox.y + contentBox.height);
      content().scrollTop = 100;
      await bringBack(draft);
      expect(content().scrollTop).toBe(100);

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

      focus(draft);
      const pageTop = scrollY;
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      expect(scrollY).toBe(pageTop);
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();
      await page.viewport(1280, 560);
      scrollTo(0, 0);
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      const tabBox = box(tab);
      expect(Math.abs(tabBox.y + tabBox.height - 560)).toBeLessThan(2);
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();

      await page.viewport(1440, 300);
      mount(fixture);
      focus(draft);
      content().scrollTop = content().scrollHeight;
      await keyboard.press('Alt+KeyM');
      await expect.element(tab).toHaveFocus();
      scrollTo(0, dock.frame().getBoundingClientRect().bottom + scrollY - innerHeight);
      const shortTop = scrollY;
      await keyboard.press('Enter');
      await expect.element(draft).toHaveFocus();
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
    focus(draft);
    await keyboard.press('Alt+KeyN');
    await expect.poll(() => chat().querySelectorAll('li')).toHaveLength(9);
    await expect.poll(atNewest).toBeLessThanOrEqual(1);
    expect(list().scrollTop).toBe(60);
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
    const header = dockOf().panel('report')!.querySelector('.env-panel-dock-header')!;
    expect(css(header, 'transition-duration')).toBe('0.12s');
    await commands.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => css(header, 'transition-duration')).toBe('0s');

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
    await isVisible(first);
    await isHidden(second);
    await button(passive, 'Show Second note light').click();
    await isVisible(second);
    await isHidden(first);
    await expect.poll(holdsFocus(second)).toBe(true);
    await button(passive, 'Show First note light').click();
    await isVisible(first);
    await isHidden(second);
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
    await isVisible(panel('why'));
    await button(loose, 'Show Ex light').click();
    await isVisible(panel('ex'));
    await isHidden(panel('why'));
    await page.getByRole('button', { name: 'Open note light' }).click();
    await isVisible(panel('zed-2'));
    expect(panel('zed-2')()!.hasAttribute('inert')).toBe(false);
    await isHidden(panel('ex'));
    expect(visible(button(loose, 'Show Ex light').element())).toBe(true);

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
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect.poll(log).toBe('plan minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    expect(visible(button(scope, 'Show Plan light').element())).toBe(true);
    await button(scope, 'Show Plan light').click();
    await expect.poll(ids).toEqual(['plan', 'retro']);
    await expect.poll(log).toBe('plan minimized,plan open,review minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    scope.element().style.inlineSize = '80rem';
    await expect.poll(ids).toEqual(['plan', 'review', 'retro']);
    await expect.poll(log).toBe('plan minimized,plan open,review minimized,review open');

    mount(fixture);
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect.poll(log).toBe('plan minimized');
    await minimize('review');
    await expect.poll(ids).toEqual(['retro']);
    await frames();
    expect(log()).toBe('plan minimized,review minimized');
    scope.element().style.inlineSize = '80rem';
    await expect.poll(ids).toEqual(['plan', 'retro']);
    await frames();
    expect(log()).toBe('plan minimized,review minimized,plan open');
    await button(scope, 'Show Review light').click();
    await expect.poll(ids).toEqual(['plan', 'review', 'retro']);
    scope.element().style.inlineSize = '';
    await expect.poll(ids).toEqual(['review', 'retro']);
    await expect
      .poll(log)
      .toBe('plan minimized,review minimized,plan open,review open,plan minimized');
    expect(row().hasAttribute('data-overflowing')).toBe(false);

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
    expect(visible(button(stacking, 'Bring back One').element())).toBe(true);

    for (const [name, panels] of [
      ['lone', ['solo']],
      ['wide', ['draft', 'outline', 'canvas']],
    ] as const) {
      const { row, ids } = rowOf(dockScope(name));
      await expect.poll(() => row().getAttribute('data-overflowing'), { message: name }).toBe('');
      await frames();
      expect(logText(name)(), name).toBe('');
      expect(ids(), name).toEqual(panels);
    }

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
    await expect.poll(ids).toEqual(['alpha']);
    await button(protective, 'Show Beta').click();
    await expect.poll(ids).toEqual(['alpha', 'beta']);
    await frames();
    expect(logText('protective')()).toBe('beta open');
    expect(ids()).toEqual(['alpha', 'beta']);
    await expect.poll(() => row().getAttribute('data-overflowing')).toBe('');
    await expect.poll(() => document.activeElement).toBe(section(protective, 'beta')());

    const typing = dockScope('typing');
    const typingIds = rowOf(typing).ids;
    const field = typing.getByRole('textbox', { name: 'Notes of Draft' });
    await field.click();
    await keyboard.type('Hello');
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
    const once = 'p0 minimized,p0 reopened,p1 minimized,p1 reopened';
    await expect.poll(log).toBe(once);
    await frames(10);
    expect(log()).toBe(once);
    expect(rowOf(scope).ids()).toEqual(['p0', 'p1', 'p2']);
    scope.element().style.inlineSize = '50rem';
    await expect.poll(log).toBe(`${once},${once}`);
    await frames(10);
    expect(log()).toBe(`${once},${once}`);
  });

  test('a dock that minimizes asks for the next panel when the application keeps one open', async () => {
    stopTimers('performance');
    mount(fixture);
    const scope = dockScope('keeping');
    const log = logText('keeping');
    const { row, ids } = rowOf(scope);
    await expect.poll(log).toBe('pinned minimized');
    await passTime(4_900);
    expect(log()).toBe('pinned minimized');
    await passTime(200);
    await expect.poll(log).toBe('pinned minimized,inbox minimized');
    await expect.poll(ids).toEqual(['pinned', 'today']);
    expect(row().hasAttribute('data-overflowing')).toBe(false);
    await frames();
    expect(log()).toBe('pinned minimized,inbox minimized');
    expect(visible(button(scope, 'Return to Inbox').element())).toBe(true);
  });

  test('a dock that minimizes waits for an answer that comes later, as in a transition', async () => {
    stopTimers('performance');
    mount(fixture);
    const scope = dockScope('late');
    const log = logText('late');
    const { ids } = rowOf(scope);
    await expect.poll(log).toBe('p0 minimized');
    await passTime(1_000);
    await expect.poll(ids).toEqual(['p1', 'p2']);
    await passTime(500);
    expect(log()).toBe('p0 minimized');
    expect(ids()).toEqual(['p1', 'p2']);
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
    expect(button(notizen, 'Minimieren').elements()).toHaveLength(0);
    expect(visible(button(notizen, 'Notizen bearbeiten').element())).toBe(true);
    for (const control of [
      button(entwurf, 'Entwurf bearbeiten'),
      button(entwurf, 'Minimieren'),
      button(entwurf, 'Schließen'),
      button(tabs, 'Plan schließen'),
    ])
      await expect.element(control).toHaveAttribute('data-variant', 'ghost');
    await button(entwurf, 'Maximieren').click();
    await isVisible(() => button(entwurf, 'Wiederherstellen').query());
  });
});

test('a panel that closes while the dock awaits its answer leaves the others open', async () => {
  await commands.emulateMedia({ reducedMotion: 'reduce' });
  stopTimers();
  mount(fixture);
  const scope = dockScope('late');
  const log = logText('late');
  const first = section(scope, 'p0');
  await expect.poll(log).toBe('p0 minimized');
  await button(page.elementLocator(first()!), 'Close').click();
  await isGone(first);
  const commits = () => Number(scope.element().dataset.commits);
  const before = commits();
  await passTime(1500);
  await expect.poll(commits).toBeGreaterThan(before);
  expect(log()).toBe('p0 minimized');
  expect(rowOf(scope).ids()).toEqual(['p1', 'p2']);
});

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
