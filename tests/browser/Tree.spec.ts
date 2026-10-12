import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const treeFixture = `${fixtureUrl}/?fixture=tree`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** The id of the row the tree's aria-activedescendant points at. */
function activeRowId(page: Page, theme = 'light') {
  return page
    .getByRole('tree', { name: `Files ${theme}` })
    .evaluate(
      (tree) =>
        document.getElementById(tree.getAttribute('aria-activedescendant') ?? '')?.dataset.id ??
        null,
    );
}

function lastLog(page: Page, theme = 'light') {
  return page
    .getByTestId(`tree-log-${theme}`)
    .evaluate((output) => output.textContent!.split('\n').at(-1));
}

test.describe('Tree', () => {
  test('pointer opens, previews and expands rows through the callbacks', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(treeFixture);
    const tree = page.getByRole('tree', { name: 'Files light' });
    await expect(tree.getByRole('treeitem', { name: 'Folder 01' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const doc = tree.getByRole('treeitem', { name: 'Doc 1.md' }).first();
    await expect(doc).toHaveAttribute('aria-level', '2');
    await expect(doc).toHaveAttribute('data-id', 'folder-1/doc-1.md');
    await doc.click();
    await expect.poll(() => lastLog(page)).toBe('preview folder-1/doc-1.md');
    await expect(doc).toHaveAttribute('aria-selected', 'true');
    await expect(tree).toBeFocused();
    await doc.dblclick();
    await expect.poll(() => lastLog(page)).toBe('open folder-1/doc-1.md');

    const nested = tree.getByRole('treeitem', { name: 'Nested' });
    await nested.locator('.env-tree-chevron').click();
    await expect.poll(() => lastLog(page)).toBe('expand folder-1/nested');
    await expect(nested).toHaveAttribute('aria-expanded', 'true');
    await expect(tree.getByRole('treeitem', { name: 'Deep.md' })).toHaveAttribute(
      'aria-level',
      '3',
    );
    // A disabled row neither previews nor opens.
    await tree.locator('[data-id="folder-1/doc-6.md"]').click({ force: true });
    await expect.poll(() => lastLog(page)).toBe('expand folder-1/nested');
    expect(errors).toEqual([]);
  });

  test('the keyboard moves the active row, expands, collapses and opens', async ({ page }) => {
    await page.goto(treeFixture);
    const tree = page.getByRole('tree', { name: 'Files light' });
    await tree.focus();
    await expect.poll(() => activeRowId(page)).toBe('folder-1');
    // The active row shows a focus ring only with keyboard focus.
    const ring = () =>
      tree.locator('[data-active]').evaluate((row) => getComputedStyle(row).outlineStyle);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => activeRowId(page)).toBe('folder-1/nested');
    await expect.poll(ring).toBe('solid');

    await page.keyboard.press('ArrowRight');
    await expect.poll(() => lastLog(page)).toBe('expand folder-1/nested');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => activeRowId(page)).toBe('folder-1/nested/deep.md');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => activeRowId(page)).toBe('folder-1/nested');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => lastLog(page)).toBe('collapse folder-1/nested');
    await expect(tree.getByRole('treeitem', { name: 'Deep.md' })).toHaveCount(0);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect.poll(() => lastLog(page)).toBe('open folder-1/doc-1.md');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press(' ');
    await expect.poll(() => lastLog(page)).toBe('preview folder-1/doc-2.md');
    await expect(tree.locator('[data-id="folder-1/doc-2.md"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page.keyboard.press('PageDown');
    const paged = await activeRowId(page);
    expect(paged).not.toBe('folder-1/doc-2.md');
    await page.keyboard.press('PageUp');
    await expect.poll(() => activeRowId(page)).toBe('folder-1/doc-2.md');

    await page.keyboard.press('End');
    await expect.poll(() => activeRowId(page)).toBe('folder-40');
    await page.keyboard.press('Home');
    await expect.poll(() => activeRowId(page)).toBe('folder-1');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => lastLog(page)).toBe('collapse folder-1');

    // Type-ahead moves to the next row starting with the typed text; a repeated letter cycles.
    await page.keyboard.press('f');
    await expect.poll(() => activeRowId(page)).toBe('folder-2');
    await page.keyboard.press('f');
    await expect.poll(() => activeRowId(page)).toBe('folder-3');
    await page.waitForTimeout(700);
    await page.keyboard.type('doc 1');
    await expect.poll(() => activeRowId(page)).toBe('folder-2/doc-1.md');

    await tree.locator('[data-id="folder-2"]').click({ position: { x: 4, y: 4 } });
    await expect.poll(ring).toBe('none');
  });

  test('only rows in view are rendered, and a new selection scrolls into view', async ({
    page,
  }) => {
    await page.goto(treeFixture);
    const scope = page.getByTestId('tree-light');
    const tree = page.getByRole('tree', { name: 'Files light' });
    await scope.getByRole('button', { name: 'Expand all' }).click();
    await expect(tree.getByRole('treeitem', { name: 'Deep.md' })).toBeVisible();
    const count = () => tree.getByRole('treeitem').count();
    expect(await count()).toBeLessThan(60);
    const setSize = await tree
      .getByRole('treeitem', { name: 'Folder 01' })
      .getAttribute('aria-setsize');
    expect(setSize).toBe('40');

    await tree.focus();
    await page.keyboard.press('End');
    await expect.poll(() => activeRowId(page)).toBe('folder-40/doc-30.md');
    const last = tree.locator('[data-id="folder-40/doc-30.md"]');
    await expect(last).toBeInViewport();
    expect(await count()).toBeLessThan(60);
    expect(await tree.evaluate((element) => element.scrollTop)).toBeGreaterThan(30000);

    await scope.getByRole('button', { name: 'Select a distant document' }).click();
    const distant = tree.locator('[data-id="folder-2/doc-25.md"]');
    await expect(distant).toHaveAttribute('aria-selected', 'true');
    await expect(distant).toBeInViewport();
    expect(await count()).toBeLessThan(60);
  });

  test('the context menu opens for a row, the active row and the empty area', async ({ page }) => {
    await page.goto(treeFixture);
    const tree = page.getByRole('tree', { name: 'Files light' });
    await tree.getByRole('treeitem', { name: 'Doc 3.md' }).first().click({ button: 'right' });
    const menu = page.getByRole('menu', { name: 'Actions' });
    await expect(menu.getByRole('menuitem', { name: 'Rename Doc 3.md' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(tree).toBeFocused();
    await expect.poll(() => activeRowId(page)).toBe('folder-1/doc-3.md');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Shift+F10');
    await page.getByRole('menuitem', { name: 'Rename Doc 4.md' }).click();
    await expect.poll(() => lastLog(page)).toBe('rename folder-1/doc-4.md');

    const box = (await tree.boundingBox())!;
    await page.mouse.click(box.x + 2, box.y + box.height - 4, { button: 'right' });
    await page.getByRole('menuitem', { name: 'New file' }).click();
    await expect.poll(() => lastLog(page)).toBe('new file');
  });

  test('dark rows keep readable selection and icon colors', async ({ page }) => {
    await page.goto(treeFixture);
    const tree = page.getByRole('tree', { name: 'Files dark' });
    const row = tree.getByRole('treeitem', { name: 'Doc 2.md' }).first();
    await row.click();
    await expect(row).toHaveAttribute('aria-selected', 'true');
    const colors = await row.evaluate((element) => ({
      text: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
    }));
    expect(colors.text).not.toBe(colors.background);
    await expect.poll(() => lastLog(page, 'dark')).toBe('preview folder-1/doc-2.md');
  });
});
