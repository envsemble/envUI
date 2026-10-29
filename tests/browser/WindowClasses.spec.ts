import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

// The env-window container: the outermost theme boundary takes the width its context gives it,
// so it never collapses where its parent sizes to content, nested boundaries are no containers,
// a region opts in with a primitive's container prop, and popups measure their portal's boundary.
// The fixture's own root is a Theme; the boundaries outside it are added to the body.

/** Adds markup to the end of the body, outside the fixture's own Theme. */
async function append(page: Page, html: string) {
  await page.evaluate((markup) => {
    const holder = document.createElement('div');
    holder.innerHTML = markup;
    document.body.append(...holder.children);
  }, html);
}

const width = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => element.getBoundingClientRect().width);

const containerType = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => getComputedStyle(element).containerType);

test('the outermost boundary is the window and never collapses, nested ones size to content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  await expect(page.getByTestId('primitives')).toBeVisible();
  await append(
    page,
    `<div id="centered-root" style="display: grid; place-items: center; inline-size: 40rem">
       <div class="env-theme" data-env-theme="light" id="centered-theme">An application</div>
     </div>
     <div data-env-layout="row" id="outer-row" style="inline-size: 40rem">
       <div class="env-theme" data-env-theme="dark" id="outer-island">Dark island</div>
       <span>Beside it</span>
     </div>`,
  );
  // A Theme that is the application's root, in a parent that centres it: as wide as the parent.
  expect(await width(page, '#centered-theme')).toBeCloseTo(640, 0);
  expect(await containerType(page, '#centered-theme')).toBe('inline-size');
  // An outermost Theme in a row shares the row instead of collapsing.
  expect(await width(page, '#outer-island')).toBeGreaterThan(100);
  // One that renders an inline element is a block as wide as its parent, and one with padding
  // holds it inside that width rather than overflow.
  await append(
    page,
    `<div id="plain-root" style="inline-size: 40rem">
       <span class="env-theme" data-env-theme="light" id="inline-theme">Inline</span>
       <div class="env-theme" data-env-theme="light" id="padded-theme" style="padding: 1rem">
         Padded
       </div>
     </div>`,
  );
  expect(await width(page, '#inline-theme')).toBeCloseTo(640, 0);
  expect(await containerType(page, '#inline-theme')).toBe('inline-size');
  expect(await width(page, '#padded-theme')).toBeCloseTo(640, 0);
  // The fixture's own root Theme is the window; a Theme inside it, such as a dark island in a Row,
  // sizes to its content and is no container.
  const root = page.locator('#root > .env-theme');
  expect(await root.evaluate((element) => getComputedStyle(element).containerName)).toBe(
    'env-window',
  );
  await page.evaluate(() => {
    const row = document.createElement('div');
    row.dataset.envLayout = 'row';
    row.id = 'nested-row';
    row.innerHTML =
      '<div class="env-theme" data-env-theme="dark" id="nested-island">Dark island</div><span>Beside it</span>';
    document.querySelector('[data-testid="primitives"]')!.append(row);
  });
  expect(await containerType(page, '#nested-island')).toBe('normal');
  const islandWidth = await width(page, '#nested-island');
  expect(islandWidth).toBeGreaterThan(40);
  expect(islandWidth).toBeLessThan(await width(page, '#nested-row'));
});

test('a primitive with container="env-window" is the window of what it holds', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  await expect(page.getByTestId('primitives')).toBeVisible();
  await page.addStyleTag({
    content:
      '@layer env.components { @container env-window (width >= 37.5rem) { .window-probe { --window-probe: medium; } } }',
  });
  await page.evaluate(() => {
    const scope = document.querySelector('[data-testid="primitives"]')!;
    scope.insertAdjacentHTML(
      'beforeend',
      `<div data-env-layout="box" data-env-container style="--env-layout-container: env-window; inline-size: 30rem">
         <span class="window-probe" id="narrow-probe">Narrow</span>
       </div>
       <span class="window-probe" id="page-probe">Page</span>`,
    );
  });
  const probe = (id: string) =>
    page
      .locator(id)
      .evaluate((element) => getComputedStyle(element).getPropertyValue('--window-probe'));
  // A 30 rem region is compact, though the page around it is not.
  expect(await probe('#narrow-probe')).toBe('');
  expect(await probe('#page-probe')).toBe('medium');
});

