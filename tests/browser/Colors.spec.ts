import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8766');
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const sources: Record<string, string> = {
  'button-primary': '--color-primary-action',
  'button-important': '--color-accent',
  'button-secondary': '--color-secondary-action',
  'button-outlined': '--color-subtle-action',
  'button-destructive': '--color-destructive-action',
  'icon-button': '--color-secondary-action',
  navigation: '--color-navigation-quiet',
  'navigation-selected': '--color-navigation-selected',
  'tab-primary': '--color-primary-action',
  'tab-secondary': '--color-secondary-action',
  'tab-navigation': '--color-navigation-selected',
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
      if (name.startsWith('tab-')) await control.press('Enter');
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
      contrastPane: `.env-contrast-row-pane:has([data-testid="${theme}-color-contrast-rows"])`,
      tabRail: `[data-testid="${theme}-color-tabs"] .env-tabs-list`,
      tab: `[data-testid="${theme}-color-tabs"] [role="tab"][aria-selected="true"]`,
      tabIcon: `[data-testid="${theme}-color-tabs"] .env-navigation-item .env-symbol`,
      link: `[data-testid="${theme}-color-link"]`,
      textButton: `[data-testid="${theme}-color-text-button"]`,
      navigation: `[data-testid="${theme}-navigation-selected"]`,
      navigationIcon: `[data-testid="${theme}-navigation"] .env-symbol`,
      direction: `[data-testid="${theme}-color-direction"]`,
      field: `[data-testid="${theme}-color-field"]`,
      fieldWell: `.env-text-field-well:has([data-testid="${theme}-color-field"])`,
      fieldError: `.env-text-field-well:has([data-testid="${theme}-color-error-field"])`,
      select: `[data-testid="${theme}-color-select"]`,
      selectLabel: `.env-form-field:has(> [data-testid="${theme}-color-select"])`,
      selectHint: `.env-form-field:has(> [data-testid="${theme}-color-select"]) > .env-field-hint`,
      selectError: `[data-testid="${theme}-color-select-error"]`,
      radioRow: `[data-testid="${theme}-color-radio-row"] .env-radio-option`,
      radio: `[data-testid="${theme}-color-radio"]`,
      checkbox: `[data-testid="${theme}-color-checkbox"]`,
      switch: `[data-testid="${theme}-color-switch"]`,
      chip: `[data-testid="${theme}-color-chip"]`,
      skeleton: `[data-testid="${theme}-color-skeleton"]`,
      errorToast: `[data-testid="${theme}-color-error-toast"]`,
      toastAction: `[data-testid="${theme}-color-error-toast"] .env-toast-action`,
    };
    async function snapshot() {
      return boundary.evaluate(
        (root, probes) =>
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
          ),
        selectors,
      );
    }
    const cases = [
      ['--color-canvas', ['canvas', 'canvasCard']],
      ['--color-pane', ['pane', 'paneCard']],
      ['--color-surface-muted', ['surface', 'card', 'tabRail', 'contrastPane']],
      ['--color-row', ['row']],
      ['--color-secondary-action', ['secondary', 'icon', 'select', 'selectError']],
      ['--color-on-secondary-action', ['secondary', 'icon', 'select', 'selectError']],
      ['--color-link', ['link', 'textButton']],
      ['--color-primary-action', ['primary', 'tab', 'toastAction']],
      ['--color-on-primary-action', ['primary', 'tab', 'toastAction']],
      ['--color-navigation-selected', ['navigation']],
      ['--color-navigation-icon', ['navigationIcon', 'tabIcon']],
      ['--color-direction-link', ['direction']],
      ['--color-field', ['fieldWell', 'fieldError']],
      ['--color-field-active', ['fieldWell']],
      ['--color-field-error', ['fieldError', 'selectError']],
      ['--color-field-text', ['field', 'fieldWell', 'fieldError', 'selectLabel']],
      ['--color-field-hint', ['selectHint']],
      ['--color-destructive-action', ['destructive']],
      ['--color-toast-error', ['errorToast']],
      ['--color-radio-row', ['radioRow']],
      ['--color-radio', ['radio']],
      ['--color-checkbox', ['checkbox']],
      ['--color-switch-on', ['switch']],
      ['--color-chip', ['chip']],
      ['--color-skeleton-base', ['skeleton']],
    ] as const;
    for (const [token, targets] of cases) {
      if (token === '--color-field-active') await page.getByTestId(`${theme}-color-field`).focus();
      const before = await snapshot();
      await boundary.evaluate(
        (root, name) => (root as HTMLElement).style.setProperty(name, '#d02780'),
        token,
      );
      const after = await snapshot();
      for (const name of Object.keys(selectors)) {
        if ((targets as readonly string[]).includes(name))
          expect(after[name], `${theme}/${token} must update ${name}`).not.toEqual(before[name]);
        else
          expect(after[name], `${theme}/${token} must leave ${name} alone`).toEqual(before[name]);
      }
      await boundary.evaluate(
        (root, name) => (root as HTMLElement).style.removeProperty(name),
        token,
      );
      if (token === '--color-field-active')
        await page
          .getByTestId(`${theme}-color-field`)
          .evaluate((input) => (input as HTMLElement).blur());
    }
    for (const [label, primitiveId, color] of [
      ['First tab', `${theme}-button-primary`, '--color-primary-action'],
      ['Second tab', `${theme}-button-secondary`, '--color-secondary-action'],
      ['Third tab', `${theme}-navigation-selected`, '--color-navigation-selected'],
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
    const railLightness = await lightness(rail);
    for (const id of ['tab-primary', 'tab-secondary']) {
      const inactive = page.getByTestId(`${theme}-${id}`);
      await expect(inactive).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await inactive.hover();
      expect(await lightness(inactive)).toBeCloseTo(
        railLightness + (railLightness < 50 ? 2 : -2),
        0,
      );
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
