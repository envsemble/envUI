import { test, expect, type Browser } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** A phone-sized page with a touch screen, whose primary pointer is coarse. */
async function openOnTouchScreen(browser: Browser, path: string) {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${fixtureUrl}${path}`);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  return page;
}

test('entered text is 16 px on touch screens, so focusing a field does not zoom the page', async ({
  browser,
}) => {
  // Four touch contexts take Firefox and WebKit longer than the default timeout.
  test.slow();
  const forms = await openOnTouchScreen(browser, '/?fixture=forms');
  const input = forms.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(input).toHaveCSS('font-size', '16px');
  await expect(forms.getByRole('textbox', { name: 'Notes', exact: true })).toHaveCSS(
    'font-size',
    '16px',
  );
  await forms.context().close();

  const affixes = await openOnTouchScreen(browser, '/?fixture=affixes');
  const scope = affixes.getByTestId('affixes-light');
  // A label resting in an empty field stands in for its text, so it takes the same size.
  await expect(scope.locator('label', { hasText: 'Address' })).toHaveCSS('font-size', '16px');
  const price = scope.getByRole('textbox', { name: 'Price', exact: true });
  await expect(price).toHaveCSS('font-size', '16px');
  await expect(price.locator('xpath=..').locator('.env-text-field-prefix')).toHaveCSS(
    'font-size',
    '16px',
  );
  await affixes.context().close();

  const adoption = await openOnTouchScreen(browser, '/?fixture=adoption');
  await expect(adoption.getByRole('searchbox', { name: 'Search members' })).toHaveCSS(
    'font-size',
    '16px',
  );
  await adoption.context().close();

  const palette = await openOnTouchScreen(browser, '/?fixture=palette');
  await palette.getByRole('button', { name: 'Quick open light' }).click();
  await expect(palette.locator('.env-command-palette-input')).toHaveCSS('font-size', '16px');
  await palette.context().close();

  const composer = await openOnTouchScreen(browser, '/?fixture=composer');
  await expect(composer.getByRole('textbox', { name: 'Message light' })).toHaveCSS(
    'font-size',
    '16px',
  );
  await composer.context().close();

  const markdown = await openOnTouchScreen(browser, '/?fixture=markdown');
  await expect(markdown.getByRole('textbox', { name: 'Workload source' })).toHaveCSS(
    'font-size',
    '16px',
  );
  await markdown.context().close();

  const richText = await openOnTouchScreen(browser, '/rich-text.html');
  // The editing host is the element that gets focus, so it takes the size, and so do paragraphs.
  const editable = richText.locator('[contenteditable="true"]').first();
  await expect(editable).toHaveCSS('font-size', '16px');
  await expect(editable.locator('p').first()).toHaveCSS('font-size', '16px');
  await richText.context().close();
});

test('entered text keeps the body size with a mouse', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
  await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveCSS(
    'font-size',
    '15px',
  );
  await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveCSS(
    'font-size',
    '15px',
  );
  await page.goto(`${fixtureUrl}/rich-text.html`);
  await expect(page.locator('[contenteditable="true"]').first()).toHaveCSS('font-size', '15px');
});
