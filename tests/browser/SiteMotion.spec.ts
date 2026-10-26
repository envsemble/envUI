import { test, expect, type Locator, type Page } from '@playwright/test';
import { siteDevUrl } from './Servers';
import { displayStorageKeys } from '../../apps/site/src/theme/DisplayStorage';

/*
 * The site's animations (apps/site/src/previews/Motion.tsx): a tile plays its own preview while
 * the pointer is on it and rests at its still, the animation's first step, once it leaves; an
 * animated figure on a page plays by itself, with a pause button that holds it where it is; the
 * sidebar's button pauses them all, is stored, and is what a reader who prefers reduced motion
 * starts with.
 */

const tile = (page: Page, name: string) =>
  page.locator('.catalogue-gallery-tile', { has: page.getByRole('link', { name, exact: true }) });

/** Whether the Switch tile's switch is on. */
const switchOn = (tileOf: Locator) =>
  tileOf.locator('input').evaluate((input) => (input as HTMLInputElement).checked);

/** What the Slider figure on its page shows: the value it is at. */
const figureValue = (page: Page) =>
  page.locator('.catalogue-motion-stage .env-slider-value').textContent();

test('a tile plays its preview while the pointer is on it, and rests at its still after', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components`);
  const switchTile = tile(page, 'Switch');
  await switchTile.scrollIntoViewIfNeeded();
  await expect(switchTile.locator('.catalogue-related-canvas[data-fitted]')).toBeVisible();
  // The still is the switch off, and nothing moves at rest.
  expect(await switchOn(switchTile)).toBe(false);
  await page.waitForTimeout(800);
  expect(await switchOn(switchTile)).toBe(false);
  // On the tile, it plays: the switch turns on.
  await switchTile.hover();
  await expect.poll(() => switchOn(switchTile)).toBe(true);
  // Off it, it goes back to the still at once.
  await page.mouse.move(1, 1);
  await expect.poll(() => switchOn(switchTile)).toBe(false);
});

test('an animated figure plays by itself, and its pause button holds it where it is', async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = page.locator('.catalogue-motion-stage');
  await stage.scrollIntoViewIfNeeded();
  // It moves on from its still, the value at 60, by itself.
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe('60');
  const pause = stage.getByRole('button', { name: /^Pause / });
  await pause.click();
  const held = await figureValue(page);
  await page.waitForTimeout(2500);
  expect(await figureValue(page)).toBe(held);
  // Played again, it goes on.
  await stage.getByRole('button', { name: /^Play / }).click();
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe(held);
});

test("the sidebar's pause pauses every animation and is kept, and a figure's own button overrides it", async ({
  page,
}) => {
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = page.locator('.catalogue-motion-stage');
  await stage.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Pause animations' }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), displayStorageKeys.motion)).toBe(
    'paused',
  );
  const held = await figureValue(page);
  await page.waitForTimeout(2500);
  expect(await figureValue(page)).toBe(held);
  // The figure's own button plays it, though the sidebar's pauses the rest.
  await stage.getByRole('button', { name: /^Play / }).click();
  await expect.poll(() => figureValue(page), { timeout: 4000 }).not.toBe(held);
  // A tile stays at its still under the pointer while the sidebar's pause holds.
  await page.goto(`${siteDevUrl}/components`);
  const switchTile = tile(page, 'Switch');
  await switchTile.scrollIntoViewIfNeeded();
  await expect(switchTile.locator('.catalogue-related-canvas[data-fitted]')).toBeVisible();
  await switchTile.hover();
  await page.waitForTimeout(1500);
  expect(await switchOn(switchTile)).toBe(false);
  await expect(page.getByRole('button', { name: 'Play animations' })).toBeVisible();
});

test('a reader who prefers reduced motion starts with every animation paused', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${siteDevUrl}/components/slider`);
  const stage = page.locator('.catalogue-motion-stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play animations' })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(await figureValue(page)).toBe('60');
  await context.close();
});
