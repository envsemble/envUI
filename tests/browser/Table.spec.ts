import { test, expect, type Locator } from '@playwright/test';
import { fixtureUrl } from './helpers/Servers';
import { openServerMarkup } from './helpers/ServerMarkup';

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
  await expect(report).toHaveCSS('color', await tokenColor(report, '--env-color-fg-default'));

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
  const arrow = (await reviews.locator('.env-icon').boundingBox())!;
  const number = table.getByRole('cell', { name: '3', exact: true });
  const numberBox = (await number.boundingBox())!;
  const padding = await number.evaluate((cell) => parseFloat(getComputedStyle(cell).paddingRight));
  expect(arrow.x).toBeLessThan(label.x);
  expect(label.x + label.width).toBeCloseTo(numberBox.x + numberBox.width - padding, 0);
  // The focus ring is a rounded ring a hair inside the button, so the table's corners never cut it.
  const sortButton = reviews.getByRole('button');
  const focus = await tokenColor(reviews, '--env-color-border-focus');
  const ring = () =>
    sortButton.evaluate((button) => {
      const style = getComputedStyle(button, '::after');
      return [style.borderTopColor, style.borderTopWidth, style.top, style.borderTopLeftRadius];
    });
  await expect.poll(ring).toEqual([focus, '2px', '2px', expect.not.stringMatching(/^0px$/)]);
  await expect(sortButton).not.toHaveCSS('border-radius', '0px');
});

test(
  'columns resize from the keyboard and the pointer without changing the table width',
  { tag: '@engines' },
  async ({ page }) => {
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
      .poll(() =>
        handle.evaluate((element) => getComputedStyle(element, '::after').backgroundColor),
      )
      .toBe(await tokenColor(handle, '--env-color-border-focus'));
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
  },
);

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

