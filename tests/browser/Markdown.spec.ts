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
  // Without a heading, a table is named after its first column.
  await expectNames(page.getByTestId('narrow').getByRole('region'), ['Setting table']);
  const tasks = english.getByRole('checkbox');
  await expectNames(tasks, ['Completed task', 'Incomplete task']);
  // Tasks are envUI checkboxes, not small native boxes.
  await expect(tasks.first()).toHaveClass(/env-checkbox-input/);
});

test('a rule is a hairline across the whole text column', async ({ page }) => {
  await page.goto(fixture);
  const rule = page.getByTestId('english').locator('hr');
  await expect(rule).toHaveCSS('border-top-width', '1px');
  await expect(rule).toHaveCSS('border-top-style', 'solid');
  await expect(rule).toHaveCSS('border-bottom-width', '0px');
  const [own, column] = await rule.evaluate((element) => [
    element.getBoundingClientRect().width,
    element.closest('.env-prose')!.clientWidth,
  ]);
  expect(own).toBeCloseTo(column, 0);
});

test('list markers are tinted circles on the first line, quieter one level in', async ({
  page,
}) => {
  await page.goto(fixture);
  const markers = await page
    .getByTestId('lists')
    .locator('li')
    .evaluateAll((items) =>
      items.map((item) => {
        const marker = getComputedStyle(item, '::before');
        const line = parseFloat(getComputedStyle(item).lineHeight);
        // The circle's middle, from its offset in the item, against the middle of the first line.
        const middle = parseFloat(marker.top) + parseFloat(marker.height) / 2;
        return {
          content: marker.content,
          filled: marker.backgroundColor !== 'rgba(0, 0, 0, 0)',
          centred: Math.abs(middle - line / 2) < 0.5,
        };
      }),
    );
  expect(markers).toEqual([
    { content: '""', filled: true, centred: true },
    { content: '""', filled: true, centred: true },
    { content: '""', filled: false, centred: true },
    { content: 'counter(list-item)', filled: true, centred: true },
    { content: 'counter(list-item)', filled: true, centred: true },
    { content: 'counter(list-item, lower-alpha)', filled: false, centred: true },
  ]);
  // Task lists keep their checkboxes and draw no marker.
  await expect(page.getByTestId('english').locator('.task-list-item').first()).toHaveCSS(
    'padding-inline-start',
    '0px',
  );
});

test(
  'inline code in a table cell breaks only where it would overflow, not inside its word',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(fixture);
    const code = page.getByTestId('narrow').locator('td code');
    await expect(code).toHaveCSS('overflow-wrap', 'break-word');
    // The column keeps room for the whole word, which the region scrolls to show.
    expect(await code.evaluate((element) => element.getClientRects().length)).toBe(1);
  },
);

test('Markdown accepts component overrides and remark and rehype plugins', async ({ page }) => {
  await page.goto(`${fixtureUrl}/?fixture=markdown-extensions`);
  const scope = page.getByTestId('markdown-extensions');
  await expect(scope.locator('.env-markdown')).toHaveClass(/fixture-markdown/);
  // envUI's heading offset still applies, and the rehype plugin's id reaches the element.
  const heading = scope.getByRole('heading', { name: 'Project plan', level: 2 });
  await expect(heading).toHaveAttribute('id', 'project-plan');
  // The application's override wins over envUI's components.
  await expect(scope.locator('blockquote[data-custom-quote]')).toHaveText('A quoted decision');
  // The remark plugin runs after envUI's own Markdown extensions, which still render tables.
  await expect(scope.locator('em')).toHaveText('TODO');
  await expect(scope.getByRole('table')).toBeVisible();
  // Raw HTML stays ignored, even with a rehype plugin that would render it.
  await expect(scope.getByText('Some inline HTML')).toBeVisible();
  await expect(scope.locator('.env-markdown [data-raw]')).toHaveCount(0);
  await expect(scope).not.toContainText('A block');
  await expect(scope).not.toContainText('<span>');
  // Keys are the one exception: <kbd> around plain text renders as Kbd, and nothing else.
  await expect(scope.locator('.env-markdown kbd.env-kbd')).toHaveText(['Ctrl', 'P']);
  await expect(scope.getByText(/^Press/)).toHaveText('Press Ctrl+P or F1.');
  await expect(scope.getByText(/^Not keys/)).toHaveText('Not keys: A B');
  await expect(scope.locator('.env-markdown [onclick], .env-markdown kbd.x')).toHaveCount(0);
  await expect(scope.locator('.env-markdown b')).toHaveCount(0);
});
