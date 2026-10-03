import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8766');
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const sources: Record<string, string> = {
  'button-primary': '--color-primary-action',
  'button-important': '--color-accent',
  'button-secondary': '--color-icon-button',
  'button-outlined': '--color-subtle-action',
  'button-destructive': '--color-destructive-action',
  'icon-button': '--color-icon-button',
  navigation: '--color-surface-muted',
  'navigation-selected': '--color-navigation-selected',
};

async function lightness(control: import('@playwright/test').Locator, token?: string) {
  return control.evaluate((element, name) => {
    const probe = document.createElement('span');
    if (name) {
      probe.style.backgroundColor = `var(${name})`;
      element.append(probe);
    }
    const color = getComputedStyle(name ? probe : element).backgroundColor;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => value / 255);
    probe.remove();
    return (Math.max(...rgb) + Math.min(...rgb)) * 50;
  }, token);
}

test('all action and navigation fills derive hover/pressed from their base color', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const [name, token] of Object.entries(sources)) {
      const control = page.getByTestId(`${theme}-${name}`);
      const base = await lightness(control, token);
      const direction = base < 50 ? 1 : -1;
      await control.hover();
      expect(await lightness(control), `${theme}/${name} hover`).toBeCloseTo(
        Math.min(100, Math.max(0, base + direction * 10)),
        0,
      );
      await page.mouse.down();
      expect(await lightness(control), `${theme}/${name} pressed`).toBeCloseTo(
        Math.min(100, Math.max(0, base + direction * 20)),
        0,
      );
      await page.mouse.up();
    }
  }
});

test('the central threshold uses subtraction at 50 and clamps the extremes', async ({ page }) => {
  const control = page.getByTestId('light-button-primary');
  for (const base of [0, 49, 50, 100]) {
    await page.getByTestId('color-controls-light').evaluate((element, value) => {
      (element as HTMLElement).style.setProperty('--color-primary-action', `hsl(0 0% ${value}%)`);
    }, base);
    await control.hover();
    expect(await lightness(control)).toBeCloseTo(base + (base < 50 ? 10 : -10), 0);
    await page.mouse.down();
    expect(await lightness(control)).toBeCloseTo(base + (base < 50 ? 20 : -20), 0);
    await page.mouse.up();
  }
});

test('styles leave unrelated host content alone and dimensions remain responsive', async ({
  page,
}) => {
  const host = await page.getByTestId('host-marker').evaluate((element) => {
    const css = getComputedStyle(element);
    return { family: css.fontFamily, margin: css.marginBlockStart };
  });
  expect(host.family).not.toContain('envUI Inter');
  expect(host.margin).not.toBe('0px');
  const control = page.getByTestId('light-button-primary');
  const before = await control.boundingBox();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '150%';
  });
  const after = await control.boundingBox();
  expect(after!.height / before!.height).toBeCloseTo(1.5, 1);
  await expect(control).toHaveCSS('border-width', '0px');
});
