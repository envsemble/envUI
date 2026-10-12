import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const resizableShell = `${fixtureUrl}/?fixture=resizable-shell`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.describe('Resizable AppShell', () => {
  test('the sidebar edge resizes with the pointer and the keyboard and remembers the width', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(resizableShell);
    const sidebar = page.locator('.env-app-sidebar');
    const context = page.locator('.env-app-topbar-context');
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuemin', '192');
    await expect(handle).toHaveAttribute('aria-valuemax', '512');
    const start = Number(await handle.getAttribute('aria-valuenow'));
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(start, 0);

    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 300, { steps: 4 });
    await expect(page.locator('.env-app-shell')).toHaveAttribute('data-resizing', '');
    await page.mouse.up();
    await expect(page.locator('.env-app-shell')).not.toHaveAttribute('data-resizing');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 60));
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(start + 60, 0);
    await expect.poll(async () => (await context.boundingBox())!.width).toBeCloseTo(start + 60, 0);
    expect(
      await page.evaluate(() => localStorage.getItem('fixture-resizable-sidebar-chosen-width')),
    ).toBe(String(start + 60));
    await expect(page.getByTestId('width-changes')).toContainText(String(start + 60));

    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 44));
    await page.keyboard.press('Shift+ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', String(start + 92));
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '512');
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(512, 0);
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '192');

    // Dragging past a bound stops at it.
    await page.keyboard.press('ArrowRight');
    // Keyboard steps ease into place; take the edge position once it settles.
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(208, 0);
    const edge = (await handle.boundingBox())!;
    await page.mouse.move(edge.x + edge.width / 2, edge.y + 200);
    await page.mouse.down();
    await page.mouse.move(edge.x - 200, edge.y + 200, { steps: 4 });
    await page.mouse.up();
    await expect(handle).toHaveAttribute('aria-valuenow', '192');

    await page.keyboard.press('Shift+ArrowRight');
    await page.reload();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute(
      'aria-valuenow',
      '240',
    );
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(240, 0);
    // Measuring the content after a reload never replaces the chosen width.
    await page.reload();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute(
      'aria-valuenow',
      '240',
    );

    // A collapsed sidebar cannot be resized and hides the sidebar content.
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(page.getByRole('separator', { name: 'Resize sidebar' })).toHaveCount(0);
    await expect(page.getByTestId('sidebar-list')).toBeHidden();
    await page.mouse.move(900, 500);
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    await expect.poll(async () => (await sidebar.boundingBox())!.width).toBeCloseTo(240, 0);
    expect(errors).toEqual([]);
  });

  test('an application shortcut compacts the sidebar even while it holds focus', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto(resizableShell);
    const shell = page.locator('.env-app-shell');
    const handle = page.getByRole('separator', { name: 'Resize sidebar' });
    await page.mouse.move(900, 500);

    // From the resize handle, which a compact sidebar removes.
    await handle.focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await expect(handle).toHaveCount(0);

    // From a navigation item, which keeps focus on its icon.
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).not.toHaveAttribute('data-compact');
    const documents = page.getByRole('button', { name: 'Documents' });
    await documents.focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await expect(documents).toBeFocused();
    // Focus moving within the sidebar afterwards expands it again.
    await page.getByRole('button', { name: 'Search' }).focus();
    await expect(shell).not.toHaveAttribute('data-compact');

    // With the pointer over the sidebar too, until the pointer leaves and comes back.
    await page.keyboard.press('Alt+KeyB');
    const box = (await page.getByRole('button', { name: 'Search' }).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(shell).not.toHaveAttribute('data-compact');
    await page.getByRole('button', { name: 'Documents' }).focus();
    await page.keyboard.press('Alt+KeyB');
    await expect(shell).toHaveAttribute('data-compact', '');
    await page.mouse.move(900, 500);
    const compact = (await page.locator('.env-app-sidebar').boundingBox())!;
    await page.mouse.move(compact.x + compact.width / 2, box.y + box.height / 2);
    await expect(shell).not.toHaveAttribute('data-compact');
    expect(errors).toEqual([]);
  });

  test('sidebar content fills the height below the navigation and scrolls on its own', async ({
    page,
  }) => {
    await page.goto(resizableShell);
    const list = page.getByTestId('sidebar-list');
    const navigation = page.getByRole('navigation', { name: 'Resizable navigation' });
    const viewport = page.viewportSize()!;
    const listBox = (await list.boundingBox())!;
    const navigationBox = (await navigation.boundingBox())!;
    expect(listBox.y).toBeCloseTo(navigationBox.y + navigationBox.height, 0);
    expect(listBox.y + listBox.height).toBeCloseTo(viewport.height, 0);
    const navigationHeight = navigationBox.height;

    await list.hover();
    await page.mouse.wheel(0, 600);
    await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect((await navigation.boundingBox())!.height).toBeCloseTo(navigationHeight, 0);
  });

  test('page content can stick below the topbar while the document scrolls', async ({ page }) => {
    await page.goto(resizableShell);
    const header = page.getByTestId('sticky-header');
    const topbar = (await page.locator('.env-app-topbar').boundingBox())!;
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    expect((await header.boundingBox())!.y).toBeCloseTo(topbar.height, 0);
  });
});
