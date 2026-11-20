import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { DocumentTabs, Menu, Surface, Theme } from '@envsemble/envui';
import { commands, page, type Locator } from 'vitest/browser';
import * as tabsFixture from '../fixture/DocumentTabs.fixture.tsx';
import * as rerenderFixture from '../fixture/DocumentTabsRerender.fixture.tsx';
import * as reorderFixture from '../fixture/DocumentTabsReorder.fixture.tsx';
import * as rtlFixture from '../fixture/DocumentTabsRtl.fixture.tsx';
import { box, keyboard, mouse, nextFrames, shown, viewportRatio } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const lastLog =
  (theme = 'light') =>
  () =>
    page.getByTestId(`document-tabs-log-${theme}`).element().textContent!.split('\n').at(-1);
const reorderLog = () => page.getByTestId('reorder-log').element().textContent!.split('\n').at(-1);
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
    await expect.element(roadmap).toHaveAttribute('data-value', 'plans/roadmap.md');
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
    await keyboard.press('Delete');
    await expect.poll(lastLog()).toBe('close plans/roadmap.md');
    await isGone(roadmap);
    await expect.element(decisions).toHaveAttribute('aria-selected', 'true');
    await expect.element(decisions).toHaveFocus();

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

    const firstNote = strip.getByRole('tab', { name: /number 1\.md/ });
    await firstNote.click({ button: 'middle' });
    await expect.poll(lastLog()).toBe('close notes/note-1.md');
    await isGone(firstNote);
    await expect.element(retrospective).toHaveAttribute('aria-selected', 'true');

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

    await decisions.click({ button: 'right' });
    await expect.poll(() => shown(menu)).toBe(true);
    expect(texts(items)).toEqual(['Close Decisions.md', 'Close all tabs']);
    await menu.getByRole('menuitem', { name: 'Close Decisions.md' }).click();
    await expect.poll(lastLog()).toBe('close plans/decisions.md');
    await isGone(decisions);
    await expect.element(roadmap).toHaveAttribute('aria-selected', 'true');
    await expect.element(roadmap).toHaveFocus();

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

    await keyboard.press('ContextMenu');
    await expect.poll(() => shown(menu)).toBe(true);
    await menu.getByRole('menuitem', { name: 'Close all tabs' }).click();
    await expect.poll(lastLog()).toBe('close all');
    await expect.poll(() => strip.getByRole('tab').elements()).toHaveLength(0);
    await expect.poll(() => document.activeElement).toBe(document.body);

    await strip.click({ button: 'right' });
    await expect.poll(() => texts(items)).toEqual(['Close all tabs']);
    await expect.element(items).toHaveAttribute('aria-disabled', 'true');
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);

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

    const darkStrip = dark.element() as HTMLElement;
    darkStrip.scrollLeft = 0;
    let lastContextMenu: MouseEvent | undefined;
    darkStrip.addEventListener('contextmenu', (event) => {
      if (event.target === darkStrip) lastContextMenu = event;
    });
    const stripBox = box(darkStrip);
    const laterTabs = [...darkStrip.querySelectorAll<HTMLElement>('.env-document-tabs-item')].slice(
      2,
    );
    for (const item of laterTabs) item.style.display = 'none';
    try {
      const lastTab = box(darkStrip.querySelectorAll('.env-document-tabs-item')[1]!);
      const gap = { x: lastTab.x + lastTab.width + 8, y: stripBox.y + 8 };
      expect(document.elementFromPoint(gap.x, gap.y)).toBe(darkStrip);
      await mouse.click(gap.x, gap.y, { button: 'right' });
      await expect.poll(() => lastContextMenu?.defaultPrevented).toBe(false);
      expect(
        darkStrip.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 1,
            clientY: 1,
          }),
        ),
      ).toBe(true);
      await nextFrames();
      expect(page.getByRole('menu').elements()).toHaveLength(0);
    } finally {
      for (const item of laterTabs) item.style.display = '';
    }
  });

  test(
    'dragging a tab that is not selected reorders the tabs and leaves the selection, and a click selects',
    { tags: ['engines'] },
    async () => {
      mount(reorderFixture);
      const strip = page.getByRole('tablist', { name: 'Reorderable documents' });
      const tabs = () => strip.getByRole('tab').elements();
      const selected = () =>
        tabs()
          .filter((tab) => tab.getAttribute('aria-selected') === 'true')
          .map((tab) => tab.textContent);
      const before = selected();
      const [first, second, third] = tabs().filter(
        (tab) => tab.getAttribute('aria-selected') !== 'true',
      );
      const dragged = second!.textContent;
      const from = box(page.elementLocator(second!));
      const to = box(page.elementLocator(third!));
      await mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await mouse.down();
      expect(selected()).toEqual(before);
      await mouse.move(to.x + to.width - 4, to.y + to.height / 2, { steps: 8 });
      expect(selected()).toEqual(before);
      await mouse.up();
      await expect.poll(reorderLog).toMatch(/^reorder /);
      expect(selected()).toEqual(before);
      expect(texts(strip.getByRole('tab')).indexOf(dragged)).toBeGreaterThan(
        texts(strip.getByRole('tab')).indexOf(third!.textContent),
      );
      await nextFrames();
      expect(selected()).toEqual(before);
      await page.elementLocator(first!).click();
      await expect.element(page.elementLocator(first!)).toHaveAttribute('aria-selected', 'true');
      await expect.poll(reorderLog).toBe(`select ${first!.dataset.value}`);
    },
  );

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
      await keyboard.press('ArrowLeft');
      await expect.element(decisions).toHaveFocus();
      await expect.element(decisions).toHaveAttribute('aria-selected', 'true');
      await keyboard.press('ArrowRight');
      await expect.element(roadmap).toHaveFocus();
      const scrollLeft = () => strip.element().scrollLeft;
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

    focus(two);
    const draft = page.getByRole('textbox', { name: 'Draft' });
    await draft.click();
    await keyboard.type('abc');
    await rendersPast(3);
    await expect.element(draft).toHaveFocus();
    await expect.element(draft).toHaveValue('abc');

    focus(two);
    await keyboard.press('Delete');
    await isGone(two);
    await expect.element(three).toHaveAttribute('aria-selected', 'true');
    await expect.element(three).toHaveFocus();
  });
});

