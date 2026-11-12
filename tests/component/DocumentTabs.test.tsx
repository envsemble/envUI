import { describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as tabsFixture from '../fixture/DocumentTabs.fixture.tsx';
import * as rerenderFixture from '../fixture/DocumentTabsRerender.fixture.tsx';
import * as rtlFixture from '../fixture/DocumentTabsRtl.fixture.tsx';
import { box, keyboard, mouse, nextFrames, shown, viewportRatio } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const lastLog =
  (theme = 'light') =>
  () =>
    page.getByTestId(`document-tabs-log-${theme}`).element().textContent!.split('\n').at(-1);
const isGone = (locator: Locator) => expect.poll(() => locator.query()).toBeNull();
const focus = (locator: Locator) => (locator.element() as HTMLElement).focus();
const texts = (locator: Locator) => locator.elements().map((element) => element.textContent);

describe('DocumentTabs', () => {
  test('tabs select, pin, close and keep one tab stop', async () => {
    mount(tabsFixture);
    const strip = page.getByRole('tablist', { name: 'Open documents light' });
    const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
    const retrospective = strip.getByRole('tab', { name: 'Retrospective.md', exact: true });
    await expect.element(roadmap).toHaveAttribute('aria-selected', 'true');
    await expect.element(roadmap).toHaveAttribute('tabindex', '0');
    await expect.element(roadmap).toHaveAttribute('data-tab-id', 'plans/roadmap.md');
    await expect.element(roadmap).toHaveAttribute('aria-controls', 'document-panel-light');
    await expect.element(decisions).toHaveAttribute('tabindex', '-1');
    await expect.element(retrospective).toHaveAttribute('data-preview', '');
    const label = retrospective.element().querySelector('.env-document-tabs-tab-label')!;
    expect(getComputedStyle(label).fontStyle).toBe('italic');

    await decisions.click();
    await expect.poll(lastLog()).toBe('select plans/decisions.md');
    await expect.element(decisions).toHaveAttribute('aria-selected', 'true');
    await retrospective.dblClick();
    await expect.poll(lastLog()).toBe('pin plans/retrospective.md');
    await expect.element(retrospective).not.toHaveAttribute('data-preview');

    // Arrow keys move and activate; Home and End reach the ends.
    focus(decisions);
    await keyboard.press('ArrowRight');
    await expect.element(retrospective).toHaveFocus();
    await expect.element(retrospective).toHaveAttribute('aria-selected', 'true');
    await keyboard.press('ArrowLeft');
    await keyboard.press('ArrowLeft');
    await expect.element(roadmap).toHaveFocus();
    await keyboard.press('End');
    const last = strip.getByRole('tab', { name: /number 7/ });
    await expect.element(last).toHaveFocus();
    await expect.element(last).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => viewportRatio(last)).toBeGreaterThanOrEqual(0.9);
    await keyboard.press('Home');
    await expect.element(roadmap).toHaveFocus();
    // Keys with Alt, Ctrl or ⌘ are the application's: the strip leaves them unhandled.
    const applicationKeys: boolean[] = [];
    const onKey = (event: KeyboardEvent) => {
      if (!event.key.startsWith('Arrow')) return;
      applicationKeys.push(event.defaultPrevented);
      event.preventDefault();
    };
    addEventListener('keydown', onKey);
    try {
      await keyboard.press('Alt+ArrowRight');
      await keyboard.press('Control+ArrowRight');
      expect(applicationKeys).toEqual([false, false]);
    } finally {
      removeEventListener('keydown', onKey);
    }
    await expect.element(roadmap).toHaveFocus();
    await expect.element(roadmap).toHaveAttribute('aria-selected', 'true');
    // Delete closes the focused tab, and focus moves to the tab that becomes active.
    await keyboard.press('Delete');
    await expect.poll(lastLog()).toBe('close plans/roadmap.md');
    await isGone(roadmap);
    await expect.element(decisions).toHaveAttribute('aria-selected', 'true');
    await expect.element(decisions).toHaveFocus();

    // So does the close button, a pointer's affordance beside the tab, outside it and hidden from
    // assistive technology: Delete, Backspace and the context menu close a tab from the keyboard.
    await expect.element(decisions).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace');
    expect(decisions.element().querySelectorAll('button')).toHaveLength(0);
    const closeDecisions = decisions
      .element()
      .closest('.env-document-tabs-item')!
      .querySelector<HTMLElement>('.env-document-tabs-close')!;
    expect(closeDecisions.getAttribute('tabindex')).toBe('-1');
    expect(closeDecisions.getAttribute('aria-hidden')).toBe('true');
    expect(closeDecisions.getAttribute('title')).toBe('Close Decisions.md');
    await page.elementLocator(closeDecisions).click();
    await expect.poll(lastLog()).toBe('close plans/decisions.md');
    await isGone(decisions);
    await expect.element(retrospective).toHaveAttribute('aria-selected', 'true');
    focus(retrospective);

    // A middle click closes a tab without activating it.
    const firstNote = strip.getByRole('tab', { name: /number 1\.md/ });
    await firstNote.click({ button: 'middle' });
    await expect.poll(lastLog()).toBe('close notes/note-1.md');
    await isGone(firstNote);
    await expect.element(retrospective).toHaveAttribute('aria-selected', 'true');

    // The application's own shortcut closes the focused tab, and focus still follows.
    focus(retrospective);
    await keyboard.press('Alt+KeyW');
    await expect.poll(lastLog()).toBe('close plans/retrospective.md');
    const secondNote = strip.getByRole('tab', { name: /number 2\.md/ });
    await expect.element(secondNote).toHaveAttribute('aria-selected', 'true');
    await expect.element(secondNote).toHaveFocus();
  });

  test('the context menu closes a tab or all tabs, with the pointer and the keyboard', async () => {
    mount(tabsFixture);
    const strip = page.getByRole('tablist', { name: 'Open documents light' });
    const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
    const retrospective = strip.getByRole('tab', { name: 'Retrospective.md', exact: true });
    const menu = page.getByRole('menu', { name: 'Tab actions' });
    const items = menu.getByRole('menuitem');

    // A right click on a tab offers closing that tab and all tabs.
    await decisions.click({ button: 'right' });
    await expect.poll(() => shown(menu)).toBe(true);
    expect(texts(items)).toEqual(['Close Decisions.md', 'Close all tabs']);
    await menu.getByRole('menuitem', { name: 'Close Decisions.md' }).click();
    await expect.poll(lastLog()).toBe('close plans/decisions.md');
    await isGone(decisions);
    await expect.element(roadmap).toHaveAttribute('aria-selected', 'true');
    await expect.element(roadmap).toHaveFocus();

    // Shift+F10 opens it for the focused tab; when that tab closes, focus moves to the active tab.
    focus(roadmap);
    await keyboard.press('Shift+F10');
    await expect.element(menu).toHaveFocus();
    await keyboard.press('ArrowDown');
    await expect
      .element(menu.getByRole('menuitem', { name: 'Close Roadmap.md' }))
      .toHaveAttribute('data-highlighted', '');
    await keyboard.press('Enter');
    await expect.poll(lastLog()).toBe('close plans/roadmap.md');
    await expect.element(retrospective).toHaveAttribute('aria-selected', 'true');
    await expect.element(retrospective).toHaveFocus();

    // So does the Menu key; Close all tabs leaves an empty strip.
    await keyboard.press('ContextMenu');
    await expect.poll(() => shown(menu)).toBe(true);
    await menu.getByRole('menuitem', { name: 'Close all tabs' }).click();
    await expect.poll(lastLog()).toBe('close all');
    await expect.poll(() => strip.getByRole('tab').elements()).toHaveLength(0);
    await expect.poll(() => document.activeElement).toBe(document.body);

    // On the empty strip the menu has only Close all tabs, unavailable without tabs.
    await strip.click({ button: 'right' });
    await expect.poll(() => texts(items)).toEqual(['Close all tabs']);
    await expect.element(items).toHaveAttribute('aria-disabled', 'true');
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);

    // Without onCloseAll, a tab still offers Close, from the pointer and the keyboard.
    const dark = page.getByRole('tablist', { name: 'Open documents dark' });
    const darkRoadmap = dark.getByRole('tab', { name: 'Roadmap.md', exact: true });
    const darkDecisions = dark.getByRole('tab', { name: 'Decisions.md', exact: true });
    await darkDecisions.click({ button: 'right' });
    await expect.poll(() => texts(items)).toEqual(['Close Decisions.md']);
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);
    focus(darkRoadmap);
    await keyboard.press('Shift+F10');
    await expect.element(menu).toHaveFocus();
    await keyboard.press('ArrowDown');
    await keyboard.press('Enter');
    await expect.poll(lastLog('dark')).toBe('close plans/roadmap.md');
    await isGone(darkRoadmap);
    await expect.element(darkDecisions).toHaveFocus();

    // Backspace closes the focused tab too, for keyboards without a forward Delete key. A held key
    // closes only that tab: its repeats close no more.
    const darkTabs = dark.getByRole('tab').elements().length;
    await keyboard.down('Backspace');
    await expect.poll(lastLog('dark')).toBe('close plans/decisions.md');
    await isGone(darkDecisions);
    for (const key of ['Backspace', 'Delete']) {
      const init = { key, repeat: true, bubbles: true, cancelable: true };
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', init));
    }
    await keyboard.up('Backspace');
    expect(dark.getByRole('tab').elements()).toHaveLength(darkTabs - 1);
    expect(lastLog('dark')()).toBe('close plans/decisions.md');

    // The strip around the tabs offers no menu without onCloseAll, and leaves the browser its own:
    // neither a right click in the gap before the first tab nor a contextmenu event is cancelled.
    const darkStrip = dark.element() as HTMLElement;
    darkStrip.scrollLeft = 0;
    let lastContextMenu: MouseEvent | undefined;
    darkStrip.addEventListener('contextmenu', (event) => {
      if (event.target === darkStrip) lastContextMenu = event;
    });
    const stripBox = box(darkStrip);
    const gap = { x: 2, y: 8 };
    expect(document.elementFromPoint(stripBox.x + gap.x, stripBox.y + gap.y)).toBe(darkStrip);
    await mouse.click(stripBox.x + gap.x, stripBox.y + gap.y, { button: 'right' });
    await expect.poll(() => lastContextMenu?.defaultPrevented).toBe(false);
    // dispatchEvent returns false for an event that was cancelled.
    expect(
      darkStrip.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 1, clientY: 1 }),
      ),
    ).toBe(true);
    // React mounts a menu in the frame after the event; two frames on, none has.
    await nextFrames();
    expect(page.getByRole('menu').elements()).toHaveLength(0);
  });

  test(
    'the strip scrolls sideways and keeps the active tab in view',
    { tags: ['engines'] },
    async () => {
      mount(tabsFixture);
      const strip = page.getByRole('tablist', { name: 'Open documents light' });
      const element = strip.element();
      const scrollLeft = () => element.scrollLeft;
      expect(element.scrollWidth > element.clientWidth).toBe(true);
      await page
        .getByTestId('document-tabs-light')
        .getByRole('button', { name: 'Activate the last note' })
        .click();
      await expect
        .poll(() => viewportRatio(strip.getByRole('tab', { name: /number 7/ })))
        .toBeGreaterThanOrEqual(0.9);
      const scrolled = scrollLeft();
      expect(scrolled).toBeGreaterThan(0);

      await strip.hover();
      await mouse.wheel(0, -200);
      await expect.poll(scrollLeft).toBeLessThan(scrolled);
      // Long labels truncate within the maximum width.
      expect(box(strip.getByRole('tab', { name: /number 1\.md/ })).width).toBeLessThanOrEqual(
        14 * 16 + 1,
      );
    },
  );

  test(
    'in right-to-left text the arrow keys and the wheel run toward the end',
    { tags: ['engines'] },
    async () => {
      mount(rtlFixture);
      const strip = page.getByRole('tablist', { name: 'Right-to-left documents' });
      const roadmap = strip.getByRole('tab', { name: 'Roadmap.md', exact: true });
      const decisions = strip.getByRole('tab', { name: 'Decisions.md', exact: true });
      focus(roadmap);
      // The next tab is to the left.
      await keyboard.press('ArrowLeft');
      await expect.element(decisions).toHaveFocus();
      await expect.element(decisions).toHaveAttribute('aria-selected', 'true');
      await keyboard.press('ArrowRight');
      await expect.element(roadmap).toHaveFocus();
      // Turning the wheel down scrolls toward the end, the left, where scrollLeft is negative.
      const scrollLeft = () => strip.element().scrollLeft;
      // Back on the first tab, the strip scrolls home, clear of the fade at its edge, on the next
      // frame; a slower machine may read it before then.
      await expect.poll(scrollLeft).toBe(0);
      await strip.hover();
      await mouse.wheel(0, 200);
      await expect.poll(scrollLeft).toBeLessThan(0);
      const scrolled = scrollLeft();
      await mouse.wheel(0, -100);
      await expect.poll(scrollLeft).toBeGreaterThan(scrolled);
    },
  );

  test('tabs and their close buttons are the touch height on a coarse pointer, in either scale', async () => {
    await commands.emulateTouch(true);
    try {
      for (const scale of ['comfortable', 'compact'] as const) {
        mount(tabsFixture, { scale });
        expect(matchMedia('(pointer: coarse)').matches).toBe(true);
        const strip = document.querySelector<HTMLElement>('.env-document-tabs-list')!;
        expect(strip.parentElement!.closest('.env-theme')!.getAttribute('data-env-scale')).toBe(
          scale,
        );
        // The tabs fill the strip, and every close button shows, as tall and wide as its tab.
        expect(strip.clientHeight, scale).toBe(44);
        const tabs = [...strip.querySelectorAll('.env-document-tabs-item')].map(
          (tab) => box(tab).height,
        );
        expect(tabs.length).toBeGreaterThan(0);
        expect(tabs.filter((height) => height !== 44)).toEqual([]);
        const closes = [...strip.querySelectorAll('.env-document-tabs-close')];
        expect(closes.length).toBeGreaterThan(1);
        expect(
          closes
            .map((close) => box(close))
            .filter(({ width, height }) => width !== 44 || height !== 44),
        ).toEqual([]);
        // Every close button shows, the inactive tabs' too, not only the active tab's.
        expect(closes.filter((close) => getComputedStyle(close).visibility !== 'visible')).toEqual(
          [],
        );
      }
    } finally {
      await commands.emulateTouch(false);
    }
  });

  test('a parent re-rendering with new items leaves focus where it is', async () => {
    mount(rerenderFixture);
    const strip = page.getByRole('tablist', { name: 'Re-rendered documents' });
    const two = strip.getByRole('tab', { name: 'two.md', exact: true });
    const three = strip.getByRole('tab', { name: 'three.md', exact: true });
    const renders = () => Number(page.getByTestId('rerender-count').element().textContent);
    const rendersPast = async (more: number) => {
      const from = renders();
      await expect.poll(renders).toBeGreaterThan(from + more);
    };
    await two.click();
    await expect.element(two).toHaveFocus();

    // Opening a menu re-renders the parent as it opens and while it stays open: the menu keeps focus.
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    const menu = page.getByRole('menu', { name: 'File' });
    await expect.poll(() => page.getByTestId('rerender-state').element().textContent).toBe('open');
    await expect.poll(() => shown(menu)).toBe(true);
    await rendersPast(3);
    expect(shown(menu)).toBe(true);
    await keyboard.press('ArrowDown');
    const first = menu.getByRole('menuitem', { name: 'First action' });
    await expect.element(first).toHaveFocus();
    await rendersPast(3);
    expect(shown(menu)).toBe(true);
    await expect.element(first).toHaveFocus();
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);

    // Typing elsewhere re-renders the parent on each key: the input keeps focus.
    focus(two);
    const draft = page.getByRole('textbox', { name: 'Draft' });
    await draft.click();
    await keyboard.type('abc');
    await rendersPast(3);
    await expect.element(draft).toHaveFocus();
    await expect.element(draft).toHaveValue('abc');

    // Closing the focused tab still moves focus to its right neighbour.
    focus(two);
    await keyboard.press('Delete');
    await isGone(two);
    await expect.element(three).toHaveAttribute('aria-selected', 'true');
    await expect.element(three).toHaveFocus();
  });
});
