import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test('segmented controls choose one option with the pointer and arrow keys', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${fixtureUrl}/?fixture=segments`);
  for (const theme of ['light', 'dark']) {
    const group = page.getByRole('radiogroup', { name: `Work items ${theme}` });
    const value = page.getByTestId(`segments-value-${theme}`);
    const open = group.getByRole('radio', { name: 'Open 12' });
    const blocked = group.getByRole('radio', { name: 'Blocked 3' });
    const done = group.getByRole('radio', { name: 'Done 40' });
    await expect(open).toHaveAttribute('aria-checked', 'true');
    await expect(group.getByRole('radio', { name: 'Archived' })).toBeDisabled();
    // Counts take the locale's number format.
    await expect(
      page
        .getByRole('radiogroup', { name: `Counts in German ${theme}` })
        .getByRole('radio', { name: 'Alle 1.200' }),
    ).toBeVisible();

    // Connected outlined segments: one outline around them and a line between two. The chosen one
    // takes the selected fill and shows a check, which the others don't.
    const fill = await open.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--env-color-bg-selected)';
      element.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(open).toHaveCSS('background-color', fill);
    await expect(open.locator('.env-segmented-control-item-check')).toBeVisible();
    await expect(blocked.locator('.env-segmented-control-item-check')).toBeHidden();
    await expect(group).toHaveCSS('outline-style', 'solid');
    await expect(open).toHaveCSS('border-inline-start-color', 'rgba(0, 0, 0, 0)');
    await expect(blocked).not.toHaveCSS('border-inline-start-color', 'rgba(0, 0, 0, 0)');
    await expect(blocked).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

    await blocked.click();
    await expect(value).toHaveText(/^blocked/);
    await expect(blocked).toHaveAttribute('aria-checked', 'true');
    await expect(open).toHaveAttribute('aria-checked', 'false');

    // Arrow keys move and choose, skipping the disabled option.
    await blocked.focus();
    await page.keyboard.press('ArrowRight');
    await expect(done).toBeFocused();
    await expect(value).toHaveText(/^done/);
    await page.keyboard.press('ArrowLeft');
    await expect(blocked).toBeFocused();
    await expect(value).toHaveText(/^blocked/);

    const layout = page.getByRole('radiogroup', { name: `Layout ${theme}` });
    await layout.getByRole('radio', { name: 'Board' }).click();
    await expect(value).toHaveText(/board$/);
    const compactHeight = (await layout.boundingBox())!.height;
    expect(compactHeight).toBeLessThan((await group.boundingBox())!.height);
  }
  expect(errors).toEqual([]);
});

test('a full-width control splits its container evenly and cuts long labels short, with a tooltip', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${fixtureUrl}/?fixture=segments`);
  const narrow = page.getByTestId('segments-narrow-light');
  const control = narrow.getByRole('radiogroup', { name: 'Assignments light' });
  const segments = control.getByRole('radio');
  // The tooltip that shows, leaving out one that is still fading out, as when focus moves on.
  const tooltip = page.locator('.env-tooltip:not([data-ending-style])');
  // In 13 rem the control fills its container, half each, without scrolling.
  const [frame, rail, first, second] = await Promise.all([
    narrow.boundingBox(),
    control.boundingBox(),
    segments.first().boundingBox(),
    segments.nth(1).boundingBox(),
  ]);
  expect(rail!.width).toBeCloseTo(frame!.width, 0);
  expect(await control.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(1);
  // Labels too long for their half end in an ellipsis; the options keep their whole names.
  const label = segments.first().locator('.env-segmented-control-item-label');
  await expect(label).toHaveCSS('text-overflow', 'ellipsis');
  expect(await label.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(segments.first()).toHaveAccessibleName('Assigned to me');
  await expect(segments.nth(1)).toHaveAccessibleName('Everyone on the team');
  // A cut label shows whole in a tooltip, on hover and keyboard focus.
  await segments.nth(1).hover();
  await expect(tooltip).toHaveText('Everyone on the team');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
  await segments.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(segments.nth(1)).toBeFocused();
  await expect(segments.nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(tooltip).toHaveText('Everyone on the team');
  await page.keyboard.press('Escape');

  // With room the labels show whole, without a tooltip, and the options still share the rail.
  const wide = page
    .getByTestId('segments-wide-light')
    .getByRole('radiogroup', { name: 'Scopes light' });
  const widths = await wide
    .getByRole('radio')
    .evaluateAll((radios) => radios.map((radio) => radio.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  expect(
    await wide
      .locator('.env-segmented-control-item-label')
      .evaluateAll((labels) =>
        labels.every((element) => element.scrollWidth <= element.clientWidth),
      ),
  ).toBe(true);
  await wide.getByRole('radio').first().hover();
  await page.clock.runFor(600);
  await expect(tooltip).toHaveCount(0);
  // Without fullWidth the control keeps the width of its options.
  const plain = page
    .getByTestId('segments-light')
    .getByRole('radiogroup', { name: 'Layout light' });
  expect((await plain.boundingBox())!.width).toBeLessThan(300);
});

test('on touch screens a full-width label too long for its share wraps, as no tooltip shows', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1024, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${fixtureUrl}/?fixture=segments`);
  expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  const narrow = page.getByTestId('segments-narrow-light');
  const control = narrow.getByRole('radiogroup', { name: 'Assignments light' });
  const segments = control.getByRole('radio');
  const label = segments.nth(1).locator('.env-segmented-control-item-label');
  // The label shows whole, on two lines, and the options still share the rail evenly.
  await expect(label).not.toHaveCSS('text-overflow', 'ellipsis');
  expect(await label.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const lines = await label.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
  });
  expect(lines).toBeGreaterThan(1);
  const [frame, rail, first, second] = await Promise.all([
    narrow.boundingBox(),
    control.boundingBox(),
    segments.first().boundingBox(),
    segments.nth(1).boundingBox(),
  ]);
  expect(rail!.width).toBeCloseTo(frame!.width, 0);
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(1);
  expect(Math.abs(first!.height - second!.height)).toBeLessThan(1);
  await segments.nth(1).tap();
  await expect(segments.nth(1)).toHaveAttribute('aria-checked', 'true');
  await context.close();
});
