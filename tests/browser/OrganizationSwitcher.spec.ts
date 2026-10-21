import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const adoption = `${fixtureUrl}/?fixture=adoption`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('OrganizationSwitcher switches organizations and offers creating one', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(adoption);
  const trigger = page.getByRole('button', { name: 'Northwind Labs' });
  await trigger.click();
  const menu = page.getByRole('menu', { name: 'Organizations', exact: true });
  await expect(menu).toContainText('Organizations');
  // The heading names the group of organizations.
  await expect(menu.getByRole('group', { name: 'Organizations', exact: true })).toBeVisible();
  await expect(menu.getByRole('menuitemradio', { name: 'Northwind Labs' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  // A detail, such as the person's role, follows each name.
  await expect(
    menu.getByRole('menuitemradio', { name: 'Contoso Member', exact: true }),
  ).toBeVisible();
  await expect(menu.locator('.env-organization-switcher-description').first()).toHaveText('Admin');
  // Choosing the active organization again does not switch.
  await menu.getByRole('menuitemradio', { name: 'Northwind Labs' }).click();
  await expect(menu).toBeHidden();
  await expect(page.getByTestId('menu-action')).toHaveText('');

  await trigger.click();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menuitemradio', { name: 'Contoso' }).click();
  await expect(page.getByTestId('menu-action')).toHaveText('Selected contoso');
  await expect(page.getByRole('button', { name: 'Contoso' })).toBeFocused();

  await page.getByRole('button', { name: 'Contoso' }).click();
  await page.getByRole('menuitem', { name: 'Create organization' }).click();
  await expect(page.getByTestId('menu-action')).toHaveText('Create organization');

  // The trigger is an ordinary secondary button.
  await expect(page.getByRole('button', { name: 'Contoso' })).toHaveAttribute(
    'data-variant',
    'secondary',
  );
  await page
    .getByTestId('no-organization')
    .getByRole('button', { name: 'Create organization' })
    .click();
  await expect(page.getByTestId('menu-action')).toHaveText('Create first organization');
  expect(errors).toEqual([]);
});
