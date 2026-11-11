import { test, expect } from '@playwright/test';
import { siteBuildUrl } from '../helpers/Servers';
import { componentDocuments } from '../../../apps/site/src/routes/PageModel';
import { goTo } from '../helpers/SiteSpecHelpers';

// Figures with overlays open on their stages, and the notifications they show.

test('figures with open overlays keep them in their stages, overviews live and others inert, and leave the page alone', async ({
  page,
}) => {
  test.slow();
  const pages = componentDocuments
    .filter((document) =>
      (document.outline ?? []).some((section) => section.examples.some((example) => example.open)),
    )
    .map(({ id }) => id);
  expect(pages).toEqual(expect.arrayContaining(['dialog', 'menu', 'tooltip', 'toast', 'select']));
  await page.goto(`${siteBuildUrl}/`);
  for (const id of pages) {
    await goTo(page, `/components/${id}`);
    const rooms = page.locator('.catalogue-open-example');
    await expect(rooms.first()).toBeVisible();
    await expect(page.locator('.site-loading')).toHaveCount(0);
    // Every open figure shows an overlay, inside its stage. The Overview's is the component at
    // rest, open, which people can use; any other is a picture: inert.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            [...document.querySelectorAll<HTMLElement>('.catalogue-open-example')].flatMap(
              (room) => {
                const stage = room
                  .closest('.site-live-example, .site-verdict-stage, .site-anatomy-stage')!
                  .getBoundingClientRect();
                const surfaces = [
                  ...room.querySelectorAll(
                    '.env-popup, .env-dialog, .env-sheet, .env-command-palette, .env-toast',
                  ),
                ];
                const name = room.dataset.openExample;
                const overview = !!room.closest('[data-section="overview"]');
                if (overview && room.inert) return [`${name}, an overview, is inert`];
                if (!overview && !room.inert) return [`${name} is not inert`];
                if (!surfaces.length) return [`${name} shows no overlay`];
                return surfaces
                  .map((surface) => surface.getBoundingClientRect())
                  .filter(
                    (box) =>
                      box.left < stage.left - 1 ||
                      box.right > stage.right + 1 ||
                      box.top < stage.top - 1 ||
                      box.bottom > stage.bottom + 1,
                  )
                  .map(() => `${name} reaches past its stage`);
              },
            ),
          ),
        { message: `${id}: open figures` },
      )
      .toEqual([]);
    // No figure took focus or locked the page.
    expect(
      await page.evaluate(() => ({
        focusInFigure: !!document.activeElement?.closest('.catalogue-open-example'),
        locked: [document.documentElement, document.body].some(
          (element) => getComputedStyle(element).overflow === 'hidden',
        ),
        hidden: !!document.querySelector('main [aria-hidden="true"] .site-figures'),
      })),
      id,
    ).toEqual({ focusInFigure: false, locked: false, hidden: false });
  }
  // The page still scrolls with the wheel.
  const scroller = page.locator('.env-scaffold-body');
  const before = await scroller.evaluate((element) => element.scrollTop);
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).not.toBe(before);
});

test("an overlay's overview rests open, and people can close it and open it again", async ({
  page,
}) => {
  await page.goto(`${siteBuildUrl}/components/dialog`);
  const room = page.locator('[data-section="overview"] .catalogue-open-example').first();
  const dialog = room.locator('.env-dialog');
  // Open as the page loads, without taking focus.
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await room.getByRole('button', { name: 'View project', exact: true }).click();
  await expect(dialog).toBeVisible();
  // What opens a palette stays where it is as the palette closes and opens again.
  await page.goto(`${siteBuildUrl}/components/command-palette`);
  const palette = page.locator('[data-section="overview"] .catalogue-open-example').first();
  const search = palette.getByRole('button', { name: 'Search', exact: true });
  // Where it is within the figure's frame, which pressing a key in the palette may scroll.
  const inFrame = () =>
    search.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const frame = button.closest('.site-live-example')!.getBoundingClientRect();
      return { x: box.x - frame.x, y: box.y - frame.y, width: box.width, height: box.height };
    });
  await expect(palette.locator('.env-command-palette')).toBeVisible();
  const open = await inFrame();
  await palette.getByRole('combobox').press('Escape');
  await expect(palette.locator('.env-command-palette')).toHaveCount(0);
  expect(await inFrame()).toEqual(open);
  // A select's list takes the pointer too, and its choice sticks.
  await page.goto(`${siteBuildUrl}/components/select`);
  const select = page.locator('[data-section="overview"] .catalogue-open-example').first();
  await select.getByRole('option', { name: 'Private', exact: true }).click();
  await expect(select.locator('.env-select-trigger')).toContainText('Private');
});

test("F6 passes the figures' notifications by, to the browser @engines", async ({ page }) => {
  await page.goto(`${siteBuildUrl}/components/toast`);
  await expect(page.locator('.catalogue-open-example .env-toast').first()).toBeVisible();
  // While no notification of the page is open, F6 is the browser's: the figures' notices, which
  // are pictures, don't take it.
  await page.evaluate(() =>
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F6') document.body.dataset.f6Prevented = String(event.defaultPrevented);
    }),
  );
  await page.keyboard.press('F6');
  await expect(page.locator('body')).toHaveAttribute('data-f6-prevented', 'false');
  // Every catalogue figure that raises a notice plays it or shows it as a picture, so none is
  // live; F6 reaching a live notice is Toast's own (Toast.spec.ts).
});
