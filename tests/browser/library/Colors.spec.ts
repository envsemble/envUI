import { test, expect } from '@playwright/test';
import { fixtureUrl } from '../helpers/Servers';

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=colors`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/** The token each control paints at rest; its hover and pressed tokens carry `-hover`, `-pressed`. */
const sources: Record<string, readonly [rest: string, hover: string, pressed: string]> = {
  'button-primary': [
    '--env-color-bg-primary-emphasis',
    '--env-color-bg-primary-emphasis-hover',
    '--env-color-bg-primary-emphasis-pressed',
  ],
  'button-important': [
    '--env-color-bg-accent-emphasis',
    '--env-color-bg-accent-emphasis-hover',
    '--env-color-bg-accent-emphasis-pressed',
  ],
  'button-secondary': [
    '--env-color-bg-neutral-muted',
    '--env-color-bg-neutral-muted-hover',
    '--env-color-bg-neutral-muted-pressed',
  ],
  // No fill at rest: a state layer over the surface beneath on hover and press.
  'button-outlined': [
    '--env-color-bg-neutral-subtle',
    '--env-color-bg-neutral-subtle-hover',
    '--env-color-bg-neutral-subtle-pressed',
  ],
  'button-destructive': [
    '--env-color-bg-danger-emphasis',
    '--env-color-bg-danger-emphasis-hover',
    '--env-color-bg-danger-emphasis-pressed',
  ],
  'icon-button': [
    '--env-color-bg-neutral-muted',
    '--env-color-bg-neutral-muted-hover',
    '--env-color-bg-neutral-muted-pressed',
  ],
  navigation: [
    '--env-color-bg-list-item',
    '--env-color-bg-navigation-hover',
    '--env-color-bg-navigation-pressed',
  ],
  'navigation-selected': [
    '--env-color-bg-selected',
    '--env-color-bg-selected-hover',
    '--env-color-bg-selected-pressed',
  ],
  // Tabs take no fill in any state: their hover and press are checked with the compositions.
};

/** A control of the color fixture by its name: the drawer's items by whether they are current. */
function colorControl(page: import('@playwright/test').Page, theme: string, name: string) {
  if (name === 'navigation')
    return page
      .getByTestId(`${theme}-navigation`)
      .locator('.env-navigation-drawer-item:not([data-current])');
  if (name === 'navigation-selected')
    return page
      .getByTestId(`${theme}-navigation`)
      .locator('.env-navigation-drawer-item[data-current]');
  return page.getByTestId(`${theme}-${name}`);
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
      const control = colorControl(page, theme, name);
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

test('a nested Theme that overrides the semantic tokens recolors its area alone', async ({
  page,
}) => {
  const inside = page.getByTestId('override-inside');
  const outside = page.getByTestId('override-outside');
  await expect(inside).toHaveCSS('background-color', 'rgb(23, 111, 53)');
  await expect(page.getByTestId('override-switch')).toHaveCSS(
    'background-color',
    'rgb(23, 111, 53)',
  );
  // The area keeps every state: its own hover and pressed tokens apply.
  await inside.hover();
  await expect(inside).toHaveCSS('background-color', 'rgb(17, 90, 42)');
  await page.mouse.down();
  await expect(inside).toHaveCSS('background-color', 'rgb(11, 69, 32)');
  await page.mouse.up();
  await page.mouse.move(0, 0);
  // Outside the area, the theme's own brand color stays.
  const brand = await tokenColor(outside, '--env-color-bg-primary-emphasis');
  expect(brand).not.toBe('rgb(23, 111, 53)');
  await expect(outside).toHaveCSS('background-color', brand);
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
      link: `[data-testid="${theme}-color-link"]`,
      textButton: `[data-testid="${theme}-color-text-button"]`,
      navigation: `[data-testid="${theme}-navigation"] .env-navigation-drawer-item[data-current]`,
      navigationIcon: `[data-testid="${theme}-navigation"] .env-navigation-drawer-item:not([data-current]) .env-icon`,
      direction: `[data-testid="${theme}-color-direction"]`,
      field: `[data-testid="${theme}-color-field"]`,
      // A field has no fill of its own; its border is the fieldset over its edge.
      fieldWell: `.env-text-field-control:has([data-testid="${theme}-color-field"]) > .env-text-field-border`,
      fieldError: `.env-text-field-control:has([data-testid="${theme}-color-error-field"]) > .env-text-field-border`,
      // A select is a field: its trigger has no fill, and its edge is the well's fieldset.
      select: `[data-testid="${theme}-color-select"]`,
      selectLabel: `.env-select:has([data-testid="${theme}-color-select"])`,
      selectHint: `.env-select:has([data-testid="${theme}-color-select"]) > .env-field-description`,
      selectError: `.env-select-control:has([data-testid="${theme}-color-select-error"]) > .env-text-field-border`,
      radioRow: `[data-testid="${theme}-color-radio-row"] .env-radio`,
      radio: `[data-testid="${theme}-color-radio"]`,
      checkbox: `[data-testid="${theme}-color-checkbox"]`,
      switch: `[data-testid="${theme}-color-switch"]`,
      chip: `[data-testid="${theme}-color-chip"]`,
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
      // A list item's component token is the muted surface in both themes.
      ['--env-color-bg-default', ['pane', 'paneCard']],
      ['--env-color-bg-muted', ['surface', 'card', 'contrastPane', 'radioRow', 'row']],
      ['--env-color-bg-list-item', ['row']],
      ['--env-color-bg-neutral-muted', ['secondary', 'icon', 'chip']],
      ['--env-color-fg-link', ['link', 'textButton']],
      ['--env-color-bg-primary-emphasis', ['primary', 'radio', 'checkbox', 'switch']],
      // Every primary takes its tone's emphasis fill; the destructive one's saturated red takes the
      // white label of the strong fills, the others the emphasis label.
      ['--env-color-fg-on-emphasis', ['primary']],
      ['--env-color-fg-on-strong', ['destructive']],
      // The selected tab is a text tab in the accent's text color, whatever its button's variant.
      ['--env-color-fg-primary', ['tab']],
      ['--env-color-bg-selected', ['navigation']],
      // A neutral badge's text is muted, as InfoChip's metadata became a Badge.
      ['--env-color-fg-muted', ['navigationIcon', 'selectHint', 'chip']],
      ['--env-color-bg-raised', ['direction']],
      ['--env-color-border-primary-emphasis', ['fieldWell']],
      ['--env-color-fg-danger', ['fieldError', 'selectError']],
      // The default text color is every part's that sets no other, a secondary button's label
      // among them, so it has no case of its own.
      ['--env-color-bg-danger-emphasis', ['destructive']],
    ] as const;
    for (const [token, targets] of cases) {
      if (token === '--env-color-border-primary-emphasis')
        await page.getByTestId(`${theme}-color-field`).focus();
      const { before, after } = await compareToken(token);
      for (const name of Object.keys(selectors)) {
        if ((targets as readonly string[]).includes(name))
          expect(after[name], `${theme}/${token} must update ${name}`).not.toEqual(before[name]);
        else
          expect(after[name], `${theme}/${token} must leave ${name} alone`).toEqual(before[name]);
      }
      if (token === '--env-color-border-primary-emphasis')
        await page
          .getByTestId(`${theme}-color-field`)
          .evaluate((input) => (input as HTMLElement).blur());
    }
    // A selected tab is a text tab whatever its button's variant: no fill, its label in the
    // accent's text color, and its indicator in the accent's border color.
    for (const label of ['First tab', 'Second tab']) {
      const tab = boundary.getByRole('tab', { name: label });
      await tab.press('Enter');
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await page.mouse.move(0, 0);
      await tab.blur();
      await expect(tab).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      // The one indicator, which moves to the selected tab.
      const indicator = () =>
        tab.evaluate(
          (element) =>
            getComputedStyle(element.parentElement!.querySelector('.env-tabs-indicator')!)
              .backgroundColor,
        );
      const before = await indicator();
      await boundary.evaluate((root) =>
        (root as HTMLElement).style.setProperty('--env-color-border-primary-emphasis', '#d02780'),
      );
      expect(await indicator()).not.toBe(before);
      await boundary.evaluate((root) =>
        (root as HTMLElement).style.removeProperty('--env-color-border-primary-emphasis'),
      );
    }
    const selected = boundary.getByRole('tab', { name: 'Third tab' });
    await selected.press('Enter');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    const selectedFill = await selected.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    // An unselected tab under the pointer and pressed shows no block and no bar, either of which
    // would read as a second selection: only its label takes the text color. The bar is the one
    // indicator that moves between the tabs, lying under the selected tab once it has arrived.
    const markAlpha = (tab: import('@playwright/test').Locator) =>
      tab.evaluate((element) => {
        const moving = element.parentElement?.querySelector('.env-tabs-indicator:not([hidden])');
        if (moving) {
          const [bar, box] = [moving.getBoundingClientRect(), element.getBoundingClientRect()];
          return bar.left >= box.left - 0.5 && bar.right <= box.right + 0.5 ? 1 : 0;
        }
        const probe = document.createElement('canvas').getContext('2d')!;
        probe.fillStyle = getComputedStyle(element, '::after').backgroundColor;
        probe.fillRect(0, 0, 1, 1);
        return probe.getImageData(0, 0, 1, 1).data[3] / 255;
      });
    for (const id of ['tab-primary', 'tab-secondary']) {
      const inactive = page.getByTestId(`${theme}-${id}`);
      const [muted, text] = [
        await tokenColor(inactive, '--env-color-fg-muted-hover'),
        await tokenColor(inactive, '--env-color-fg-default'),
      ];
      expect(text, `${theme} text and muted labels differ`).not.toBe(muted);
      await expect(inactive).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(inactive).toHaveCSS('color', muted);
      expect(await markAlpha(inactive)).toBe(0);
      await inactive.hover();
      await expect(inactive).toHaveCSS('color', text);
      await expect(inactive).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      expect(await markAlpha(inactive)).toBe(0);
      await expect(inactive).toHaveAttribute('aria-selected', 'false');
      await expect(selected).toHaveCSS('background-color', selectedFill);
      // A press selects the tab, so the indicator shows, and lays a faint state layer while held.
      await page.mouse.down();
      await expect(inactive).toHaveAttribute('aria-selected', 'true');
      await expect(inactive).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect.poll(() => markAlpha(inactive)).toBe(1);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await selected.press('Enter');
      await expect(inactive).toHaveAttribute('aria-selected', 'false');
    }
    const disabled = page.getByTestId(`${theme}-tab-disabled`);
    await disabled.hover();
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
  }
});