test('children go in the panel the active tab controls, which the active tab joins', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const items = [
    { value: 'a', label: 'A.md' },
    { value: 'b', label: 'B.md' },
  ];
  const render = (value: string) =>
    root.render(
      <Theme theme="dark">
        <DocumentTabs
          aria-label="Panel documents"
          items={items}
          value={value}
          onValueChange={() => undefined}
          onClose={() => undefined}
        >
          <p data-testid="panel-content">Content of {value}</p>
        </DocumentTabs>
      </Theme>,
    );
  render('b');
  const panel = page.getByRole('tabpanel', { name: 'B.md' });
  await expect.element(panel).toBeVisible();
  const tab = page.getByRole('tab', { name: 'B.md' }).element();
  expect(tab.getAttribute('aria-controls')).toBe(panel.element().id);
  expect(panel.element().getAttribute('aria-labelledby')).toBe(tab.id);
  expect(panel.element().getAttribute('tabindex')).toBe('0');
  expect(panel.element().contains(page.getByTestId('panel-content').element())).toBe(true);
  const item = tab.closest('.env-document-tabs-item')!;
  expect(getComputedStyle(item).backgroundColor).toBe(
    getComputedStyle(panel.element()).backgroundColor,
  );
  expect(getComputedStyle(panel.element()).borderStartStartRadius).toBe('0px');
  expect(getComputedStyle(panel.element()).borderStartEndRadius).toBe('0px');
  render('a');
  await expect.poll(() => tab.closest('[data-first-active]')).not.toBeNull();
  root.unmount();
  host.remove();
});

test(
  'the strip is a step from the panel on every surface, and the first tab drops the fillet on its own side',
  { tags: ['engines'] },
  async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const items = [
      { value: 'a', label: 'A.md' },
      { value: 'b', label: 'B.md' },
    ];
    const tabs = (dir: 'ltr' | 'rtl') => (
      <div dir={dir}>
        <DocumentTabs
          aria-label={`Surface documents ${dir}`}
          items={items}
          value="a"
          onValueChange={() => undefined}
          onClose={() => undefined}
        >
          <p>Content</p>
        </DocumentTabs>
      </div>
    );
    for (const [theme, contrast] of [
      ['light', 'standard'],
      ['dark', 'standard'],
      ['light', 'high'],
    ] as const) {
      root.render(
        <Theme theme={theme} contrast={contrast}>
          {tabs('ltr')}
          <Surface background="muted">{tabs('rtl')}</Surface>
          <Surface background="raised">{tabs('ltr')}</Surface>
        </Theme>,
      );
      await expect.poll(() => host.querySelectorAll('.env-document-tabs').length).toBe(3);
      for (const strip of host.querySelectorAll('.env-document-tabs')) {
        const panel = strip.querySelector('.env-document-tabs-panel')!;
        expect(getComputedStyle(strip).backgroundColor, `${theme} ${contrast}`).not.toBe(
          getComputedStyle(panel).backgroundColor,
        );
        const active = strip.querySelector('.env-document-tabs-item[data-active]')!;
        const fillets = getComputedStyle(active, '::after').backgroundImage;
        const rtl = strip.closest('[dir]')!.getAttribute('dir') === 'rtl';
        expect(fillets.startsWith('none'), `left fillet ${rtl ? 'rtl' : 'ltr'}`).toBe(!rtl);
        expect(fillets.endsWith('none'), `right fillet ${rtl ? 'rtl' : 'ltr'}`).toBe(rtl);
      }
    }
    root.unmount();
    host.remove();
  },
);

