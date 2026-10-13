import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './Servers';

const tablesFixture = `${fixtureUrl}/?fixture=tables`;
const themes = ['light', 'dark'] as const;

/** Text contrast as painted: the text color over every fill between it and the theme canvas. */
async function paintedContrast(element: Locator) {
  return element.evaluate((node) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const fills: string[] = [];
    for (let current: Element | null = node; current; current = current.parentElement) {
      fills.unshift(getComputedStyle(current).backgroundColor);
      if (current.classList.contains('env-theme')) break;
    }
    const paint = (colors: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const color of colors) {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(red!) + 0.7152 * linear(green!) + 0.0722 * linear(blue!);
    };
    const background = paint(fills);
    const foreground = paint([...fills, getComputedStyle(node).color]);
    const [lighter, darker] = [background, foreground].sort((a, b) => b - a);
    return (lighter! + 0.05) / (darker! + 0.05);
  });
}

/** The color a token resolves to inside the element's theme. */
async function tokenColor(element: Locator, token: string) {
  return element.evaluate((node, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    node.closest('.env-theme')!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

let errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(tablesFixture);
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('sortable headers are buttons that say what pressing does and report the order', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Reports light' });
  const report = table.getByRole('columnheader', { name: 'Report', exact: true });
  await expect(report).toHaveAttribute('aria-sort', 'none');
  await expect(table.getByRole('columnheader', { name: 'Owner', exact: true })).not.toHaveAttribute(
    'aria-sort',
  );
  const sortReport = report.getByRole('button');
  await expect(sortReport).toHaveAccessibleName('Report sort ascending');
  // The header renders its children once; the button and the handle refer to them for their names.
  expect(await report.evaluate((cell) => cell.textContent!.split('Report').length - 1)).toBe(1);
  // The button fills its header cell, so the whole cell is the target.
  const cell = (await report.boundingBox())!;
  const button = (await sortReport.boundingBox())!;
  expect(button.width).toBeCloseTo(cell.width, 0);
  expect(button.x).toBeCloseTo(cell.x, 0);

  await sortReport.click();
  await expect(report).toHaveAttribute('aria-sort', 'ascending');
  await expect(sortReport).toHaveAccessibleName('Report sort descending');
  await expect(page.getByTestId('order-light')).toHaveText('audit tokens quarterly roadmap');
  // The sorted header shows its order in the primary text color.
  await expect(report).toHaveCSS('color', await tokenColor(report, '--color-text-primary'));

  await sortReport.focus();
  await page.keyboard.press('Enter');
  await expect(report).toHaveAttribute('aria-sort', 'descending');
  await expect(sortReport).toHaveAccessibleName('Report sort ascending');
  await expect(sortReport).toBeFocused();
  await expect(page.getByTestId('order-light')).toHaveText('roadmap quarterly tokens audit');

  const reviews = table.getByRole('columnheader', { name: 'Reviews', exact: true });
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(reviews.getByRole('button')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(reviews).toHaveAttribute('aria-sort', 'ascending');
  await expect(report).toHaveAttribute('aria-sort', 'none');
  await expect(page.getByTestId('order-light')).toHaveText('roadmap tokens quarterly audit');
  // In a numeric column the arrow comes first, so the label lines up with the numbers below.
  const label = (await reviews.locator('.env-table-header-label').boundingBox())!;
  const arrow = (await reviews.locator('.env-symbol').boundingBox())!;
  const number = table.getByRole('cell', { name: '3', exact: true });
  const numberBox = (await number.boundingBox())!;
  const padding = await number.evaluate((cell) => parseFloat(getComputedStyle(cell).paddingRight));
  expect(arrow.x).toBeLessThan(label.x);
  expect(label.x + label.width).toBeCloseTo(numberBox.x + numberBox.width - padding, 0);
  await expect(reviews.getByRole('button')).toHaveCSS(
    'outline-color',
    await tokenColor(reviews, '--color-focus-ring'),
  );
});

test('columns resize from the keyboard and the pointer without changing the table width', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Reports light' });
  const widths = page.getByTestId('widths-light');
  const handle = table.getByRole('separator', { name: 'Resize Report' });
  // The last column ends at the table's edge, so it has no handle.
  await expect(table.getByRole('separator')).toHaveCount(3);
  await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  await expect(handle).toHaveAttribute('aria-valuemin', '10');
  await expect(handle).toHaveAttribute('aria-valuemax', '60');
  await expect(handle).toHaveAttribute('aria-valuetext', '40%');
  // The header keeps its own name beside the sort button and the handle.
  await expect(table.getByRole('columnheader', { name: 'Report', exact: true })).toBeVisible();

  const tableWidth = (await table.boundingBox())!.width;
  const columnShare = async (name: string) =>
    (await table.getByRole('columnheader', { name, exact: true }).boundingBox())!.width /
    tableWidth;
  expect(await columnShare('Report')).toBeCloseTo(0.4, 2);

  await handle.focus();
  await expect(handle).toHaveCSS('outline-style', 'none');
  // Keyboard focus shows the boundary line in the focus ring color.
  await expect
    .poll(() => handle.evaluate((element) => getComputedStyle(element, '::after').backgroundColor))
    .toBe(await tokenColor(handle, '--color-focus-ring'));
  await page.keyboard.press('ArrowRight');
  await expect(widths).toHaveText('41.0 29.0 15.0 15.0');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(widths).toHaveText('46.0 24.0 15.0 15.0');
  await expect(handle).toHaveAttribute('aria-valuenow', '46');
  await page.keyboard.press('End');
  await expect(widths).toHaveText('60.0 10.0 15.0 15.0');
  await page.keyboard.press('ArrowRight');
  await expect(widths).toHaveText('60.0 10.0 15.0 15.0');
  await page.keyboard.press('Home');
  await expect(widths).toHaveText('10.0 60.0 15.0 15.0');
  await page.keyboard.press('ArrowLeft');
  await expect(widths).toHaveText('10.0 60.0 15.0 15.0');
  await expect.poll(() => columnShare('Report')).toBeCloseTo(0.1, 2);
  await expect.poll(() => columnShare('Owner')).toBeCloseTo(0.6, 2);
  expect((await table.boundingBox())!.width).toBeCloseTo(tableWidth, 0);

  // Double-clicking restores the starting widths.
  await handle.dblclick();
  await expect(widths).toHaveText('40.0 30.0 15.0 15.0');

  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + tableWidth * 0.1, box.y + box.height / 2, {
    steps: 4,
  });
  await expect(table).toHaveAttribute('data-resizing', '');
  await expect(handle).toHaveAttribute('data-resizing', '');
  await page.mouse.up();
  await expect(table).not.toHaveAttribute('data-resizing');
  await expect(handle).toHaveAttribute('aria-valuenow', '50');
  await expect(table.getByRole('separator', { name: 'Resize Owner' })).toHaveAttribute(
    'aria-valuemax',
    '25',
  );
  await expect.poll(() => columnShare('Report')).toBeCloseTo(0.5, 2);
  expect((await table.boundingBox())!.width).toBeCloseTo(tableWidth, 0);

  // A table can own its widths; a cut-short cell ends with an ellipsis.
  const owned = page.getByRole('table', { name: 'Owned widths light' });
  const ownerHandle = owned.getByRole('separator', { name: 'Resize the owner column' });
  await expect(ownerHandle).toHaveAttribute('aria-valuenow', '35');
  await ownerHandle.focus();
  await page.keyboard.press('Shift+ArrowLeft');
  await expect(ownerHandle).toHaveAttribute('aria-valuenow', '30');
  await owned.getByRole('separator', { name: 'Resize Name' }).dblclick();
  await expect(ownerHandle).toHaveAttribute('aria-valuenow', '35');
  const cut = owned.getByRole('cell', { name: /A very long report name/ });
  await expect(cut).toHaveCSS('text-overflow', 'ellipsis');
  expect(await cut.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('columns resize the other way in a right-to-left table', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Reports light' });
  await table.evaluate((element) =>
    element.closest('.env-table-region')!.setAttribute('dir', 'rtl'),
  );
  const handle = table.getByRole('separator', { name: 'Resize Report' });
  const box = (await handle.boundingBox())!;
  const cell = (await table.getByRole('columnheader', { name: 'Report' }).boundingBox())!;
  // The handle sits at the inline end of its header, the left edge in right-to-left text.
  expect(box.x).toBeCloseTo(cell.x, 0);
  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(handle).toHaveAttribute('aria-valuenow', '41');

  // Dragging toward the inline end, to the left, widens the column too.
  const tableWidth = (await table.boundingBox())!.width;
  const start = (await handle.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2 - tableWidth * 0.09, start.y + start.height / 2, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-valuenow', '50');
  // The boundary moves between the two columns, so the next one gives up what this one gains.
  const [report, owner] = (await page.getByTestId('widths-light').textContent())!
    .split(' ')
    .map(Number);
  expect(report).toBeCloseTo(50, 0);
  expect(report! + owner!).toBeCloseTo(70, 5);
  const header = (await table.getByRole('columnheader', { name: 'Report' }).boundingBox())!;
  expect(header.width / tableWidth).toBeCloseTo(0.5, 2);
});

test('selected rows report aria-selected and take the selection colors in both themes', async ({
  page,
}) => {
  await page.mouse.move(0, 0);
  for (const theme of themes) {
    const table = page.getByRole('table', { name: `Reports ${theme}` });
    const selected = table.getByRole('row', { name: /design-system\/tokens/ });
    const other = table.getByRole('row', { name: /Quarterly report/ });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(other).toHaveAttribute('aria-selected', 'false');
    const selection = await selected.evaluate((row) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--color-navigation-selected)';
      row.closest('.env-theme')!.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(selected).toHaveCSS('background-color', selection);
    await expect(other).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // A bar in the selection text color marks the start of the row.
    await expect(selected.getByRole('cell').first()).toHaveCSS(
      'box-shadow',
      `${await tokenColor(selected, '--color-on-navigation-selected')} 3px 0px 0px 0px inset`,
    );
    expect(
      await paintedContrast(selected.getByRole('cell', { name: 'Mira Okafor' })),
    ).toBeGreaterThan(4.5);
    await other.getByRole('checkbox', { name: 'Quarterly report' }).check();
    await expect(other).toHaveAttribute('aria-selected', 'true');
    await other.hover();
    const hovered = await selected.evaluate((row) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--color-row-selected-hover)';
      row.closest('.env-theme')!.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(other).toHaveCSS('background-color', hovered);
    await page.mouse.move(0, 0);
  }
});

test('a stacking table lists its rows as blocks in a narrow container and keeps table semantics', async ({
  page,
}) => {
  for (const theme of themes) {
    const frame = page.getByTestId(`stack-frame-${theme}`);
    const table = page.getByRole('table', { name: `Stacked ${theme}` });
    // Explicit roles keep the table, its rows and cells available whatever their display.
    await expect(table).toHaveAttribute('role', 'table');
    await expect(table.getByRole('rowgroup')).toHaveCount(2);
    await expect(table.getByRole('row')).toHaveCount(5);
    await expect(table.getByRole('columnheader')).toHaveCount(4);
    const row = table.getByRole('row', { name: /Quarterly report/ });
    await expect(row.getByRole('cell')).toHaveCount(4);
    await expect(row.getByRole('cell', { name: 'Aurora', exact: true })).toBeVisible();

    await expect(row).toHaveCSS('display', 'grid');
    const title = row.getByRole('cell').first();
    await expect(title).toHaveCSS('font-weight', '500');
    const owner = row.getByRole('cell', { name: 'Aurora', exact: true });
    const ownerLabel = owner.locator('.env-table-cell-label');
    await expect(ownerLabel).toHaveText('Owner');
    await expect(ownerLabel).toBeVisible();
    await expect(ownerLabel).toHaveAttribute('aria-hidden', 'true');
    expect(await paintedContrast(ownerLabel)).toBeGreaterThan(4.5);
    expect(await paintedContrast(owner.locator('.env-table-cell-content'))).toBeGreaterThan(4.5);
    // The label and its value share a line; the rows stack below each other.
    const labelBox = (await ownerLabel.boundingBox())!;
    const valueBox = (await owner.locator('.env-table-cell-content').boundingBox())!;
    expect(valueBox.x).toBeGreaterThan(labelBox.x + labelBox.width);
    expect(Math.abs(valueBox.y - labelBox.y)).toBeLessThan(4);
    const rows = table.locator('tbody > tr');
    const first = (await rows.nth(0).boundingBox())!;
    const second = (await rows.nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(first.width).toBeCloseTo((await frame.boundingBox())!.width - 2, 0);
    // The selected row keeps its colors as a block.
    await expect(table.getByRole('row', { name: /design-system\/tokens/ })).toHaveCSS(
      'box-shadow',
      `${await tokenColor(table, '--color-on-navigation-selected')} 3px 0px 0px 0px inset`,
    );

    // The header row is visually hidden until a sort button in it has keyboard focus.
    const head = table.locator('thead');
    await expect(head).toHaveCSS('position', 'absolute');
    expect((await head.boundingBox())!.height).toBeLessThanOrEqual(1);
    await table.getByRole('button', { name: /^Report sort/ }).focus();
    await expect(head).toHaveCSS('position', 'static');
    expect((await head.boundingBox())!.height).toBeGreaterThan(20);
    await table.getByRole('button', { name: /^Report sort/ }).blur();

    // A wide container shows the table again, without the labels.
    await frame.evaluate((element) => (element.style.inlineSize = '48rem'));
    await expect(row).toHaveCSS('display', 'table-row');
    await expect(ownerLabel).toBeHidden();
    await expect(head).toHaveCSS('position', 'static');
    await expect(owner).toHaveText('Aurora', { useInnerText: true });
    await frame.evaluate((element) => (element.style.inlineSize = ''));
    await expect(row).toHaveCSS('display', 'grid');
  }
});

test('stacked labels take the room they need and long values wrap inside the row', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of themes) {
      const table = page.getByRole('table', { name: `Pages ${theme}` });
      await expect(page.getByRole('region', { name: `Pages ${theme}` })).toHaveAttribute(
        'data-stacked',
        '',
      );
      const row = table.locator('tbody > tr').first();
      const rowBox = (await row.boundingBox())!;
      const padding = await row.evaluate((element) =>
        parseFloat(getComputedStyle(element).paddingRight),
      );
      const cells = row.locator('.env-table-cell[data-labelled]');
      await expect(cells).toHaveCount(3);
      const labels = await cells
        .locator('.env-table-cell-label')
        .evaluateAll((elements) =>
          elements.map((element) => element.getBoundingClientRect().toJSON()),
        );
      const values = await cells.locator('.env-table-cell-content').evaluateAll((elements) =>
        elements.map((element) => ({
          box: element.getBoundingClientRect().toJSON(),
          overflows: element.scrollWidth > element.clientWidth,
        })),
      );
      // The label column fits the longest label, well under half the row.
      expect(labels[0]!.width).toBeLessThan(rowBox.width / 3);
      for (const value of values) {
        // Values line up after the labels and wrap within the row instead of overflowing it.
        expect(value.box.x).toBeCloseTo(values[0]!.box.x, 0);
        expect(value.box.x + value.box.width).toBeLessThanOrEqual(
          rowBox.x + rowBox.width - padding + 0.5,
        );
        expect(value.overflows).toBe(false);
      }
      expect(values[1]!.box.height).toBeGreaterThan(30);
    }
  }
});

test('a table stacks below the width it is given, measured on its region', async ({ page }) => {
  for (const theme of themes) {
    const frame = page.getByTestId(`wide-stack-frame-${theme}`);
    const table = page.getByRole('table', { name: `Seven columns ${theme}` });
    const region = page.getByRole('region', { name: `Seven columns ${theme}` });
    const row = table.getByRole('row', { name: /Quarterly report/ });
    // 48 rem is below the 60 rem this table needs, so its rows stack.
    await expect(region).toHaveAttribute('data-stacked', '');
    await expect(row).toHaveCSS('display', 'grid');
    await expect(
      row.getByRole('cell', { name: 'Platform' }).locator('.env-table-cell-label'),
    ).toBeVisible();
    await frame.evaluate((element) => (element.style.inlineSize = '62rem'));
    await expect(region).not.toHaveAttribute('data-stacked');
    await expect(row).toHaveCSS('display', 'table-row');
    await frame.evaluate((element) => (element.style.inlineSize = '59rem'));
    await expect(region).toHaveAttribute('data-stacked', '');
    await frame.evaluate((element) => (element.style.inlineSize = ''));
  }
  // The default stays at 36 rem.
  await expect(page.getByRole('region', { name: 'Stacked light' })).toHaveAttribute(
    'data-stacked',
    '',
  );
  await expect(page.getByRole('region', { name: 'Reports light' })).not.toHaveAttribute(
    'data-stacked',
  );
});

test('a table measures stackBelow in any CSS length and reports when it stacks', async ({
  page,
}) => {
  for (const theme of themes) {
    const frame = page.getByTestId(`measured-stack-frame-${theme}`);
    const region = page.getByRole('region', { name: `Measured threshold ${theme}` });
    const changes = page.getByTestId(`stack-changes-${theme}`);
    // calc(20rem + 160px) is 480 px, wider than the region, so its rows stack and it says so.
    await expect(region).toHaveAttribute('data-stacked', '');
    await expect(changes).toHaveText('stacked');
    await frame.evaluate((element) => (element.style.inlineSize = '31rem'));
    await expect(region).not.toHaveAttribute('data-stacked');
    await expect(changes).toHaveText('stacked columns');
    await frame.evaluate((element) => (element.style.inlineSize = '29.5rem'));
    await expect(region).toHaveAttribute('data-stacked', '');
    await expect(changes).toHaveText('stacked columns stacked');
  }
  // The probe that measures the length never widens the region or the page.
  const region = page.getByRole('region', { name: 'Measured threshold light' });
  expect(await region.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

/** Waits for two frames, so resize observations and the renders they cause have run. */
function nextFrames(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

test('a hidden table keeps stacking, and one that leaves reports that its rows no longer stack', async ({
  page,
}) => {
  const frame = page.getByTestId('measured-stack-frame-light');
  const region = page.getByRole('region', { name: 'Measured threshold light' });
  const changes = page.getByTestId('stack-changes-light');
  await expect(changes).toHaveText('stacked');
  // Hidden, as in a hidden tab panel, the table has nothing to measure and keeps stacking, so it
  // shows again with its rows stacked.
  await frame.evaluate((element) => (element.hidden = true));
  await nextFrames(page);
  expect(
    await frame.evaluate((element) => {
      element.hidden = false;
      return element.querySelector('.env-table-region')!.hasAttribute('data-stacked');
    }),
  ).toBe(true);
  await nextFrames(page);
  await expect(changes).toHaveText('stacked');
  // Leaving while stacked, such as for an empty state, reports that the rows no longer stack, so
  // a wider table that returns with its columns needs no report.
  await page.getByRole('button', { name: 'Toggle measured table light' }).click();
  await expect(region).toHaveCount(0);
  await expect(changes).toHaveText('stacked columns');
  await frame.evaluate((element) => (element.style.inlineSize = '31rem'));
  await page.getByRole('button', { name: 'Toggle measured table light' }).click();
  await expect(region).not.toHaveAttribute('data-stacked');
  await nextFrames(page);
  await expect(changes).toHaveText('stacked columns');
});

test('a handler added later learns that rows stack, and stacking again starts over', async ({
  page,
}) => {
  const frame = page.getByTestId('measured-stack-frame-light');
  const changes = page.getByTestId('stack-changes-light');
  const listener = page.getByRole('button', { name: 'Toggle stacking listener light' });
  const layout = page.getByRole('button', { name: 'Toggle measured layout light' });
  await expect(changes).toHaveText('stacked');
  await listener.click();
  await listener.click();
  await expect(changes).toHaveText('stacked stacked');
  // Scrolling ends the stacking; a wide table that may stack again keeps its columns.
  await layout.click();
  await expect(changes).toHaveText('stacked stacked columns');
  await frame.evaluate((element) => (element.style.inlineSize = '31rem'));
  await layout.click();
  await nextFrames(page);
  await expect(page.getByRole('region', { name: 'Measured threshold light' })).not.toHaveAttribute(
    'data-stacked',
  );
  await expect(changes).toHaveText('stacked stacked columns');
});

test('a bare number for stackBelow is a length in pixels', async ({ page }) => {
  const frame = page.getByTestId('bare-stack-frame-light');
  const region = page.getByRole('region', { name: 'Bare threshold light' });
  // The frame is 400 px wide, below 600.
  await expect(region).toHaveAttribute('data-stacked', '');
  await frame.evaluate((element) => (element.style.inlineSize = '40rem'));
  await expect(region).not.toHaveAttribute('data-stacked');
});

test('a header named by aria-label lends its name to its sort button and resize handle', async ({
  page,
}) => {
  const table = page.getByRole('table', { name: 'Icon headers light' });
  await expect(table.getByRole('columnheader', { name: 'Priority', exact: true })).toBeVisible();
  const sort = table.getByRole('button', { name: 'Priority sort ascending', exact: true });
  await expect(sort).toBeVisible();
  await sort.click();
  await expect(
    table.getByRole('button', { name: 'Priority sort descending', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('separator', { name: 'Resize Priority', exact: true }),
  ).toBeVisible();
});

test('content positioned in a cell stays inside the scroll region', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const region = page.getByRole('region', { name: 'Hidden header text light' });
  await expect(region).toHaveCSS('position', 'relative');
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  // Visually hidden text at the end of a wide header row widens the region, not the page.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(
    page.getByRole('table', { name: 'Hidden header text light' }).getByRole('columnheader', {
      name: 'Actions',
    }),
  ).toBeAttached();
});

test('a compact table gives the controls in its cells the compact height', async ({ page }) => {
  for (const theme of themes) {
    const table = page.getByRole('table', { name: `Owned widths ${theme}` });
    await expect(table).toHaveAttribute('data-density', 'compact');
    const button = table.getByRole('button', { name: 'Open' });
    const icon = table.getByRole('button', { name: `More for the report ${theme}` });
    expect((await button.boundingBox())!.height).toBeCloseTo(32, 0);
    const iconBox = (await icon.boundingBox())!;
    expect(iconBox.width).toBeCloseTo(32, 0);
    expect(iconBox.height).toBeCloseTo(32, 0);
  }
  // Standard tables keep the standard control height.
  const standard = page.getByRole('table', { name: 'Hidden header text light' });
  await expect(standard.getByRole('button', { name: 'Edit' })).toHaveCSS('min-height', '40px');
});

test('tables fit a narrow viewport: stacking tables stack, others scroll in their region', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const stacked = page.getByRole('table', { name: 'Stacked light' });
  await expect(stacked.getByRole('row', { name: /Roadmap/ })).toHaveCSS('display', 'grid');
  const region = page.getByRole('region', { name: 'Reports light' });
  const regionBox = (await region.boundingBox())!;
  expect(regionBox.x + regionBox.width).toBeLessThanOrEqual(390);
  // Columns still resize at this size.
  const handle = page
    .getByRole('table', { name: 'Reports light' })
    .getByRole('separator', { name: 'Resize Report' });
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '41');
});
