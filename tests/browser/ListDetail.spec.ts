import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';
import { openServerMarkup } from './ServerMarkup';

const fixture = `${fixtureUrl}/?fixture=split-panes`;

test.describe('ListDetail', () => {
  test('shows the list beside the detail, with the handle between', async ({ page }) => {
    await page.goto(fixture);
    const root = page.getByTestId('list-detail');
    await expect(root.getByRole('region', { name: 'Projects' })).toBeVisible();
    await expect(root.getByRole('region', { name: 'No project' })).toBeVisible();
    await expect(root.getByRole('separator', { name: 'Resize project list' })).toHaveAttribute(
      'aria-valuenow',
      '32',
    );
    // WebKit doesn't focus a button it clicks, so the keyboard presses it.
    await root.getByRole('button', { name: 'Annual report' }).focus();
    await page.keyboard.press('Enter');
    await expect(root.getByRole('region', { name: 'Annual report' })).toContainText(
      'Annual report details',
    );
    // Side by side, focus stays where it was, and there is no back button.
    await expect(root.getByRole('button', { name: 'Annual report' })).toBeFocused();
    await expect(root.getByRole('button', { name: 'All projects' })).toHaveCount(0);
  });

  test('stacked, shows one at a time and moves focus between them', async ({ page }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    const root = page.getByTestId('list-detail');
    await expect(root).toHaveAttribute('data-stacked', '');
    const list = root.getByRole('region', { name: 'Projects' });
    await expect(list).toBeVisible();
    await expect(root.getByRole('region', { name: 'No project' })).toBeHidden();
    await expect(root.getByRole('separator')).toHaveCount(0);

    await root.getByRole('button', { name: 'Office move' }).focus();
    await page.keyboard.press('Enter');
    const back = root.getByRole('button', { name: 'All projects' });
    await expect(back).toBeFocused();
    await expect(list).toBeHidden();
    await expect(root.getByRole('region', { name: 'Office move' })).toContainText(
      'Office move details',
    );

    await page.keyboard.press('Enter');
    await expect(list).toBeVisible();
    // Back returns focus to the list's current row.
    const current = root.getByRole('button', { name: 'Office move' });
    await expect(current).toBeFocused();
    await expect(current).toHaveAttribute('aria-current', 'true');

    // Widening with the detail shown shows both again, and narrowing the detail alone.
    await root.getByRole('button', { name: 'Hiring plan' }).click();
    await expect(back).toBeFocused();
    await page.getByRole('button', { name: 'Wide list and detail' }).click();
    await expect(list).toBeVisible();
    await expect(back).toHaveCount(0);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    await expect(list).toBeHidden();
    await expect(back).toBeVisible();
  });

  test('stacked, moves focus only from inside it, and off the back button as it widens', async ({
    page,
  }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    const root = page.getByTestId('list-detail');
    await expect(root).toHaveAttribute('data-stacked', '');
    await root.getByRole('button', { name: 'Office move' }).focus();
    await page.keyboard.press('Enter');
    const back = root.getByRole('button', { name: 'All projects' });
    await expect(back).toBeFocused();
    // Closing the detail from outside the layout leaves focus where it is.
    const close = page.getByRole('button', { name: 'Close the detail' });
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(root.getByRole('region', { name: 'Projects' })).toBeVisible();
    await expect(close).toBeFocused();
    // Widening while the back button has focus moves focus to the detail, not the page.
    await root.getByRole('button', { name: 'Hiring plan' }).click();
    await expect(back).toBeFocused();
    await root.evaluate((element) => (element.parentElement!.style.inlineSize = '60rem'));
    await expect(root).not.toHaveAttribute('data-stacked');
    await expect(back).toHaveCount(0);
    await expect(root.getByRole('region', { name: 'Hiring plan' })).toBeFocused();
  });

  test('turns its back arrow in right-to-left text', async ({ page }) => {
    await page.goto(fixture);
    await page.getByRole('button', { name: 'Narrow list and detail' }).click();
    const root = page.getByTestId('list-detail');
    await root.getByRole('button', { name: 'Annual report' }).click();
    await root.evaluate((element) => element.setAttribute('dir', 'rtl'));
    const icon = root.getByRole('button', { name: 'All projects' }).locator('.env-icon');
    await expect(icon).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
  });

  test.describe('server-rendered', () => {
    test.use({ javaScriptEnabled: false });

    test('stacks below stackBelow from the server markup, by data-detail-shown', async ({
      page,
    }) => {
      // Four list-detail layouts, the default 44rem and 30rem, each with and without the detail.
      await openServerMarkup(
        page,
        `import {createElement as h} from 'react';
        import {ListDetail} from '@envsemble/envui';
        const layout = (name, stackBelow, detailShown) => h(ListDetail.Root, {
          'data-testid': name, stackBelow, detailShown, onBack() {}, backLabel: 'Back',
          style: {blockSize: '10rem'},
        }, h(ListDetail.List, {label: name + ' list'}, 'List'),
          h(ListDetail.Detail, {label: name + ' detail'}, 'Detail'));
        export const element = h('div', {style: {display: 'grid', gap: '1rem'}},
          layout('default', undefined, false), layout('default shown', undefined, true),
          layout('custom', '30rem', false), layout('custom shown', '30rem', true));`,
      );
      const region = (name: string) => page.getByRole('region', { name, exact: true });
      const handles = page.getByRole('separator');
      // 50rem: side by side, both panes and every handle show.
      await page.setViewportSize({ width: 800, height: 900 });
      for (const name of ['default', 'default shown', 'custom', 'custom shown']) {
        await expect(region(`${name} list`)).toBeVisible();
        await expect(region(`${name} detail`)).toBeVisible();
      }
      await expect(handles.filter({ visible: true })).toHaveCount(4);
      // 40rem: the default layouts stack, showing the list or the detail; the 30rem ones don't.
      await page.setViewportSize({ width: 640, height: 900 });
      await expect(region('default list')).toBeVisible();
      await expect(region('default detail')).toBeHidden();
      await expect(region('default shown list')).toBeHidden();
      await expect(region('default shown detail')).toBeVisible();
      await expect(region('custom detail')).toBeVisible();
      await expect(handles.filter({ visible: true })).toHaveCount(2);
      // The stacked pane takes the whole row.
      const root = (await page.getByTestId('default').boundingBox())!;
      expect((await region('default list').boundingBox())!.width).toBeCloseTo(root.width, 0);
      // 25rem: every layout stacks, a width other than the default included.
      await page.setViewportSize({ width: 400, height: 900 });
      await expect(region('custom list')).toBeVisible();
      await expect(region('custom detail')).toBeHidden();
      await expect(region('custom shown list')).toBeHidden();
      await expect(region('custom shown detail')).toBeVisible();
      await expect(region('custom shown detail')).toHaveCSS('border-top-width', '0px');
      await expect(handles.filter({ visible: true })).toHaveCount(0);
    });
  });
});
