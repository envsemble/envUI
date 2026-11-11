import { createElement as h } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, onTestFinished, test } from 'vitest';
import { page } from 'vitest/browser';
import { Theme, Tree } from '@envsemble/envui';
import * as fixture from '../fixture/Tree.fixture.tsx';
import { box, css, keyboard, mouse, nextFrames, shown, viewportRatio } from './Browser.ts';
import { mount } from './Mount.tsx';

const treeOf = (theme = 'light') => page.getByRole('tree', { name: `Files ${theme}` });

/** The id of the row the tree's aria-activedescendant points at. */
const activeRowId =
  (theme = 'light') =>
  () =>
    document.getElementById(treeOf(theme).element().getAttribute('aria-activedescendant') ?? '')
      ?.dataset.id ?? null;

const lastLog =
  (theme = 'light') =>
  () =>
    page.getByTestId(`tree-log-${theme}`).element().textContent!.split('\n').at(-1);

const row = (id: string) => treeOf().element().querySelector<HTMLElement>(`[data-id="${id}"]`);

describe('Tree', () => {
  test('pointer opens, previews and expands rows through the callbacks', async () => {
    mount(fixture);
    const tree = treeOf();
    await expect
      .element(tree.getByRole('treeitem', { name: 'Folder 01' }))
      .toHaveAttribute('aria-expanded', 'true');
    const doc = page.elementLocator(
      tree.getByRole('treeitem', { name: 'Doc 1.md' }).elements()[0]!,
    );
    await expect.element(doc).toHaveAttribute('aria-level', '2');
    await expect.element(doc).toHaveAttribute('data-id', 'folder-1/doc-1.md');
    await doc.click();
    await expect.poll(lastLog()).toBe('preview folder-1/doc-1.md');
    await expect.element(doc).toHaveAttribute('aria-selected', 'true');
    await expect.element(tree).toHaveFocus();
    await doc.dblClick();
    await expect.poll(lastLog()).toBe('open folder-1/doc-1.md');

    const nested = tree.getByRole('treeitem', { name: 'Nested' });
    await page.elementLocator(nested.element().querySelector('.env-tree-chevron')!).click();
    await expect.poll(lastLog()).toBe('expand folder-1/nested');
    await expect.element(nested).toHaveAttribute('aria-expanded', 'true');
    await expect
      .element(tree.getByRole('treeitem', { name: 'Deep.md' }))
      .toHaveAttribute('aria-level', '3');
    // A disabled row neither previews nor opens. The rows below Nested slide down as it opens: wait
    // for them to hold still, so the press lands on the disabled row.
    await Promise.all(
      tree
        .element()
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    );
    await page.elementLocator(row('folder-1/doc-6.md')!).click({ force: true });
    await expect.poll(lastLog()).toBe('expand folder-1/nested');
  });

  test('the keyboard moves the active row, expands, collapses and opens, and leaves keys with Alt, Ctrl or ⌘ to the application', async () => {
    mount(fixture);
    const tree = treeOf();
    const active = activeRowId();
    (tree.element() as HTMLElement).focus();
    await expect.poll(active).toBe('folder-1');
    // The application hears each key with Alt, Ctrl or ⌘ unhandled, and takes it so the browser
    // does not go back.
    const applicationKeys: boolean[] = [];
    const onKey = (event: KeyboardEvent) => {
      if (!event.key.startsWith('Arrow')) return;
      applicationKeys.push(event.defaultPrevented);
      event.preventDefault();
    };
    addEventListener('keydown', onKey);
    onTestFinished(() => removeEventListener('keydown', onKey));
    await keyboard.press('Alt+ArrowLeft');
    await keyboard.press('Control+ArrowDown');
    await keyboard.press('Meta+ArrowRight');
    expect(applicationKeys).toEqual([false, false, false]);
    await expect
      .element(tree.getByRole('treeitem', { name: 'Folder 01' }))
      .toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('folder-1');

    // Without them, the tree takes its keys again. The active row shows a focus ring only with
    // keyboard focus.
    const ring = () => css(tree.element().querySelector('[data-highlighted]')!, 'outline-style');
    await keyboard.press('ArrowDown');
    await expect.poll(active).toBe('folder-1/nested');
    expect(applicationKeys).toEqual([false, false, false, true]);
    removeEventListener('keydown', onKey);
    await expect.poll(ring).toBe('solid');

    await keyboard.press('ArrowRight');
    await expect.poll(lastLog()).toBe('expand folder-1/nested');
    await keyboard.press('ArrowRight');
    await expect.poll(active).toBe('folder-1/nested/deep.md');
    await keyboard.press('ArrowLeft');
    await expect.poll(active).toBe('folder-1/nested');
    await keyboard.press('ArrowLeft');
    await expect.poll(lastLog()).toBe('collapse folder-1/nested');
    await expect.poll(() => tree.getByRole('treeitem', { name: 'Deep.md' }).query()).toBeNull();

    await keyboard.press('ArrowDown');
    await keyboard.press('Enter');
    await expect.poll(lastLog()).toBe('open folder-1/doc-1.md');
    await keyboard.press('ArrowDown');
    await keyboard.press(' ');
    await expect.poll(lastLog()).toBe('preview folder-1/doc-2.md');
    await expect.poll(() => row('folder-1/doc-2.md')?.getAttribute('aria-selected')).toBe('true');

    await keyboard.press('PageDown');
    expect(active()).not.toBe('folder-1/doc-2.md');
    await keyboard.press('PageUp');
    await expect.poll(active).toBe('folder-1/doc-2.md');

    await keyboard.press('End');
    await expect.poll(active).toBe('folder-40');
    await keyboard.press('Home');
    await expect.poll(active).toBe('folder-1');
    await keyboard.press('ArrowLeft');
    await expect.poll(lastLog()).toBe('collapse folder-1');

    // Type-ahead moves to the next row starting with the typed text; a repeated letter cycles.
    await keyboard.press('f');
    await expect.poll(active).toBe('folder-2');
    await keyboard.press('f');
    await expect.poll(active).toBe('folder-3');
    // Past the type-ahead's pause, the next letters start a new search.
    await new Promise((resolve) => setTimeout(resolve, 800));
    await keyboard.type('doc 1');
    await expect.poll(active).toBe('folder-2/doc-1.md');

    const folder = box(row('folder-2')!);
    await mouse.click(folder.x + 4, folder.y + 4);
    await expect.poll(ring).toBe('none');
  });

  test(
    'only rows in view are rendered, and a new selection scrolls into view',
    { tags: ['engines'] },
    async () => {
      mount(fixture);
      const scope = page.getByTestId('tree-light');
      const tree = treeOf();
      await scope.getByRole('button', { name: 'Expand all' }).click();
      await expect.poll(() => shown(tree.getByRole('treeitem', { name: 'Deep.md' }))).toBe(true);
      const count = () => tree.getByRole('treeitem').elements().length;
      expect(count()).toBeLessThan(60);
      await expect
        .element(tree.getByRole('treeitem', { name: 'Folder 01' }))
        .toHaveAttribute('aria-setsize', '40');

      (tree.element() as HTMLElement).focus();
      await keyboard.press('End');
      await expect.poll(activeRowId()).toBe('folder-40/doc-30.md');
      await expect.poll(() => viewportRatio(row('folder-40/doc-30.md')!)).toBeGreaterThan(0);
      expect(count()).toBeLessThan(60);
      expect(tree.element().scrollTop).toBeGreaterThan(30000);

      await scope.getByRole('button', { name: 'Select a distant document' }).click();
      await expect
        .poll(() => row('folder-2/doc-25.md')?.getAttribute('aria-selected'))
        .toBe('true');
      await expect.poll(() => viewportRatio(row('folder-2/doc-25.md')!)).toBeGreaterThan(0);
      expect(count()).toBeLessThan(60);
    },
  );

  test('rows keep their layout height while an ancestor is scaled', async () => {
    mount(fixture);
    const tree = treeOf().element() as HTMLElement;
    await expect.poll(() => tree.querySelector('[role="treeitem"]')).not.toBeNull();
    // Scaled down, as inside a dialog that scales in; a resize makes the tree measure again.
    tree.parentElement!.style.transform = 'scale(0.5)';
    tree.style.blockSize = `${tree.clientHeight - 20}px`;
    await nextFrames();
    const rows = [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')].slice(0, 3);
    const offset = (element: HTMLElement) => new DOMMatrix(css(element, 'transform')).m42;
    const height = Number.parseFloat(css(rows[0]!, 'block-size'));
    expect([offset(rows[1]!) - offset(rows[0]!), offset(rows[2]!) - offset(rows[1]!)]).toEqual([
      height,
      height,
    ]);
  });

  test('the context menu opens for a row, the active row and the empty area', async () => {
    mount(fixture);
    const tree = treeOf();
    await page
      .elementLocator(tree.getByRole('treeitem', { name: 'Doc 3.md' }).elements()[0]!)
      .click({ button: 'right' });
    const menu = page.getByRole('menu', { name: 'Actions' });
    await expect
      .poll(() => shown(menu.getByRole('menuitem', { name: 'Rename Doc 3.md' })))
      .toBe(true);
    await keyboard.press('Escape');
    await expect.poll(() => shown(menu)).toBe(false);
    await expect.element(tree).toHaveFocus();
    await expect.poll(activeRowId()).toBe('folder-1/doc-3.md');

    await keyboard.press('ArrowDown');
    await keyboard.press('Shift+F10');
    await page.getByRole('menuitem', { name: 'Rename Doc 4.md' }).click();
    await expect.poll(lastLog()).toBe('rename folder-1/doc-4.md');

    const area = box(tree);
    await mouse.click(area.x + 2, area.y + area.height - 4, { button: 'right' });
    await page.getByRole('menuitem', { name: 'New file' }).click();
    await expect.poll(lastLog()).toBe('new file');
  });
});

test('a tree renders a tall pane of rows before it measures, and fills its viewport once it has', async () => {
  const items = Array.from({ length: 100 }, (_, index) => ({
    value: `n${index}`,
    depth: 0,
    label: `Node ${index}`,
  }));
  const element = h(
    Theme,
    { theme: 'light' },
    h(
      'div',
      { style: { blockSize: '20rem', display: 'grid' } },
      h(Tree, { 'aria-label': 'Files', items, onAction: () => {}, onExpandedChange: () => {} }),
    ),
  );
  // The markup a server sends, in the page before any script runs.
  const container = document.createElement('div');
  container.innerHTML = renderToString(element);
  document.body.append(container);
  const rows = () => container.querySelectorAll('.env-tree-item').length;
  // 24 rows and the overscan of 8 below them, before any script runs.
  expect(rows()).toBe(33);
  const errors: string[] = [];
  const root = hydrateRoot(container, element, {
    onRecoverableError: (error) => errors.push(String(error)),
  });
  onTestFinished(() => {
    root.unmount();
    container.remove();
  });
  // Measured, a 20 rem viewport needs fewer rows than that: the rows in view and the overscan.
  await expect.poll(rows).toBeLessThan(33);
  expect(errors).toEqual([]);
  expect(shown(page.elementLocator(container.querySelector('.env-tree-item')!))).toBe(true);
});
