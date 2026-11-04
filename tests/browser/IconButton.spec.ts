import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

test('icon-only buttons keep their square size where their container is squeezed', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=layout`);
  for (const theme of ['light', 'dark']) {
    const row = page.getByTestId(`layout-${theme}`).getByTestId('shrink-row');
    const button = row.getByRole('button', { name: `Squeezed next ${theme}` });
    await expect(button).toBeVisible();
    // The slot around the button is squeezed below the button's size; the button is not.
    const slot = (await row.locator('.fixture-shrink-slot').boundingBox())!;
    expect(slot.width).toBeLessThan(40);
    const box = (await button.boundingBox())!;
    expect(box.width).toBeCloseTo(40, 0);
    expect(box.height).toBeCloseTo(40, 0);
    await expect(button.locator('svg')).toBeVisible();
  }
});

/** The WCAG contrast ratio of two opaque rgb() colors. */
function contrast(first: string, second: string) {
  const luminance = (color: string) => {
    const [red, green, blue] = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number) as [number, number, number];
    const linear = (channel: number) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  };
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

test('quiet buttons take the icon color, a state layer and the focus ring in both themes', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}/?fixture=quiet-buttons`);
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`quiet-${theme}`);
    const toggle = scope.getByRole('button', { name: `Toggle sidebar ${theme}` });
    const labelled = scope.getByRole('button', { name: `New section ${theme}` });
    const pane = scope.getByRole('button', { name: `Pane settings ${theme}` });
    // Resolves a color token where the button sits.
    const resolve = (target: typeof toggle, value: string) =>
      target.evaluate((element, token) => {
        const probe = document.createElement('span');
        probe.style.color = token;
        element.parentElement!.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }, value);
    const icon = await resolve(toggle, 'var(--env-color-fg-muted)');
    const text = await resolve(toggle, 'var(--env-color-fg-default)');
    const hover = await resolve(toggle, 'var(--env-color-bg-neutral-subtle-hover)');
    const pressed = await resolve(toggle, 'var(--env-color-bg-neutral-subtle-pressed)');
    const ring = await resolve(toggle, 'var(--env-color-border-focus)');
    // At rest: the icon, or the label, in the icon color, without a fill or a border.
    for (const button of [toggle, labelled, pane]) {
      await expect(button).toHaveCSS('color', icon);
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(button).toHaveCSS('border-top-width', '0px');
    }
    expect((await toggle.boundingBox())!.width).toBeCloseTo(40, 0);
    // The label reads at 4.5:1 on the canvas and on the pane.
    const canvas = await resolve(toggle, 'var(--env-color-bg-page)');
    const paneFill = await scope
      .getByTestId(`quiet-pane-${theme}`)
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(contrast(icon, canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(icon, paneFill)).toBeGreaterThanOrEqual(4.5);
    // Hover and press lay the state layer under the icon, which takes the text color.
    await toggle.hover();
    await expect(toggle).toHaveCSS('background-color', hover);
    await expect(toggle).toHaveCSS('color', text);
    await page.mouse.down();
    await expect(toggle).toHaveCSS('background-color', pressed);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    // The keyboard shows the shared focus ring.
    await labelled.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveCSS('outline-style', 'solid');
    await expect(toggle).toHaveCSS('outline-color', ring);
    await expect(scope.getByRole('button', { name: `Unavailable settings ${theme}` })).toHaveCSS(
      'opacity',
      '0.48',
    );
  }
});
