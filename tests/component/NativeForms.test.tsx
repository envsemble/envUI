import { beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Forms.fixture.tsx';
import { mount } from './support/Mount.tsx';

// envUI's controls in a native form, tests/fixture/Forms.fixture.tsx: what a form submits, and
// what its reset restores.

beforeEach(() => {
  mount(fixture);
});

const input = (testId: string) => page.getByTestId(testId).element() as HTMLInputElement;
const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });
const search = () => page.getByRole('searchbox', { name: 'Search projects', exact: true });
const notifications = () => page.getByRole('switch', { name: 'Notifications', exact: true });
const button = (name: string) => page.getByRole('button', { name, exact: true });

test(
  'native controls submit values and restore uncontrolled defaults on form reset',
  { tags: ['engines'] },
  async () => {
    const controlled = page.getByTestId('controlled-checkbox');
    const uncontrolled = page.getByTestId('uncontrolled-checkbox');
    await expect.element(controlled).toHaveAttribute('aria-checked', 'mixed');
    expect(input('controlled-checkbox').indeterminate).toBe(true);
    expect(input('uncontrolled-checkbox').indeterminate).toBe(true);
    await controlled.click();
    await expect.element(controlled).toBeChecked();
    await expect.element(page.getByTestId('control-state')).toHaveTextContent('true');
    await uncontrolled.click();
    await expect.element(uncontrolled).toBeChecked();
    expect(input('uncontrolled-checkbox').indeterminate).toBe(false);

    await expect.element(notifications()).toBeChecked();
    await notifications().click();
    await expect.element(notifications()).not.toBeChecked();
    await page.getByRole('radio', { name: /Shared/ }).click();
    await textbox('Project name').fill('Changed project');
    await textbox('Notes').fill('Changed notes');
    await search().fill('changed query');
    await button('Submit form').click();
    await expect
      .poll(() => JSON.parse(page.getByTestId('form-values').element().textContent!))
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

    await button('Reset form').click();
    await expect.element(textbox('Project name')).toHaveValue('Initial project');
    await expect.element(textbox('Notes')).toHaveValue('Initial notes');
    // SearchField renders its query itself, and follows the reset to its default query.
    await expect.element(search()).toHaveValue('initial query');
    expect(button('Clear search').elements()).toHaveLength(1);
    await search().fill('');
    await expect.poll(() => button('Clear search').elements().length).toBe(0);
    await button('Reset form').click();
    await expect.element(search()).toHaveValue('initial query');
    await expect.poll(() => input('uncontrolled-checkbox').indeterminate).toBe(true);
    await expect.element(uncontrolled).not.toBeChecked();
    await expect.element(controlled).toBeChecked();
    await expect.element(notifications()).toBeChecked();
    await expect.element(page.getByRole('radio', { name: /Private/ })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: /Shared/ })).not.toBeChecked();
  },
);

test(
  'canceling a native form reset preserves field and selection state',
  { tags: ['engines'] },
  async () => {
    await page.getByRole('checkbox', { name: 'Prevent form reset', exact: true }).click();
    await textbox('Project name').fill('Preserved project');
    await search().fill('preserved query');
    await page.getByTestId('uncontrolled-checkbox').click();
    await notifications().click();
    await expect.element(notifications()).not.toBeChecked();
    await page.getByRole('radio', { name: /Shared/ }).click();
    const plan = page.getByRole('combobox', { name: 'Plan', exact: true });
    await plan.click();
    await page.getByRole('option', { name: 'Team', exact: true }).click();
    await expect.poll(() => page.getByRole('listbox').elements().length).toBe(0);
    await button('Reset form').click();
    await expect.element(textbox('Project name')).toHaveValue('Preserved project');
    await expect.element(page.getByTestId('uncontrolled-checkbox')).toBeChecked();
    expect(input('uncontrolled-checkbox').indeterminate).toBe(false);
    await expect.element(notifications()).not.toBeChecked();
    await expect.element(page.getByRole('radio', { name: /Shared/ })).toBeChecked();
    await expect.element(plan).toHaveTextContent('Team');
    await expect.element(search()).toHaveValue('preserved query');
  },
);
