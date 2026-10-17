import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { openServerMarkup } from './ServerMarkup';

const fixture = `${fixtureUrl}/?fixture=split-panes`;

/** Drags a handle from its centre by dx and dy pixels, in steps, as a person would. */
async function drag(page: Page, handle: Locator, dx: number, dy = 0) {
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

test.describe('SplitPane', () => {
  test('is a named window splitter that controls the first pane', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Persisted' });
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAttribute('aria-valuenow', '40');
    await expect(handle).toHaveAttribute('aria-valuemin', '20');
    await expect(handle).toHaveAttribute('aria-valuemax', '80');
    const list = page.getByRole('region', { name: 'Persisted list' });
    await expect(page.getByRole('region', { name: 'Persisted detail' })).toBeVisible();
    await expect(handle).toHaveAttribute('aria-controls', (await list.getAttribute('id'))!);
    // The first pane takes its share of the root's width.
    expect((await list.boundingBox())!.width).toBeCloseTo(240, 0);
  });

  test('moves with the arrow keys, Shift, Home and End', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Persisted' });
    const size = page.getByTestId('persisted-size');
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '42');
    await expect(size).toHaveText('42 committed');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '32');
    await page.keyboard.press('Home');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '20');
    await page.keyboard.press('End');
    await expect(handle).toHaveAttribute('aria-valuenow', '80');
    // A vertical split pane's handle moves with the up and down arrows.
    const vertical = page.getByRole('separator', { name: 'Resize Vertical' });
    await expect(vertical).toHaveAttribute('aria-orientation', 'horizontal');
    await vertical.focus();
    await page.keyboard.press('ArrowDown');
    await expect(vertical).toHaveAttribute('aria-valuenow', '52');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(vertical).toHaveAttribute('aria-valuenow', '48');
  });

  test('follows the pointer, horizontally and vertically', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Persisted' });
    const size = page.getByTestId('persisted-size');
    // 60 px of a 600 px split pane is 10 percent.
    await drag(page, handle, 60);
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await expect(size).toHaveText('50 committed');
    const list = page.getByRole('region', { name: 'Persisted list' });
    expect((await list.boundingBox())!.width).toBeCloseTo(300, 0);
    const vertical = page.getByRole('separator', { name: 'Resize Vertical' });
    await drag(page, vertical, 0, -40);
    await expect(vertical).toHaveAttribute('aria-valuenow', '40');
  });

  test('keeps the chosen size under its key and forgets it on a double click', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Persisted' });
    await handle.focus();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    expect(await page.evaluate(() => localStorage.getItem('fixture.split'))).toBe('50');
    await page.reload();
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await handle.dblclick();
    await expect(handle).toHaveAttribute('aria-valuenow', '40');
    expect(await page.evaluate(() => localStorage.getItem('fixture.split'))).toBeNull();
    await page.reload();
    await expect(handle).toHaveAttribute('aria-valuenow', '40');
  });

  test('sizes in rem, its value the first pane’s share of the root', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Rem' });
    const size = page.getByTestId('rem-size');
    // 12 rem of a 640 px split pane is 30 percent.
    await expect(handle).toHaveAttribute('aria-valuenow', '30');
    await expect(handle).toHaveAttribute('aria-valuetext', '30%, 12 rem');
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect(size).toHaveText('13 committed');
    await drag(page, handle, 32);
    await expect(size).toHaveText('15 committed');
    const list = page.getByRole('region', { name: 'Rem list' });
    expect((await list.boundingBox())!.width).toBeCloseTo(240, 0);
    await handle.focus();
    await page.keyboard.press('End');
    await expect(size).toHaveText('20 committed');
    // In a split pane narrower than the size, the first pane leaves room for the handle.
    const root = page.getByTestId('rem');
    await root.evaluate((element) => (element.style.inlineSize = '200px'));
    await expect.poll(async () => (await list.boundingBox())!.width).toBeCloseTo(192, 0);
    const box = (await root.boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    expect(handleBox.x + handleBox.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
  });

  test('follows the reading direction in right-to-left text', async ({ page }) => {
    await page.goto(fixture);
    const handle = page.getByRole('separator', { name: 'Resize Right to left' });
    const list = page.getByRole('region', { name: 'Right to left list' });
    const detail = page.getByRole('region', { name: 'Right to left detail' });
    // The first pane is at the inline start, on the right.
    expect((await list.boundingBox())!.x).toBeGreaterThan((await detail.boundingBox())!.x);
    await handle.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(handle).toHaveAttribute('aria-valuenow', '52');
    await drag(page, handle, -60);
    await expect(handle).toHaveAttribute('aria-valuenow', '62');
  });

  test('stacks below its own stackBelow width, without the handle', async ({ page }) => {
    await page.goto(fixture);
    const root = page.getByTestId('stacking');
    const handle = page.getByRole('separator', { name: 'Resize Stacking' });
    await expect(root).not.toHaveAttribute('data-stacked');
    await expect(handle).toBeVisible();
    await page.getByRole('button', { name: 'Narrow container' }).click();
    await expect(root).toHaveAttribute('data-stacked', '');
    await expect(handle).toHaveCount(0);
    await expect(page.getByTestId('stacked')).toHaveText('stacked');
    const list = (await page.getByRole('region', { name: 'Stacking list' }).boundingBox())!;
    const detail = (await page.getByRole('region', { name: 'Stacking detail' }).boundingBox())!;
    expect(detail.y).toBeGreaterThanOrEqual(list.y + list.height);
    await page.getByRole('button', { name: 'Wide container' }).click();
    await expect(root).not.toHaveAttribute('data-stacked');
    await expect(handle).toBeVisible();
    await expect(page.getByTestId('stacked')).toHaveText('side by side');
  });

  test.describe('server-rendered', () => {
    test.use({ javaScriptEnabled: false });

    test('stacks below stackBelow from the server markup, without the handle', async ({ page }) => {
      await openServerMarkup(
        page,
        `import {createElement as h} from 'react';
        import {SplitPane} from '@envsemble/envui';
        export const element = h(SplitPane.Root, {stackBelow: 600},
          h(SplitPane.Pane, {label: 'First'}, 'First pane'),
          h(SplitPane.ResizeHandle, {label: 'Resize'}),
          h(SplitPane.Pane, {label: 'Second'}, 'Second pane'));`,
      );
      const first = page.getByRole('region', { name: 'First' });
      const second = page.getByRole('region', { name: 'Second' });
      const handle = page.getByRole('separator', { name: 'Resize' });
      await page.setViewportSize({ width: 800, height: 600 });
      await expect(handle).toBeVisible();
      expect((await second.boundingBox())!.x).toBeGreaterThan((await first.boundingBox())!.x);
      await page.setViewportSize({ width: 500, height: 600 });
      await expect(handle).toBeHidden();
      const top = (await first.boundingBox())!;
      const below = (await second.boundingBox())!;
      expect(below.y).toBeGreaterThanOrEqual(top.y + top.height);
      expect(below.width).toBeCloseTo(top.width, 0);
      await expect(second).toHaveCSS('border-top-style', 'solid');
    });
  });
});
