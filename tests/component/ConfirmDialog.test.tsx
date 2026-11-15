import { beforeEach, describe, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/ConfirmDialog.fixture.tsx';
import { box, collectErrors, keyboard, mouse, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const log = () => page.getByTestId('confirm-log').element().textContent;
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isHidden = (locator: Locator) => expect.poll(() => shown(locator)).toBe(false);
const isFocused = (locator: Locator) => expect.element(locator).toHaveFocus();

function expectedUncaughtErrors() {
  const errors: string[] = [];
  const listener = (event: ErrorEvent) => errors.push(event.error?.message ?? event.message);
  window.addEventListener('error', listener);
  return { errors, stop: () => window.removeEventListener('error', listener) };
}

function pressPastModalBackdrop(name: string) {
  const button = [...document.querySelectorAll('button')].find(
    (element) => element.textContent === name,
  )!;
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

async function dblclick(locator: Locator) {
  const { x, y, width, height } = box(locator);
  await mouse.dblclick(x + width / 2, y + height / 2);
}

describe('ConfirmDialog', () => {
  test(
    'is an alert dialog that focuses its confirm button, and confirms or cancels',
    { tags: ['engines'] },
    async () => {
      const trigger = page.getByRole('button', { name: 'Archive project' });
      await trigger.click();
      const dialog = page.getByRole('alertdialog', { name: 'Archive Northwind launch?' });
      await isShown(dialog);
      await expect
        .element(dialog)
        .toHaveAccessibleDescription('People can still find it under Archived.');
      await isFocused(dialog.getByRole('button', { name: 'Archive project' }));
      await mouse.click(4, 4);
      await isShown(dialog);
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await isHidden(dialog);
      await isFocused(trigger);
      await expect.poll(log).toBe('open trigger-press,close close-press');

      await trigger.click();
      await isShown(dialog);
      await keyboard.press('Escape');
      await isHidden(dialog);

      await trigger.click();
      await isFocused(dialog.getByRole('button', { name: 'Archive project' }));
      await keyboard.press('Enter');
      await isHidden(dialog);
      await expect
        .poll(log)
        .toBe(
          'open trigger-press,close close-press,open trigger-press,close escape-key,open trigger-press,archived,close imperative-action',
        );
    },
  );

  test('a danger confirmation starts on Cancel, is pending while its action runs and stays open when it fails', async () => {
    const reported = expectedUncaughtErrors();
    try {
      const trigger = page.getByRole('button', { name: 'Delete project' });
      await trigger.click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete Northwind launch?' });
      const cancel = dialog.getByRole('button', { name: 'Cancel' });
      const confirm = dialog.getByRole('button', { name: 'Delete project' });
      await isFocused(cancel);
      await expect.element(confirm).toHaveAttribute('data-tone', 'danger');

      await confirm.click();
      await expect.element(confirm).toHaveAttribute('aria-busy', 'true');
      await expect.element(cancel).toBeDisabled();
      await expect.element(dialog).toHaveAttribute('aria-busy', 'true');
      await keyboard.press('Escape');
      await isShown(dialog);

      pressPastModalBackdrop('Finish the action');
      await expect
        .poll(() => dialog.getByRole('alert').query()?.textContent)
        .toMatch(/could not be deleted/);
      await expect.element(confirm).not.toHaveAttribute('aria-busy');
      await expect.element(cancel).toBeEnabled();
      expect(reported.errors).toEqual(['failed']);

      await confirm.click();
      await expect.element(confirm).toHaveAttribute('aria-busy', 'true');
      pressPastModalBackdrop('Finish the action');
      await isHidden(dialog);
      await expect.poll(log).toBe('deleted');
      await isFocused(trigger);
    } finally {
      reported.stop();
    }
  });

  test('a double-click on the confirm button runs the action once, and a dialog kept open confirms again', async () => {
    await page.getByRole('button', { name: 'Archive project' }).click();
    const archive = page.getByRole('alertdialog', { name: 'Archive Northwind launch?' });
    await isFocused(archive.getByRole('button', { name: 'Archive project' }));
    await dblclick(archive.getByRole('button', { name: 'Archive project' }));
    await isHidden(archive);
    await page.getByRole('button', { name: 'Duplicate project' }).click();
    const duplicate = page.getByRole('alertdialog', { name: 'Duplicate Northwind launch?' });
    await isFocused(duplicate.getByRole('button', { name: 'Duplicate project' }));
    await dblclick(duplicate.getByRole('button', { name: 'Duplicate project' }));
    await isHidden(duplicate);
    await expect.poll(log).toBe('open trigger-press,archived,close imperative-action,duplicated');
    await page.getByRole('button', { name: 'Duplicate project' }).click();
    await duplicate.getByRole('button', { name: 'Duplicate project' }).click();
    await isHidden(duplicate);
    await expect
      .poll(log)
      .toBe('open trigger-press,archived,close imperative-action,duplicated,duplicated');

    await page.getByRole('button', { name: 'Save draft' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Save the draft?' });
    const save = dialog.getByRole('button', { name: 'Save draft' });
    await save.click();
    await expect.poll(log).toMatch(/,saved$/);
    await isShown(dialog);
    await save.click();
    await expect.poll(log).toMatch(/,saved,saved$/);
  });

  test(
    'opened from a menu item, it returns focus to the menu button',
    { tags: ['engines'] },
    async () => {
      const menuButton = page.getByRole('button', { name: 'Project actions' });
      await menuButton.click();
      await page.getByRole('menuitem', { name: 'Remove member…' }).click();
      const dialog = page.getByRole('alertdialog', { name: 'Remove Sam Lee?' });
      await expect
        .poll(() => dialog.query()?.textContent)
        .toContain('Sam loses access to Northwind launch.');
      await isFocused(dialog.getByRole('button', { name: 'Keep member' }));
      await keyboard.press('Escape');
      await isHidden(dialog);
      await isFocused(menuButton);
    },
  );

  test('Enter in a field confirms through the same action: pending, once, and kept open when it fails', async () => {
    const reported = expectedUncaughtErrors();
    try {
      const trigger = page.getByRole('button', { name: 'Delete workspace' });
      await trigger.click();
      const dialog = page.getByRole('alertdialog', { name: 'Delete the Acme workspace?' });
      const confirm = dialog.getByRole('button', { name: 'Delete workspace' });
      const field = dialog.getByRole('textbox', { name: 'Workspace name' });
      await field.fill('Acme');
      await keyboard.press('Enter');
      await expect.element(confirm).toHaveAttribute('aria-busy', 'true');
      await expect.element(dialog).toHaveAttribute('aria-busy', 'true');
      await keyboard.press('Enter');
      await expect.poll(log).toBe('delete workspace');
      pressPastModalBackdrop('Finish the workspace action');
      await expect
        .poll(() => dialog.getByRole('alert').query()?.textContent)
        .toMatch(/could not be deleted/);
      await expect.element(confirm).not.toHaveAttribute('aria-busy');
      expect(reported.errors).toEqual(['failed']);
      await isFocused(field);
      await keyboard.press('Enter');
      await expect.element(confirm).toHaveAttribute('aria-busy', 'true');
      pressPastModalBackdrop('Finish the workspace action');
      await isHidden(dialog);
      expect(log()).toBe('delete workspace,delete workspace');
    } finally {
      reported.stop();
    }
  });

  test('with confirmDisabled, neither its confirm button nor Enter in a field confirms', async () => {
    await page.getByRole('button', { name: 'Delete repository' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete acme/api?' });
    const confirm = dialog.getByRole('button', { name: 'Delete repository' });
    const field = dialog.getByRole('textbox', { name: 'Repository name' });
    await isFocused(dialog.getByRole('button', { name: 'Cancel' }));
    await expect.element(confirm).toBeDisabled();
    await field.click();
    await field.fill('acme/ap');
    await keyboard.press('Enter');
    await isShown(dialog);
    await expect.element(confirm).toBeDisabled();
    expect(log()).toBe('');
    await field.fill('acme/api');
    await expect.element(confirm).toBeEnabled();
    await keyboard.press('Enter');
    await isHidden(dialog);
    await expect.poll(log).toBe('delete repository');
  });

  test(
    'says while developing that a form in its content would nest in its own',
    { tags: ['once'] },
    async () => {
      const errors = collectErrors();
      await page.getByRole('button', { name: 'Archive project' }).click();
      const archive = page.getByRole('alertdialog', { name: 'Archive Northwind launch?' });
      await isShown(archive);
      await keyboard.press('Escape');
      await isHidden(archive);
      await page.getByRole('button', { name: 'Rename project' }).click();
      await isShown(page.getByRole('alertdialog', { name: 'Rename Northwind launch?' }));
      await expect
        .poll(() => errors.filter((error) => error.startsWith('envUI: ')))
        .toEqual([expect.stringMatching(/ConfirmDialog's children hold a <form>.*use Dialog/)]);
    },
  );
});
