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

test('list markers are plain: a dot in the text color or a muted number on the first line, quieter one level in', async ({
  page,
}) => {
  await page.goto(fixture);
  const markers = await page
    .getByTestId('lists')
    .locator('li')
    .evaluateAll((items) =>
      items.map((item) => {
        const bullet = item.parentElement!.localName === 'ul';
        // A bullet is the item's ::after, a number its ::before.
        const marker = getComputedStyle(item, bullet ? '::after' : '::before');
        const line = parseFloat(getComputedStyle(item).lineHeight);
        // The dot's middle, from its offset in the item, against the middle of the first line; a
        // number sits on the first line itself.
        const middle = parseFloat(marker.top) + parseFloat(marker.height) / 2;
        const probe = document.createElement('span');
        item.append(probe);
        probe.style.color = 'var(--env-color-fg-default)';
        const text = getComputedStyle(probe).color;
        probe.style.color = 'var(--env-color-fg-muted)';
        const muted = getComputedStyle(probe).color;
        probe.remove();
        // A dot is filled; a ring, one level in, is only its border.
        const ring = bullet && marker.backgroundColor === 'rgba(0, 0, 0, 0)';
        const color = !bullet
          ? marker.color
          : ring
            ? marker.borderTopColor
            : marker.backgroundColor;
        return {
          content: marker.content,
          shape: !bullet ? 'number' : ring ? 'ring' : 'dot',
          size: bullet ? marker.width : undefined,
          // No circle behind any marker.
          circle: getComputedStyle(item, '::before').backgroundColor !== 'rgba(0, 0, 0, 0)',
          tone: color === text ? 'text' : color === muted ? 'muted' : color,
          onFirstLine: bullet ? Math.abs(middle - line / 2) < 0.5 : parseFloat(marker.top) === 0,
        };
      }),
    );
  expect(markers).toEqual([
    { content: '""', shape: 'dot', size: '5px', circle: false, tone: 'text', onFirstLine: true },
    { content: '""', shape: 'dot', size: '5px', circle: false, tone: 'text', onFirstLine: true },
    { content: '""', shape: 'ring', size: '5px', circle: false, tone: 'muted', onFirstLine: true },
    {
      content: 'counter(list-item) "."',
      shape: 'number',
      circle: false,
      tone: 'muted',
      onFirstLine: true,
    },
    {
      content: 'counter(list-item) "."',
      shape: 'number',
      circle: false,
      tone: 'muted',
      onFirstLine: true,
    },
    {
      content: 'counter(list-item, lower-alpha) "."',
      shape: 'number',
      circle: false,
      tone: 'muted',
      onFirstLine: true,
    },
  ]);
  // Task lists keep their checkboxes and draw no marker.
  await expect(page.getByTestId('english').locator('.task-list-item').first()).toHaveCSS(
    'padding-inline-start',
    '0px',
  );
});

test('an item with key caps in its line keeps its line, its bullet beside the keys', async ({
  page,
}) => {
  await page.goto(fixture);
  const items = await page
    .getByTestId('keys')
    .locator('li')
    .evaluateAll((list) =>
      list.map((item) => {
        // The bullet's middle, from the item's top, sits within each key cap's height: a margin on
        // a key would push the line, and the keys, down below the bullet.
        const bullet = getComputedStyle(item, '::after');
        const middle = parseFloat(bullet.top) + parseFloat(bullet.height) / 2;
        const top = item.getBoundingClientRect().top;
        return [...item.querySelectorAll('.env-kbd')].every((key) => {
          const box = key.getBoundingClientRect();
          return box.top - top < middle && box.bottom - top > middle;
        });
      }),
    );
  expect(items).toEqual([true, true]);
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

test('rendered again with a new renderLink, Markdown keeps its elements and uses the new one', async ({
  page,
}) => {
  await page.goto(fixture);
  const scope = page.getByTestId('rendered-again');
  const heading = await scope.getByRole('heading', { name: 'Plans' }).elementHandle();
  await expect(scope.getByRole('link', { name: 'the prices' })).toHaveAttribute('data-round', '0');
  await scope.getByRole('button', { name: 'Render again' }).click();
  await expect(scope.getByRole('link', { name: 'the prices' })).toHaveAttribute('data-round', '1');
  // The heading is the same element: a page's anchors, focus and scroll position survive.
  expect(await heading!.evaluate((element) => element.isConnected)).toBe(true);
});

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
