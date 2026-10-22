import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** The inline end of the heading row and of its meta, in the row's own direction. */
async function metaPlacement(card: Locator) {
  return card.locator('.env-card-header').evaluate((row) => {
    const meta = row.querySelector('.env-card-meta')!.getBoundingClientRect();
    const heading = row.querySelector('h3')!.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === 'rtl';
    return {
      gapToEnd: Math.round(rtl ? meta.left - box.left : box.right - meta.right),
      afterHeading: rtl ? meta.right <= heading.left : meta.left >= heading.right,
      sameLine: Math.abs(meta.top + meta.height / 2 - (heading.top + heading.height / 2)) < 4,
    };
  });
}

test('card meta sits at the end of the heading row in both themes and directions', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`layout-${theme}`);
    for (const id of ['meta-action-card', 'meta-card']) {
      const card = scope.getByTestId(id);
      await expect(card.locator('.env-card-meta')).toBeVisible();
      expect(await metaPlacement(card)).toEqual({
        gapToEnd: 0,
        afterHeading: true,
        sameLine: true,
      });
    }
  }
  const card = page.getByTestId('layout-light').getByTestId('meta-action-card');
  await card.evaluate((element) => element.setAttribute('dir', 'rtl'));
  expect(await metaPlacement(card)).toEqual({ gapToEnd: 0, afterHeading: true, sameLine: true });
});

test('button and link cards provide native keyboard activation, focus and disabled behavior in both themes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  let activations = 0;
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`layout-${theme}`);
    const action = scope.getByTestId('clickable-action');
    // A card with onClick is a native button, and never submits its form.
    await expect(action).toHaveJSProperty('tagName', 'BUTTON');
    await expect(action).toHaveAttribute('type', 'button');
    await expect(action).toHaveAttribute('data-interactive', '');
    await action.focus();
    await page.keyboard.press('Space');
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));
    await page.keyboard.press('Enter');
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));
    expect(await action.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    await action.click({ position: { x: (await action.boundingBox())!.width / 2, y: 8 } });
    await expect(action.getByTestId('card-activations')).toHaveText(String(++activations));

    const link = scope.getByTestId('clickable-link');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#destination$/);
    await expect(scope.getByTestId('disabled-card')).toBeDisabled();
    const disabledLink = scope.getByTestId('disabled-card-link');
    await expect(disabledLink).not.toHaveAttribute('href');
    await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledLink).toHaveAttribute('tabindex', '-1');
    await disabledLink.dispatchEvent('click');
    await expect(page).toHaveURL(/#destination$/);
    await expect(action.getByTestId('card-activations')).toHaveText(String(activations));
  }
  expect(errors).toEqual([]);
});

test('a card heading takes its level, the element comes from render and a link card is named by its text', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=cards`);
  await expect(page.getByTestId('card-h3').getByRole('heading', { level: 3 })).toHaveText(
    'Default level',
  );
  await expect(page.getByTestId('card-h3').locator('.env-card-description')).toHaveText(
    'A sentence under it.',
  );
  await expect(page.getByTestId('card-h4').getByRole('heading', { level: 4 })).toHaveText(
    'Fourth level',
  );
  const article = page.getByTestId('article-card');
  await expect(article).toHaveJSProperty('tagName', 'ARTICLE');
  await expect(article).toHaveAttribute('data-actions', '');
  await expect(article.locator('> footer.env-card-footer').getByRole('button')).toHaveText('Open');
  const link = page.getByTestId('named-link');
  await expect(link).not.toHaveAttribute('aria-label');
  await expect(link).not.toHaveAttribute('aria-labelledby');
  await expect(link).toHaveAccessibleName('Northwind launch 12 open tasks');
});
