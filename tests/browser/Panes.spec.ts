import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const panes = (query = '') => `${fixtureUrl}/?fixture=panes${query}`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

const display = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).display);

async function setWidth(page: Page, width: string) {
  await page.getByRole('button', { name: `Width ${width}` }).click();
}

test.describe('Panes, supporting', () => {
  test('side by side from splitAt, the supporting pane at the end at its size', async ({
    page,
  }) => {
    await page.goto(panes('&width=60rem'));
    const root = page.getByTestId('supporting');
    const main = root.getByRole('region', { name: 'Document' });
    const supporting = root.getByRole('region', { name: 'Details' });
    const divider = root.getByRole('separator', { name: 'Resize details' });
    await expect(supporting).toBeVisible();
    await expect(divider).toBeVisible();
    const side = await box(supporting);
    expect(side.width).toBeCloseTo(22.5 * 16, 0);
    expect(side.x).toBeGreaterThan((await box(main)).x);
    // It paints nothing while it is a pane, and each pane scrolls on its own.
    await expect(supporting).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(supporting).toHaveCSS('position', 'static');
    await expect(main).toHaveCSS('overflow-y', 'auto');
    expect((await box(main)).height).toBeCloseTo(24 * 16 - 2, 0);
  });

  test(
    'below splitAt it is a modal sheet while open, which Escape, its button and the scrim close',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(panes('&width=45rem'));
      const root = page.getByTestId('supporting');
      const supporting = root.locator('.env-panes-supporting');
      const main = root.locator('.env-panes-main');
      const close = supporting.getByRole('button', { name: 'Close' });
      await expect(supporting).toBeHidden();
      await expect(root.getByRole('separator')).toBeHidden();
      const show = root.getByRole('button', { name: 'Show details' });
      // From the keyboard, as WebKit focuses no button that a press activates.
      await show.focus();
      await page.keyboard.press('Enter');
      // Medium: a side sheet at the end, as tall as the panes, over a scrim; a modal dialog that
      // focus moves into, with the rest of the panes inert.
      const sheet = root.getByRole('dialog', { name: 'Details' });
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAttribute('aria-modal', 'true');
      await expect(sheet).toBeFocused();
      await expect(sheet).toHaveCSS('position', 'absolute');
      await expect(main).toHaveJSProperty('inert', true);
      const placed = await box(sheet);
      const frame = await box(page.getByTestId('supporting-frame'));
      expect(placed.x + placed.width).toBeCloseTo(frame.x + frame.width - 1, 0);
      expect(placed.height).toBeCloseTo(frame.height - 2, 0);
      await expect(root.locator('.env-panes-scrim')).toBeVisible();
      // Tab stays in the sheet: its close button, its content, and round again.
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(sheet.getByRole('button', { name: 'Edit details' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(sheet.getByRole('button', { name: 'Edit details' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(supporting).toBeHidden();
      await expect(show).toBeFocused();
      await expect(main).toHaveJSProperty('inert', false);
      // Its close button and the scrim close it too.
      await page.keyboard.press('Enter');
      await close.click();
      await expect(supporting).toBeHidden();
      await expect(show).toBeFocused();
      await show.click();
      await root.locator('.env-panes-scrim').click({ position: { x: 10, y: 10 } });
      await expect(supporting).toBeHidden();
      // Compact: a bottom sheet across the width, shorter than the panes.
      await setWidth(page, '30rem');
      await show.click();
      const bottom = await box(supporting);
      const narrow = await box(page.getByTestId('supporting-frame'));
      expect(bottom.width).toBeCloseTo(narrow.width - 2, 0);
      expect(bottom.y + bottom.height).toBeCloseTo(narrow.y + narrow.height - 1, 0);
      expect(bottom.height).toBeLessThan(narrow.height * 0.9);
      // Wider again, the panes sit side by side, whatever open says: a region again, without its
      // close button, beside a main pane that isn't inert.
      await page.getByTestId('supporting-frame').evaluate((frame) => {
        frame.style.inlineSize = '80rem';
      });
      await expect(supporting).toHaveCSS('position', 'static');
      await expect(root.getByRole('region', { name: 'Details' })).toBeVisible();
      await expect(close).toBeHidden();
      await expect(main).toHaveJSProperty('inert', false);
      await expect(root.locator('.env-panes-scrim')).toBeHidden();
    },
  );

  test('the divider starts from the width that shows, where the room allows less than the size', async ({
    page,
  }) => {
    await page.goto(panes('&width=45rem&split=medium&size=40'));
    const root = page.getByTestId('supporting');
    const divider = root.getByRole('separator', { name: 'Resize details' });
    const supporting = root.getByRole('region', { name: 'Details' });
    const shown = (await box(supporting)).width / 16;
    expect(shown).toBeLessThan(30);
    // ArrowRight narrows the supporting pane by 1 rem from the width it shows, not from 40 rem.
    await divider.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await box(supporting)).width / 16).toBeCloseTo(shown - 1, 0);
    const value = Number.parseFloat((await divider.getAttribute('aria-valuetext'))!);
    expect(value).toBeLessThan(30);
  });

  test('splitAt sets where the panes sit side by side', async ({ page }) => {
    await page.goto(panes('&width=45rem&split=medium'));
    await expect(
      page.getByTestId('supporting').getByRole('region', { name: 'Details' }),
    ).toBeVisible();
    await page.goto(panes('&width=60rem&split=large'));
    await expect(
      page.getByTestId('supporting').getByRole('region', { name: 'Details' }),
    ).toBeHidden();
  });

  test(
    'the divider resizes the pane by keyboard and pointer, in rem, and remembers it',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(panes('&width=60rem&persist=fixture-panes'));
      const root = page.getByTestId('supporting');
      const divider = root.getByRole('separator', { name: 'Resize details' });
      const supporting = root.getByRole('region', { name: 'Details' });
      await expect(divider).toHaveAttribute('aria-valuetext', '22.5 rem');
      await expect(divider).toHaveAttribute(
        'aria-controls',
        (await supporting.getAttribute('id'))!,
      );
      // The supporting pane is at the end: ArrowLeft moves the divider toward the start and grows it.
      await divider.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(divider).toHaveAttribute('aria-valuetext', '23.5 rem');
      await page.keyboard.press('Shift+ArrowRight');
      await expect(divider).toHaveAttribute('aria-valuetext', '18.5 rem');
      expect((await box(supporting)).width).toBeCloseTo(18.5 * 16, 0);
      // A drag of 32 px toward the start grows it by 2 rem.
      const handle = await box(divider);
      const x = handle.x + handle.width / 2;
      const y = handle.y + handle.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x - 16, y);
      await page.mouse.move(x - 32, y);
      await page.mouse.up();
      await expect(divider).toHaveAttribute('aria-valuetext', '20.5 rem');
      await expect(page.getByTestId('sizes')).toContainText('20.5!');
      // The size is kept in a cookie, and read again after the first render.
      expect(await page.evaluate(() => document.cookie)).toContain('fixture-panes=20.5');
      await page.reload();
      await expect(page.getByRole('separator', { name: 'Resize details' })).toHaveAttribute(
        'aria-valuetext',
        '20.5 rem',
      );
      // A double click returns it to the default and forgets it.
      await page.getByRole('separator', { name: 'Resize details' }).dblclick();
      await expect(page.getByRole('separator', { name: 'Resize details' })).toHaveAttribute(
        'aria-valuetext',
        '22.5 rem',
      );
      expect(await page.evaluate(() => document.cookie)).not.toContain('fixture-panes=');
    },
  );

  test('mirrors in right-to-left text', async ({ page }) => {
    await page.goto(panes('&width=60rem&dir=rtl'));
    const root = page.getByTestId('supporting');
    const main = await box(root.getByRole('region', { name: 'Document' }));
    const supporting = await box(root.getByRole('region', { name: 'Details' }));
    expect(supporting.x).toBeLessThan(main.x);
  });
});

test.describe('Panes, list-detail', () => {
  test('side by side, the list at the start and no back button', async ({ page }) => {
    await page.goto(panes('&width=60rem'));
    const root = page.getByTestId('list-detail');
    const list = root.getByRole('region', { name: 'Projects' });
    await expect(list).toBeVisible();
    expect((await box(list)).width).toBeCloseTo(22.5 * 16, 0);
    await root.getByRole('button', { name: 'Website refresh' }).click();
    await expect(root.getByRole('region', { name: 'Website refresh' })).toBeVisible();
    await expect(list).toBeVisible();
    await expect(root.getByRole('button', { name: 'All projects' })).toBeHidden();
    // Focus stays on the row people chose.
    await expect(root.getByRole('button', { name: 'Website refresh' })).toBeFocused();
  });

  test('below splitAt one pane at a time, with back, and focus follows', async ({ page }) => {
    await page.goto(panes('&width=45rem'));
    const root = page.getByTestId('list-detail');
    const list = root.getByRole('region', { name: 'Projects' });
    await expect(list).toBeVisible();
    expect(await display(root.locator('.env-panes-detail'))).toBe('none');
    await expect(root.getByRole('separator')).toBeHidden();
    await root.getByRole('button', { name: 'Annual report' }).click();
    const detail = root.getByRole('region', { name: 'Annual report' });
    await expect(detail).toBeVisible();
    await expect(list).toBeHidden();
    const back = root.getByRole('button', { name: 'All projects' });
    await expect(back).toBeFocused();
    expect((await box(detail)).width).toBeCloseTo(
      (await box(page.getByTestId('list-frame'))).width - 2,
      0,
    );
    await back.click();
    await expect(list).toBeVisible();
    await expect(root.locator('.env-panes-detail')).toBeHidden();
    // Focus returns to the list's current row.
    await expect(root.getByRole('button', { name: 'Annual report' })).toBeFocused();
  });
});
