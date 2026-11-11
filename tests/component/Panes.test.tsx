import { describe, expect, test } from 'vitest';
import { commands, page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/Panes.fixture.tsx';
import * as scaffoldPanes from '../fixture/ScaffoldPanes.fixture.tsx';
import { box, css, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

/** The fixture with the query it reads, such as `width=60rem&split=medium`. */
const panes = (search = '') => mount(fixture, { search });
const setWidth = (width: string) => page.getByRole('button', { name: `Width ${width}` }).click();
const focus = (target: Locator) => (target.element() as HTMLElement).focus();
const element = (root: Locator, selector: string) =>
  root.element().querySelector<HTMLElement>(selector)!;
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();
const shownElement = (target: Element) => shown(page.elementLocator(target));

describe('Panes, supporting', () => {
  test('side by side from splitAt, the supporting pane at the end at its size, with the same gap with or without a divider, mirrored right to left', async () => {
    for (const search of ['width=60rem', 'width=60rem&divider=none']) {
      panes(search);
      const root = page.getByTestId('supporting');
      const main = root.getByRole('region', { name: 'Document' });
      const supporting = root.getByRole('region', { name: 'Details' });
      expect(root.getByRole('separator').elements()).toHaveLength(search.includes('none') ? 0 : 1);
      const side = box(supporting);
      expect(side.width).toBeCloseTo(22.5 * 16, 0);
      expect(side.x).toBeGreaterThan(box(main).x);
      expect(side.x - (box(main).x + box(main).width)).toBeCloseTo(16, 0);
      const listDetail = page.getByTestId('list-detail');
      const list = box(listDetail.getByRole('region', { name: 'Projects' }));
      const detail = box(listDetail.getByRole('region', { name: 'No project' }));
      expect(detail.x - (list.x + list.width)).toBeCloseTo(16, 0);
      if (search.includes('none')) continue;
      expect(shown(root.getByRole('separator', { name: 'Resize details' }))).toBe(true);
      // It paints nothing while it is a pane, and each pane scrolls on its own.
      expect(css(supporting, 'background-color')).toBe('rgba(0, 0, 0, 0)');
      expect(css(supporting, 'position')).toBe('static');
      expect(css(main, 'overflow-y')).toBe('auto');
      expect(box(main).height).toBeCloseTo(24 * 16 - 2, 0);
    }

    // splitAt sets where the panes sit side by side.
    panes('width=45rem&split=medium');
    expect(shown(page.getByTestId('supporting').getByRole('region', { name: 'Details' }))).toBe(
      true,
    );
    expect(shown(page.getByRole('button', { name: 'Show details' }))).toBe(false);
    panes('width=60rem&split=large');
    expect(shown(page.getByTestId('supporting').getByRole('region', { name: 'Details' }))).toBe(
      false,
    );

    // Right to left, the supporting pane is at the left.
    panes('width=60rem&dir=rtl');
    const root = page.getByTestId('supporting');
    expect(box(root.getByRole('region', { name: 'Details' })).x).toBeLessThan(
      box(root.getByRole('region', { name: 'Document' })).x,
    );
  });

  test(
    'below splitAt it is a modal sheet while open, which Escape, its button and the backdrop close',
    { tags: ['engines'] },
    async () => {
      panes('width=45rem');
      const root = page.getByTestId('supporting');
      const supporting = page.elementLocator(element(root, '.env-panes-supporting'));
      const main = element(root, '.env-panes-main');
      const backdrop = () => element(root, '.env-panes-backdrop');
      const close = supporting.getByRole('button', { name: 'Close' });
      expect(shown(supporting)).toBe(false);
      expect(shown(root.getByRole('separator'))).toBe(false);
      // Panes.Trigger opens the sheet, and says whether it is open and which pane it opens.
      const show = root.getByRole('button', { name: 'Show details' });
      await expect.element(show).toHaveAttribute('aria-expanded', 'false');
      await expect.element(show).toHaveAttribute('aria-controls', supporting.element().id);
      // From the keyboard, as WebKit focuses no button that a press activates.
      focus(show);
      await keyboard.press('Enter');
      // Medium: a side sheet at the end, as tall as the panes, over a backdrop; a modal dialog that
      // focus moves into, with the rest of the panes inert.
      const sheet = root.getByRole('dialog', { name: 'Details' });
      await isShown(sheet);
      await expect.element(sheet).toHaveAttribute('aria-modal', 'true');
      await isFocused(sheet);
      await expect.element(show).toHaveAttribute('aria-expanded', 'true');
      expect(css(sheet, 'position')).toBe('absolute');
      expect(main.inert).toBe(true);
      const placed = box(sheet);
      const frame = box(page.getByTestId('supporting-frame'));
      expect(placed.x + placed.width).toBeCloseTo(frame.x + frame.width - 1, 0);
      expect(placed.height).toBeCloseTo(frame.height - 2, 0);
      expect(shownElement(backdrop())).toBe(true);
      // Tab stays in the sheet: its close button, its content, and round again.
      await keyboard.press('Tab');
      await isFocused(close);
      await keyboard.press('Tab');
      await isFocused(sheet.getByRole('button', { name: 'Edit details' }));
      await keyboard.press('Tab');
      await isFocused(close);
      await keyboard.press('Shift+Tab');
      await isFocused(sheet.getByRole('button', { name: 'Edit details' }));
      await keyboard.press('Escape');
      await isHidden(supporting);
      await isFocused(show);
      expect(main.inert).toBe(false);
      // Its close button and the backdrop close it too.
      await keyboard.press('Enter');
      await isShown(close);
      await close.click();
      await isHidden(supporting);
      await isFocused(show);
      await show.click();
      await isShown(supporting);
      const cover = box(backdrop());
      await mouse.click(cover.x + 10, cover.y + 10);
      await isHidden(supporting);
      // Compact: a bottom sheet across the width, shorter than the panes.
      await setWidth('30rem');
      await show.click();
      await isShown(supporting);
      const bottom = box(supporting);
      const narrow = box(page.getByTestId('supporting-frame'));
      expect(bottom.width).toBeCloseTo(narrow.width - 2, 0);
      expect(bottom.y + bottom.height).toBeCloseTo(narrow.y + narrow.height - 1, 0);
      expect(bottom.height).toBeLessThan(narrow.height * 0.9);
      // Wider again, the panes sit side by side, whatever open says: a region again, without its
      // close button, beside a main pane that isn't inert.
      page.getByTestId('supporting-frame').element().setAttribute('style', 'inline-size: 80rem');
      await expect.poll(() => css(supporting, 'position')).toBe('static');
      await isShown(root.getByRole('region', { name: 'Details' }));
      expect(shown(close)).toBe(false);
      expect(main.inert).toBe(false);
      expect(shownElement(backdrop())).toBe(false);
      // The trigger hides while the supporting pane shows beside the main one.
      expect(shown(show)).toBe(false);
    },
  );

  test('the divider starts from the width that shows, where the room allows less than the size', async () => {
    panes('width=45rem&split=medium&size=40');
    const root = page.getByTestId('supporting');
    const divider = root.getByRole('separator', { name: 'Resize details' });
    const supporting = root.getByRole('region', { name: 'Details' });
    const width = box(supporting).width / 16;
    expect(width).toBeLessThan(30);
    // ArrowRight narrows the supporting pane by 1 rem from the width it shows, not from 40 rem.
    focus(divider);
    await keyboard.press('ArrowRight');
    await expect.poll(() => box(supporting).width / 16).toBeCloseTo(width - 1, 0);
    expect(Number.parseFloat(divider.element().getAttribute('aria-valuetext')!)).toBeLessThan(30);
  });

  test(
    'the divider resizes the pane by keyboard and pointer, in rem, and remembers it',
    { tags: ['engines'] },
    async () => {
      const forget = () => {
        for (const name of ['fixture-panes', 'fixture-kept'])
          document.cookie = `${name}=; max-age=0; path=/`;
      };
      forget();
      try {
        const fixtureMount = panes('width=60rem&persist=fixture-panes');
        const root = page.getByTestId('supporting');
        const divider = () => page.getByRole('separator', { name: 'Resize details' });
        const supporting = root.getByRole('region', { name: 'Details' });
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '22.5 rem');
        await expect.element(divider()).toHaveAttribute('aria-controls', supporting.element().id);
        // The supporting pane is at the end: ArrowLeft moves the divider toward the start and
        // grows it. Focus shows the divider.
        focus(divider());
        expect(css(divider(), 'outline-style')).toBe('solid');
        await keyboard.press('ArrowLeft');
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '23.5 rem');
        await keyboard.press('Shift+ArrowRight');
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '18.5 rem');
        expect(box(supporting).width).toBeCloseTo(18.5 * 16, 0);
        // A drag of 32 px toward the start grows it by 2 rem.
        const handle = box(divider());
        const x = handle.x + handle.width / 2;
        const y = handle.y + handle.height / 2;
        await mouse.move(x, y);
        await mouse.down();
        await mouse.move(x - 16, y);
        await mouse.move(x - 32, y);
        await mouse.up();
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '20.5 rem');
        await expect.poll(() => page.getByTestId('sizes').element().textContent).toContain('20.5!');
        // The size is kept in a cookie, and read again after the first render.
        expect(document.cookie).toContain('fixture-panes=20.5');
        fixtureMount.remount();
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '20.5 rem');
        // A width the server read from the cookie renders at once, and a double click returns to
        // the default at once, not to it.
        panes('width=60rem&persist=fixture-kept&kept=30');
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '30 rem');
        await divider().dblClick();
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '22.5 rem');
        panes('width=60rem&persist=fixture-panes');
        // A double click returns it to the default and forgets it.
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '20.5 rem');
        await divider().dblClick();
        await expect.element(divider()).toHaveAttribute('aria-valuetext', '22.5 rem');
        expect(document.cookie).not.toContain('fixture-panes=');
      } finally {
        forget();
      }
    },
  );

  test('uncontrolled, the trigger opens the sheet and Escape closes it, each with its reason', async () => {
    panes('width=30rem&uncontrolled');
    const root = page.getByTestId('supporting');
    await root.getByRole('button', { name: 'Show details' }).click();
    const sheet = root.getByRole('dialog', { name: 'Details' });
    await isShown(sheet);
    await keyboard.press('Escape');
    await isHidden(sheet);
    await expect
      .poll(() => page.getByTestId('reasons').element().textContent)
      .toBe('open trigger-press, close escape-key');
  });
});

