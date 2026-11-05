import { test, expect } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';

const confirmDialogs = `${fixtureUrl}/?fixture=confirm-dialogs`;

test.describe('ConfirmDialog', () => {
  test(
    'is an alert dialog that focuses its confirm button, and confirms or cancels',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(confirmDialogs);
      const log = page.getByTestId('confirm-log');
      const trigger = page.getByRole('button', { name: 'Archive project' });
      await trigger.click();
      const dialog = page.getByRole('alertdialog', { name: 'Archive Northwind launch?' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleDescription('People can still find it under Archived.');
      // A neutral confirmation starts on its confirm button.
      await expect(dialog.getByRole('button', { name: 'Archive project' })).toBeFocused();
      // A press outside doesn't dismiss an alert dialog.
      await page.mouse.click(4, 4);
      await expect(dialog).toBeVisible();
      // Cancel closes it, and focus returns to the trigger.
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(log).toHaveText('open trigger-press,close close-press');

      // Escape closes it too.
      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();

      // Enter on the focused confirm button confirms.
      await trigger.click();
      await expect(dialog.getByRole('button', { name: 'Archive project' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect(log).toHaveText(
        'open trigger-press,close close-press,open trigger-press,close escape-key,open trigger-press,archived,close imperative-action',
      );
    },
  );

  test('a danger confirmation starts on Cancel, is pending while its action runs and stays open when it fails', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(confirmDialogs);
    const trigger = page.getByRole('button', { name: 'Delete project' });
    await trigger.click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete Northwind launch?' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    const confirm = dialog.getByRole('button', { name: 'Delete project' });
    await expect(cancel).toBeFocused();
    await expect(confirm).toHaveAttribute('data-tone', 'danger');

    await confirm.click();
    // While the action runs, the confirm button is pending, Cancel is disabled and nothing
    // dismisses the dialog.
    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await expect(cancel).toBeDisabled();
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    // The action fails: the dialog stays open and announces why.
    await page
      .getByRole('button', { name: 'Finish the action', includeHidden: true })
      .dispatchEvent('click');
    const alert = dialog.getByRole('alert');
    await expect(alert).toHaveText(/could not be deleted/);
    await expect(confirm).not.toHaveAttribute('aria-busy');
    await expect(cancel).toBeEnabled();
    // The failure isn't swallowed: it's reported like an uncaught error.
    expect(errors).toEqual(['failed']);

    // Trying again succeeds and closes it.
    await confirm.click();
    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await page
      .getByRole('button', { name: 'Finish the action', includeHidden: true })
      .dispatchEvent('click');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('confirm-log')).toHaveText('deleted');
    await expect(trigger).toBeFocused();
  });

  test('a double-click on the confirm button runs the action once', async ({ page }) => {
    await page.goto(confirmDialogs);
    const log = page.getByTestId('confirm-log');
    // A synchronous action: the second click lands while the dialog closes.
    await page.getByRole('button', { name: 'Archive project' }).click();
    const archive = page.getByRole('alertdialog', { name: 'Archive Northwind launch?' });
    await archive.getByRole('button', { name: 'Archive project' }).dblclick();
    await expect(archive).toBeHidden();
    // An asynchronous action that succeeds at once: the second click lands after it resolves.
    await page.getByRole('button', { name: 'Duplicate project' }).click();
    const duplicate = page.getByRole('alertdialog', { name: 'Duplicate Northwind launch?' });
    await duplicate.getByRole('button', { name: 'Duplicate project' }).dblclick();
    await expect(duplicate).toBeHidden();
    await expect(log).toHaveText('open trigger-press,archived,close imperative-action,duplicated');
    // Opened again, it confirms again.
    await page.getByRole('button', { name: 'Duplicate project' }).click();
    await duplicate.getByRole('button', { name: 'Duplicate project' }).click();
    await expect(duplicate).toBeHidden();
    await expect(log).toHaveText(
      'open trigger-press,archived,close imperative-action,duplicated,duplicated',
    );
  });

  test('kept open by the application after its action, it confirms again', async ({ page }) => {
    await page.goto(confirmDialogs);
    const log = page.getByTestId('confirm-log');
    await page.getByRole('button', { name: 'Save draft' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Save the draft?' });
    const save = dialog.getByRole('button', { name: 'Save draft' });
    await save.click();
    await expect(log).toHaveText('saved');
    await expect(dialog).toBeVisible();
    await save.click();
    await expect(log).toHaveText('saved,saved');
  });

  test(
    'opened from a menu item, it returns focus to the menu button',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(confirmDialogs);
      const menuButton = page.getByRole('button', { name: 'Project actions' });
      await menuButton.click();
      await page.getByRole('menuitem', { name: 'Remove member…' }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Remove Sam Lee?' });
      await expect(dialog).toContainText('Sam loses access to Northwind launch.');
      await expect(dialog.getByRole('button', { name: 'Keep member' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(menuButton).toBeFocused();
    },
  );

  test('Enter in a field confirms through the same action: pending, once, and kept open when it fails', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(confirmDialogs);
    const log = page.getByTestId('confirm-log');
    const trigger = page.getByRole('button', { name: 'Delete workspace' });
    await trigger.click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete the Acme workspace?' });
    const confirm = dialog.getByRole('button', { name: 'Delete workspace' });
    const field = dialog.getByRole('textbox', { name: 'Workspace name' });
    await field.fill('Acme');
    await field.press('Enter');
    // The action runs, pending, and a second Enter doesn't run it again.
    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await expect(dialog).toHaveAttribute('aria-busy', 'true');
    await field.press('Enter');
    await expect(log).toHaveText('delete workspace');
    const finish = page.getByRole('button', {
      name: 'Finish the workspace action',
      includeHidden: true,
    });
    // It fails: the dialog stays open and announces why.
    await finish.dispatchEvent('click');
    await expect(dialog.getByRole('alert')).toHaveText(/could not be deleted/);
    await expect(confirm).not.toHaveAttribute('aria-busy');
    expect(errors).toEqual(['failed']);
    // Enter again tries again, and success closes it; the page's form never sees a submit.
    await field.press('Enter');
    await expect(confirm).toHaveAttribute('aria-busy', 'true');
    await finish.dispatchEvent('click');
    await expect(dialog).toBeHidden();
    await expect(log).toHaveText('delete workspace,delete workspace');
  });

  test('with confirmDisabled, neither its confirm button nor Enter in a field confirms', async ({
    page,
  }) => {
    await page.goto(confirmDialogs);
    const log = page.getByTestId('confirm-log');
    await page.getByRole('button', { name: 'Delete repository' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete acme/api?' });
    const confirm = dialog.getByRole('button', { name: 'Delete repository' });
    const field = dialog.getByRole('textbox', { name: 'Repository name' });
    // Focus still starts on Cancel, and the field takes it when clicked.
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expect(confirm).toBeDisabled();
    await field.click();
    await field.fill('acme/ap');
    await field.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(confirm).toBeDisabled();
    await expect(log).toHaveText('');
    // The right name enables it, and Enter confirms.
    await field.fill('acme/api');
    await expect(confirm).toBeEnabled();
    await field.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(log).toHaveText('delete repository');
  });

  test('says while developing that a form in its content would nest in its own', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(confirmDialogs);
    // A dialog without a form of its own says nothing.
    await page.getByRole('button', { name: 'Archive project' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Rename project' }).click();
    await expect(page.getByRole('alertdialog', { name: 'Rename Northwind launch?' })).toBeVisible();
    await expect
      .poll(() => errors.filter((error) => error.startsWith('envUI: ')))
      .toEqual([expect.stringMatching(/ConfirmDialog's children hold a <form>.*use Dialog/)]);
  });
});
