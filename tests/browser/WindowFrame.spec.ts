import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const windowFrame = `${fixtureUrl}/?fixture=window-frame`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

/** Computed app-region of an element, or null where the engine has no app regions. */
function appRegion(locator: Locator) {
  return locator.evaluate((element) => {
    if (!CSS.supports('app-region', 'drag') && !CSS.supports('-webkit-app-region', 'drag'))
      return null;
    const style = getComputedStyle(element);
    return style.getPropertyValue('app-region') || style.getPropertyValue('-webkit-app-region');
  });
}

/** The declared value of a property in the rule for a selector, searched through every sheet. */
function declaredValue(page: Page, selector: string, property: string) {
  return page.evaluate(
    ({ selector, property }) => {
      const find = (rules: CSSRuleList): string | undefined => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && rule.selectorText === selector)
            return rule.style.getPropertyValue(property);
          const nested =
            rule instanceof CSSImportRule
              ? rule.styleSheet?.cssRules
              : 'cssRules' in rule
                ? (rule as CSSGroupingRule).cssRules
                : undefined;
          const value = nested && find(nested);
          if (value) return value;
        }
        return undefined;
      };
      for (const sheet of Array.from(document.styleSheets)) {
        const value = find(sheet.cssRules);
        if (value) return value;
      }
      return undefined;
    },
    { selector, property },
  );
}

test('WindowFrame.Root fills the window and WindowFrame.Content scrolls below the title bar', async ({
  page,
}) => {
  // With motion allowed, the keyboard scrolls smoothly.
  await page.goto(windowFrame);
  const content = page.getByTestId('window-frame-content');
  await expect(content).toHaveClass(/env-window-frame-content/);
  const viewport = page.viewportSize()!;
  const geometry = await content.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const root = document.scrollingElement!;
    return {
      top: box.top,
      bottom: box.bottom,
      overflowY: style.overflowY,
      gutter: style.getPropertyValue('scrollbar-gutter'),
      gutterSupported: CSS.supports('scrollbar-gutter', 'stable'),
      documentOverflow: root.scrollHeight - root.clientHeight,
      overflows: element.scrollHeight > element.clientHeight,
    };
  });
  // The content runs from the title bar to the bottom of the window and scrolls; the document
  // does not, so no scrollbar reaches under the window controls.
  expect([geometry.top, geometry.bottom]).toEqual([40, viewport.height]);
  expect(geometry.overflowY).toBe('auto');
  expect(geometry.overflows).toBe(true);
  expect(geometry.documentOverflow).toBeLessThanOrEqual(0);
  if (geometry.gutterSupported) expect(geometry.gutter).toBe('stable');
  // The keyboard scrolls it from a fresh window.
  await page.keyboard.press('PageDown');
  await expect
    .poll(() => content.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(viewport.height / 2);
  await page.keyboard.press('Home');
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(0);
  // Content's ref is the scrolling element, for restoring scroll positions.
  await page.getByRole('button', { name: 'Restore start page scroll' }).click();
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(200);
});

test('WindowFrame.TitleBar keeps at least --env-title-bar-height, which an application can set', async ({
  page,
}) => {
  await page.goto(windowFrame);
  // The window reports a smaller height once the page is zoomed in; the bar keeps its least height.
  // Its hairline runs below the title bar area, under the window controls too. Compared without
  // white space, which a declaration that wraps over lines keeps.
  const compact = (value: string | undefined) => value?.replace(/\s+/g, '');
  expect(compact(await declaredValue(page, '.env-window-frame-title-bar', 'block-size'))).toContain(
    'max(calc(env(titlebar-area-height,0px)+0.0625rem)',
  );
  const bar = page.getByTestId('title-bar');
  await bar.evaluate((element: HTMLElement) =>
    element.style.setProperty('--env-title-bar-height', '48px'),
  );
  expect((await bar.boundingBox())!.height).toBe(48);
});

