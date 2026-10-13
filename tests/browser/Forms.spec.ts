import { expect, test, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

/** Contrast between two opaque CSS colors, as WCAG computes it. */
function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const [r, g, b] = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map((channel) => {
        const value = Number(channel) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The open Select list against the surface it opens over: its color and its border. */
async function popupSeparation(page: Page, surfaceSelector: string) {
  const [surface, popup, border] = await page.evaluate((selector) => {
    const popupElement = document.querySelector('.env-dropdown-options')!;
    return [
      getComputedStyle(document.querySelector(selector)!).backgroundColor,
      getComputedStyle(popupElement).backgroundColor,
      getComputedStyle(popupElement).borderTopWidth,
    ];
  }, surfaceSelector);
  return { contrast: contrastRatio(surface, popup), border: Number.parseFloat(border) };
}

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
});

test('fields associate labels, hints, and validation messages', async ({ page }) => {
  const project = page.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(project).toHaveAccessibleDescription('A descriptive name');
  await expect(
    page.getByRole('textbox', { name: 'Notes', exact: true }),
  ).toHaveAccessibleDescription('Optional supporting details');
  const invalid = page.getByRole('textbox', { name: 'Invalid sample', exact: true });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Please correct this value');
});

test('native controls submit values and restore uncontrolled defaults on form reset', async ({
  page,
}) => {
  const controlled = page.getByTestId('controlled-checkbox');
  const uncontrolled = page.getByTestId('uncontrolled-checkbox');
  await expect(controlled).toHaveAttribute('aria-checked', 'mixed');
  await expect(controlled).toHaveJSProperty('indeterminate', true);
  await expect(uncontrolled).toHaveJSProperty('indeterminate', true);
  await controlled.click();
  await expect(controlled).toBeChecked();
  await expect(page.getByTestId('control-state')).toHaveText('true');
  await uncontrolled.click();
  await expect(uncontrolled).toBeChecked();
  await expect(uncontrolled).toHaveJSProperty('indeterminate', false);

  const notifications = page.getByRole('switch', { name: 'Notifications', exact: true });
  await expect(notifications).toBeChecked();
  await notifications.click();
  await expect(notifications).not.toBeChecked();
  await page.getByRole('radio', { name: /Shared/ }).check();
  await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Changed project');
  await page.getByRole('textbox', { name: 'Notes', exact: true }).fill('Changed notes');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await page.getByTestId('form-values').textContent())!))
    .toEqual({
      project: 'Changed project',
      notes: 'Changed notes',
      controlled: 'enabled',
      uncontrolled: 'enabled',
      visibility: 'shared',
      plan: 'starter',
      emptyChoice: '',
    });

  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue(
    'Initial project',
  );
  await expect(page.getByRole('textbox', { name: 'Notes', exact: true })).toHaveValue(
    'Initial notes',
  );
  await expect(uncontrolled).toHaveJSProperty('indeterminate', true);
  await expect(uncontrolled).not.toBeChecked();
  await expect(controlled).toBeChecked();
  await expect(notifications).toBeChecked();
  await expect(page.getByRole('radio', { name: /Private/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Shared/ })).not.toBeChecked();
});

test('a controlled mixed checkbox retains its DOM state when the owner retains mixed', async ({
  page,
}) => {
  const fixed = page.getByTestId('frozen-checkbox');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await fixed.click();
  await expect(page.getByTestId('frozen-request')).toHaveText('true');
  await expect(fixed).toHaveAttribute('aria-checked', 'mixed');
  await expect(fixed).toHaveJSProperty('indeterminate', true);
  await expect(fixed).not.toBeChecked();
});

test('canceling a native form reset preserves field and selection state', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Prevent form reset', exact: true }).check();
  await page.getByRole('textbox', { name: 'Project name', exact: true }).fill('Preserved project');
  await page.getByTestId('uncontrolled-checkbox').click();
  await page.getByRole('switch', { name: 'Notifications', exact: true }).uncheck();
  await page.getByRole('radio', { name: /Shared/ }).check();
  const plan = page.getByRole('combobox', { name: 'Plan', exact: true });
  await plan.click();
  await page.getByRole('option', { name: 'Team', exact: true }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name', exact: true })).toHaveValue(
    'Preserved project',
  );
  await expect(page.getByTestId('uncontrolled-checkbox')).toBeChecked();
  await expect(page.getByTestId('uncontrolled-checkbox')).toHaveJSProperty('indeterminate', false);
  await expect(page.getByRole('switch', { name: 'Notifications', exact: true })).not.toBeChecked();
  await expect(page.getByRole('radio', { name: /Shared/ })).toBeChecked();
  await expect(plan).toHaveText('Team');
});

