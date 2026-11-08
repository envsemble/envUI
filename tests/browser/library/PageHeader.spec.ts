import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

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
      // It publishes its height on its page, which keeps what scrolls into view clear of it.
      const page_ = page.getByTestId('page');
      const published = () =>
        page_.evaluate((element) => element.style.getPropertyValue('--env-page-header-block-size'));
      const height = () => sticky.evaluate((element) => `${element.offsetHeight}px`);
      await expect.poll(published).toBe(await height());
      // A field scrolled into view as it takes focus lands below the header.
      await body.evaluate((element) => element.scrollTo(0, 0));
      await page.getByTestId('far-field').focus();
      const header = await box(sticky);
      await expect
        .poll(async () => (await box(page.getByTestId('far-field'))).y)
        .toBeGreaterThanOrEqual(header.y + header.height);
      // In a compact page its title wraps over more lines than CSS reckons with; the measured
      // height counts them.
      const before = await height();
      await page.getByTestId('frame').evaluate((element) => {
        element.style.inlineSize = '20rem';
      });
      await expect.poll(height).not.toBe(before);
      await expect.poll(published).toBe(await height());
      await body.evaluate((element) => element.scrollTo(0, 0));
      await page.getByTestId('far-field').blur();
      await page.getByTestId('far-field').focus();
      const wrapped = await box(sticky);
      await expect
        .poll(async () => (await box(page.getByTestId('far-field'))).y)
        .toBeGreaterThanOrEqual(wrapped.y + wrapped.height);
    },
  );

  test('takes the muted fill, not a line, once content scrolls beneath it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fixture);
    const body = page.locator('.env-scaffold-body');
    const sticky = page.getByTestId('sticky');
    const [pageColor, muted] = await sticky.evaluate((element) =>
      ['var(--env-color-bg-page)', 'var(--env-color-bg-muted)'].map((value) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = value;
        element.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      }),
    );
    await expect(sticky).not.toHaveAttribute('data-scrolled');
    await expect(sticky).toHaveCSS('background-color', pageColor);
    await body.evaluate((element) => element.scrollTo(0, 600));
    await expect(sticky).toHaveAttribute('data-scrolled');
    await expect(sticky).toHaveCSS('background-color', muted);
    await expect(sticky).toHaveCSS('border-bottom-width', '0px');
    await body.evaluate((element) => element.scrollTo(0, 0));
    await expect(sticky).not.toHaveAttribute('data-scrolled');
    await expect(sticky).toHaveCSS('background-color', pageColor);
  });
});

test.describe('Page', () => {
  test('its gutters follow the window class of the region it sits in', async ({ page }) => {
    await page.goto(fixture);
    const frame = page.getByTestId('frame');
    const gutter = () =>
      page.getByTestId('page').evaluate((element) => getComputedStyle(element).paddingInlineStart);
    for (const [width, expected] of [
      ['30rem', '16px'],
      ['37rem', '16px'],
      ['38rem', '24px'],
      ['60rem', '24px'],
    ] as const) {
      await frame.evaluate((element, value) => {
        element.style.inlineSize = value;
      }, width);
      await expect.poll(gutter, `${width} wide`).toBe(expected);
    }
  });
});
