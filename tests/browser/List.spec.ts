import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const lists = `${fixtureUrl}/?fixture=lists`;

/** The live region the first reorderable list announces through. */
const announcer = (page: Page) => page.locator('.env-list-announcer').first();

/** The centre of an element. */
async function centre(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.describe('List', () => {
  test('moves a row by keyboard from its handle, announcing each step', async ({ page }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides');
    const order = page.getByTestId('slides-order');
    const handle = list.getByRole('button', { name: 'Reorder Intro' });
    await expect(handle).toBeVisible();

    // Space lifts the row; ↓ moves it, and the others make room; Space drops it.
    await handle.focus();
    await page.keyboard.press('Space');
    await expect(announcer(page)).toHaveText(/^Intro picked up, position 1 of 4\./);
    await expect(announcer(page)).toHaveAttribute('role', 'status');
    await expect(list.getByRole('listitem').first()).toHaveAttribute('data-moving', 'keyboard');
    await page.keyboard.press('ArrowDown');
    await expect(announcer(page)).toHaveText('Intro moved to position 2 of 4.');
    await page.keyboard.press('ArrowDown');
    await expect(announcer(page)).toHaveText('Intro moved to position 3 of 4.');
    // Nothing moves until the drop.
    await expect(order).toHaveText('Intro,Roadmap,Budget,Questions');
    await page.keyboard.press('Space');
    await expect(order).toHaveText('Roadmap,Budget,Intro,Questions');
    await expect(announcer(page)).toHaveText('Intro dropped at position 3 of 4.');
    // Focus stays on the handle of the row that moved, and the rows are at rest.
    await expect(handle).toBeFocused();
    await expect(list.locator('[data-moving]')).toHaveCount(0);
    await expect(list.getByRole('listitem').nth(2)).toHaveCSS('translate', 'none');

    // Escape puts a lifted row back where it was.
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(announcer(page)).toHaveText('Intro moved to position 1 of 4.');
    await page.keyboard.press('Escape');
    await expect(announcer(page)).toHaveText('Move cancelled. Intro is back at position 3 of 4.');
    await expect(order).toHaveText('Roadmap,Budget,Intro,Questions');
    await expect(handle).toBeFocused();
  });

  test('Alt+↑ and Alt+↓ on a row target move it one place at once', async ({ page }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides');
    const order = page.getByTestId('slides-order');
    const link = list.getByRole('link', { name: 'Budget' });
    await link.focus();
    await page.keyboard.press('Alt+ArrowUp');
    await expect(order).toHaveText('Intro,Budget,Roadmap,Questions');
    await expect(announcer(page)).toHaveText('Budget moved to position 2 of 4.');
    await expect(link).toBeFocused();
    await page.keyboard.press('Alt+ArrowUp');
    await page.keyboard.press('Alt+ArrowUp');
    // The first place is as far as it goes.
    await expect(order).toHaveText('Budget,Intro,Roadmap,Questions');
    await page.keyboard.press('Alt+ArrowDown');
    await expect(order).toHaveText('Intro,Budget,Roadmap,Questions');
  });

  test('drags a row by its handle with the pointer', async ({ page }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides');
    const order = page.getByTestId('slides-order');
    const rows = list.getByRole('listitem');
    const from = await centre(list.getByRole('button', { name: 'Reorder Roadmap' }));
    const target = await centre(rows.nth(3));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // A press that doesn't move is no drag.
    await expect(rows.nth(1)).not.toHaveAttribute('data-moving');
    const steps = 8;
    for (let step = 1; step <= steps; step++)
      await page.mouse.move(from.x, from.y + ((target.y + 4 - from.y) * step) / steps);
    await expect(rows.nth(1)).toHaveAttribute('data-moving', 'pointer');
    // The row follows the pointer, the rows it passed make room, and the move is announced.
    await expect(announcer(page)).toHaveText('Roadmap moved to position 4 of 4.');
    const roadmap = (await rows.nth(1).boundingBox())!;
    expect(Math.abs(roadmap.y + roadmap.height / 2 - (target.y + 4))).toBeLessThan(2);
    await page.mouse.up();
    await expect(order).toHaveText('Intro,Budget,Questions,Roadmap');
    await expect(announcer(page)).toHaveText('Roadmap dropped at position 4 of 4.');
    await expect(list.locator('[data-moving]')).toHaveCount(0);

    // A press on the handle without moving changes nothing.
    const handle = list.getByRole('button', { name: 'Reorder Intro' });
    await handle.click();
    await expect(order).toHaveText('Intro,Budget,Questions,Roadmap');
  });

  test('marks the current row on its target and takes the selected fill', async ({ page }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides');
    const roadmap = list.getByRole('link', { name: 'Roadmap' });
    await expect(roadmap).toHaveAttribute('aria-current', 'true');
    await expect(list.locator('[aria-current]')).toHaveCount(1);
    const fill = (locator: Locator) =>
      locator.evaluate((element) => getComputedStyle(element).backgroundColor);
    const selected = await fill(list.getByRole('listitem').nth(1));
    expect(selected).not.toBe(await fill(list.getByRole('listitem').nth(0)));
    // Choosing another row moves the mark and the fill.
    await list.getByRole('link', { name: 'Budget' }).click();
    await expect(list.getByRole('link', { name: 'Budget' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(roadmap).not.toHaveAttribute('aria-current');
    // Away from the row, once its fill has settled from the hover.
    await page.mouse.move(0, 0);
    await expect.poll(() => fill(list.getByRole('listitem').nth(2))).toBe(selected);

    // A checked checkbox in the start slot gives its row the same fill.
    const reviewers = page.getByRole('list', { name: 'Reviewers' }).getByRole('listitem');
    expect(await fill(reviewers.nth(1))).toBe(selected);
    expect(await fill(reviewers.nth(0))).not.toBe(selected);
    await page.getByRole('checkbox', { name: 'Choose Alex Morgan' }).check();
    expect(await fill(reviewers.nth(0))).toBe(selected);

    // The start slot sits before the label.
    const people = page.getByRole('list', { name: 'People' }).getByRole('listitem').first();
    const avatar = (await people.locator('.env-avatar').boundingBox())!;
    const label = (await people.locator('.env-list-item-content').boundingBox())!;
    expect(avatar.x + avatar.width).toBeLessThanOrEqual(label.x);
  });

  test('in right-to-left text the handle leads at the right and the keys move the same way', async ({
    page,
  }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides-rtl');
    const handle = list.getByRole('button', { name: 'Reorder Intro' });
    const row = (await list.getByRole('listitem').first().boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    expect(handleBox.x).toBeGreaterThan(row.x + row.width / 2);
    await handle.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('slides-rtl-order')).toHaveText('Roadmap,Intro,Budget,Questions');
  });
});