test('Select supports keyboard commit, typeahead, Escape, and native form reset', async ({
  page,
}) => {
  const trigger = page.getByRole('combobox', { name: 'Plan', exact: true });
  await expect(trigger).toHaveText('Starter');
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Starter', exact: true })).toBeFocused();
  await expect(page.getByRole('option', { name: 'Enterprise', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText('Team');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Team', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Team');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Team', exact: true })).toBeFocused();
  await page.keyboard.press('s');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Starter');
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Space');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.getByRole('option', { name: 'Starter', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toHaveText('Team');
  await page.getByRole('button', { name: 'Submit form', exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await page.getByTestId('form-values').textContent())!).plan)
    .toBe('team');
  await page.getByRole('button', { name: 'Reset form', exact: true }).click();
  await expect(trigger).toHaveText('Starter');
  await page.setViewportSize({ width: 320, height: 480 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await trigger.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const wrappedOptions = await list.getByRole('option').evaluateAll((options) => {
    for (const option of options)
      option.firstElementChild!.textContent = 'Long workspace configuration label '.repeat(3);
    return options.map((option) => ({ height: option.clientHeight, content: option.scrollHeight }));
  });
  for (const option of wrappedOptions)
    expect(option.content).toBeLessThanOrEqual(option.height + 1);
  // Changing option content invalidates Floating UI's previous measurements.
  await expect(async () => {
    const popup = await page.locator('.env-dropdown-options').boundingBox();
    expect(popup!.x).toBeGreaterThanOrEqual(0);
    expect(popup!.x + popup!.width).toBeLessThanOrEqual(321);
    expect(popup!.y + popup!.height).toBeLessThanOrEqual(481);
  }).toPass({ timeout: 8_000 });
  const scroll = await list.evaluate((element) => ({
    height: element.clientHeight,
    content: element.scrollHeight,
  }));
  expect(scroll.content).toBeGreaterThan(scroll.height);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Select triggers are button styles, and the open list stands apart from a pane', async ({
  page,
}) => {
  const outlined = page.getByRole('combobox', { name: 'Pane sort', exact: true });
  await expect(outlined).toHaveAttribute('data-variant', 'outlined');
  // The outlined trigger looks like an outlined Button beside it.
  const looks = await outlined.evaluate((element) => {
    const button = document.createElement('button');
    button.className = 'env-button env-button-outlined';
    element.parentElement!.append(button);
    const read = (target: Element) => {
      const style = getComputedStyle(target);
      return [style.backgroundColor, style.color, style.borderTopColor, style.borderTopWidth];
    };
    const result = { trigger: read(element), button: read(button) };
    button.remove();
    return result;
  });
  expect(looks.trigger).toEqual(looks.button);
  expect(Number.parseFloat(looks.trigger[3]!)).toBeGreaterThan(0);
  // The label sits above a trigger that fits its content, as for every select.
  const role = page.getByRole('combobox', { name: 'Pane role', exact: true });
  const [roleBox, labelBox, paneBox] = await Promise.all([
    role.boundingBox(),
    page.getByText('Pane role', { exact: true }).boundingBox(),
    page.getByTestId('select-pane').boundingBox(),
  ]);
  expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(roleBox!.y + 1);
  expect(roleBox!.width).toBeLessThan(paneBox!.width / 2);

  await role.click();
  await expect(page.getByRole('option', { name: 'Boreal', exact: true })).toBeVisible();
  const separation = await popupSeparation(page, '[data-testid="select-pane"]');
  expect(separation.contrast).toBeGreaterThanOrEqual(1.08);
  expect(separation.border).toBeGreaterThan(0);
  // The popup takes the surface corners, and its options the same corners inset by its padding.
  const corners = await page.locator('.env-dropdown-options').evaluate((popup) => {
    const option = popup.querySelector('.env-dropdown-option')!;
    const radius = (element: Element) =>
      Number.parseFloat(getComputedStyle(element).borderTopLeftRadius);
    return {
      popup: radius(popup),
      option: radius(option),
      padding: Number.parseFloat(getComputedStyle(popup).paddingTop),
    };
  });
  expect(corners.popup).toBeGreaterThanOrEqual(24);
  expect(Math.abs(corners.option - (corners.popup - corners.padding))).toBeLessThan(1);
  await page.getByRole('option', { name: 'Boreal', exact: true }).click();
  await expect(role).toHaveText('Boreal');
});

test('a required Select participates in native constraint validation', async ({ page }) => {
  const nativeInput = page.getByTestId('required-form').locator('input[name="requiredChoice"]');
  await expect
    .poll(() => nativeInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing))
    .toBe(true);
  await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
  await expect(page.getByTestId('required-submissions')).toHaveText('0');
  const required = page.getByRole('combobox', { name: 'Required choice', exact: true });
  await expect(required).toHaveAttribute('aria-required', 'true');
  await expect(required).toBeFocused();
  // Dismiss native validation chrome before interacting with the custom popup.
  // Firefox on Linux consumes the first outside click while that chrome is open.
  await page.keyboard.press('Escape');
  await required.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.getByRole('option', { name: 'Atlas', exact: true }).click();
  await expect(nativeInput).toHaveValue('atlas');
  await expect
    .poll(() => nativeInput.evaluate((input: HTMLInputElement) => input.validity.valid))
    .toBe(true);
  await page.getByRole('button', { name: 'Submit required choice', exact: true }).click();
  await expect(page.getByTestId('required-submissions')).toHaveText('1');
});

test('Dialog traps and restores focus and its nested Select retains the dark theme', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Open dark dialog', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Dark theme dialog', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription('A nested theme retained in a portal.');
  await expect
    .poll(() =>
      dialog.evaluate((element) =>
        element.closest('[data-env-theme]')?.getAttribute('data-env-theme'),
      ),
    )
    .toBe('dark');
  const firstField = dialog.getByRole('textbox', { name: 'Dialog first field', exact: true });
  await expect(firstField).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Save dialog', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstField).toBeFocused();

  const select = dialog.getByRole('combobox', { name: 'Dialog choice', exact: true });
  await select.click();
  const option = page.getByRole('option', { name: 'Boreal', exact: true });
  await expect(option).toBeVisible();
  // The open list stands apart from the dark dialog it opens over.
  const separation = await popupSeparation(page, '.env-modal-pane');
  expect(separation.contrast).toBeGreaterThanOrEqual(1.08);
  expect(separation.border).toBeGreaterThan(0);
  await expect
    .poll(() =>
      option.evaluate((element) =>
        element.closest('[data-env-theme]')?.getAttribute('data-env-theme'),
      ),
    )
    .toBe('dark');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('dialog-status')).toHaveText('closed');
  await expect(trigger).toBeFocused();
});

