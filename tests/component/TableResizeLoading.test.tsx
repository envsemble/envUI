import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as fixture from '../fixture/Table.fixture.tsx';
import { box, mouse, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

test('alone in its file, as the module loads once: a table whose resize code fails to load keeps its columns, and a remount loads it as it renders, the first drag resizing', async () => {
  const name = 'ColumnResizeHandle';
  await commands.failModule(name);
  try {
    const fixtureMount = mount(fixture);
    const reports = () => page.getByRole('table', { name: 'Reports light', exact: true });
    const report = () => reports().getByRole('columnheader', { name: 'Report', exact: true });
    const separators = () => reports().getByRole('separator').elements().length;
    await expect.poll(() => shown(report())).toBe(true);
    await commands.moduleRequested(name);
    expect(separators()).toBe(0);
    await report().getByRole('button').click();
    await expect.poll(() => report().element().getAttribute('aria-sort')).toBe('ascending');

    await commands.unrouteModule(name);
    await commands.holdModule(name);
    fixtureMount.remount();
    await expect.poll(() => shown(report())).toBe(true);
    await commands.moduleRequested(name);
    expect(separators()).toBe(0);
    await commands.releaseModule(name);
    await expect.poll(separators).toBe(3);
    const handle = reports().getByRole('separator', { name: 'Resize Report' });
    await expect.poll(() => getComputedStyle(handle.element()).cursor).toBe('col-resize');
    const tableWidth = box(reports()).width;
    const { x, y, width, height } = box(handle);
    await mouse.move(x + width / 2, y + height / 2);
    await mouse.down();
    await mouse.move(x + width / 2 + tableWidth * 0.1, y + height / 2, { steps: 4 });
    await mouse.up();
    await expect
      .poll(() => page.getByTestId('widths-light').element().textContent)
      .toBe('50.0 20.0 15.0 15.0');
  } finally {
    await commands.unrouteModule(name);
  }
});
