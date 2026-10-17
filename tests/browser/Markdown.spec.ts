import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const fixture = `${fixtureUrl}/?fixture=markdown-tables`;

/** Expects the elements a locator finds to have these accessible names, in order. */
async function expectNames(locator: Locator, names: string[]) {
  await expect(locator).toHaveCount(names.length);
  for (const [index, name] of names.entries())
    await expect(locator.nth(index)).toHaveAccessibleName(name);
}

test('table regions are named after their heading, numbered where they share a name', async ({
  page,
}) => {
  await page.goto(fixture);
  const english = page.getByTestId('english');
  await expectNames(english.getByRole('region'), [
    'Prices table',
    'Prices table 2',
    'Prices table 3',
  ]);
  const tasks = english.getByRole('checkbox');
  await expectNames(tasks, ['Completed task', 'Incomplete task']);
  // Tasks are envUI checkboxes, not small native boxes.
  await expect(tasks.first()).toHaveClass(/env-checkbox-input/);
});

test("table regions and task checkboxes take their names from EnvUIProvider's messages", async ({
  page,
}) => {
  await page.goto(fixture);
  const german = page.getByTestId('german');
  await expectNames(german.getByRole('region'), [
    'Tabelle Prices',
    'Tabelle Prices 2',
    'Tabelle Prices 3',
  ]);
  await expectNames(german.getByRole('checkbox'), ['Erledigte Aufgabe', 'Offene Aufgabe']);
});

test('inline code in a table cell breaks only where it would overflow, not inside its word', async ({
  page,
}) => {
  await page.goto(fixture);
  const code = page.getByTestId('narrow').locator('td code');
  await expect(code).toHaveCSS('overflow-wrap', 'break-word');
  // The column keeps room for the whole word, which the region scrolls to show.
  expect(await code.evaluate((element) => element.getClientRects().length)).toBe(1);
});
