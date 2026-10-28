import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;

/**
 * The boundary between an application's CSS and envUI's. envUI's style sheet puts every rule in a cascade layer of env, so an application's CSS outside
 * cascade layers overrides it without !important or a heavier selector. tests/fixture/CascadeLayers.css is
 * such an application style sheet: each of its rules is less specific than envUI's rule for the
 * same element and state.
 */

async function openLayers(page: Page) {
  await page.goto(`${fixtureUrl}/CascadeLayers.html`);
  await page.waitForSelector('body[data-styles-ready] .env-button', { state: 'attached' });
}

test(
  "an application's CSS outside cascade layers overrides envUI's without !important",
  { tag: '@engines' },
  async ({ page }) => {
    await openLayers(page);
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
    const box = page.locator('.app-region .env-checkbox-input');
    expect(await box.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      'rgb(0, 90, 90)',
    );
  },
);

test(
  'each theme boundary sets its color scheme, also nested and at high contrast',
  { tag: '@engines' },
  async ({ page }) => {
    await openLayers(page);
    const schemes = await page.evaluate(() => {
      const boundary = (attributes: Record<string, string>, parent: Element = document.body) => {
        const element = document.createElement('div');
        element.className = 'env-theme';
        for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
        parent.append(element);
        return element;
      };
      const light = boundary({});
      const dark = boundary({ 'data-env-theme': 'dark' });
      const darkHigh = boundary({ 'data-env-theme': 'dark', 'data-env-contrast': 'high' });
      const lightHigh = boundary({ 'data-env-contrast': 'high' });
      const nested = boundary({ 'data-env-theme': 'light' }, dark);
      const read = (element: Element) => getComputedStyle(element).colorScheme;
      return [light, dark, darkHigh, lightHigh, nested].map(read);
    });
    expect(schemes).toEqual(['light', 'dark', 'dark', 'light', 'light']);
  },
);

test(
  'the migration guide’s per-theme token override applies in each theme and contrast',
  { tag: '@engines' },
  async ({ page }) => {
    await openLayers(page);
    // The example in docs/migration.md, as written, so the guide can't drift from the cascade.
    const guide = readFileSync('docs/migration.md', 'utf8');
    const example = [...guide.matchAll(/```css\n([\s\S]*?)```/g)]
      .map(([, css]) => css)
      .find((css) => css.includes('--env-color-fg-link') && css.includes('prefers-contrast'));
    expect(example, 'the token override example').toBeDefined();
    const values = [...example!.matchAll(/--env-color-fg-link:\s*([^;]+);/g)].map(([, value]) =>
      value.trim(),
    );
    const [light, dark, lightHigh, darkHigh] = values;
    const read = (scheme: string, contrast?: string) =>
      page.evaluate(
        ({ css, scheme, contrast }) => {
          // Added afresh each time: one engine evaluates an emulated media feature only in style
          // sheets added after it changes.
          document.getElementById('guide-example')?.remove();
          const style = document.createElement('style');
          style.id = 'guide-example';
          style.textContent = css;
          document.head.append(style);
          const boundary = document.createElement('div');
          boundary.className = 'env-theme';
          boundary.setAttribute('data-env-theme', scheme);
          if (contrast) boundary.setAttribute('data-env-contrast', contrast);
          document.body.append(boundary);
          const value = getComputedStyle(boundary).getPropertyValue('--env-color-fg-link').trim();
          boundary.remove();
          return value;
        },
        { css: example!, scheme, contrast },
      );
    await page.emulateMedia({ contrast: 'no-preference' });
    expect(await read('light')).toBe(light);
    expect(await read('dark')).toBe(dark);
    expect(await read('light', 'high')).toBe(lightHigh);
    expect(await read('dark', 'high')).toBe(darkHigh);
    await page.emulateMedia({ contrast: 'more' });
    const emulated = await page.evaluate(() => matchMedia('(prefers-contrast: more)').matches);
    test.skip(!emulated, 'This engine does not emulate prefers-contrast.');
    expect(await read('light')).toBe(lightHigh);
    expect(await read('dark')).toBe(darkHigh);
    expect(await read('light', 'standard')).toBe(light);
    expect(await read('dark', 'standard')).toBe(dark);
  },
);

