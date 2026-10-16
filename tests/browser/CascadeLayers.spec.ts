import { expect, test } from '@playwright/test';
import { fixtureUrl } from './Servers';

/**
 * envUI's style sheet puts every rule in a cascade layer of env, so an application's CSS outside
 * cascade layers overrides it without !important or a heavier selector. tests/fixture/layers.css is
 * such an application style sheet: each of its rules is less specific than envUI's rule for the
 * same element and state.
 */

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/layers.html`);
  await page.waitForSelector('body[data-styles-ready] .env-button', { state: 'attached' });
});

test("an application's CSS outside cascade layers overrides envUI's without !important", async ({
  page,
}) => {
  const override = page.getByTestId('override');
  const library = page.getByTestId('library');
  const background = (locator: typeof override) =>
    locator.evaluate((element) => getComputedStyle(element).backgroundColor);

  // A single class beats envUI's variant rules for a primary button, at rest and under the pointer.
  expect(await background(override)).toBe('rgb(102, 51, 153)');
  expect(await background(library)).not.toBe('rgb(102, 51, 153)');
  await override.hover();
  expect(await background(override)).toBe('rgb(102, 51, 153)');

  // A link's color, and a bare element selector over envUI's base and Text rules.
  expect(
    await page.getByTestId('link').evaluate((element) => getComputedStyle(element).color),
  ).toBe('rgb(0, 100, 0)');
  const margin = await page
    .getByTestId('text')
    .evaluate((element) => getComputedStyle(element).marginBlockStart);
  expect(margin).toBe('12px');

  // A token set on a region of the application re-themes envUI's components inside it.
  expect(await background(page.getByTestId('region'))).toBe('rgb(0, 90, 90)');
  const box = page.locator('.app-region .env-checkbox-control');
  expect(await box.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgb(0, 90, 90)',
  );
});

test('every rule of envUI’s style sheet is in a cascade layer of env, in order', async ({
  page,
}) => {
  const layers = await page.evaluate(() => {
    const sheets = [...document.styleSheets].filter((sheet) => {
      const node = sheet.ownerNode as HTMLElement | null;
      const id = node?.dataset.viteDevId ?? sheet.href ?? '';
      return id.replaceAll('\\', '/').includes('packages/ui/src/styles/index.css');
    });
    return sheets.map((sheet) =>
      [...sheet.cssRules].map((rule) =>
        rule instanceof CSSLayerStatementRule
          ? `statement ${rule.nameList.join(', ')}`
          : rule instanceof CSSLayerBlockRule
            ? `block ${rule.name}`
            : rule instanceof CSSFontFaceRule
              ? 'font face'
              : `unlayered ${rule.cssText.slice(0, 80)}`,
      ),
    );
  });
  expect(layers).toHaveLength(1);
  const [rules] = layers;
  expect(rules[0]).toBe('statement env.reset, env.tokens, env.base, env.components, env.utilities');
  // The font face is no style rule, which cascade layers order.
  expect(rules.filter((rule) => !/^(?:(?:statement|block) env\.|font face$)/.test(rule))).toEqual(
    [],
  );
  expect(new Set(rules.slice(1))).toEqual(
    new Set([
      'block env.reset',
      'block env.tokens',
      'block env.base',
      'block env.components',
      'font face',
    ]),
  );
});