test('a date picker stacks its time under the calendar in a compact window', async ({ page }) => {
  for (const [viewport, beside] of [
    [1024, true],
    [480, false],
  ] as const) {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto(`${fixtureUrl}/?fixture=date-picker`);
    await page.getByRole('combobox', { name: 'Meeting light', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Meeting light' });
    await expect(dialog).toBeVisible();
    // The popup's portal boundary is the window, as wide as the document's body.
    expect(
      await dialog.evaluate(
        (element) => getComputedStyle(element.closest('.env-popup-theme')!).containerName,
      ),
    ).toBe('env-window');
    await expect(async () => {
      const calendar = (await dialog.locator('.env-calendar').boundingBox())!;
      const time = (await dialog.locator('.env-date-picker-time').boundingBox())!;
      if (beside) expect(time.x).toBeGreaterThan(calendar.x + calendar.width - 1);
      else expect(time.y).toBeGreaterThan(calendar.y + calendar.height - 1);
    }).toPass();
  }
});

// With a document root that isn't themed, as in the fixture, each portal's boundary is outermost.
// Fixed overlays still cover the viewport and stack over the page, popups follow their trigger, and
// what a dialog holds lays out at the window's class. Each check runs as browsers do today, and
// again as an engine whose container-type also contains layout would, which makes a container the
// containing block of its fixed and absolute descendants: `contain: layout` on every container.
for (const containsLayout of [false, true]) {
  const as = containsLayout ? ', where a container contains layout' : '';
  test.describe(`portals with an unthemed document root${as}`, () => {
    /** Opens the page, scrolled, so a box placed against anything but the viewport shows. */
    async function open(page: Page, address: string, { scroll = true } = {}) {
      if (containsLayout)
        await page.addInitScript(() => {
          const contain = (node: Node) => {
            if (!(node instanceof HTMLElement)) return;
            for (const element of [node, ...node.querySelectorAll<HTMLElement>('*')])
              if (getComputedStyle(element).containerType !== 'normal')
                element.style.contain = 'layout';
          };
          new MutationObserver((records) =>
            records.forEach((record) => record.addedNodes.forEach(contain)),
          ).observe(document, { childList: true, subtree: true });
        });
      await page.goto(address);
      await expect(page.locator('html')).not.toHaveClass(/env-theme/);
      if (scroll)
        await page.evaluate(() => {
          document.body.style.minBlockSize = '300vh';
          window.scrollTo(0, 400);
        });
    }

    test(
      'a dialog’s backdrop and positioner cover the viewport, over the page',
      { tag: '@engines' },
      async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 700 });
        await open(page, `${fixtureUrl}/?fixture=dialog-variants`);
        await page.getByRole('button', { name: 'Open wide dialog' }).click();
        const dialog = page.getByRole('dialog', { name: 'Wide details' });
        await expect(dialog).toBeVisible();
        for (const selector of ['.env-dialog-backdrop', '.env-dialog-positioner']) {
          const box = await page.locator(selector).evaluate((element) => {
            const { x, y, width, height } = element.getBoundingClientRect();
            return { x, y, width, height };
          });
          expect(box, selector).toEqual({ x: 0, y: 0, width: 1024, height: 700 });
        }
        // The backdrop is what shows at a corner, over the page, and the dialog over the backdrop.
        const top = await page.evaluate(() => {
          const corner = document.elementFromPoint(4, 4);
          const box = document.querySelector('[role="dialog"]')!.getBoundingClientRect();
          const middle = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
          return {
            backdrop: corner?.closest('.env-dialog-backdrop') !== null,
            dialog: middle?.closest('[role="dialog"]') !== null,
          };
        });
        expect(top).toEqual({ backdrop: true, dialog: true });
        // A press on the backdrop reaches it through the overlay's layer, and closes the dialog.
        await page.mouse.click(4, 4);
        await expect(dialog).toBeHidden();
      },
    );

    test('a toast sits at the window’s edge', { tag: '@engines' }, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 700 });
      await open(page, `${fixtureUrl}/?fixture=toast`);
      await page.getByTestId('toast-queue-bottom').click();
      const viewport = page.locator('.env-toast-viewport[data-placement="bottom-end"]');
      await expect(viewport.locator('.env-toast').first()).toBeVisible();
      await expect(async () => {
        const box = (await viewport.boundingBox())!;
        expect(box.y + box.height).toBeLessThanOrEqual(700);
        expect(box.y + box.height).toBeGreaterThan(700 - 64);
        expect(box.x + box.width).toBeLessThanOrEqual(1024);
        expect(box.x + box.width).toBeGreaterThan(1024 - 64);
      }).toPass();
    });

    test(
      'a menu opens against its trigger, also in a grid body, where it takes no cell',
      { tag: '@engines' },
      async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 700 });
        await open(page, `${fixtureUrl}/?fixture=menus`, { scroll: false });
        await page.evaluate(() => {
          document.body.style.display = 'grid';
          document.body.style.gap = '3rem';
        });
        const trigger = page
          .getByTestId('menus-light')
          .getByRole('button', { name: 'View options' });
        await trigger.scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, 40));
        await trigger.click();
        const menu = page.getByRole('menu', { name: 'View options' });
        await expect(menu).toBeVisible();
        await expect(async () => {
          const button = (await trigger.boundingBox())!;
          const box = (await menu.boundingBox())!;
          // Below the trigger, a few pixels apart, or above it where there is no room below.
          const gap =
            box.y >= button.y
              ? box.y - (button.y + button.height)
              : button.y - (box.y + box.height);
          expect(gap).toBeGreaterThanOrEqual(0);
          expect(gap).toBeLessThan(16);
          expect(box.x + box.width).toBeGreaterThan(button.x);
          expect(box.x).toBeLessThan(button.x + button.width);
        }).toPass();
        // The portal's boundary is the window, at the window's width, and out of flow, so it takes
        // no cell of the grid body.
        const theme = menu.locator('xpath=ancestor::*[contains(@class, "env-popup-theme")][1]');
        const style = await theme.evaluate((element) => {
          const computed = getComputedStyle(element);
          return {
            position: computed.position,
            containerName: computed.containerName,
            width: element.getBoundingClientRect().width,
          };
        });
        expect(style.position).toBe('absolute');
        expect(style.containerName).toBe('env-window');
        expect(style.width).toBeCloseTo(
          await page.evaluate(() => document.documentElement.clientWidth),
          0,
        );
      },
    );

    test('what a dialog holds lays out at the window’s class', async ({ page }) => {
      for (const [width, expected] of [
        [480, ''],
        [1024, 'medium'],
      ] as const) {
        await page.setViewportSize({ width, height: 800 });
        await open(page, `${fixtureUrl}/?fixture=dialog-variants`, { scroll: false });
        await page.addStyleTag({
          content:
            '@layer env.components { @container env-window (width >= 37.5rem) { .env-dialog { --window-probe: medium; } } }',
        });
        await page.getByRole('button', { name: 'Open top dialog' }).click();
        const dialog = page.getByRole('dialog', { name: 'Search plans' });
        await expect(dialog).toBeVisible();
        expect(
          await dialog.evaluate((element) =>
            getComputedStyle(element).getPropertyValue('--window-probe'),
          ),
          `${width} px`,
        ).toBe(expected);
      }
    });
  });
}

test('under a themed document root, portals measure the root and keep their boxes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto(`${fixtureUrl}/?fixture=menus`);
  await page.evaluate(() => {
    document.documentElement.classList.add('env-theme');
    document.documentElement.dataset.envTheme = 'light';
  });
  await page.getByTestId('menus-light').getByRole('button', { name: 'View options' }).click();
  const menu = page.getByRole('menu', { name: 'View options' });
  await expect(menu).toBeVisible();
  const theme = menu.locator('xpath=ancestor::*[contains(@class, "env-popup-theme")][1]');
  expect(await theme.evaluate((element) => getComputedStyle(element).display)).toBe('contents');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).containerName)).toBe(
    'env-window',
  );
});
