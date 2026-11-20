import { createElement as h, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import { Table, Theme } from '@envsemble/envui';
import * as fixture from '../fixture/Table.fixture.tsx';
import * as dataDisplay from '../fixture/DataDisplay.fixture.tsx';
import { box, css, keyboard, mouse, nextFrames, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const themes = ['light', 'dark'] as const;

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

function resolved(node: Element, value: string, property = 'color') {
  const probe = document.createElement('span');
  probe.style.setProperty(property, value);
  node.closest('.env-theme')!.append(probe);
  const color = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return color;
}
const tokenColor = (node: Element, token: string) => resolved(node, `var(${token})`);

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
  expect(report.element().textContent!.split('Report').length - 1).toBe(1);
  expect(box(sortReport).width).toBeCloseTo(box(report).width, 0);
  expect(box(sortReport).x).toBeCloseTo(box(report).x, 0);

  await sortReport.click();
  await expect.poll(attribute(report, 'aria-sort')).toBe('ascending');
  await expect.element(sortReport).toHaveAccessibleName('Report sort descending');
  await expect.poll(text('order-light')).toBe('audit tokens quarterly roadmap');
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
  await expect.poll(() => reports.getByRole('separator').elements().length).toBe(3);
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  await keyboard.press('Tab');
  await expect.element(reviews.getByRole('button')).toHaveFocus();
  await keyboard.press('Space');
  await expect.poll(attribute(reviews, 'aria-sort')).toBe('ascending');
  expect(attribute(report, 'aria-sort')()).toBe('none');
  await expect.poll(text('order-light')).toBe('roadmap tokens quarterly audit');
  const label = box(reviews.element().querySelector('.env-table-header-label')!);
  const arrow = box(reviews.element().querySelector('.env-icon')!);
  const number = reports.getByRole('cell', { name: '3', exact: true });
  const numberBox = box(number);
  expect(arrow.x).toBeLessThan(label.x);
  expect(label.x + label.width).toBeCloseTo(
    numberBox.x + numberBox.width - parseFloat(css(number, 'padding-right')),
    0,
  );
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
    await expect.poll(() => reports.getByRole('separator').elements().length).toBe(3);
    expect(attribute(handle, 'aria-orientation')()).toBe('vertical');
    expect(attribute(handle, 'aria-valuenow')()).toBe('40');
    expect(attribute(handle, 'aria-valuemin')()).toBe('10');
    expect(attribute(handle, 'aria-valuemax')()).toBe('60');
    expect(attribute(handle, 'aria-valuetext')()).toBe('40%');
    expect(shown(header(reports, 'Report'))).toBe(true);

    const tableWidth = box(reports).width;
    const columnShare = (name: string) => () => box(header(reports, name)).width / tableWidth;
    expect(columnShare('Report')()).toBeCloseTo(0.4, 2);

    (handle.element() as HTMLElement).focus();
    expect(css(handle, 'outline-style')).toBe('none');
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

    mount(fixture);
    const rtl = table('Reports light');
    rtl.element().closest('.env-table-region')!.setAttribute('dir', 'rtl');
    const rtlHandle = rtl.getByRole('separator', { name: 'Resize Report' });
    await expect.poll(() => rtlHandle.query()).not.toBeNull();
    expect(box(rtlHandle).x).toBeCloseTo(box(header(rtl, 'Report')).x, 0);
    (rtlHandle.element() as HTMLElement).focus();
    await keyboard.press('ArrowLeft');
    await expect.poll(attribute(rtlHandle, 'aria-valuenow')).toBe('41');
    const rtlWidth = box(rtl).width;
    await drag(rtlHandle, -rtlWidth * 0.09);
    await expect.poll(attribute(rtlHandle, 'aria-valuenow')).toBe('50');
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
    const selection = resolved(
      selected.element(),
      `color-mix(in oklab, var(--env-color-bg-selected) ${theme === 'dark' ? 100 : 75}%, var(--env-color-bg-raised))`,
      'background-color',
    );
    await expect.poll(() => css(selected, 'background-color')).toBe(selection);
    expect(css(other, 'background-color')).toBe('rgba(0, 0, 0, 0)');
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
    const probe = document.createElement('span');
    probe.style.fontWeight = 'var(--env-font-weight-medium)';
    title.element().append(probe);
    const medium = getComputedStyle(probe).fontWeight;
    probe.remove();
    expect(css(title, 'font-weight')).toBe(medium);
    const ownerLabel = owner.element().querySelector('.env-table-cell-label')!;
    expect(ownerLabel.textContent).toBe('Owner');
    expect(ownerLabel.checkVisibility()).toBe(false);
    expect(Math.abs(box(owner).y - box(title).y)).toBeLessThan(4);
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
    const rows = stacked.element().querySelectorAll('tbody > tr');
    const first = box(rows[0]!);
    const second = box(rows[1]!);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1);
    expect(first.width).toBeCloseTo(rows[0]!.parentElement!.clientWidth, 0);
    expect(rows[0]!.parentElement!.clientWidth).toBeGreaterThan(box(frame).width - 4);
    expect(css(stacked.getByRole('row', { name: /design-system\/tokens/ }), 'box-shadow')).toBe(
      `${tokenColor(stacked.element(), '--env-color-fg-on-selected')} 3px 0px 0px 0px inset`,
    );

    const head = stacked.element().querySelector('thead')!;
    expect(css(head, 'position')).toBe('absolute');
    expect(box(head).height).toBeLessThanOrEqual(1);
    const sort = stacked.getByRole('button', { name: /^Report sort/ }).element() as HTMLElement;
    await keyboard.press('Shift');
    sort.focus();
    await expect.poll(() => css(head, 'position')).toBe('static');
    expect(box(head).height).toBeGreaterThan(20);
    sort.blur();

    frame.style.inlineSize = '48rem';
    await expect.poll(() => css(row, 'display')).toBe('table-row');
    expect(ownerLabel.checkVisibility()).toBe(false);
    expect(css(head, 'position')).toBe('static');
    expect((owner.element() as HTMLElement).innerText).toBe('Aurora');
    frame.style.inlineSize = '';
    await expect.poll(() => css(row, 'display')).toBe('flex');
  }

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
      expect(status!.labelShown, name).toBe(false);
      expect(address!.label.y, name).toBeCloseTo(owner!.label.y, 0);
      for (const field of [address!, owner!]) {
        expect(field.labelShown, name).toBe(true);
        expect(field.value.y, name).toBeGreaterThanOrEqual(
          field.label.y + field.label.height - 0.5,
        );
        expect(field.value.width, name).toBeLessThan(rowBox.width / 2);
      }
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
      await expect.poll(attribute(wide, 'data-stacked')).toBe('');
      expect(css(row, 'display')).toBe('flex');
      expect(
        row
          .getByRole('cell', { name: 'Infrastructure' })
          .element()
          .querySelector('.env-table-cell-label')!
          .checkVisibility(),
      ).toBe(true);
      frame.style.inlineSize = '62rem';
      expect(css(row, 'display')).toBe('table-row');
      await expect.poll(attribute(wide, 'data-stacked')).toBeNull();
      frame.style.inlineSize = '59rem';
      await expect.poll(attribute(wide, 'data-stacked')).toBe('');
      frame.style.inlineSize = '';
    }
    expect(attribute(region('Stacked light'), 'data-stacked')()).toBe('');
    expect(attribute(region('Reports light'), 'data-stacked')()).toBeNull();
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
      frame.scrollIntoView();
      await expect.poll(attribute(measured, 'data-stacked')).toBe('');
      await expect.poll(changes).toBe('stacked');
      frame.style.inlineSize = '31rem';
      await expect.poll(attribute(measured, 'data-stacked'), { message: theme }).toBeNull();
      await expect.poll(changes, { message: theme }).toBe('stacked columns');
      frame.style.inlineSize = '29.5rem';
      await expect.poll(attribute(measured, 'data-stacked'), { message: theme }).toBe('');
      await expect.poll(changes, { message: theme }).toBe('stacked columns stacked');
    }
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
  frame().hidden = true;
  await nextFrames();
  frame().hidden = false;
  expect(frame().querySelector('.env-table-region')!.hasAttribute('data-stacked')).toBe(true);
  await nextFrames();
  expect(changes()).toBe('stacked');
  const toggle = page.getByRole('button', { name: 'Toggle measured table light' });
  await toggle.click();
  await expect.poll(() => measured.query()).toBeNull();
  await expect.poll(changes).toBe('stacked columns');
  frame().style.inlineSize = '31rem';
  await toggle.click();
  await expect.poll(() => measured.query()?.hasAttribute('data-stacked')).toBe(false);
  await nextFrames();
  expect(changes()).toBe('stacked columns');

  mount(fixture);
  const listener = page.getByRole('button', { name: 'Toggle stacking listener light' });
  const layout = page.getByRole('button', { name: 'Toggle measured layout light' });
  await expect.poll(changes).toBe('stacked');
  await listener.click();
  await listener.click();
  await expect.poll(changes).toBe('stacked stacked');
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
    expect(document.documentElement.scrollWidth <= innerWidth).toBe(true);
    expect(header(table('Hidden header text light'), 'Actions').query()).not.toBeNull();
  },
);

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
    const holder = document.createElement('div');
    holder.innerHTML = renderToString(element);
    document.body.append(holder);
    servedHolders.push(holder);
    const firstRow = (name: string) =>
      holder.querySelector(`table[aria-label="${name}"] > tbody > tr`)!;
    const served = (name: string) => holder.querySelector(`[role="region"][aria-label="${name}"]`)!;
    expect(css(firstRow('Narrow'), 'display')).toBe('flex');
    expect(served('Narrow').hasAttribute('data-stacked')).toBe(false);
    expect(css(firstRow('Thirty'), 'display')).toBe('flex');
    document.documentElement.style.fontSize = '12px';
    expect(css(firstRow('Thirty'), 'display')).toBe('flex');
    (served('Thirty').parentElement as HTMLElement).style.inlineSize = '400px';
    expect(css(firstRow('Thirty'), 'display')).toBe('table-row');
    document.documentElement.style.fontSize = '';
    const recoverable: string[] = [];
    servedRoots.push(
      hydrateRoot(holder, element, {
        onRecoverableError: (error) => recoverable.push(String(error)),
      }),
    );
    await expect.poll(() => served('Narrow').getAttribute('data-stacked')).toBe('');
    expect(recoverable).toEqual([]);
    await expect.poll(() => served('Thirty').getAttribute('data-stacked')).toBe('');
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
      const top = scroller.getBoundingClientRect().top + scroller.clientTop;
      await expect.poll(() => box(plan).y).toBeCloseTo(top, 0);
      expect(css(plan, 'background-color')).not.toBe('rgba(0, 0, 0, 0)');
    }
    expect(table('Compact light').getByRole('rowheader', { name: 'Total' }).query()).not.toBeNull();

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

