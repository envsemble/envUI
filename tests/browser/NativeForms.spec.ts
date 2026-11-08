import { expect, test } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

// envUI's controls in a native form, tests/fixture/Forms.tsx: what a form submits, and what its
// reset restores.

test.beforeEach(async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=forms`);
});

test(
  'native controls submit values and restore uncontrolled defaults on form reset',
  { tag: '@engines' },
  async ({ page }) => {
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
    const search = page.getByRole('searchbox', { name: 'Search projects', exact: true });
    await search.fill('changed query');
    await page.getByRole('button', { name: 'Submit form', exact: true }).click();
    await expect
      .poll(async () => JSON.parse((await page.getByTestId('form-values').textContent())!))
      .toEqual({
        project: 'Changed project',
        notes: 'Changed notes',
        query: 'changed query',
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
    // SearchField renders its query itself, and follows the reset to its default query.
    await expect(search).toHaveValue('initial query');
    await expect(page.getByRole('button', { name: 'Clear search', exact: true })).toHaveCount(1);
    await search.fill('');
    await expect(page.getByRole('button', { name: 'Clear search', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset form', exact: true }).click();
    await expect(search).toHaveValue('initial query');
    await expect(uncontrolled).toHaveJSProperty('indeterminate', true);
    await expect(uncontrolled).not.toBeChecked();
    await expect(controlled).toBeChecked();
    await expect(notifications).toBeChecked();
    await expect(page.getByRole('radio', { name: /Private/ })).toBeChecked();
    await expect(page.getByRole('radio', { name: /Shared/ })).not.toBeChecked();
  },
);

test(
  'canceling a native form reset preserves field and selection state',
  { tag: '@engines' },
  async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Prevent form reset', exact: true }).check();
    await page
      .getByRole('textbox', { name: 'Project name', exact: true })
      .fill('Preserved project');
    const search = page.getByRole('searchbox', { name: 'Search projects', exact: true });
    await search.fill('preserved query');
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
    await expect(page.getByTestId('uncontrolled-checkbox')).toHaveJSProperty(
      'indeterminate',
      false,
    );
    await expect(
      page.getByRole('switch', { name: 'Notifications', exact: true }),
    ).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Shared/ })).toBeChecked();
    await expect(plan).toHaveText('Team');
    await expect(search).toHaveValue('preserved query');
  },
);
