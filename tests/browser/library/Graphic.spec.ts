import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

/** A length in px, such as var(--env-picture-size-md), resolved where the fixture is. */
async function length(page: Page, value: string) {
  return page.getByTestId('graphics').evaluate((element, css) => {
    const probe = document.createElement('div');
    probe.style.inlineSize = css;
    element.append(probe);
    const px = probe.getBoundingClientRect().width;
    probe.remove();
    return px;
  }, value);
}

/** Whether one box is the size of another and centered on it. */
function expectSameBox(
  inner: { x: number; y: number; width: number; height: number },
  outer: typeof inner,
) {
  expect(Math.abs(inner.width - outer.width)).toBeLessThan(0.5);
  expect(Math.abs(inner.height - outer.height)).toBeLessThan(0.5);
  expect(Math.abs(inner.x + inner.width / 2 - (outer.x + outer.width / 2))).toBeLessThan(0.5);
  expect(Math.abs(inner.y + inner.height / 2 - (outer.y + outer.height / 2))).toBeLessThan(0.5);
}

/**
 * The boxes of an element and of the first element a selector finds inside it, measured together,
 * so nothing moves between the two, such as text as its face loads.
 */
async function boxes(outer: Locator, selector: string) {
  return outer.evaluate((element, css) => {
    const rect = (node: Element) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };
    return [rect(element), rect(element.querySelector(css)!)] as const;
  }, selector);
}