test('a selected row underlines no link: links show their underline on their own hover and focus', async ({
  page,
}) => {
  for (const theme of themes) {
    const rows = page.getByRole('table', { name: `Selected links ${theme}` }).getByRole('row');
    // all() reads the rows there are now, without waiting: the table may not have rendered yet.
    await expect(rows).toHaveCount(2);
    const [selected, other] = await rows.all();
    const decoration = (row: Locator, name: string) =>
      row
        .getByRole('link', { name, exact: true })
        .evaluate((link) => getComputedStyle(link).textDecorationLine);
    // A Link and a text button that is a link take the cell's text color in every row, and the
    // row's state never underlines them.
    expect(await decoration(selected!, 'Plain link')).toBe('none');
    expect(await decoration(selected!, 'Text button link')).toBe('none');
    // A link styled as a button keeps its look, and rows that aren't selected are unchanged.
    expect(await decoration(selected!, 'Button link')).toBe('none');
    expect(await decoration(other!, 'Plain link')).toBe('none');
    expect(await decoration(other!, 'Text button link')).toBe('none');
  }
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
    // Three quarters of the selection fill over the table's surface, so wide rows don't outweigh
    // their content.
    const selection = await selected.evaluate((row) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor =
        'color-mix(in oklab, var(--env-color-bg-selected) 75%, var(--env-color-bg-raised))';
      row.closest('.env-theme')!.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(selected).toHaveCSS('background-color', selection);
    await expect(other).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // Its checkbox says it is selected, so no bar marks the start of the row.
    await expect(selected.getByRole('cell').first()).toHaveCSS('box-shadow', 'none');
    expect(
      await paintedContrast(selected.getByRole('cell', { name: 'Mira Okafor' })),
    ).toBeGreaterThan(4.5);
    await other.getByRole('checkbox', { name: 'Quarterly report' }).check();
    await expect(other).toHaveAttribute('aria-selected', 'true');
    await other.hover();
    const hovered = await selected.evaluate((row) => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = 'var(--env-color-bg-selected-hover)';
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

    await expect(row).toHaveCSS('display', 'flex');
    const title = row.getByRole('cell').first();
    // The medium weight is the theme's: dark sets its own.
    const medium = await title.evaluate((cell) => {
      const probe = document.createElement('span');
      probe.style.fontWeight = 'var(--env-font-weight-medium)';
      cell.append(probe);
      const weight = getComputedStyle(probe).fontWeight;
      probe.remove();
      return weight;
    });
    await expect(title).toHaveCSS('font-weight', medium);
    // The first labelled value sits on the title's line, without its label.
    const owner = row.getByRole('cell', { name: 'Aurora', exact: true });
    const ownerLabel = owner.locator('.env-table-cell-label');
    await expect(ownerLabel).toHaveText('Owner');
    await expect(ownerLabel).toBeHidden();
    expect(Math.abs((await owner.boundingBox())!.y - (await title.boundingBox())!.y)).toBeLessThan(
      4,
    );
    // The others follow, each under its label.
    const reviews = row.getByRole('cell').nth(2);
    const reviewsLabel = reviews.locator('.env-table-cell-label');
    await expect(reviewsLabel).toHaveText('Reviews');
    await expect(reviewsLabel).toBeVisible();
    await expect(reviewsLabel).toHaveAttribute('aria-hidden', 'true');
    expect(await paintedContrast(reviewsLabel)).toBeGreaterThan(4.5);
    expect(await paintedContrast(reviews.locator('.env-table-cell-content'))).toBeGreaterThan(4.5);
    const labelBox = (await reviewsLabel.boundingBox())!;
    const valueBox = (await reviews.locator('.env-table-cell-content').boundingBox())!;
    expect(valueBox.y).toBeGreaterThanOrEqual(labelBox.y + labelBox.height - 0.5);
    // The rows stack below each other.
    const rows = table.locator('tbody > tr');
    const first = (await rows.nth(0).boundingBox())!;
    const second = (await rows.nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(first.width).toBeCloseTo((await frame.boundingBox())!.width - 2, 0);
    // The selected row keeps its colors as a block.
    await expect(table.getByRole('row', { name: /design-system\/tokens/ })).toHaveCSS(
      'box-shadow',
      `${await tokenColor(table, '--env-color-fg-on-selected')} 3px 0px 0px 0px inset`,
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
    await expect(row).toHaveCSS('display', 'flex');
  }
});

test('stacked values sit two to a line under their labels and long values wrap inside the row', async ({
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
      const fields = await cells.evaluateAll((elements) =>
        elements.map((element) => {
          const label = element.querySelector('.env-table-cell-label')!;
          const value = element.querySelector('.env-table-cell-content')!;
          return {
            label: label.getBoundingClientRect().toJSON(),
            labelShown: getComputedStyle(label).display !== 'none',
            value: value.getBoundingClientRect().toJSON(),
            overflows: value.scrollWidth > value.clientWidth,
          };
        }),
      );
      const [status, address, owner] = fields;
      // The first value goes with the title, without its label; the others share the next line,
      // each under its label in half the row.
      expect(status!.labelShown).toBe(false);
      expect(address!.label.y).toBeCloseTo(owner!.label.y, 0);
      for (const field of [address!, owner!]) {
        expect(field.labelShown).toBe(true);
        expect(field.value.y).toBeGreaterThanOrEqual(field.label.y + field.label.height - 0.5);
        expect(field.value.width).toBeLessThan(rowBox.width / 2);
      }
      // Values wrap within the row instead of overflowing it.
      for (const field of fields) {
        expect(field.value.x + field.value.width).toBeLessThanOrEqual(
          rowBox.x + rowBox.width - padding + 0.5,
        );
        expect(field.overflows).toBe(false);
      }
      expect(address!.value.height).toBeGreaterThan(30);
    }
  }
});

test(
  'a table stacks below the width it is given, measured on its region',
  { tag: '@engines' },
  async ({ page }) => {
    for (const theme of themes) {
      const frame = page.getByTestId(`wide-stack-frame-${theme}`);
      const table = page.getByRole('table', { name: `Seven columns ${theme}` });
      const region = page.getByRole('region', { name: `Seven columns ${theme}` });
      const row = table.getByRole('row', { name: /Quarterly report/ });
      // 48 rem is below the 60 rem this table needs, so its rows stack.
      await expect(region).toHaveAttribute('data-stacked', '');
      await expect(row).toHaveCSS('display', 'flex');
      await expect(
        row.getByRole('cell', { name: 'Infrastructure' }).locator('.env-table-cell-label'),
      ).toBeVisible();
      // A container query decides it: the rows return in the same frame as the width, before any
      // script reads the layout, and data-stacked follows as the table reports it.
      expect(
        await row.evaluate((element) => {
          element.closest<HTMLElement>('[data-testid^="wide-stack-frame"]')!.style.inlineSize =
            '62rem';
          return getComputedStyle(element).display;
        }),
      ).toBe('table-row');
      await expect(region).not.toHaveAttribute('data-stacked');
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
  },
);

test(
  'a table measures stackBelow in any CSS length and reports when it stacks',
  { tag: '@engines' },
  async ({ page }) => {
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
    // The length, the region's font size times 37.5, never widens the region or the page.
    const region = page.getByRole('region', { name: 'Measured threshold light' });
    expect(await region.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  },
);

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

test('a bare number for stackBelow is a length in rem', async ({ page }) => {
  const frame = page.getByTestId('bare-stack-frame-light');
  const region = page.getByRole('region', { name: 'Bare threshold light' });
  // The frame is 400 px wide, 25 rem, below 37.5 rem.
  await expect(region).toHaveAttribute('data-stacked', '');
  // So is a number.
  const number = page.getByRole('region', { name: 'Number threshold light' });
  await expect(number).toHaveAttribute('data-stacked', '');
  await frame.evaluate((element) => (element.style.inlineSize = '40rem'));
  await expect(region).not.toHaveAttribute('data-stacked');
  await expect(number).not.toHaveAttribute('data-stacked');
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
  // So does a header named by aria-labelledby.
  await expect(table.getByRole('columnheader', { name: 'Due date', exact: true })).toBeVisible();
  await expect(
    table.getByRole('button', { name: 'Due date sort ascending', exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole('separator', { name: 'Resize Due date', exact: true }),
  ).toBeVisible();
});

test('a table named by aria-labelledby names its scroll region too, and its strings come from messages', async ({
  page,
}) => {
  const region = page.getByRole('region', { name: 'Quarterly figures light' });
  await expect(region).toHaveAttribute('tabindex', '0');
  await expect(region.getByRole('table', { name: 'Quarterly figures light' })).toBeVisible();
  await expect(region.getByRole('button')).toHaveAccessibleName('Quarter aufsteigend sortieren');
});

test(
  'content positioned in a cell stays inside the scroll region',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const region = page.getByRole('region', { name: 'Hidden header text light' });
    await expect(region).toHaveCSS('position', 'relative');
    expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
      true,
    );
    // Visually hidden text at the end of a wide header row widens the region, not the page.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(
      page.getByRole('table', { name: 'Hidden header text light' }).getByRole('columnheader', {
        name: 'Actions',
      }),
    ).toBeAttached();
  },
);

test('tables give the controls in their cells the small height at every density', async ({
  page,
}) => {
  for (const theme of themes) {
    const table = page.getByRole('table', { name: `Owned widths ${theme}` });
    await expect(table).toHaveAttribute('data-density', 'sm');
    const button = table.getByRole('button', { name: 'Open' });
    const icon = table.getByRole('button', { name: `More for the report ${theme}` });
    expect((await button.boundingBox())!.height).toBeCloseTo(32, 0);
    const iconBox = (await icon.boundingBox())!;
    expect(iconBox.width).toBeCloseTo(32, 0);
    expect(iconBox.height).toBeCloseTo(32, 0);
  }
  // Tables at the default density do too.
  const standard = page.getByRole('table', { name: 'Hidden header text light' });
  await expect(standard).toHaveAttribute('data-density', 'md');
  await expect(standard.getByRole('button', { name: 'Edit' })).toHaveCSS('min-height', '32px');
});

test('tables fit a narrow viewport: stacking tables stack, others scroll in their region', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const stacked = page.getByRole('table', { name: 'Stacked light' });
  await expect(stacked.getByRole('row', { name: /Roadmap/ })).toHaveCSS('display', 'flex');
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

/** A stacking table of two rows in a box of the given width, with the given stackBelow. */
const stackingTable = (name: string, width: string, stackBelow: string, cell = "'Ana'") =>
  `h('div', {style: {inlineSize: '${width}'}}, h(Table.Root, {'aria-label': '${name}',
    narrowLayout: 'stack', stackBelow: '${stackBelow}'},
    h(Table.Head, null, h(Table.Row, null, h(Table.HeaderCell, null, 'Name'),
      h(Table.HeaderCell, null, 'Team'))),
    h(Table.Body, null, h(Table.Row, null, h(Table.Cell, null, ${cell}),
      h(Table.Cell, {label: 'Team'}, 'Design')))))`;

test(
  'a stacking table stacks in the server markup, follows the root size and keeps nested tables apart',
  { tag: '@engines' },
  async ({ page }) => {
    const hydrate = await openServerMarkup(
      page,
      `import {createElement as h} from 'react';
      import {Table} from '@envsemble/envui';
      export const element = h('div', null,
        ${stackingTable('Narrow', '20rem', '36rem')},
        ${stackingTable('Thirty', '25rem', '30rem')},
        ${stackingTable('Outer', '20rem', '36rem', stackingTable('Inner', '15rem', '5rem'))});`,
      { hydrate: true },
    );
    const firstRow = (name: string) =>
      page.getByRole('table', { name, exact: true }).locator('tbody > tr').first();
    // Before any script runs, the container query has already stacked the narrow table.
    await expect(firstRow('Narrow')).toHaveCSS('display', 'flex');
    await expect(page.getByRole('region', { name: 'Narrow' })).not.toHaveAttribute('data-stacked');
    // 25 rem is under 30 rem at the 16 px root; at a 12 px root, 30 rem is 360 px and 25 rem is
    // 300 px, still under it, and both follow the root together.
    await expect(firstRow('Thirty')).toHaveCSS('display', 'flex');
    await page.evaluate(() => (document.documentElement.style.fontSize = '12px'));
    await expect(firstRow('Thirty')).toHaveCSS('display', 'flex');
    await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>('[aria-label="Thirty"]')!.parentElement!;
      box.style.inlineSize = '400px';
    });
    // 400 px is under 30 rem at 16 px (480 px), but over it at 12 px (360 px): the threshold is
    // the region's own em, which follows the root, not a measured length.
    await expect(firstRow('Thirty')).toHaveCSS('display', 'table-row');
    await page.evaluate(() => (document.documentElement.style.fontSize = ''));
    expect(await hydrate()).toEqual([]);
    await expect(page.getByRole('region', { name: 'Narrow' })).toHaveAttribute('data-stacked', '');
    await expect(page.getByRole('region', { name: 'Thirty' })).toHaveAttribute('data-stacked', '');
    // The outer table stacks; the inner one, wider than its 5 rem, keeps its columns and reports
    // so, rather than the stacked reading of the table around it.
    await expect(page.getByRole('region', { name: 'Outer' })).toHaveAttribute('data-stacked', '');
    await expect(page.getByRole('region', { name: 'Inner' })).not.toHaveAttribute('data-stacked');
    await expect(firstRow('Inner')).toHaveCSS('display', 'table-row');
  },
);

test(
  'tables scroll sideways in a focusable region and keep a sticky header',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}/?fixture=data-display`);
    for (const theme of ['light', 'dark']) {
      const table = page.getByRole('table', { name: `Plans ${theme}` });
      await expect(table).toBeVisible();
      const region = page.getByRole('region', { name: `Plans ${theme}` });
      await expect(region).toHaveAttribute('tabindex', '0');
      expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
        true,
      );
      await expect(table.getByRole('columnheader', { name: 'Decisions' })).toHaveCSS(
        'text-align',
        'end',
      );
      await expect(table.getByRole('cell', { name: '7', exact: true }).first()).toHaveCSS(
        'font-variant-numeric',
        'tabular-nums',
      );

      const header = table.getByRole('columnheader', { name: 'Plan' });
      await region.evaluate((element) => (element.scrollTop = 400));
      // The caption scrolls away; the header row stays at the top of the region.
      const top = await region.evaluate(
        (element) => element.getBoundingClientRect().top + element.clientTop,
      );
      await expect.poll(async () => (await header.boundingBox())!.y).toBeCloseTo(top, 0);
      // The opaque header covers the rows scrolled beneath it.
      const background = await header.evaluate(
        (element) => getComputedStyle(element).backgroundImage,
      );
      expect(background).toContain('gradient');
    }
    const compact = page.getByRole('table', { name: 'Compact light' });
    await expect(compact.getByRole('rowheader', { name: 'Total' })).toBeVisible();
  },
);

test(
  'wheeling over a table with a sticky header scrolls the page when the table cannot scroll further',
  { tag: '@engines' },
  async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await page.goto(`${fixtureUrl}/?fixture=data-display`);
    const region = page.getByRole('region', { name: 'Plans light' });
    const pageTop = () => page.evaluate(() => document.scrollingElement!.scrollTop);
    const wheelOver = async (deltaY: number) => {
      const box = (await region.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, Math.min(Math.max(box.y, 0) + 40, 460));
      const before = await pageTop();
      await page.mouse.wheel(0, deltaY);
      await expect.poll(async () => Math.sign((await pageTop()) - before)).toBe(Math.sign(deltaY));
    };
    // At its start, the region hands an upward wheel on to the page.
    await region.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    await region.evaluate((element) => (element.scrollTop = 0));
    await wheelOver(-150);
    // Without a height, the region has nothing to scroll: the wheel moves the page at once.
    await region.evaluate((element) => (element.style.maxBlockSize = 'none'));
    expect(await region.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(
      false,
    );
    await region.scrollIntoViewIfNeeded();
    await wheelOver(300);
  },
);