test('Dialog provides an accessible dismissal action and controlled action closure', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Open dark dialog', exact: true });
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('a compact Select has a compact trigger and the compact menu popup with a check mark', async ({
  page,
}) => {
  const compact = page.getByRole('combobox', { name: 'Compact plan', exact: true });
  const standard = page.getByRole('combobox', { name: 'Plan', exact: true });
  await expect(compact).toHaveAttribute('data-density', 'compact');
  const [compactBox, standardBox] = await Promise.all([
    compact.boundingBox(),
    standard.boundingBox(),
  ]);
  expect(compactBox!.height).toBeCloseTo(32, 0);
  expect(compactBox!.height).toBeLessThan(standardBox!.height);
  const chevron = (locator: typeof compact) =>
    locator.locator('.env-symbol').evaluate((icon) => icon.getBoundingClientRect().width);
  expect(await chevron(compact)).toBeLessThan(await chevron(standard));
  // The outlined variant keeps its Button style at the compact height.
  const outlined = page.getByRole('combobox', { name: 'Compact outlined plan', exact: true });
  expect((await outlined.boundingBox())!.height).toBeCloseTo(32, 0);
  expect(
    Number.parseFloat(
      await outlined.evaluate((element) => getComputedStyle(element).borderTopWidth),
    ),
  ).toBeGreaterThan(0);

  await compact.focus();
  await page.keyboard.press('Space');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const popup = page.locator('.env-dropdown-options');
  await expect(popup).toHaveAttribute('data-density', 'compact');
  await expect(popup).not.toHaveAttribute('data-starting-style');
  const surface = await popup.evaluate(async (element) => {
    // The popup grows in; its rows have their final size once the transition has run.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.allSettled(element.getAnimations().map(({ finished }) => finished));
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--color-popup)';
    element.append(probe);
    const popupColor = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const style = getComputedStyle(element);
    return {
      popupColor,
      background: style.backgroundColor,
      border: Number.parseFloat(style.borderTopWidth),
      radius: Number.parseFloat(style.borderTopLeftRadius),
      padding: Number.parseFloat(style.paddingTop),
    };
  });
  expect(surface.background).toBe(surface.popupColor);
  expect(surface.border).toBeGreaterThanOrEqual(1);
  expect(surface.radius).toBeCloseTo(12, 0);
  expect(surface.padding).toBeCloseTo(4, 0);
  const starter = page.getByRole('option', { name: 'Starter', exact: true });
  const team = page.getByRole('option', { name: 'Team', exact: true });
  await expect(starter).toBeFocused();
  for (const option of [starter, team])
    expect((await option.boundingBox())!.height).toBeCloseTo(28, 0);
  // A check mark shows the selected option instead of a fill, and labels stay aligned.
  await expect(starter.locator('.env-dropdown-option-check svg')).toBeVisible();
  await expect(team.locator('.env-dropdown-option-check svg')).toHaveCount(0);
  const textStart = (option: typeof starter) =>
    option.evaluate((element) => element.lastElementChild!.getBoundingClientRect().x);
  expect(await textStart(team)).toBeCloseTo(await textStart(starter), 0);
  await page.keyboard.press('ArrowDown');
  await expect(team).toBeFocused();
  expect(await starter.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );
  await page.keyboard.press('Enter');
  await expect(list).toHaveCount(0);
  await expect(compact).toHaveText('Team');
  await expect(compact).toBeFocused();
  await page.getByRole('button', { name: 'Submit compact form', exact: true }).click();
  await expect
    .poll(async () => JSON.parse((await page.getByTestId('compact-values').textContent())!))
    .toEqual({ compactPlan: 'team' });
  await compact.click();
  await expect(team.locator('.env-dropdown-option-check svg')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(compact).toBeFocused();
});