test('a table is framed on the raised surface with its header on a band, and plain drops the frame and the band', async () => {
  mount(fixture);
  for (const theme of themes) {
    const framed = region(`Reports ${theme}`).element();
    expect(attribute(region(`Reports ${theme}`), 'data-plain')()).toBeNull();
    expect(css(framed, 'border-top-width')).not.toBe('0px');
    expect(css(framed, 'border-top-left-radius')).not.toBe('0px');
    expect(css(framed, 'background-color')).toBe(tokenColor(framed, '--env-color-bg-raised'));
    const banded = header(table(`Reports ${theme}`), 'Owner').element();
    expect(css(banded, 'background-image')).toContain('gradient');
    expect(css(banded, 'border-bottom-width')).toBe('0px');

    for (const name of [`Plain ${theme}`]) {
      const plain = region(name).element();
      expect(plain.hasAttribute('data-plain'), name).toBe(true);
      expect(css(plain, 'border-top-width'), name).toBe('0px');
      expect(css(plain, 'background-color'), name).toBe('rgba(0, 0, 0, 0)');
      const plainHeader = header(table(name), 'Report').element();
      expect(css(plainHeader, 'background-image'), name).toBe('none');
      expect(css(plainHeader, 'border-bottom-width'), name).toBe('1px');
    }
  }
});