test('a tab takes content for its label, named by its text value or the label’s rendered text, an end, its own item props, can stay open, and the context menu ends with the application’s items', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const closed: string[] = [];
  const menuFor: (string | null)[] = [];
  root.render(
    <Theme theme="light">
      <DocumentTabs
        aria-label="Own tabs"
        items={[
          { value: 'welcome', label: 'Welcome', closable: false },
          {
            value: 'src/index.ts',
            label: (
              <>
                <span data-testid="folder">src/</span>index.ts
              </>
            ),
            textValue: 'index.ts',
            end: <span data-testid="modified">●</span>,
            itemProps: { className: 'own-tab', 'data-testid': 'index-tab' },
          },
          {
            value: 'lib/util.ts',
            label: (
              <>
                <b>lib/</b>util.ts
              </>
            ),
          },
        ]}
        value="welcome"
        onValueChange={() => undefined}
        onClose={(id) => closed.push(id)}
        contextMenu={(tab) => {
          menuFor.push(tab?.value ?? null);
          return <Menu.Item>Copy path</Menu.Item>;
        }}
      />
    </Theme>,
  );
  try {
    const strip = page.getByRole('tablist', { name: 'Own tabs' });
    const welcome = strip.getByRole('tab', { name: 'Welcome', exact: true });
    const index = strip.getByRole('tab', { name: 'index.ts', exact: true });
    await expect.element(index).toBeInTheDocument();
    const indexElement = index.element();
    expect(
      indexElement.querySelector('.env-document-tabs-tab-label [data-testid="folder"]'),
    ).not.toBeNull();
    expect(
      indexElement.querySelector('.env-document-tabs-tab-end [data-testid="modified"]'),
    ).not.toBeNull();
    expect(
      indexElement.closest('.env-document-tabs-item')!.querySelector('.env-document-tabs-close'),
    ).not.toBeNull();
    await expect
      .element(page.getByTestId('index-tab'))
      .toHaveClass('env-document-tabs-item', 'own-tab');
    expect(indexElement.closest('[data-testid="index-tab"]')).not.toBeNull();
    const util = strip.getByRole('tab', { name: 'lib/util.ts', exact: true });
    await expect.element(util).toHaveAttribute('title', 'lib/util.ts');
    expect(
      util
        .element()
        .closest('.env-document-tabs-item')!
        .querySelector('.env-document-tabs-close')!
        .getAttribute('title'),
    ).toBe('Close lib/util.ts');
    const welcomeItem = welcome.element().closest('.env-document-tabs-item')!;
    expect(welcomeItem.querySelector('.env-document-tabs-close')).toBeNull();
    expect(welcome.element().hasAttribute('aria-keyshortcuts')).toBe(false);

    focus(welcome);
    await keyboard.press('Delete');
    await mouse.click(box(welcome.element()).x + 8, box(welcome.element()).y + 8, {
      button: 'middle',
    });
    expect(closed).toEqual([]);

    const menu = page.getByRole('menu', { name: 'Tab actions' });
    const items = menu.getByRole('menuitem');
    await welcome.click({ button: 'right' });
    await expect.poll(() => texts(items)).toEqual(['Copy path']);
    expect(menu.element().querySelector('[role="separator"]')).toBeNull();
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);

    await index.click({ button: 'right' });
    await expect.poll(() => texts(items)).toEqual(['Close index.ts', 'Copy path']);
    expect(menu.element().querySelector('[role="separator"]')).not.toBeNull();
    expect(menuFor).toContain('welcome');
    expect(menuFor.at(-1)).toBe('src/index.ts');
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);
  } finally {
    root.unmount();
    host.remove();
  }
});