test('WindowFrame.TitleBar leaves room for the window controls, with small controls that take no drag', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.goto(windowFrame);
  const bar = page.getByTestId('title-bar');
  await expect(bar).toHaveClass(/env-window-frame-title-bar/);
  const box = (await bar.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect([box.x, box.y, box.width, box.height]).toEqual([0, 0, viewport.width, 40]);
  // A normal block: the application decides whether it sticks or stays fixed.
  expect(await bar.evaluate((element) => getComputedStyle(element).position)).toBe('static');
  const mark = (await page.getByTestId('title-bar-mark').boundingBox())!;
  const settings = (await page.getByRole('button', { name: 'Settings' }).boundingBox())!;
  const title = (await page.getByTestId('title-bar-title').boundingBox())!;
  expect(mark.x).toBeCloseTo(12, 0);
  expect(settings.x + settings.width).toBeCloseTo(viewport.width - 12, 0);
  expect(title.x + title.width / 2).toBeCloseTo(viewport.width / 2, 0);
  for (const control of [
    page.getByRole('button', { name: 'Share' }),
    page.getByRole('button', { name: 'Settings' }),
    page.getByRole('button', { name: 'Back' }),
    page.getByRole('menuitem', { name: 'File', exact: true }),
  ])
    expect((await control.boundingBox())!.height).toBeCloseTo(32, 0);
  // Buttons that set no size take the small one from the title bar.
  await expect(page.getByRole('button', { name: 'Back' })).toHaveAttribute('data-size', 'sm');
  const region = await appRegion(bar);
  if (region !== null) {
    expect(region).toBe('drag');
    expect(await appRegion(page.getByRole('button', { name: 'Share' }))).toBe('no-drag');
    expect(await appRegion(page.getByRole('menuitem', { name: 'File', exact: true }))).toBe(
      'no-drag',
    );
  }
  // The height and the space beside the window controls come from the title bar area
  // environment variables, with fallbacks for an ordinary browser window.
  expect(await declaredValue(page, '.env-window-frame-title-bar', 'block-size')).toContain(
    'env(titlebar-area-height',
  );
  expect(await declaredValue(page, '.env-window-frame-title-bar', 'padding-left')).toContain(
    'env(titlebar-area-x',
  );
  expect(await declaredValue(page, '.env-window-frame-title-bar', 'padding-right')).toContain(
    'env(titlebar-area-width',
  );
  // The menubar inside opens its menus as anywhere else.
  await page.getByRole('menuitem', { name: 'File', exact: true }).click();
  await expect(page.getByRole('menu', { name: 'File' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('buttons in a title bar that set no variant are ghost, in the quiet icon color', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(windowFrame);
  const bar = page.getByTestId('title-bar');
  const color = (token: string) =>
    bar.evaluate((element, value) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${value})`;
      element.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    }, token);
  const back = page.getByRole('button', { name: 'Back' });
  await expect(back).toHaveAttribute('data-variant', 'ghost');
  // Like the window controls beside them, not the link blue; they darken while hovered.
  await expect(back).toHaveCSS('color', await color('--env-color-fg-muted'));
  expect(await color('--env-color-fg-muted')).not.toBe(await color('--env-color-fg-link'));
  await back.hover();
  await expect(back).toHaveCSS('color', await color('--env-color-fg-default'));
  // A button's own variant wins.
  await expect(page.getByRole('button', { name: 'Settings' })).toHaveAttribute(
    'data-variant',
    'secondary',
  );
});

test('a title bar keeps text fields inside it free of the drag region', async ({ page }) => {
  await page.goto(windowFrame);
  const bar = page.getByTestId('title-bar');
  // A field's box around its input, which its label and padding fill, takes presses too.
  const box = await bar.evaluate((element) => {
    const field = document.createElement('div');
    field.innerHTML = '<input aria-label="Find" />';
    element.querySelector('.env-window-frame-title-bar-end')!.append(field);
    const style = getComputedStyle(field);
    const region =
      style.getPropertyValue('app-region') || style.getPropertyValue('-webkit-app-region');
    field.remove();
    return region;
  });
  if ((await appRegion(bar)) !== null) expect(box).toBe('no-drag');
});