test(
  "an interactive row's data-row-target opens on a click anywhere in the row, its other controls keep their own clicks, and its cells let content cut itself short",
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    await mouse.move(0, 0);
    const work = table('Work light');
    const row = work.getByRole('row', { name: /Accessibility audit/ });
    row.element().scrollIntoView({ block: 'center' });
    const target = row.getByRole('link', { name: 'Accessibility audit' });
    expect(css(target, 'text-decoration-line')).toBe('none');
    expect(css(target, 'color')).toBe(css(row.getByRole('cell').nth(1), 'color'));

    const owner = middle(row.getByRole('cell', { name: /Sam Lee/ }));
    await mouse.click(owner.x, owner.y);
    await expect.poll(text('opened-light')).toBe('audit');

    const rowBox = box(row);
    await mouse.click(rowBox.x + rowBox.width - 4, rowBox.y + 4);
    await expect.poll(text('opened-light')).toBe('audit audit');

    const assign = middle(row.getByRole('button', { name: 'Assign Accessibility audit' }));
    await mouse.click(assign.x, assign.y);
    await expect.poll(text('pressed-light')).toBe('audit');
    expect(text('opened-light')()).toBe('audit audit');

    const second = middle(page.getByTestId('cut-roadmap-light'));
    await mouse.click(second.x, second.y);
    await expect.poll(text('opened-light')).toBe('audit audit roadmap');

    const avatar = middle(page.getByTestId('avatar-audit-light'));
    await mouse.click(avatar.x, avatar.y);
    await expect.poll(text('opened-light')).toBe('audit audit roadmap audit');

    await mouse.click(assign.x, assign.y);
    await mouse.move(0, 0);
    await expect.poll(() => css(row, 'background-color')).toBe('rgba(0, 0, 0, 0)');

    const cut = page.getByTestId('cut-audit-light').element() as HTMLElement;
    expect(cut.scrollWidth).toBeGreaterThan(cut.clientWidth);
    expect(box(cut).width).toBeLessThanOrEqual(box(row.getByRole('cell').first()).width);

    expect(document.elementFromPoint(owner.x, owner.y)).toBe(target.element());
  },
);

