import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

/**
 * A tab's fill and its label's contrast as painted: the label color over every fill between it and
 * the theme canvas, including the rail's.
 */
function paintedLabel(tab: Locator) {
  return tab.evaluate((node) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const fills: string[] = [];
    for (let current: Element | null = node; current; current = current.parentElement) {
      fills.unshift(getComputedStyle(current).backgroundColor);
      if (current.classList.contains('env-theme')) break;
    }
    const luminance = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const background = luminance(fills);
    const label = luminance([...fills, getComputedStyle(node).color]);
    const [lighter, darker] = [background, label].sort((a, b) => b - a);
    return {
      fill: getComputedStyle(node).backgroundColor,
      ratio: (lighter! + 0.05) / (darker! + 0.05),
    };
  });
}

test('selected and unselected tab labels keep 4.5:1 contrast at rest and on hover', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=tab-states`);
  // Without transitions, a hovered tab shows its final colors at once.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const failures: string[] = [];
  for (const theme of ['light', 'dark']) {
    const tabs = page.getByTestId(`tab-states-${theme}`).getByRole('tab');
    // Five kinds of button at two densities, each with a selected and an unselected tab.
    await expect(tabs).toHaveCount(20);
    for (const tab of await tabs.all()) {
      const name = await tab.evaluate(
        (node) =>
          `${node.closest('[role="tablist"]')!.getAttribute('aria-label')}: ${node.textContent} ` +
          (node.getAttribute('aria-selected') === 'true' ? 'selected' : 'unselected'),
      );
      await page.mouse.move(0, 0);
      const rest = await paintedLabel(tab);
      await tab.hover();
      const hover = await paintedLabel(tab);
      if (hover.fill === rest.fill) failures.push(`${name} shows no hover`);
      if (rest.ratio < 4.5) failures.push(`${name} at rest: ${rest.ratio.toFixed(2)}`);
      if (hover.ratio < 4.5) failures.push(`${name} on hover: ${hover.ratio.toFixed(2)}`);
    }
  }
  expect(failures).toEqual([]);
});

test('compact tabs make the whole rail as tall as a compact control', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=compact-tabs`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`compact-tabs-${theme}`);
    const control = (await scope.getByTestId(`compact-control-${theme}`).boundingBox())!;
    const rail = (await scope.getByRole('tablist').boundingBox())!;
    expect(Math.abs(rail.height - control.height), theme).toBeLessThan(1);
    // The counter fits inside its tab, centred on the label's line.
    const tab = (await scope.getByRole('tab', { name: /Submissions/ }).boundingBox())!;
    const counter = (await scope.locator('.env-counter-badge').boundingBox())!;
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
