import { test, expect, type Page } from '@playwright/test';
import { siteDevUrl, fixtureUrl } from './helpers/Servers';

/** The computed display of the panel each tab of a tab list controls, in order. */
function panelDisplays(page: Page, list: string) {
  return page.getByRole('tablist', { name: list, exact: true }).evaluate((element) =>
    [...element.querySelectorAll('[role="tab"]')].map((tab) => {
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      return panel ? getComputedStyle(panel).display : 'missing';
    }),
  );
}

test('compact tabs make the whole rail as tall as a compact control', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=compact-tabs`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`compact-tabs-${theme}`);
    const control = (await scope.getByTestId(`compact-control-${theme}`).boundingBox())!;
    const rail = (await scope.getByRole('tablist').boundingBox())!;
    expect(Math.abs(rail.height - control.height), theme).toBeLessThan(1);
    // The counter fits inside its tab, centred on the label's line.
    const tab = (await scope.getByRole('tab', { name: /Submissions/ }).boundingBox())!;
    const counter = (await scope.locator('.env-badge[data-count]').boundingBox())!;
    expect(counter.y).toBeGreaterThanOrEqual(tab.y);
    expect(counter.y + counter.height).toBeLessThanOrEqual(tab.y + tab.height);
    const label = await scope.getByRole('tab', { name: /Submissions/ }).evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node.firstChild!);
      return range.getBoundingClientRect();
    });
    expect(
      Math.abs(counter.y + counter.height / 2 - (label.y + label.height / 2)),
      theme,
    ).toBeLessThan(1.5);
  }
});

test('the arrow keys follow the text direction, from dir or from EnvUIProvider', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=rtl-tabs`);
  for (const name of ['Right-to-left tabs', 'Provider tabs']) {
    const list = page.getByRole('tablist', { name });
    await list.getByRole('tab', { name: 'One' }).focus();
    // In right-to-left text the next tab is to the left.
    await page.keyboard.press('ArrowLeft');
    await expect(list.getByRole('tab', { name: 'Two' })).toBeFocused();
    await expect(list.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'One' })).toBeFocused();
  }
});

test('a panel keeps the direction around it, not the tab list’s', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=rtl-tabs`);
  const slider = page.getByRole('slider', { name: 'Volume' });
  await slider.focus();
  // The slider is in a left-to-right region, so → raises it.
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '51');
});

test('a rail with more tabs than fit starts at its chosen first tab @engines', async ({ page }) => {
  // The rail measures its tabs from its own start: in a positioned frame set in from the page's
  // start, it once measured them from the frame's and rested scrolled past the chosen tab.
  await page.goto(`${fixtureUrl}/?fixture=scrolling-tabs`);
  const list = page.getByRole('tablist', { name: 'Project views' });
  await expect(list.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true');
  const place = () =>
    list.evaluate((rail) => {
      const tab = rail.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
      const box = rail.getBoundingClientRect();
      return {
        overflows: rail.scrollWidth > rail.clientWidth,
        atStart: rail.scrollLeft === 0,
        inView: tab.left >= box.left - 0.5 && tab.right <= box.right + 0.5,
      };
    });
  await expect.poll(place).toEqual({ overflows: true, atStart: true, inView: true });
});

test('filling tabs give the selected panel the height left below the list', async ({ page }) => {
  await page.goto(`${siteDevUrl}/components/tabs`);
  const example = page.locator('.site-live-example[data-example="FillARegion"]');
  const canvas = example.getByRole('tabpanel', { name: 'Canvas' }).locator(':scope > *').first();
  await expect(canvas).toBeVisible();
  // The region, which has a height of its own, the list and the canvas, measured in one frame: the
  // examples above this one are still loading and move it down the page between separate calls.
  const { region, list, box } = await canvas.evaluate((element) => {
    const example = element.closest('.site-live-example')!;
    const rect = (target: Element): { top: number; bottom: number; height: number } =>
      target.getBoundingClientRect().toJSON();
    return {
      region: rect(example.querySelector(':scope > div')!),
      list: rect(example.querySelector('[role="tablist"]')!),
      box: rect(element),
    };
  });
  // The canvas reaches the bottom of the region and starts below the list.
  expect(Math.abs(box.bottom - region.bottom)).toBeLessThanOrEqual(2);
  expect(box.top).toBeGreaterThan(list.bottom - 1);
  expect(box.height).toBeGreaterThan(100);
});

test('filling tabs that keep inactive panels mounted display only the selected panel', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=fill-tabs`);
  for (const theme of ['light', 'dark']) {
    // Tabs nested in a filling panel keep their own layout, and their hidden panel stays hidden.
    await expect
      .poll(() => panelDisplays(page, `Canvas layers ${theme}`))
      .toEqual(['block', 'none']);
    // Alone, and vertical with the list beside a heading through renderList.
    for (const name of [`Filling views ${theme}`, `Vertical filling views ${theme}`]) {
      await expect.poll(() => panelDisplays(page, name)).toEqual(['flex', 'none', 'none']);
      await page
        .getByRole('tablist', { name, exact: true })
        .getByRole('tab', { name: 'History' })
        .click();
      // The outgoing panel is hidden once it has faded out.
      await expect.poll(() => panelDisplays(page, name)).toEqual(['none', 'none', 'flex']);
    }
  }
});

test('every tab is a text tab, the selected one with an indicator under it', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=compact-tabs`);
  const scope = page.getByTestId('compact-tabs-light');
  const rail = scope.getByRole('tablist');
  // No rail fill, and no fill or edge on any tab, whatever its button's variant.
  await expect(rail).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const tabs = rail.getByRole('tab');
  for (const tab of await tabs.all()) {
    await expect(tab).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(tab).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
  }
  const selected = rail.getByRole('tab', { selected: true });
  const other = rail.getByRole('tab', { selected: false }).first();
  const indicator = (tab: typeof selected) =>
    tab.evaluate((element) => {
      const style = getComputedStyle(element, '::after');
      return { content: style.content, height: style.blockSize, color: style.backgroundColor };
    });
  const shown = await indicator(selected);
  expect(shown.content).toBe('""');
  expect(Number.parseFloat(shown.height)).toBeGreaterThan(0);
  expect((await indicator(other)).content).toBe('none');
  // The selected label takes the accent's text color, the others the muted one.
  expect(await selected.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    await other.evaluate((element) => getComputedStyle(element).color),
  );
});
