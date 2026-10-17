import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=stacking`;

/**
 * Each layer's z-index before the stacking tokens, from the literal values the style sheets had.
 * The tokens must keep their order: every pair stacks as it did.
 */
const literals: Record<string, number> = {
  'toast-leaving': -1,
  'panel-dock-panel-hidden': -1,
  'panel-dock-panel-fill': 0,
  'app-sidebar-resize': 1,
  'loading-bar-contained': 1,
  'panel-dock-panel': 1,
  'panel-dock-header': 1,
  'table-sticky-header-cell': 1,
  'table-column-resize': 1,
  'panel-dock-panel-active': 2,
  'panel-dock-resize': 2,
  'panel-dock-strip': 3,
  'panel-dock': 10,
  'app-sidebar': 20,
  'app-topbar': 25,
  'app-sidebar-backdrop': 29,
  'app-sidebar-narrow': 30,
  'dialog-backdrop': 100,
  'dialog-positioner': 101,
  'command-palette-positioner': 101,
  'popup-positioner': 110,
  'menu-positioner': 110,
  'toast-viewport': 120,
  'tooltip-positioner': 130,
  'loading-bar': 140,
};

/** The computed z-index of every layer in the fixture's ladder. */
async function ladder(page: Page) {
  return page
    .locator('[data-layer]')
    .evaluateAll((elements) =>
      Object.fromEntries(
        elements.map((element) => [
          element.getAttribute('data-layer')!,
          getComputedStyle(element).zIndex,
        ]),
      ),
    );
}

/** Whether nothing between an element and the root makes a stacking context of its own. */
function inRootContext(element: Locator) {
  return element.evaluate((node) => {
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (
        (style.position !== 'static' && style.zIndex !== 'auto') ||
        style.opacity !== '1' ||
        style.transform !== 'none' ||
        style.filter !== 'none' ||
        style.isolation === 'isolate' ||
        /\b(?:paint|layout|strict|content)\b/.test(style.contain)
      )
        return false;
    }
    return true;
  });
}

const zIndex = (element: Locator) =>
  element.evaluate((node) => Number(getComputedStyle(node).zIndex));

test('every layer takes its z-index from a stacking token, in the order it had', async ({
  page,
}) => {
  await page.goto(fixture);
  const computed = await ladder(page);
  // Each layer resolves to a number: a token that is missing would leave it at auto.
  for (const [layer, value] of Object.entries(computed)) expect(value, layer).toMatch(/^-?\d+$/);
  const layers = Object.keys(literals);
  expect(Object.keys(computed).sort()).toEqual([...layers, 'rich-text-suggestions'].sort());
  const changed: string[] = [];
  for (const a of layers)
    for (const b of layers) {
      const before = Math.sign(literals[a]! - literals[b]!);
      const after = Math.sign(Number(computed[a]) - Number(computed[b]));
      if (before !== after) changed.push(`${a} against ${b}: ${before} before, ${after} now`);
    }
  expect(changed).toEqual([]);
  // The token values themselves.
  expect(computed).toMatchObject({
    'panel-dock-panel-fill': '0',
    'table-sticky-header-cell': '1',
    'app-sidebar': '20',
    'dialog-backdrop': '90',
    'dialog-positioner': '100',
    'menu-positioner': '110',
    'toast-viewport': '120',
    'tooltip-positioner': '130',
  });
  // Suggestions are a popup at the popover level, on the positioner the editor places beside the
  // caret. Their 100 never applied, as it was on a static element inside the positioner.
  expect(computed['rich-text-suggestions']).toBe('110');
});

test('a menu, a notice and a tooltip open over a modal dialog', async ({ page }) => {
  await page.goto(fixture);
  await page.getByRole('button', { name: 'Open the layered dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Layered dialog' });
  await expect(dialog).toBeVisible();
  const backdrop = page.locator('.env-dialog-backdrop').filter({ visible: true });
  const dialogLayer = page.locator('.env-dialog-positioner').filter({ has: dialog });

  // A menu inside the dialog: its items are what a press over them reaches.
  await dialog.getByRole('button', { name: 'Actions' }).click();
  const menu = page.getByRole('menu', { name: 'Dialog actions' });
  await expect(menu).toBeVisible();
  const menuLayer = page.locator('.env-menu-positioner').filter({ has: menu });
  for (const layer of [backdrop, dialogLayer, menuLayer])
    expect(await inRootContext(layer)).toBe(true);
  expect(await zIndex(backdrop)).toBeLessThan(await zIndex(dialogLayer));
  expect(await zIndex(dialogLayer)).toBeLessThan(await zIndex(menuLayer));
  const item = menu.getByRole('menuitem', { name: 'Archive' });
  const box = (await item.boundingBox())!;
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent,
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    ),
  ).toBe('Archive');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(dialog).toBeVisible();

  // A notice shown from the dialog stacks over it.
  await dialog.getByRole('button', { name: 'Show a notice' }).click();
  const notice = page.locator('.env-toast-message', { hasText: 'Saved over the dialog' });
  await expect(notice).toBeVisible();
  const toastLayer = page.locator('.env-toast-viewport').filter({ has: notice });
  expect(await inRootContext(toastLayer)).toBe(true);
  expect(await zIndex(toastLayer)).toBeGreaterThan(await zIndex(dialogLayer));

  // A tooltip in the dialog stacks over the dialog and the notice.
  await dialog.getByRole('button', { name: 'Hover for a tooltip' }).hover();
  const tooltip = page.getByText('Explains the control');
  await expect(tooltip).toBeVisible();
  const tooltipLayer = page.locator('.env-tooltip-positioner').filter({ has: tooltip });
  expect(await inRootContext(tooltipLayer)).toBe(true);
  expect(await zIndex(tooltipLayer)).toBeGreaterThan(await zIndex(toastLayer));
  expect(await zIndex(tooltipLayer)).toBeGreaterThan(await zIndex(dialogLayer));
});
