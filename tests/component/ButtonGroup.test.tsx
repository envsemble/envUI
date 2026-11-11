import { expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/ButtonGroup.fixture.tsx';
import { box, css, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** The shown buttons of a group: their boxes and their corners, start-start first. */
function buttons(group: Locator) {
  return [...group.element().children]
    .filter((child) => child.matches('.env-button:not([hidden])'))
    .map((button) => ({
      ...box(button),
      corners: [
        'border-start-start-radius',
        'border-start-end-radius',
        'border-end-start-radius',
        'border-end-end-radius',
      ].map((property) => Number.parseFloat(css(button, property))),
    }));
}

test('corners connect along the row or column, past hidden and removed buttons, and full width', async () => {
  mount(fixture);
  const scope = page.getByTestId('button-groups-light');
  // Inside a row the buttons connect at their inline ends, inside a column at their block ends.
  for (const orientation of ['horizontal', 'vertical']) {
    const group = scope.getByTestId(orientation);
    await expect.element(group).toHaveAttribute('role', 'group');
    const row = buttons(group);
    expect(row).toHaveLength(5);
    row.forEach(({ corners }, index) => {
      const start = index === 0 ? 20 : 4;
      const end = index === row.length - 1 ? 20 : 4;
      expect(corners).toEqual(
        orientation === 'horizontal' ? [start, end, start, end] : [start, start, end, end],
      );
    });
  }

  const standalone = Number.parseFloat(
    css(scope.getByTestId('standalone'), 'border-top-left-radius'),
  );
  expect(buttons(scope.getByTestId('single'))[0]!.corners).toEqual(Array(4).fill(standalone));
  // A lone accent icon button keeps its round corners.
  expect(buttons(scope.getByTestId('single-important'))[0]!.corners).toEqual(
    Array(4).fill(standalone),
  );
  const toggle = scope.getByRole('button', { name: 'Toggle end buttons' });
  await toggle.click();
  await expect.poll(() => buttons(scope.getByTestId('dynamic'))).toHaveLength(1);
  expect(buttons(scope.getByTestId('dynamic'))[0]!.corners).toEqual(Array(4).fill(standalone));
  expect(shown(scope.getByRole('button', { name: 'Hidden before', includeHidden: true }))).toBe(
    false,
  );
  await toggle.click();
  await expect
    .poll(() => buttons(scope.getByTestId('dynamic'))[0]!.corners)
    .toEqual([20, 4, 20, 4]);

  const row = scope.getByTestId('horizontal');
  row.element().setAttribute('dir', 'rtl');
  const rtl = buttons(row);
  expect(rtl[0]!.x).toBeGreaterThan(rtl[1]!.x);
  const continueButton = row.getByRole('button', { name: 'Continue' });
  expect(css(continueButton, 'border-top-right-radius')).toBe('20px');
  expect(css(continueButton, 'border-top-left-radius')).toBe('4px');

  // A full-width group fills its container, where its labelled button takes the room.
  const sidebar = scope.getByTestId('sidebar');
  const startRow = sidebar.getByRole('group', { name: 'Start a document' });
  const column = sidebar.getByRole('group', { name: 'Sidebar actions' });
  const sidebarBox = box(sidebar);
  const rowBox = box(startRow);
  const columnBox = box(column);
  expect(rowBox.width).toBeCloseTo(sidebarBox.width, 0);
  expect(columnBox.width).toBeCloseTo(sidebarBox.width, 0);
  // The chevron keeps its square size, and the labelled button takes the rest of the row.
  const create = box(startRow.getByRole('button', { name: 'New document' }));
  const more = box(startRow.getByRole('button', { name: 'More ways to start' }));
  expect(more.width).toBeCloseTo(40, 0);
  expect(more.height).toBeCloseTo(create.height, 0);
  expect(create.width + more.width + 1).toBeCloseTo(rowBox.width, 0);
  for (const button of column.getByRole('button').elements())
    expect(box(button).width).toBeCloseTo(columnBox.width, 0);
  // Icon-only buttons alone share the row evenly.
  const tools = sidebar.getByRole('group', { name: 'Sidebar tools' });
  const widths = tools
    .getByRole('button')
    .elements()
    .map((button) => box(button).width);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  expect(widths.reduce((sum, width) => sum + width, 0) + (widths.length - 1)).toBeCloseTo(
    box(tools).width,
    0,
  );
});
