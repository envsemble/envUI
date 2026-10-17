import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=colors`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** The token each control paints at rest; its hover and pressed tokens carry `-hover`, `-pressed`. */
const sources: Record<string, readonly [rest: string, hover: string, pressed: string]> = {
  'button-primary': [
    '--env-color-bg-brand-emphasis',
    '--env-color-bg-brand-emphasis-hover',
    '--env-color-bg-brand-emphasis-pressed',
  ],
  'button-important': [
    '--env-color-bg-important-strong',
    '--env-color-bg-important-strong-hover',
    '--env-color-bg-important-strong-pressed',
  ],
  'button-secondary': [
    '--env-color-bg-neutral-muted',
    '--env-color-bg-neutral-muted-hover',
    '--env-color-bg-neutral-muted-pressed',
  ],
  'button-outlined': [
    '--env-color-bg-raised',
    '--env-color-bg-raised-hover',
    '--env-color-bg-raised-pressed',
  ],
  'button-destructive': [
    '--env-color-bg-danger-strong',
    '--env-color-bg-danger-strong-hover',
    '--env-color-bg-danger-strong-pressed',
  ],
  'icon-button': [
    '--env-color-bg-neutral-muted',
    '--env-color-bg-neutral-muted-hover',
    '--env-color-bg-neutral-muted-pressed',
  ],
  navigation: [
    '--env-color-list-item-bg',
    '--env-color-bg-navigation-hover',
    '--env-color-bg-navigation-pressed',
  ],
  'navigation-selected': [
    '--env-color-bg-selected',
    '--env-color-bg-selected-hover',
    '--env-color-bg-selected-pressed',
  ],
  'tab-primary': [
    '--env-color-bg-brand-emphasis',
    '--env-color-bg-brand-emphasis-hover',
    '--env-color-bg-brand-emphasis-pressed',
  ],
  'tab-secondary': [
    '--env-color-bg-neutral-muted',
    '--env-color-bg-neutral-muted-hover',
    '--env-color-bg-neutral-muted-pressed',
  ],
  'tab-navigation': [
    '--env-color-bg-selected',
    '--env-color-bg-selected-hover',
    '--env-color-bg-selected-pressed',
  ],
};

/**
 * HSL lightness of a control's fill as painted on its theme canvas. Translucent fills are calibrated
 * against the canvas; with `layered`, the fills of the ancestors in between are painted too.
 */
async function lightness(
  control: import('@playwright/test').Locator,
  token?: string,
  { layered = false } = {},
) {
  return control.evaluate(
    (element, { name, layered }) => {
      const probe = document.createElement('span');
      if (name) {
        probe.style.backgroundColor = `var(${name})`;
        element.append(probe);
      }
      const layers = [getComputedStyle(name ? probe : element).backgroundColor];
      for (let node = element.parentElement; node; node = node.parentElement) {
        const isCanvas = node.classList.contains('env-theme');
        if (layered || isCanvas) layers.unshift(getComputedStyle(node).backgroundColor);
        if (isCanvas) break;
      }
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      for (const color of layers) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
      }
      const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((value) => value / 255);
      probe.remove();
      return (Math.max(...rgb) + Math.min(...rgb)) * 50;
    },
    { name: token, layered },
  );
}

/** The computed color a custom property resolves to inside an element. */
async function tokenColor(control: import('@playwright/test').Locator, token: string) {
  return control.evaluate((element, name) => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = `var(${name})`;
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, token);
}

test('action and navigation fills paint their precomputed hover and pressed tokens', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    for (const [name, [rest, hover, pressed]] of Object.entries(sources)) {
      const control = page.getByTestId(`${theme}-${name}`);
      if (name.startsWith('tab-')) await control.press('Enter');
      const colors = {
        rest: await tokenColor(control, rest),
        hover: await tokenColor(control, hover),
        pressed: await tokenColor(control, pressed),
      };
      // Each state is visibly its own color, not a copy of the rest color.
      expect(colors.hover, `${theme}/${name} hover differs from rest`).not.toBe(colors.rest);
      expect(colors.pressed, `${theme}/${name} pressed differs from hover`).not.toBe(colors.hover);
      await control.hover();
      await expect(control, `${theme}/${name} hover`).toHaveCSS('background-color', colors.hover);
      await page.mouse.down();
      await expect(control, `${theme}/${name} pressed`).toHaveCSS(
        'background-color',
        colors.pressed,
      );
      await page.mouse.up();
      await page.mouse.move(0, 0);
    }
  }
});

test('no hover or pressed color is computed at runtime', async ({ page }) => {
  // Every state color is a token the contrast gate measures; the old relative-color rule is gone.
  const sheets = await page.evaluate(() =>
    [...document.styleSheets].flatMap((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText);
      } catch {
        return [];
      }
    }),
  );
  const css = sheets.join('\n');
  expect(css).not.toMatch(/--state-[a-z-]*lightness/);
  expect(css).not.toMatch(/hsl\(from var\([^)]*\) h s var\(/);
});

test('compositions reuse primitive colors while unrelated roles stay independent', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const boundary = page.getByTestId(`color-controls-${theme}`);
    const selectors = {
      canvas: ':scope',
      primary: `[data-testid="${theme}-button-primary"]`,
      secondary: `[data-testid="${theme}-button-secondary"]`,
      icon: `[data-testid="${theme}-icon-button"]`,
      destructive: `[data-testid="${theme}-button-destructive"]`,
      surface: `[data-testid="${theme}-color-surface"]`,
      pane: `[data-testid="${theme}-color-pane"]`,
      card: `[data-testid="${theme}-color-card"]`,
      paneCard: `[data-testid="${theme}-color-pane-card"]`,
      canvasCard: `[data-testid="${theme}-color-canvas-card"]`,
      row: `[data-testid="${theme}-color-row"]`,
      contrastPane: `.env-surface:has(> [data-testid="${theme}-color-contrast-rows"])`,
      tabRail: `[data-testid="${theme}-color-tabs"] .env-tabs-list`,
      tab: `[data-testid="${theme}-color-tabs"] [role="tab"][aria-selected="true"]`,
      tabIcon: `[data-testid="${theme}-color-tabs"] .env-nav-list-item .env-icon`,
      link: `[data-testid="${theme}-color-link"]`,
      textButton: `[data-testid="${theme}-color-text-button"]`,
      navigation: `[data-testid="${theme}-navigation-selected"]`,
      navigationIcon: `[data-testid="${theme}-navigation"] .env-icon`,
      direction: `[data-testid="${theme}-color-direction"]`,
      field: `[data-testid="${theme}-color-field"]`,
      fieldWell: `.env-text-field-control:has([data-testid="${theme}-color-field"])`,
      fieldError: `.env-text-field-control:has([data-testid="${theme}-color-error-field"])`,
      select: `[data-testid="${theme}-color-select"]`,
      selectLabel: `.env-field:has(> [data-testid="${theme}-color-select"])`,
      selectHint: `.env-field:has(> [data-testid="${theme}-color-select"]) > .env-field-description`,
      selectError: `[data-testid="${theme}-color-select-error"]`,
      radioRow: `[data-testid="${theme}-color-radio-row"] .env-radio`,
      radio: `[data-testid="${theme}-color-radio"]`,
      checkbox: `[data-testid="${theme}-color-checkbox"]`,
      switch: `[data-testid="${theme}-color-switch"]`,
      chip: `[data-testid="${theme}-color-chip"]`,
      skeleton: `[data-testid="${theme}-color-skeleton"]`,
    };
    async function compareToken(token: string) {
      return boundary.evaluate(
        (root, { probes, token }) => {
          const snapshot = () =>
            Object.fromEntries(
              Object.entries(probes).map(([name, selector]) => {
                const element = selector === ':scope' ? root : root.querySelector(selector)!;
                if (!element) throw new Error(`Missing color probe: ${name}`);
                const css = getComputedStyle(element);
                return [
                  name,
                  {
                    fill: css.backgroundColor,
                    text: css.color,
                    border: css.borderColor,
                    accent: css.accentColor,
                  },
                ];
              }),
            );
          const before = snapshot();
          (root as HTMLElement).style.setProperty(token, '#d02780');
          try {
            return { before, after: snapshot() };
          } finally {
            (root as HTMLElement).style.removeProperty(token);
          }
        },
        { probes: selectors, token },
      );
    }
    // Each role, and every part that paints it: a component shares the role of what it means.
    const cases = [
      ['--env-color-bg-page', ['canvas', 'canvasCard']],
      // A list item's component token is the default surface in light and the muted one in dark.
      ['--env-color-bg-default', ['pane', 'paneCard', ...(theme === 'light' ? ['row'] : [])]],
      [
        '--env-color-bg-muted',
        ['surface', 'card', 'contrastPane', 'radioRow', ...(theme === 'dark' ? ['row'] : [])],
      ],
      ['--env-color-list-item-bg', ['row']],
      [
        '--env-color-bg-neutral-muted',
        ['secondary', 'icon', 'select', 'selectError', 'tabRail', 'chip', 'skeleton'],
      ],
      ['--env-color-fg-control', ['secondary', 'icon', 'select', 'selectError']],
      ['--env-color-fg-link', ['link', 'textButton']],
      ['--env-color-bg-brand-emphasis', ['primary', 'tab', 'radio', 'checkbox', 'switch']],
      ['--env-color-fg-on-emphasis', ['primary', 'tab']],
      ['--env-color-bg-selected', ['navigation']],
      ['--env-color-fg-muted', ['navigationIcon', 'tabIcon', 'selectHint']],
      ['--env-color-bg-raised', ['direction']],
      ['--env-color-bg-field', ['fieldWell', 'fieldError']],
      ['--env-color-border-accent-emphasis', ['fieldWell']],
      ['--env-color-fg-danger', ['fieldError', 'selectError']],
      // The default text color is every part's that sets no other, so it has no case of its own.
      ['--env-color-bg-danger-strong', ['destructive']],
    ] as const;
    for (const [token, targets] of cases) {
      if (token === '--env-color-border-accent-emphasis')
        await page.getByTestId(`${theme}-color-field`).focus();
      const { before, after } = await compareToken(token);
      for (const name of Object.keys(selectors)) {
        if ((targets as readonly string[]).includes(name))
          expect(after[name], `${theme}/${token} must update ${name}`).not.toEqual(before[name]);
        else
          expect(after[name], `${theme}/${token} must leave ${name} alone`).toEqual(before[name]);
      }
      if (token === '--env-color-border-accent-emphasis')
        await page
          .getByTestId(`${theme}-color-field`)
          .evaluate((input) => (input as HTMLElement).blur());
    }
    for (const [label, primitiveId, color] of [
      ['First tab', `${theme}-button-primary`, '--env-color-bg-brand-emphasis'],
      ['Second tab', `${theme}-button-secondary`, '--env-color-bg-neutral-muted'],
      ['Third tab', `${theme}-navigation-selected`, '--env-color-bg-selected'],
    ]) {
      const tab = boundary.getByRole('tab', { name: label });
      await tab.press('Enter');
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      const before = await tab.evaluate((element) => getComputedStyle(element).backgroundColor);
      const primitive = page.getByTestId(primitiveId);
      expect(before).toBe(
        await primitive.evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      await boundary.evaluate(
        (root, token) => (root as HTMLElement).style.setProperty(token, '#d02780'),
        color,
      );
      expect(await tab.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
        before,
      );
      expect(await tab.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
        await primitive.evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      await boundary.evaluate(
        (root, token) => (root as HTMLElement).style.removeProperty(token),
        color,
      );
    }
    const selected = boundary.getByRole('tab', { name: 'Third tab' });
    const selectedFill = await selected.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const rail = boundary.locator('.env-tabs-list');
    const railLightness = await lightness(rail, undefined, { layered: true });
    for (const id of ['tab-primary', 'tab-secondary']) {
      const inactive = page.getByTestId(`${theme}-${id}`);
      await expect(inactive).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await inactive.hover();
      // Hover is a translucent state layer over the rail, clearly visible in both themes.
      const shift =
        ((await lightness(inactive, undefined, { layered: true })) - railLightness) *
        (railLightness < 50 ? 1 : -1);
      expect(shift).toBeGreaterThan(4);
      expect(shift).toBeLessThan(9);
      await expect(inactive).toHaveAttribute('aria-selected', 'false');
      await expect(selected).toHaveCSS('background-color', selectedFill);
      await page.mouse.move(0, 0);
    }
    const disabled = page.getByTestId(`${theme}-tab-disabled`);
    await disabled.hover();
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
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
