import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

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

/** An element's box, and whether its center is the center of another's. */
async function box(locator: Locator) {
  const found = await locator.boundingBox();
  expect(found).not.toBeNull();
  return found!;
}
function expectSameBox(
  inner: { x: number; y: number; width: number; height: number },
  outer: typeof inner,
) {
  expect(Math.abs(inner.width - outer.width)).toBeLessThan(0.5);
  expect(Math.abs(inner.height - outer.height)).toBeLessThan(0.5);
  expect(Math.abs(inner.x + inner.width / 2 - (outer.x + outer.width / 2))).toBeLessThan(0.5);
  expect(Math.abs(inner.y + inner.height / 2 - (outer.y + outer.height / 2))).toBeLessThan(0.5);
}

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=graphics`);
  await expect(page.getByTestId('graphics')).toBeVisible();
  // The files are data URLs: wait until every picture has decoded, so a box that followed the
  // file would show.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('img')].every((image) => image.complete),
  );
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
      const outer = await box(graphic);
      expect(Math.abs(outer.width - expected), `${kind} ${size}`).toBeLessThan(0.5);
      expect(Math.abs(outer.height - expected), `${kind} ${size}`).toBeLessThan(0.5);
      // The img or svg fills the box, and object-fit or the viewBox contains the picture in it.
      const picture = graphic.locator(':scope > *');
      expectSameBox(await box(picture), outer);
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

  const container = await box(page.getByTestId('graphic-fill-box'));
  const fill = page.getByTestId('png-fill');
  expectSameBox(await box(fill), container);
  expectSameBox(await box(fill.locator('img')), container);
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
    const slot = page.getByTestId(testId).locator('.env-icon');
    const outer = await box(slot);
    expect(Math.abs(outer.width - icon), testId).toBeLessThan(0.5);
    expect(Math.abs(outer.height - icon), testId).toBeLessThan(0.5);
    expectSameBox(await box(slot.locator(':scope > *')), outer);
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
