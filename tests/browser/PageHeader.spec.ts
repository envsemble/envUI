import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=page-headers`;

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('PageHeader', () => {
  test('renders its title at its heading level, with the trail above it', async ({ page }) => {
    await page.goto(fixture);
    const responsive = page.getByTestId('responsive');
    await expect(responsive.getByRole('heading', { level: 1 })).toHaveText('Northwind launch');
    await expect(page.getByTestId('small').getByRole('heading', { level: 2 })).toHaveText(
      'Members',
    );
    const trail = responsive.getByRole('navigation', { name: 'Breadcrumb' });
    expect((await box(trail)).y).toBeLessThan((await box(responsive.getByRole('heading'))).y);
    await expect(responsive.getByText('Everything the launch needs')).toBeVisible();
    // It is no landmark, so a page never gets a second banner.
    await expect(page.getByRole('banner')).toHaveCount(0);
  });

  test('moves its actions under the title in a narrow container', async ({ page }) => {
    await page.goto(fixture);
    const responsive = page.getByTestId('responsive');
    const title = responsive.getByRole('heading', { level: 1 });
    const action = responsive.getByRole('button', { name: 'New task' });
    const description = responsive.getByText('Everything the launch needs');
    // Wide, the actions sit at the end of the title row.
    expect((await box(action)).y).toBeLessThan((await box(description)).y);
    const wideTitle = await box(title);
    expect((await box(action)).x).toBeGreaterThan(wideTitle.x + wideTitle.width);
    await page.getByRole('button', { name: 'Narrow header' }).click();
    // Narrow, they follow the description, from the inline start.
    const under = await box(description);
    await expect
      .poll(async () => (await box(action)).y)
      .toBeGreaterThanOrEqual(under.y + under.height);
    const share = responsive.getByRole('button', { name: 'Share' });
    expect((await box(share)).x).toBeCloseTo((await box(title)).x, 0);
    // The title wraps rather than being cut short.
    const overflow = await title.evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('gives its actions and toolbar the control size', async ({ page }) => {
    await page.goto(fixture);
    const small = page.getByTestId('small');
    const heights = async (header: Locator, name: string) =>
      (await box(header.getByRole('button', { name }))).height;
    // controlSize sm: 2 rem.
    expect(await heights(small, 'Invite')).toBeCloseTo(32, 0);
    expect(await heights(small, 'Export')).toBeCloseTo(32, 0);
    // The default, md: 2.5 rem.
    expect(await heights(page.getByTestId('responsive'), 'Share')).toBeCloseTo(40, 0);
  });

  test(
    'sticks at the top of the body that scrolls, and what takes focus keeps clear of it',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(fixture);
      const body = page.locator('.env-scaffold-body');
      const sticky = page.getByTestId('sticky');
      await body.evaluate((element) => element.scrollTo(0, 600));
      await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(600);
      // It sticks at the body's top, across the page's gutters.
      const top = (await box(body)).y;
      await expect.poll(async () => (await box(sticky)).y).toBeCloseTo(top, 0);
      // Nothing measures it: no height is published on the page.
      const page_ = page.getByTestId('page');
      expect(
        await page_.evaluate((element) =>
          element.style.getPropertyValue('--env-page-header-block-size'),
        ),
      ).toBe('');
      // A field scrolled into view as it takes focus lands below the header, from its rows alone.
      await body.evaluate((element) => element.scrollTo(0, 0));
      await page.getByTestId('far-field').focus();
      const header = await box(sticky);
      await expect
        .poll(async () => (await box(page.getByTestId('far-field'))).y)
        .toBeGreaterThanOrEqual(header.y + header.height);
    },
  );
});
