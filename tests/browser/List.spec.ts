import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const lists = `${fixtureUrl}/?fixture=lists`;

/** The live regions the first reorderable list announces through, one at a time. */
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
    // The handle says how to move its row without a pointer, and whether the row is lifted.
    await expect(handle).toHaveAccessibleDescription(/^Press Space or Enter, or click/);
    await expect(handle).toHaveAttribute('aria-pressed', 'false');

    // Space lifts the row; ↓ moves it, and the others make room; Space drops it.
    await handle.focus();
    await page.keyboard.press('Space');
    await expect(announcer(page)).toHaveText(/^Intro picked up, position 1 of 4\./);
    await expect(announcer(page).getByRole('status')).toHaveCount(2);
    await expect(list.getByRole('listitem').first()).toHaveAttribute('data-moving', 'keyboard');
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    // The start of the list stops it, and says so each time.
    const regions = announcer(page).getByRole('status');
    const atStart = 'Intro is at the start of the list, position 1 of 4.';
    await page.keyboard.press('ArrowUp');
    await expect(announcer(page)).toHaveText(atStart);
    const first = await regions.nth(0).textContent();
    await page.keyboard.press('ArrowUp');
    await expect(announcer(page)).toHaveText(atStart);
    // The repeat goes to the other region, so it is announced again.
    await expect(regions.nth(0)).not.toHaveText(first ?? '');
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
    await expect(handle).toHaveAttribute('aria-pressed', 'false');
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
    // The first place is as far as it goes, and the list says so.
    await expect(order).toHaveText('Budget,Intro,Roadmap,Questions');
    await expect(announcer(page)).toHaveText(
      'Budget is at the start of the list, position 1 of 4.',
    );
    await page.keyboard.press('Alt+ArrowDown');
    await expect(order).toHaveText('Intro,Budget,Roadmap,Questions');
  });

  test('drags a row by its handle with the pointer', { tag: '@engines' }, async ({ page }) => {
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
    // Once it drags, the announcement says how to move it with the pointer.
    await page.mouse.move(from.x, from.y + 6);
    await expect(announcer(page)).toHaveText(/^Roadmap picked up, position 2 of 4\. Drag it/);
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
    // The click that ends the drag doesn't lift the row again.
    await expect(list.locator('[data-moving]')).toHaveCount(0);
    await expect(list.getByRole('button', { name: 'Reorder Roadmap' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    // A press on the handle without dragging lifts the row for the arrow keys; another drops it.
    const handle = list.getByRole('button', { name: 'Reorder Intro' });
    await handle.click();
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    await expect(announcer(page)).toHaveText(/^Intro picked up, position 1 of 4\./);
    await expect(handle).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await handle.click();
    await expect(order).toHaveText('Budget,Intro,Questions,Roadmap');
    await expect(handle).toHaveAttribute('aria-pressed', 'false');
  });

  test(
    'a press on a lifted row released off its handle keeps the row on its handle',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(lists);
      const list = page.getByTestId('slides');
      const intro = list.getByRole('button', { name: 'Reorder Intro' });
      await intro.click();
      await expect(intro).toHaveAttribute('aria-pressed', 'true');
      // Pressed again, dragged off and released elsewhere: no click reaches the handle, and WebKit
      // has taken focus from it as it was pressed.
      const from = await centre(intro);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(from.x + 300, from.y + 200, { steps: 4 });
      await page.mouse.up();
      await expect(intro).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(intro).toHaveAttribute('aria-pressed', 'false');
      await expect(list.locator('[data-moving]')).toHaveCount(0);

      // Should a row stay lifted as another handle takes its keys, that handle moves its own row.
      await intro.click();
      const budget = list.getByRole('button', { name: 'Reorder Budget' });
      await budget.dispatchEvent('keydown', { key: ' ', bubbles: true });
      await expect(intro).toHaveAttribute('aria-pressed', 'false');
      await expect(budget).toHaveAttribute('aria-pressed', 'true');
      await budget.dispatchEvent('keydown', { key: 'ArrowDown', bubbles: true });
      await budget.dispatchEvent('keydown', { key: 'Enter', bubbles: true });
      await expect(page.getByTestId('slides-order')).toHaveText('Intro,Roadmap,Questions,Budget');
    },
  );

  test('a press lifts and drops a row without a pointer drag, as voice control does', async ({
    page,
  }) => {
    await page.goto(lists);
    const list = page.getByTestId('slides');
    const handle = list.getByRole('button', { name: 'Reorder Budget' });
    // A click with no pointer events before it, as assistive technology sends one.
    await handle.dispatchEvent('click');
    await expect(handle).toHaveAttribute('aria-pressed', 'true');
    await expect(handle).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await handle.dispatchEvent('click');
    await expect(page.getByTestId('slides-order')).toHaveText('Intro,Budget,Roadmap,Questions');
  });

  test('rows of a component that passes its props on to List.Item get their handles', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`${lists}&bare-rows`);
    const list = page.getByTestId('wrapped-slides');
    const handle = list.getByRole('button', { name: 'Reorder Budget' });
    await handle.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('wrapped-slides-order')).toHaveText(
      'Intro,Budget,Roadmap,Questions',
    );
    // A component that drops them leaves its rows without handles, which development reports
    // once, and Alt+↑ still names the row by its text.
    const bare = page.getByTestId('bare-slides');
    await expect(bare.getByRole('button')).toHaveCount(0);
    await bare.getByRole('link', { name: 'Intro' }).focus();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(page.getByTestId('bare-slides-order')).toHaveText(
      'Roadmap,Intro,Budget,Questions',
    );
    await expect(page.locator('.env-list-announcer').nth(3)).toHaveText(
      'Intro moved to position 2 of 4.',
    );
    expect(errors.filter((text) => text.includes('no drag handle'))).toEqual([
      expect.stringMatching(/^envUI: 4 rows of a List\.Root with onReorder have no drag handle\./),
    ]);
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
