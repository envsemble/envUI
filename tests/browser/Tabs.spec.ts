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