describe('Panes in a Scaffold whose document scrolls', { tags: ['engines'] }, () => {
  test("the sheet is the window's, over the bars, at the bottom or the end", async () => {
    for (const [width, side] of [
      [480, 'bottom'],
      [820, 'end'],
    ] as const) {
      await page.viewport(width, 640);
      mount(scaffoldPanes);
      await expect
        .poll(() => page.getByRole('button', { name: 'Message 60', exact: true }).query())
        .not.toBeNull();
      // Far down a long main pane, the button that opens the sheet is out of view.
      await expect
        .poll(() => {
          window.scrollTo(0, 600);
          return document.scrollingElement!.scrollTop;
        })
        .toBe(600);
      focus(page.getByRole('button', { name: 'Message 40', exact: true }));
      (
        page
          .getByRole('main')
          .getByRole('button', { name: 'Show details' })
          .element() as HTMLElement
      ).click();
      const sheet = page.getByRole('dialog', { name: 'Details' });
      await isShown(sheet);
      // Where the page is as the sheet opens, once focus has scrolled it as far as it would:
      // WebKit scrolls the focused message clear of the bars a moment later.
      let scrolled = -1;
      await expect
        .poll(() => {
          const now = document.scrollingElement!.scrollTop;
          const settled = now === scrolled;
          scrolled = now;
          return settled;
        })
        .toBe(true);
      await expect.element(sheet).toHaveAttribute('aria-modal', 'true');
      expect(css(sheet, 'position')).toBe('fixed');
      // What a fixed box covers: the window, less the room the page keeps for its scrollbar.
      const probe = document.createElement('div');
      probe.style.cssText = 'position: fixed; inset: 0; pointer-events: none';
      document.body.append(probe);
      const view = probe.getBoundingClientRect();
      probe.remove();
      const placed = box(sheet);
      if (side === 'bottom') {
        // At the window's bottom, across it, shorter than it.
        expect(placed.y + placed.height).toBeCloseTo(view.height, 0);
        expect(placed.width).toBeCloseTo(view.width, 0);
        expect(placed.height).toBeLessThan(view.height);
      } else {
        // At the window's end, as tall as it.
        expect(placed.x + placed.width).toBeCloseTo(view.width, 0);
        expect(placed.y).toBeCloseTo(0, 0);
        expect(placed.height).toBeCloseTo(view.height, 0);
      }
      // The backdrop covers the window, the top bar included, which is inert with the navigation.
      const topBar = document.querySelector('.env-scaffold-top-bar')!;
      const top = box(topBar);
      expect(
        document
          .elementFromPoint(top.x + 4, top.y + top.height / 2)
          ?.classList.contains('env-panes-backdrop'),
      ).toBe(true);
      expect(topBar.closest('[inert]')).not.toBeNull();
      expect(
        document
          .querySelector('.env-scaffold-navigation > :not([style*="none"])')!
          .closest('[inert]'),
      ).not.toBeNull();
      // The sheet scrolls inside itself while the page stays where it was.
      const inside = sheet.element();
      inside.scrollTop = inside.scrollHeight;
      expect({
        scrolled: inside.scrollTop > 0,
        overflow: inside.scrollHeight > inside.clientHeight,
      }).toEqual({ scrolled: true, overflow: true });
      await commands.mouseWheel(0, 600);
      expect(document.scrollingElement!.scrollTop).toBe(scrolled);
      // Escape closes it, and the page is live again where it was.
      await keyboard.press('Escape');
      await isHidden(sheet);
      expect(topBar.closest('[inert]')).toBeNull();
      expect(document.documentElement.style.overflow).toBe('');
      expect(document.scrollingElement!.scrollTop).toBe(scrolled);
    }
  });
});