test(
  'a themed document root keeps the browser font size and its body the body type',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(adoption);
    const root = page.locator('html');
    await expect(root).toHaveClass(/env-theme/);
    // 1 rem stays the browser's 16 px, so rem measures keep their designed size.
    await expect(root).toHaveCSS('font-size', '16px');
    const button = page.getByTestId('router-button');
    await expect(button).toBeVisible();
    expect((await button.boundingBox())!.height).toBeCloseTo(40, 1);
    // Text takes the body type in the document body, the application and portals alike.
    await expect(page.locator('body')).toHaveCSS('font-size', '15px');
    await expect(page.locator('body')).toHaveCSS('line-height', '21px');
    await expect(page.locator('.fixture-adoption')).toHaveCSS('font-size', '15px');
    const portal = await page.evaluate(() => {
      const element = document.createElement('div');
      element.textContent = 'Another library’s popup';
      document.body.append(element);
      const { fontSize, fontFamily } = getComputedStyle(element);
      element.remove();
      return { fontSize, fontFamily };
    });
    expect(portal.fontSize).toBe('15px');
    expect(portal.fontFamily).toContain('envUI Geist');
    await page.getByRole('button', { name: 'Open pending dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Save project' });
    await expect(dialog).toHaveCSS('font-size', '15px');
    await expect(dialog.getByRole('button', { name: 'Toggle pending' })).toHaveCSS(
      'height',
      '40px',
    );
  },
);

test(
  'an application body rule styles the body, while envUI keeps its type inside its boundaries',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(adoption);
    await expect(page.locator('html')).toHaveClass(/env-theme/);
    const body = page.locator('body');
    const inside = [
      page.getByTestId('adoption-plain-text'),
      page.getByTestId('adoption-paragraph'),
      page.getByTestId('adoption-nested-theme'),
    ];
    // A rule inside a cascade layer loses to envUI's unlayered style sheet, whatever its specificity.
    const layered = await page.evaluateHandle(() => {
      const style = document.createElement('style');
      style.textContent = '@layer application { body { font-size: 18px; } }';
      document.head.prepend(style);
      return style;
    });
    await expect(body).toHaveCSS('font-size', '15px');
    await layered.evaluate((style) => style.remove());
    // An application's unlayered body rule, before envUI's style sheet, styles the body itself.
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent =
        'body { font-family: "Fixture Serif"; font-size: 18px; line-height: 27px; }';
      document.head.prepend(style);
    });
    await expect(body).toHaveCSS('font-family', /Fixture Serif/);
    await expect(body).toHaveCSS('font-size', '18px');
    await expect(body).toHaveCSS('line-height', '27px');
    // Inside the provider's boundary, text, paragraphs and a Theme around content keep envUI's type,
    // and so do the components and the popups, each in a boundary of its own.
    for (const element of [...inside, page.getByTestId('router-button')]) {
      await expect(element).toHaveCSS('font-family', /envUI Geist/);
      await expect(element).not.toHaveCSS('font-size', '18px');
    }
    for (const element of inside) {
      await expect(element).toHaveCSS('font-size', '15px');
      await expect(element).toHaveCSS('line-height', '21px');
    }
    await page.getByRole('button', { name: 'Assign seat' }).hover();
    const tooltip = page.locator('.env-tooltip');
    await expect(tooltip).toHaveText('All seats are assigned');
    await expect(tooltip).toHaveCSS('font-family', /envUI Geist/);
    await page.mouse.move(0, 0);
    await page.getByRole('button', { name: 'Open pending dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Save project' });
    await expect(dialog).toHaveCSS('font-family', /envUI Geist/);
    await expect(dialog).toHaveCSS('font-size', '15px');
    // envUI's font tokens change its typeface wherever it applies.
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '.env-theme { --env-font-family: "Fixture Serif", serif; }';
      document.head.append(style);
    });
    await expect(page.getByTestId('adoption-paragraph')).toHaveCSS(
      'font-family',
      /^"?Fixture Serif/,
    );
    await expect(dialog).toHaveCSS('font-family', /^"?Fixture Serif/);
    // Text in another size inside a boundary keeps its lines in proportion to it.
    const large = await page.getByTestId('adoption-plain-text').evaluateHandle((element) => {
      const text = document.createElement('div');
      text.textContent = 'A larger line';
      text.style.fontSize = '2rem';
      element.after(text);
      return text;
    });
    expect(
      Number.parseFloat(await large.evaluate((element) => getComputedStyle(element).lineHeight)),
    ).toBeCloseTo(44.8, 1);
    // --env-line-height-body sets the boundary's line height.
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '.env-theme { --env-line-height-body: 2; }';
      document.head.append(style);
    });
    await expect(page.getByTestId('adoption-plain-text')).toHaveCSS('line-height', '30px');
    // The root keeps the browser's size, so rem measures keep theirs.
    await expect(page.locator('html')).toHaveCSS('font-size', '16px');
  },
);

test(
  'styles leave unrelated host content alone and dimensions remain responsive',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${fixtureUrl}/?fixture=colors`);
    const host = await page.getByTestId('host-marker').evaluate((element) => {
      const css = getComputedStyle(element);
      return { family: css.fontFamily, margin: css.marginBlockStart };
    });
    expect(host.family).not.toContain('envUI Geist');
    expect(host.margin).not.toBe('0px');
    const control = page.getByTestId('light-button-primary');
    const before = await control.boundingBox();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '150%';
    });
    const after = await control.boundingBox();
    expect(after!.height / before!.height).toBeCloseTo(1.5, 1);
    await expect(control).toHaveCSS('border-width', '0px');
  },
);
