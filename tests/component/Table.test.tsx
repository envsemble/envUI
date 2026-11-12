import { createElement as h, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import { Table } from '@envsemble/envui';
import * as fixture from '../fixture/Table.fixture.tsx';
import * as dataDisplay from '../fixture/DataDisplay.fixture.tsx';
import { box, css, keyboard, mouse, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const themes = ['light', 'dark'] as const;

/** Uncaught errors fail any test already; none of these tests expects one. */
const table = (name: string) => page.getByRole('table', { name, exact: true });
const region = (name: string) => page.getByRole('region', { name, exact: true });
const header = (scope: Locator, name: string) =>
  scope.getByRole('columnheader', { name, exact: true });
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const attribute = (locator: Locator, name: string) => () => locator.element().getAttribute(name);
const middle = (target: Element | Locator) => {
  const { x, y, width, height } = box(target);
  return { x: x + width / 2, y: y + height / 2 };
};

/** Text contrast as painted: the text color over every fill between it and the theme canvas. */
function paintedContrast(node: Element) {
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
}

/** The color a value, such as a token, resolves to inside the element's theme, as a property. */
function resolved(node: Element, value: string, property = 'color') {
  const probe = document.createElement('span');
  probe.style.setProperty(property, value);
  node.closest('.env-theme')!.append(probe);
  const color = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return color;
}
const tokenColor = (node: Element, token: string) => resolved(node, `var(${token})`);

/** Drags a resize handle from its middle by `dx`, as a person's mouse does. */
async function drag(handle: Locator, dx: number) {
  const { x, y } = middle(handle);
  await mouse.move(x, y);
  await mouse.down();
  await mouse.move(x + dx, y, { steps: 4 });
  await mouse.up();
}

test('sortable headers are buttons that say what pressing does and report the order, and controls in cells take the small height', async () => {
  mount(fixture);
  const reports = table('Reports light');
  const report = header(reports, 'Report');
  expect(attribute(report, 'aria-sort')()).toBe('none');
  expect(header(reports, 'Owner').element().hasAttribute('aria-sort')).toBe(false);
  const sortReport = report.getByRole('button');
  await expect.element(sortReport).toHaveAccessibleName('Report sort ascending');
  // The header renders its children once; the button and the handle refer to them for their names.
  expect(report.element().textContent!.split('Report').length - 1).toBe(1);
  // The button fills its header cell, so the whole cell is the target.
  expect(box(sortReport).width).toBeCloseTo(box(report).width, 0);
  expect(box(sortReport).x).toBeCloseTo(box(report).x, 0);

  await sortReport.click();
  await expect.poll(attribute(report, 'aria-sort')).toBe('ascending');
  await expect.element(sortReport).toHaveAccessibleName('Report sort descending');
  await expect.poll(text('order-light')).toBe('audit tokens quarterly roadmap');
  // The sorted header shows its order in the primary text color.
  await expect
    .poll(() => css(report, 'color'))
    .toBe(tokenColor(report.element(), '--env-color-fg-default'));

  (sortReport.element() as HTMLElement).focus();
  await keyboard.press('Enter');
  await expect.poll(attribute(report, 'aria-sort')).toBe('descending');
  await expect.element(sortReport).toHaveAccessibleName('Report sort ascending');
  await expect.element(sortReport).toHaveFocus();
  await expect.poll(text('order-light')).toBe('roadmap quarterly tokens audit');

  const reviews = header(reports, 'Reviews');
  // Tab passes the resize handles of Report and Owner, once their code has loaded.
  await expect.poll(() => reports.getByRole('separator').elements().length).toBe(3);
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  await expect.element(reviews.getByRole('button')).toHaveFocus();
  await keyboard.press('Space');
  await expect.poll(attribute(reviews, 'aria-sort')).toBe('ascending');
  expect(attribute(report, 'aria-sort')()).toBe('none');
  await expect.poll(text('order-light')).toBe('roadmap tokens quarterly audit');
  // In a numeric column the arrow comes first, so the label lines up with the numbers below.
  const label = box(reviews.element().querySelector('.env-table-header-label')!);
  const arrow = box(reviews.element().querySelector('.env-icon')!);
  const number = reports.getByRole('cell', { name: '3', exact: true });
  const numberBox = box(number);
  expect(arrow.x).toBeLessThan(label.x);
  expect(label.x + label.width).toBeCloseTo(
    numberBox.x + numberBox.width - parseFloat(css(number, 'padding-right')),
    0,
  );
  // The focus ring is a rounded ring a hair inside the button, so the table's corners never cut it.
  const sortButton = reviews.getByRole('button');
  const focus = tokenColor(reviews.element(), '--env-color-border-focus');
  await expect
    .poll(() => [
      css(sortButton, 'border-top-color', '::after'),
      css(sortButton, 'border-top-width', '::after'),
      css(sortButton, 'top', '::after'),
      css(sortButton, 'border-top-left-radius', '::after'),
    ])
    .toEqual([focus, '2px', '2px', expect.not.stringMatching(/^0px$/)]);
  expect(css(sortButton, 'border-radius')).not.toBe('0px');

  // A header named by aria-label or aria-labelledby lends its name to its resize handle too.
  const icons = table('Icon headers light');
  await expect
    .poll(() => icons.getByRole('separator', { name: 'Resize Priority', exact: true }).query())
    .not.toBeNull();
  expect(icons.getByRole('separator', { name: 'Resize Due date', exact: true }).query()).not.toBe(
    null,
  );
  const priority = icons.getByRole('button', { name: 'Priority sort ascending', exact: true });
  await priority.click();
  await expect
    .poll(() =>
      icons.getByRole('button', { name: 'Priority sort descending', exact: true }).query(),
    )
    .not.toBeNull();

  // Tables give the controls in their cells the small height at every density.
  for (const theme of themes) {
    const owned = table(`Owned widths ${theme}`);
    expect(attribute(owned, 'data-density')()).toBe('sm');
    expect(box(owned.getByRole('button', { name: 'Open' })).height).toBeCloseTo(32, 0);
    const icon = box(owned.getByRole('button', { name: `More for the report ${theme}` }));
    expect(icon.width).toBeCloseTo(32, 0);
    expect(icon.height).toBeCloseTo(32, 0);
  }
  const standard = table('Hidden header text light');
  expect(attribute(standard, 'data-density')()).toBe('md');
  expect(css(standard.getByRole('button', { name: 'Edit' }), 'min-height')).toBe('32px');
});

test(
  'columns resize from the keyboard and the pointer without changing the table width, the other way in a right-to-left table',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const reports = table('Reports light');
    const widths = text('widths-light');
    const handle = reports.getByRole('separator', { name: 'Resize Report' });
    // The last column ends at the table's edge, so it has no handle.
    await expect.poll(() => reports.getByRole('separator').elements().length).toBe(3);
    expect(attribute(handle, 'aria-orientation')()).toBe('vertical');
    expect(attribute(handle, 'aria-valuenow')()).toBe('40');
    expect(attribute(handle, 'aria-valuemin')()).toBe('10');
    expect(attribute(handle, 'aria-valuemax')()).toBe('60');
    expect(attribute(handle, 'aria-valuetext')()).toBe('40%');
    // The header keeps its own name beside the sort button and the handle.
    expect(shown(header(reports, 'Report'))).toBe(true);

    const tableWidth = box(reports).width;
    const columnShare = (name: string) => () => box(header(reports, name)).width / tableWidth;
    expect(columnShare('Report')()).toBeCloseTo(0.4, 2);

    (handle.element() as HTMLElement).focus();
    expect(css(handle, 'outline-style')).toBe('none');
    // Keyboard focus shows the boundary line in the focus ring color.
    await expect
      .poll(() => css(handle, 'background-color', '::after'))
      .toBe(tokenColor(handle.element(), '--env-color-border-focus'));
    for (const [key, expected] of [
      ['ArrowRight', '41.0 29.0 15.0 15.0'],
      ['Shift+ArrowRight', '46.0 24.0 15.0 15.0'],
      ['PageDown', '41.0 29.0 15.0 15.0'],
      ['PageUp', '46.0 24.0 15.0 15.0'],
      ['End', '60.0 10.0 15.0 15.0'],
      ['ArrowRight', '60.0 10.0 15.0 15.0'],
      ['Home', '10.0 60.0 15.0 15.0'],
      ['ArrowLeft', '10.0 60.0 15.0 15.0'],
    ]) {
      await keyboard.press(key!);
      await expect.poll(widths, { message: key }).toBe(expected);
      if (key === 'Shift+ArrowRight') expect(attribute(handle, 'aria-valuenow')()).toBe('46');
    }
    await expect.poll(columnShare('Report')).toBeCloseTo(0.1, 2);
    await expect.poll(columnShare('Owner')).toBeCloseTo(0.6, 2);
    expect(box(reports).width).toBeCloseTo(tableWidth, 0);

    // Double-clicking restores the starting widths.
    const point = middle(handle);
    await mouse.dblclick(point.x, point.y);
    await expect.poll(widths).toBe('40.0 30.0 15.0 15.0');

    const start = middle(handle);
    await mouse.move(start.x, start.y);
    await mouse.down();
    await mouse.move(start.x + tableWidth * 0.1, start.y, { steps: 4 });
    await expect.poll(() => reports.element().hasAttribute('data-resizing')).toBe(true);
    expect(handle.element().hasAttribute('data-resizing')).toBe(true);
    await mouse.up();
    await expect.poll(() => reports.element().hasAttribute('data-resizing')).toBe(false);
    await expect.poll(attribute(handle, 'aria-valuenow')).toBe('50');
    expect(
      attribute(reports.getByRole('separator', { name: 'Resize Owner' }), 'aria-valuemax')(),
    ).toBe('25');
    await expect.poll(columnShare('Report')).toBeCloseTo(0.5, 2);
    expect(box(reports).width).toBeCloseTo(tableWidth, 0);

    // A table can own its widths; a cut-short cell ends with an ellipsis.
    const owned = table('Owned widths light');
    const ownerHandle = owned.getByRole('separator', { name: 'Resize the owner column' });
    expect(attribute(ownerHandle, 'aria-valuenow')()).toBe('35');
    (ownerHandle.element() as HTMLElement).focus();
    await keyboard.press('Shift+ArrowLeft');
    await expect.poll(attribute(ownerHandle, 'aria-valuenow')).toBe('30');
    const name = middle(owned.getByRole('separator', { name: 'Resize Name' }));
    await mouse.dblclick(name.x, name.y);
    await expect.poll(attribute(ownerHandle, 'aria-valuenow')).toBe('35');
    const cut = owned.getByRole('cell', { name: /A very long report name/ }).element();
    expect(css(cut, 'text-overflow')).toBe('ellipsis');
    expect(cut.scrollWidth > cut.clientWidth).toBe(true);

    // Columns resize the other way in a right-to-left table.
    mount(fixture);
    const rtl = table('Reports light');
    rtl.element().closest('.env-table-region')!.setAttribute('dir', 'rtl');
    const rtlHandle = rtl.getByRole('separator', { name: 'Resize Report' });
    await expect.poll(() => rtlHandle.query()).not.toBeNull();
    // The handle sits at the inline end of its header, the left edge in right-to-left text.
    expect(box(rtlHandle).x).toBeCloseTo(box(header(rtl, 'Report')).x, 0);
    (rtlHandle.element() as HTMLElement).focus();
    await keyboard.press('ArrowLeft');
    await expect.poll(attribute(rtlHandle, 'aria-valuenow')).toBe('41');
    // Dragging toward the inline end, to the left, widens the column too.
    const rtlWidth = box(rtl).width;
    await drag(rtlHandle, -rtlWidth * 0.09);
    await expect.poll(attribute(rtlHandle, 'aria-valuenow')).toBe('50');
    // The boundary moves between the two columns, so the next one gives up what this one gains.
    const [first, second] = widths()!.split(' ').map(Number);
    expect(first).toBeCloseTo(50, 0);
    expect(first! + second!).toBeCloseTo(70, 5);
    expect(box(header(rtl, 'Report')).width / rtlWidth).toBeCloseTo(0.5, 2);
  },
);

test('selected rows report aria-selected and take the selection colors in both themes, and underline no link', async () => {
  mount(fixture);
  await mouse.move(0, 0);
  for (const theme of themes) {
    const reports = table(`Reports ${theme}`);
    const selected = reports.getByRole('row', { name: /design-system\/tokens/ });
    const other = reports.getByRole('row', { name: /Quarterly report/ });
    expect(attribute(selected, 'aria-selected')()).toBe('true');
    expect(attribute(other, 'aria-selected')()).toBe('false');
    // Three quarters of the selection fill over the table's surface, so wide rows don't outweigh
    // their content.
    const selection = resolved(
      selected.element(),
      'color-mix(in oklab, var(--env-color-bg-selected) 75%, var(--env-color-bg-raised))',
      'background-color',
    );
    await expect.poll(() => css(selected, 'background-color')).toBe(selection);
    expect(css(other, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    // Its checkbox says it is selected, so no bar marks the start of the row.
    expect(css(selected.getByRole('cell').first(), 'box-shadow')).toBe('none');
    expect(
      paintedContrast(selected.getByRole('cell', { name: 'Mira Okafor' }).element()),
    ).toBeGreaterThan(4.5);
    await other.getByRole('checkbox', { name: 'Quarterly report' }).click();
    await expect.poll(attribute(other, 'aria-selected')).toBe('true');
    const over = middle(other);
    await mouse.move(over.x, over.y);
    const hovered = resolved(
      selected.element(),
      'var(--env-color-bg-selected-hover)',
      'background-color',
    );
    await expect.poll(() => css(other, 'background-color')).toBe(hovered);
    await mouse.move(0, 0);

    // A selected row underlines no link: a Link and a text button that is a link take the cell's
    // text color in every row, a link styled as a button keeps its look, and rows that aren't
    // selected are unchanged.
    const [selectedLinks, otherLinks] = table(`Selected links ${theme}`).getByRole('row').all();
    const decoration = (row: Locator, name: string) =>
      css(row.getByRole('link', { name, exact: true }), 'text-decoration-line');
    for (const name of ['Plain link', 'Text button link', 'Button link'])
      expect(decoration(selectedLinks!, name), name).toBe('none');
    for (const name of ['Plain link', 'Text button link'])
      expect(decoration(otherLinks!, name), name).toBe('none');
  }
});

test('a stacking table lists its rows as blocks in a narrow container, two values to a line, and keeps table semantics', async () => {
  mount(fixture);
  for (const theme of themes) {
    const frame = page.getByTestId(`stack-frame-${theme}`).element() as HTMLElement;
    const stacked = table(`Stacked ${theme}`);
    // Explicit roles keep the table, its rows and cells available whatever their display.
    expect(attribute(stacked, 'role')()).toBe('table');
    expect(stacked.getByRole('rowgroup').elements()).toHaveLength(2);
    expect(stacked.getByRole('row').elements()).toHaveLength(5);
    expect(stacked.getByRole('columnheader').elements()).toHaveLength(4);
    const row = stacked.getByRole('row', { name: /Quarterly report/ });
    expect(row.getByRole('cell').elements()).toHaveLength(4);
    const owner = row.getByRole('cell', { name: 'Aurora', exact: true });
    expect(shown(owner)).toBe(true);

    await expect.poll(() => css(row, 'display')).toBe('flex');
    const title = row.getByRole('cell').first();
    // The medium weight is the theme's: dark sets its own.
    const probe = document.createElement('span');
    probe.style.fontWeight = 'var(--env-font-weight-medium)';
    title.element().append(probe);
    const medium = getComputedStyle(probe).fontWeight;
    probe.remove();
    expect(css(title, 'font-weight')).toBe(medium);
    // The first labelled value sits on the title's line, without its label.
    const ownerLabel = owner.element().querySelector('.env-table-cell-label')!;
    expect(ownerLabel.textContent).toBe('Owner');
    expect(ownerLabel.checkVisibility()).toBe(false);
    expect(Math.abs(box(owner).y - box(title).y)).toBeLessThan(4);
    // The others follow, each under its label.
    const reviews = row.getByRole('cell').nth(2).element();
    const reviewsLabel = reviews.querySelector('.env-table-cell-label')!;
    const reviewsValue = reviews.querySelector('.env-table-cell-content')!;
    expect(reviewsLabel.textContent).toBe('Reviews');
    expect(reviewsLabel.checkVisibility()).toBe(true);
    expect(reviewsLabel.getAttribute('aria-hidden')).toBe('true');
    expect(paintedContrast(reviewsLabel)).toBeGreaterThan(4.5);
    expect(paintedContrast(reviewsValue)).toBeGreaterThan(4.5);
    expect(box(reviewsValue).y).toBeGreaterThanOrEqual(
      box(reviewsLabel).y + box(reviewsLabel).height - 0.5,
    );
    // The rows stack below each other.
    const rows = stacked.element().querySelectorAll('tbody > tr');
    const first = box(rows[0]!);
    const second = box(rows[1]!);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(first.width).toBeCloseTo(box(frame).width - 2, 0);
    // The selected row keeps its colors as a block.
    expect(css(stacked.getByRole('row', { name: /design-system\/tokens/ }), 'box-shadow')).toBe(
      `${tokenColor(stacked.element(), '--env-color-fg-on-selected')} 3px 0px 0px 0px inset`,
    );

    // The header row is visually hidden until a sort button in it has keyboard focus.
    const head = stacked.element().querySelector('thead')!;
    expect(css(head, 'position')).toBe('absolute');
    expect(box(head).height).toBeLessThanOrEqual(1);
    const sort = stacked.getByRole('button', { name: /^Report sort/ }).element() as HTMLElement;
    await keyboard.press('Shift');
    sort.focus();
    await expect.poll(() => css(head, 'position')).toBe('static');
    expect(box(head).height).toBeGreaterThan(20);
    sort.blur();

    // A wide container shows the table again, without the labels.
    frame.style.inlineSize = '48rem';
    await expect.poll(() => css(row, 'display')).toBe('table-row');
    expect(ownerLabel.checkVisibility()).toBe(false);
    expect(css(head, 'position')).toBe('static');
    expect((owner.element() as HTMLElement).innerText).toBe('Aurora');
    frame.style.inlineSize = '';
    await expect.poll(() => css(row, 'display')).toBe('flex');
  }

  // Stacked values sit two to a line under their labels, and long values wrap inside the row.
  for (const width of [1440, 390]) {
    await page.viewport(width, 900);
    for (const theme of themes) {
      const name = `${theme}, ${width} px`;
      await expect.poll(attribute(region(`Pages ${theme}`), 'data-stacked')).toBe('');
      const row = table(`Pages ${theme}`).element().querySelector('tbody > tr')!;
      const rowBox = box(row);
      const padding = parseFloat(css(row, 'padding-right'));
      const cells = [...row.querySelectorAll('.env-table-cell[data-labelled]')];
      expect(cells, name).toHaveLength(3);
      const fields = cells.map((element) => {
        const label = element.querySelector('.env-table-cell-label')!;
        const value = element.querySelector('.env-table-cell-content')!;
        return {
          label: box(label),
          labelShown: css(label, 'display') !== 'none',
          value: box(value),
          overflows: value.scrollWidth > value.clientWidth,
        };
      });
      const [status, address, owner] = fields;
      // The first value goes with the title, without its label; the others share the next line,
      // each under its label in half the row.
      expect(status!.labelShown, name).toBe(false);
      expect(address!.label.y, name).toBeCloseTo(owner!.label.y, 0);
      for (const field of [address!, owner!]) {
        expect(field.labelShown, name).toBe(true);
        expect(field.value.y, name).toBeGreaterThanOrEqual(
          field.label.y + field.label.height - 0.5,
        );
        expect(field.value.width, name).toBeLessThan(rowBox.width / 2);
      }
      // Values wrap within the row instead of overflowing it.
      for (const field of fields) {
        expect(field.value.x + field.value.width, name).toBeLessThanOrEqual(
          rowBox.x + rowBox.width - padding + 0.5,
        );
        expect(field.overflows, name).toBe(false);
      }
      expect(address!.value.height, name).toBeGreaterThan(30);
    }
  }
});

test(
  'a table stacks below the width it is given, measured on its region',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    for (const theme of themes) {
      const frame = page.getByTestId(`wide-stack-frame-${theme}`).element() as HTMLElement;
      const wide = region(`Seven columns ${theme}`);
      const row = table(`Seven columns ${theme}`).getByRole('row', { name: /Quarterly report/ });
      // 48 rem is below the 60 rem this table needs, so its rows stack.
      await expect.poll(attribute(wide, 'data-stacked')).toBe('');
      expect(css(row, 'display')).toBe('flex');
      expect(
        row
          .getByRole('cell', { name: 'Infrastructure' })
          .element()
          .querySelector('.env-table-cell-label')!
          .checkVisibility(),
      ).toBe(true);
      // A container query decides it: the rows return in the same frame as the width, before any
      // script reads the layout, and data-stacked follows as the table reports it.
      frame.style.inlineSize = '62rem';
      expect(css(row, 'display')).toBe('table-row');
      await expect.poll(attribute(wide, 'data-stacked')).toBeNull();
      frame.style.inlineSize = '59rem';
      await expect.poll(attribute(wide, 'data-stacked')).toBe('');
      frame.style.inlineSize = '';
    }
    // The default stays at 36 rem.
    expect(attribute(region('Stacked light'), 'data-stacked')()).toBe('');
    expect(attribute(region('Reports light'), 'data-stacked')()).toBeNull();
    // A bare number is a length in rem: the frame is 400 px wide, 25 rem, below 37.5 rem.
    const bare = page.getByTestId('bare-stack-frame-light').element() as HTMLElement;
    for (const name of ['Bare threshold light', 'Number threshold light'])
      await expect.poll(attribute(region(name), 'data-stacked'), { message: name }).toBe('');
    bare.style.inlineSize = '40rem';
    for (const name of ['Bare threshold light', 'Number threshold light'])
      await expect.poll(attribute(region(name), 'data-stacked'), { message: name }).toBeNull();
  },
);

test(
  'a table measures stackBelow in any CSS length and reports when it stacks',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    for (const theme of themes) {
      const frame = page.getByTestId(`measured-stack-frame-${theme}`).element() as HTMLElement;
      const measured = region(`Measured threshold ${theme}`);
      const changes = text(`stack-changes-${theme}`);
      // In view: WebKit, in the test's frame, reports no resize of what lies outside its view.
      frame.scrollIntoView();
      // calc(20rem + 160px) is 480 px, wider than the region, so its rows stack and it says so.
      await expect.poll(attribute(measured, 'data-stacked')).toBe('');
      await expect.poll(changes).toBe('stacked');
      frame.style.inlineSize = '31rem';
      await expect.poll(attribute(measured, 'data-stacked'), { message: theme }).toBeNull();
      await expect.poll(changes, { message: theme }).toBe('stacked columns');
      frame.style.inlineSize = '29.5rem';
      await expect.poll(attribute(measured, 'data-stacked'), { message: theme }).toBe('');
      await expect.poll(changes, { message: theme }).toBe('stacked columns stacked');
    }
    // The length, the region's font size times 37.5, never widens the region or the page.
    const measured = region('Measured threshold light').element();
    expect(measured.scrollWidth <= measured.clientWidth).toBe(true);
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
  },
);

test('a hidden table keeps stacking, one that leaves reports that its rows no longer stack, and a handler added later learns that they stack', async () => {
  mount(fixture);
  const frame = () => page.getByTestId('measured-stack-frame-light').element() as HTMLElement;
  const measured = region('Measured threshold light');
  const changes = text('stack-changes-light');
  await expect.poll(changes).toBe('stacked');
  // Hidden, as in a hidden tab panel, the table has nothing to measure and keeps stacking, so it
  // shows again with its rows stacked.
  frame().hidden = true;
  await nextFrames();
  frame().hidden = false;
  expect(frame().querySelector('.env-table-region')!.hasAttribute('data-stacked')).toBe(true);
  await nextFrames();
  expect(changes()).toBe('stacked');
  // Leaving while stacked, such as for an empty state, reports that the rows no longer stack, so
  // a wider table that returns with its columns needs no report.
  const toggle = page.getByRole('button', { name: 'Toggle measured table light' });
  await toggle.click();
  await expect.poll(() => measured.query()).toBeNull();
  await expect.poll(changes).toBe('stacked columns');
  frame().style.inlineSize = '31rem';
  await toggle.click();
  await expect.poll(() => measured.query()?.hasAttribute('data-stacked')).toBe(false);
  await nextFrames();
  expect(changes()).toBe('stacked columns');

  // A handler added later learns that rows stack, and stacking again starts over.
  mount(fixture);
  const listener = page.getByRole('button', { name: 'Toggle stacking listener light' });
  const layout = page.getByRole('button', { name: 'Toggle measured layout light' });
  await expect.poll(changes).toBe('stacked');
  await listener.click();
  await listener.click();
  await expect.poll(changes).toBe('stacked stacked');
  // Scrolling ends the stacking; a wide table that may stack again keeps its columns.
  await layout.click();
  await expect.poll(changes).toBe('stacked stacked columns');
  frame().style.inlineSize = '31rem';
  await layout.click();
  await nextFrames();
  await expect.poll(attribute(measured, 'data-stacked')).toBeNull();
  expect(changes()).toBe('stacked stacked columns');
});

test(
  'content positioned in a cell stays inside the scroll region',
  { tags: ['engines'] },
  async () => {
    await page.viewport(390, 900);
    mount(fixture);
    const scroller = region('Hidden header text light');
    expect(css(scroller, 'position')).toBe('relative');
    expect(scroller.element().scrollWidth > scroller.element().clientWidth).toBe(true);
    // Visually hidden text at the end of a wide header row widens the region, not the page.
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
    expect(header(table('Hidden header text light'), 'Actions').query()).not.toBeNull();
  },
);

/** A stacking table of two rows in a box of the given width, with the given stackBelow. */
const stackingTable = (
  name: string,
  width: string,
  stackBelow: string,
  cell: ReactElement | string = 'Ana',
) =>
  h(
    'div',
    { style: { inlineSize: width } },
    h(
      Table.Root,
      { 'aria-label': name, narrowLayout: 'stack', stackBelow },
      h(
        Table.Head,
        null,
        h(Table.Row, null, h(Table.HeaderCell, null, 'Name'), h(Table.HeaderCell, null, 'Team')),
      ),
      h(
        Table.Body,
        null,
        h(Table.Row, null, h(Table.Cell, null, cell), h(Table.Cell, { label: 'Team' }, 'Design')),
      ),
    ),
  );

const servedRoots: { unmount: () => void }[] = [];
const servedHolders: HTMLElement[] = [];
afterEach(() => {
  for (const root of servedRoots.splice(0)) root.unmount();
  for (const holder of servedHolders.splice(0)) holder.remove();
  document.documentElement.style.fontSize = '';
});

test(
  'a stacking table stacks in the server markup, follows the root size and keeps nested tables apart',
  { tags: ['engines'] },
  async () => {
    const element = h(
      'div',
      null,
      stackingTable('Narrow', '20rem', '36rem'),
      stackingTable('Thirty', '25rem', '30rem'),
      stackingTable('Outer', '20rem', '36rem', stackingTable('Inner', '15rem', '5rem')),
    );
    // The markup as the server renders it, in the page with the style sheet, before any script.
    const holder = document.createElement('div');
    holder.innerHTML = renderToString(element);
    document.body.append(holder);
    servedHolders.push(holder);
    const firstRow = (name: string) =>
      holder.querySelector(`table[aria-label="${name}"] > tbody > tr`)!;
    const served = (name: string) => holder.querySelector(`[role="region"][aria-label="${name}"]`)!;
    // Before any script runs, the container query has already stacked the narrow table.
    expect(css(firstRow('Narrow'), 'display')).toBe('flex');
    expect(served('Narrow').hasAttribute('data-stacked')).toBe(false);
    // 25 rem is under 30 rem at the 16 px root; at a 12 px root, 30 rem is 360 px and 25 rem is
    // 300 px, still under it, and both follow the root together.
    expect(css(firstRow('Thirty'), 'display')).toBe('flex');
    document.documentElement.style.fontSize = '12px';
    expect(css(firstRow('Thirty'), 'display')).toBe('flex');
    (served('Thirty').parentElement as HTMLElement).style.inlineSize = '400px';
    // 400 px is under 30 rem at 16 px (480 px), but over it at 12 px (360 px): the threshold is
    // the region's own em, which follows the root, not a measured length.
    expect(css(firstRow('Thirty'), 'display')).toBe('table-row');
    document.documentElement.style.fontSize = '';
    // Hydrated, the markup matches and the tables report what the container query laid out.
    const recoverable: string[] = [];
    servedRoots.push(
      hydrateRoot(holder, element, {
        onRecoverableError: (error) => recoverable.push(String(error)),
      }),
    );
    await expect.poll(() => served('Narrow').getAttribute('data-stacked')).toBe('');
    expect(recoverable).toEqual([]);
    await expect.poll(() => served('Thirty').getAttribute('data-stacked')).toBe('');
    // The outer table stacks; the inner one, wider than its 5 rem, keeps its columns and reports
    // so, rather than the stacked reading of the table around it.
    await expect.poll(() => served('Outer').getAttribute('data-stacked')).toBe('');
    expect(served('Inner').hasAttribute('data-stacked')).toBe(false);
    expect(css(firstRow('Inner'), 'display')).toBe('table-row');
  },
);

test(
  'tables scroll sideways in a focusable region and keep a sticky header, and wheeling over one that cannot scroll further scrolls the page',
  { tags: ['engines'] },
  async () => {
    mount(dataDisplay);
    for (const theme of themes) {
      const plans = table(`Plans ${theme}`);
      await expect.poll(() => shown(plans)).toBe(true);
      const scroller = region(`Plans ${theme}`).element();
      expect(scroller.getAttribute('tabindex')).toBe('0');
      expect(scroller.scrollWidth > scroller.clientWidth).toBe(true);
      expect(css(header(plans, 'Decisions'), 'text-align')).toBe('end');
      expect(
        css(plans.getByRole('cell', { name: '7', exact: true }).first(), 'font-variant-numeric'),
      ).toBe('tabular-nums');
      const plan = header(plans, 'Plan');
      scroller.scrollTop = 400;
      // The caption scrolls away; the header row stays at the top of the region.
      const top = scroller.getBoundingClientRect().top + scroller.clientTop;
      await expect.poll(() => box(plan).y).toBeCloseTo(top, 0);
      // The opaque header covers the rows scrolled beneath it.
      expect(css(plan, 'background-image')).toContain('gradient');
    }
    expect(table('Compact light').getByRole('rowheader', { name: 'Total' }).query()).not.toBeNull();

    // At its start, a region with a sticky header hands an upward wheel on to the page, and one
    // with nothing to scroll hands on any wheel at once.
    await page.viewport(900, 500);
    const scroller = region('Plans light').element() as HTMLElement;
    const pageTop = () => document.scrollingElement!.scrollTop;
    const wheelOver = async (deltaY: number) => {
      const { x, y, width } = box(scroller);
      await mouse.move(x + width / 2, Math.min(Math.max(y, 0) + 40, 460));
      const before = pageTop();
      await mouse.wheel(0, deltaY);
      await expect.poll(() => Math.sign(pageTop() - before)).toBe(Math.sign(deltaY));
    };
    scroller.scrollIntoView({ block: 'nearest' });
    window.scrollBy(0, 200);
    scroller.scrollTop = 0;
    await wheelOver(-150);
    scroller.style.maxBlockSize = 'none';
    expect(scroller.scrollHeight > scroller.clientHeight).toBe(false);
    scroller.scrollIntoView({ block: 'nearest' });
    await wheelOver(300);
  },
);