describe('Panes, list-detail', () => {
  test('side by side the list is at the start with no back button; below splitAt one pane at a time, with back, and focus follows', async () => {
    panes('width=60rem');
    const root = page.getByTestId('list-detail');
    const list = root.getByRole('region', { name: 'Projects' });
    expect(shown(list)).toBe(true);
    expect(box(list).width).toBeCloseTo(22.5 * 16, 0);
    await root.getByRole('button', { name: 'Website refresh' }).click();
    await isShown(root.getByRole('region', { name: 'Website refresh' }));
    expect(shown(list)).toBe(true);
    expect(shown(root.getByRole('button', { name: 'All projects' }))).toBe(false);
    // The detail's surface, as tall as the pane, ends at the pane's end.
    let surface = box(root.getByTestId('detail-surface'));
    let detailBox = box(root.getByRole('region', { name: 'Website refresh' }));
    expect(surface.y + surface.height).toBeCloseTo(detailBox.y + detailBox.height, 0);
    // Focus stays on the row people chose.
    await isFocused(root.getByRole('button', { name: 'Website refresh' }));

    panes('width=45rem');
    expect(shown(list)).toBe(true);
    expect(css(element(root, '.env-panes-detail'), 'display')).toBe('none');
    expect(shown(root.getByRole('separator'))).toBe(false);
    await root.getByRole('button', { name: 'Annual report' }).click();
    const detail = root.getByRole('region', { name: 'Annual report' });
    await isShown(detail);
    await isHidden(list);
    const back = root.getByRole('button', { name: 'All projects' });
    await isFocused(back);
    // A surface as tall as the pane fills the room below the back button: it ends at the pane's
    // end, and the pane doesn't scroll by the button's height.
    const backBox = box(back);
    surface = box(root.getByTestId('detail-surface'));
    detailBox = box(detail);
    expect(surface.y).toBeGreaterThan(backBox.y + backBox.height - 1);
    expect(surface.y + surface.height).toBeCloseTo(detailBox.y + detailBox.height, 0);
    expect(detail.element().scrollHeight - detail.element().clientHeight).toBeLessThanOrEqual(0);
    expect(box(detail).width).toBeCloseTo(box(page.getByTestId('list-frame')).width - 2, 0);
    await back.click();
    await isShown(list);
    expect(shownElement(element(root, '.env-panes-detail'))).toBe(false);
    // Focus returns to the list's current row.
    await isFocused(root.getByRole('button', { name: 'Annual report' }));
  });
});