test('a row shows the focus ring of its data-row-target over the whole row', async () => {
  mount(fixture);
  const work = table('Work light');
  const target = work.getByRole('link', { name: 'Accessibility audit' });
  (
    work.getByRole('button', { name: 'Assign design-system/tokens' }).element() as HTMLElement
  ).focus();
  await keyboard.press('Tab');
  await expect.poll(() => document.activeElement === target.element()).toBe(true);
  expect(css(target, 'outline-style')).toBe('none');
  expect(css(target, 'outline-style', '::after')).toBe('solid');
  expect(css(target, 'outline-color', '::after')).toBe(
    tokenColor(target.element(), '--env-color-border-focus'),
  );
});

test(
  'a table nested in a full-width cell keeps its own look and behaviour, and the rows of several bodies are parted like any rows',
  { tags: ['engines'] },
  async () => {
    mount(fixture);
    const outer = table('Groups light');
    const parts = table('Parts light');
    await expect.poll(() => css(outer, 'display')).toBe('block');
    expect(css(parts, 'display')).toBe('table');
    expect(css(parts.getByRole('row').first(), 'display')).toBe('table-row');

    const groupCell = page.getByTestId('group-cell-light').element();
    const groupRow = groupCell.parentElement!;
    expect(box(groupCell).width).toBeGreaterThan(box(groupRow).width - 40);

    const nestedHeader = header(parts, 'Part').element();
    expect(css(nestedHeader, 'position')).toBe('static');
    expect(css(nestedHeader, 'background-image')).toContain('gradient');
    expect(css(nestedHeader, 'font-weight')).toBe(css(header(parts, 'Steps'), 'font-weight'));

    expect(css(parts.getByRole('cell', { name: '12,000' }), 'white-space')).toBe('normal');

    const nestedTarget = parts.getByRole('link', { name: 'Copy' }).element();
    expect(css(nestedTarget, 'position', '::after')).toBe('static');
    const outerTarget = outer.getByRole('link', { name: 'Launch' }).element();
    expect(css(outerTarget, 'position', '::after')).toBe('absolute');

    const design = parts.getByRole('cell', { name: 'Design' }).element();
    expect(css(design, 'border-top-width')).toBe('1px');
    const billing = outer.getByRole('row', { name: /Billing/ }).element();
    expect(css(billing, 'border-top-width')).toBe('1px');
  },
);