/** An element's box. */
async function box(locator: Locator) {
  const found = await locator.boundingBox();
  expect(found).not.toBeNull();
  return found!;
}

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=graphic`);
  await expect(page.getByTestId('graphics')).toBeVisible();
  // The files are data URLs: wait until every picture has decoded, so a box that followed the
  // file would show.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('img')].every((image) => image.complete),
  );
  await page.evaluate(() => document.fonts.ready);
});

test("a graphic is its step's size whatever the file, with the picture contained and centered in it", async ({
  page,
}) => {
  const steps = {
    icon: 'var(--env-control-icon-size)',
    sm: 'var(--env-picture-size-sm)',
    md: 'var(--env-picture-size-md)',
    lg: 'var(--env-picture-size-lg)',
    xl: 'var(--env-picture-size-xl)',
  };
  for (const [size, value] of Object.entries(steps)) {
    const expected = await length(page, value);
    for (const kind of ['png', 'svg-file', 'svg']) {
      const graphic = page.getByTestId(`${kind}-${size}`);
      const [outer, inner] = await boxes(graphic, ':scope > *');
      expect(Math.abs(outer.width - expected), `${kind} ${size}`).toBeLessThan(0.5);
      expect(Math.abs(outer.height - expected), `${kind} ${size}`).toBeLessThan(0.5);
      // The img or svg fills the box, and object-fit or the viewBox contains the picture in it.
      expectSameBox(inner, outer);
      const picture = graphic.locator(':scope > *');
      expect(await picture.evaluate((element) => getComputedStyle(element).objectFit)).toBe(
        'contain',
      );
    }
  }
  // The steps above icon are Avatar's, from the same tokens.
  expect(await length(page, 'var(--env-picture-size-sm)')).toBe(24);
  expect(await length(page, 'var(--env-picture-size-xl)')).toBe(88);
});

test('the text step is the size of the text around it, and fill takes its container', async ({
  page,
}) => {
  const text = await box(page.getByTestId('png-text'));
  const fontSize = await page
    .getByTestId('graphic-text')
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(Math.abs(text.width - fontSize)).toBeLessThan(0.5);
  expect(Math.abs(text.height - fontSize)).toBeLessThan(0.5);

  const container = page.getByTestId('graphic-fill-box');
  const [area, fill] = await boxes(container, '.env-graphic');
  expectSameBox(fill, area);
  const [, image] = await boxes(container, '.env-graphic > img');
  expectSameBox(image, area);
});

test('fill is a block that takes its height from an aspect, and a step with an aspect is wider', async ({
  page,
}) => {
  const width = await length(page, '16rem');
  const [, aspect] = await boxes(
    page.getByTestId('graphic-fill-auto'),
    '[data-testid="fill-aspect"]',
  );
  expect(Math.abs(aspect.width - width)).toBeLessThan(0.5);
  expect(Math.abs(aspect.height - (width * 9) / 16)).toBeLessThan(0.5);
  expect(
    await page.getByTestId('fill-aspect').evaluate((element) => getComputedStyle(element).display),
  ).toBe('grid');
  expect(
    await page
      .getByTestId('fill-aspect')
      .locator('img')
      .evaluate((element) => getComputedStyle(element).objectFit),
  ).toBe('cover');
  // A file in the text color has no shape of its own to give, so it is square, never 0 tall.
  const [, mask] = await boxes(page.getByTestId('fill-mask'), '.env-graphic-mask');
  expect(Math.abs(mask.width - width)).toBeLessThan(0.5);
  expect(Math.abs(mask.height - width)).toBeLessThan(0.5);
  const step = await box(page.getByTestId('step-aspect'));
  const lg = await length(page, 'var(--env-picture-size-lg)');
  expect(Math.abs(step.height - lg)).toBeLessThan(0.5);
  expect(Math.abs(step.width - (lg * 4) / 3)).toBeLessThan(0.5);
});

test("TopBar's and PageHeader's start give a graphic a picture's size, and leave envUI's symbols be", async ({
  page,
}) => {
  for (const [testId, token] of [
    ['top-bar-graphic', 'var(--env-picture-size-sm)'],
    ['page-header-graphic', 'var(--env-picture-size-md)'],
  ] as const) {
    const expected = await length(page, token);
    const graphic = await box(page.getByTestId(testId));
    expect(Math.abs(graphic.width - expected), testId).toBeLessThan(0.5);
    expect(Math.abs(graphic.height - expected), testId).toBeLessThan(0.5);
  }
  const symbol = page.getByTestId('top-bar-symbol').locator('.env-top-bar-start > svg');
  const [size, fontSize] = await symbol.evaluate((element) => [
    element.getBoundingClientRect().width,
    parseFloat(getComputedStyle(element).fontSize),
  ]);
  expect(Math.abs(size - fontSize)).toBeLessThan(0.5);
});

test('a graphic keeps its own colors, and tint="text" paints it in the text color', async ({
  page,
}) => {
  const fillOf = (testId: string) =>
    page
      .getByTestId(testId)
      .locator('path')
      .evaluate((element) => getComputedStyle(element).fill);
  expect(await fillOf('own-colors')).toBe('rgb(0, 0, 0)');
  expect(await fillOf('tint-svg')).toBe('rgb(200, 0, 0)');
  // What only shapes a picture, such as a mask, keeps its own paint.
  const masked = page.getByTestId('tint-masked');
  expect(
    await masked.locator('mask rect').evaluate((element) => getComputedStyle(element).fill),
  ).toBe('rgb(255, 255, 255)');
  expect(
    await masked
      .locator(':scope > svg > rect')
      .evaluate((element) => getComputedStyle(element).fill),
  ).toBe('rgb(200, 0, 0)');
  const mask = page.getByTestId('tint-file').locator('.env-graphic-mask');
  await expect(page.getByTestId('tint-file').locator('img')).toHaveCount(0);
  const painted = await mask.evaluate((element) => {
    const style = getComputedStyle(element);
    return { color: style.backgroundColor, image: style.maskImage, size: style.maskSize };
  });
  expect(painted.color).toBe('rgb(200, 0, 0)');
  expect(painted.image).toMatch(/^url\("data:image\/svg\+xml/);
  expect(painted.size).toBe('contain');
});

test('alt names a graphic as an image, and an empty alt hides it as decoration', async ({
  page,
}) => {
  await expect(page.getByRole('img', { name: 'Acme' })).toHaveCount(5);
  for (const testId of ['named', 'named-svg']) {
    const named = page.getByTestId(testId);
    await expect(named).toHaveAttribute('role', 'img');
    await expect(named).toHaveAttribute('aria-label', 'Acme');
  }
  const decorative = page.getByTestId('decorative');
  await expect(decorative).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative).not.toHaveAttribute('role', /.*/);
  // The file's own img is never named twice.
  await expect(page.getByTestId('named').locator('img')).toHaveAttribute('alt', '');
});

test("an icon slot sizes any child to the slot's icon size: an img, an svg or a graphic", async ({
  page,
}) => {
  const icon = await length(page, 'var(--env-control-icon-size)');
  for (const testId of ['button-img', 'button-graphic', 'button-svg']) {
    const [outer, inner] = await boxes(page.getByTestId(testId).locator('.env-icon'), ':scope > *');
    expect(Math.abs(outer.width - icon), testId).toBeLessThan(0.5);
    expect(Math.abs(outer.height - icon), testId).toBeLessThan(0.5);
    expectSameBox(inner, outer);
  }
  // A list row's start isn't an icon slot, but an icon or a picture in it takes a leading icon's
  // size there.
  const leading = await length(page, 'var(--env-icon-size-lg)');
  for (const testId of ['list-svg', 'list-img', 'list-graphic']) {
    const picture = await box(page.getByTestId(testId).locator('.env-list-item-start > *'));
    expect(Math.abs(picture.width - leading), testId).toBeLessThan(0.5);
    expect(Math.abs(picture.height - leading), testId).toBeLessThan(0.5);
  }
});
