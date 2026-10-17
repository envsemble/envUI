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

  test('sticks under the frame header and publishes its height on its page', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto(fixture);
    const sticky = page.getByTestId('sticky');
    const content = page.getByTestId('sticky-content');
    // Scrolled well past the header's place, once the page is long enough to scroll that far.
    await expect
      .poll(() => page.evaluate(() => (window.scrollTo(0, 1200), window.scrollY)))
      .toBeGreaterThan(1000);
    // It sticks at --env-frame-sticky-top, 48 px, under the frame header.
    await expect.poll(async () => (await box(sticky)).y).toBeCloseTo(48, 0);
    const height = (await box(sticky)).height;
    const published = await page
      .getByTestId('page')
      .evaluate((element) => element.style.getPropertyValue('--env-page-header-block-size'));
    expect(Number.parseFloat(published)).toBeCloseTo(height, 0);
    // Content sticks below both, from the two variables.
    await expect.poll(async () => (await box(content)).y).toBeCloseTo(48 + height, 0);
    // Without a frame's offset, it sticks at the app shell's.
    await sticky.evaluate((element) => {
      const frame = element.closest<HTMLElement>('[style*="--env-frame-sticky-top"]')!;
      frame.style.removeProperty('--env-frame-sticky-top');
      frame.style.setProperty('--env-app-sticky-top', '32px');
    });
    await expect.poll(async () => (await box(sticky)).y).toBeCloseTo(32, 0);
  });
});