test('column widths follow the owner while controlled, keep their own otherwise, and start over from new defaults', async () => {
  const holder = document.createElement('div');
  document.body.append(holder);
  servedHolders.push(holder);
  const root = createRoot(holder);
  servedRoots.push(root);
  const reported: string[] = [];
  const show = (props: Partial<Table.RootProps>) =>
    flushSync(() =>
      root.render(
        h(
          Theme,
          { theme: 'light' },
          h(
            Table.Root,
            {
              'aria-label': 'Widths',
              resizableColumns: true,
              onColumnWidthsChange: (widths, { committed }) =>
                reported.push(`${widths.join(' ')}${committed ? '' : ' moving'}`),
              ...props,
            },
            h(
              Table.Head,
              null,
              h(
                Table.Row,
                null,
                h(Table.HeaderCell, null, 'A'),
                h(Table.HeaderCell, null, 'B'),
                h(Table.HeaderCell, null, 'C'),
              ),
            ),
            h(
              Table.Body,
              null,
              h(
                Table.Row,
                null,
                h(Table.Cell, null, '1'),
                h(Table.Cell, null, '2'),
                h(Table.Cell, null, '3'),
              ),
            ),
          ),
        ),
      ),
    );
  const shownWidths = () =>
    [...holder.querySelectorAll('col')].map((col) => parseFloat(col.style.inlineSize)).join(' ');
  const handle = table('Widths').getByRole('separator', { name: 'Resize A' });
  const press = async (key: string) => {
    (handle.element() as HTMLElement).focus();
    await keyboard.press(key);
  };
  const reset = async () => {
    const { x, y } = middle(handle);
    console.log(
      'BOX',
      JSON.stringify(box(handle)),
      document.elementFromPoint(x, y)?.outerHTML.slice(0, 200),
    );
    await mouse.dblclick(x, y);
  };

  show({ defaultColumnWidths: [30, 30, 40] });
  expect(shownWidths()).toBe('30 30 40');
  await expect.poll(() => handle.query()).not.toBeNull();
  await press('ArrowRight');
  await expect.poll(shownWidths).toBe('31 29 40');
  await press('End');
  await expect.poll(shownWidths).toBe('55 5 40');
  await press('End');
  await expect.poll(() => reported.length).toBe(3);
  show({ defaultColumnWidths: [30, 30, 40] });
  expect(shownWidths()).toBe('55 5 40');
  show({ defaultColumnWidths: [50, 25, 25] });
  expect(shownWidths()).toBe('50 25 25');
  await press('ArrowLeft');
  await expect.poll(shownWidths).toBe('49 26 25');
  await reset();
  await expect.poll(shownWidths).toBe('50 25 25');
  expect(reported.splice(0)).toEqual([
    '31 29 40',
    '55 5 40',
    '55 5 40',
    '49 26 25',
    '49 26 25',
    '49 26 25',
    '50 25 25',
  ]);

  flushSync(() => root.render(null));
  show({ columnWidths: [40, 30, 30] });
  expect(shownWidths()).toBe('40 30 30');
  await expect.poll(() => handle.query()).not.toBeNull();
  await press('ArrowRight');
  await expect.poll(() => reported.length).toBe(1);
  expect(shownWidths()).toBe('40 30 30');
  show({ columnWidths: [20, 40, 40] });
  expect(shownWidths()).toBe('20 40 40');
  await reset();
  await expect.poll(() => reported.at(-1)).toBe('40 30 30');
  show({ columnWidths: [20, 40, 40], defaultColumnWidths: [10, 10, 80] });
  expect(shownWidths()).toBe('20 40 40');
  await reset();
  await expect.poll(() => reported.at(-1)).toBe('10 10 80');
  expect(shownWidths()).toBe('20 40 40');
  expect(reported).toEqual([
    '41 29 30',
    '20 40 40',
    '20 40 40',
    '40 30 30',
    '20 40 40',
    '20 40 40',
    '10 10 80',
  ]);
});
