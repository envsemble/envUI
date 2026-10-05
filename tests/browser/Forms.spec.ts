import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8766');
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
  const popup = await page.locator('.env-dropdown-options').boundingBox();
  expect(popup!.x).toBeGreaterThanOrEqual(0);
  expect(popup!.x + popup!.width).toBeLessThanOrEqual(321);
  expect(popup!.y + popup!.height).toBeLessThanOrEqual(481);
  const scroll = await list.evaluate((element) => ({
    height: element.clientHeight,
    content: element.scrollHeight,
  }));
  expect(scroll.content).toBeGreaterThan(scroll.height);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
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
