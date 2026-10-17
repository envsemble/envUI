import { test, expect, type Locator, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const dockFixture = `${fixtureUrl}/?fixture=panel-dock`;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

function lastLog(page: Page, theme = 'light') {
  return page
    .getByTestId(`dock-log-${theme}`)
    .evaluate((output) => output.textContent!.split('\n').at(-1));
}

function logOf(page: Page, theme = 'light') {
  return page
    .getByTestId(`dock-log-${theme}`)
    .evaluate((output) => output.textContent!.split('\n').filter(Boolean));
}

function dockOf(page: Page, theme = 'light') {
  const root = page.getByTestId(`dock-region-${theme}`);
  return {
    root,
    frame: page.getByTestId(`dock-frame-${theme}`),
    panel: (id: string) => root.locator(`section[data-panel-id="${id}"]`),
    tabs: root.getByRole('list', { name: 'Hidden panels' }),
    row: root.locator(':scope > .env-panel-dock-row'),
  };
}

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error('The element has no box.');
  return result;
}

/** Presses Tab until the target has focus, at most a few times. */
async function tabTo(page: Page, target: Locator, presses = 4) {
  for (let count = 0; count < presses; count++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(target).toBeFocused();
}

test.describe('PanelDock', () => {
  test('panels open side by side, minimize to tabs, maximize, restore and close', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.root.getByRole('region', { name: 'Quarterly report' });
    const notes = dock.root.getByRole('region', { name: 'Meeting notes' });
    await expect(report).toHaveAttribute('data-panel-id', 'report');
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(notes).toHaveAttribute('data-active', 'true');
    await expect(report).not.toHaveAttribute('data-active');
    // The active panel is in front.
    expect(await notes.evaluate((element) => getComputedStyle(element).zIndex)).toBe('2');
    expect(await report.evaluate((element) => getComputedStyle(element).zIndex)).toBe('1');

    // The dock fills its positioned frame; open panels sit side by side at its inline end, standing
    // on the strip of tabs along the bottom.
    const frameBox = await dock.frame.evaluate((element) =>
      element.getBoundingClientRect().toJSON(),
    );
    const rootBox = await box(dock.root);
    expect(rootBox.x).toBeCloseTo(frameBox.x + 1, 0);
    expect(rootBox.width).toBeCloseTo(frameBox.width - 2, 0);
    expect(rootBox.height).toBeCloseTo(frameBox.height - 2, 0);
    const reportBox = await box(report);
    const notesBox = await box(notes);
    const stripBox = await box(dock.tabs);
    expect(notesBox.x - (reportBox.x + reportBox.width)).toBeCloseTo(8, 0);
    expect(rootBox.x + rootBox.width - (notesBox.x + notesBox.width)).toBeCloseTo(24, 0);
    expect(reportBox.y + reportBox.height).toBeCloseTo(stripBox.y, 0);
    expect(notesBox.y + notesBox.height).toBeCloseTo(stripBox.y, 0);
    expect(stripBox.y + stripBox.height).toBeCloseTo(rootBox.y + rootBox.height, 0);

    // A minimized panel is a tab with its label, an attention dot described for assistive
    // technology, a tooltip and a close button.
    await expect(dock.tabs.getByRole('listitem')).toHaveCount(1);
    const budget = dock.tabs.getByRole('button', { name: 'Show Budget', exact: true });
    await expect(budget).toHaveText('Budget');
    await expect(budget).toHaveAccessibleDescription('Unsaved changes');
    await expect(dock.tabs.locator('li[data-panel-id="budget"]')).toHaveAttribute(
      'data-attention',
      'true',
    );
    await expect(dock.tabs.getByRole('button', { name: 'Close Budget' })).toBeVisible();
    await budget.hover();
    await expect(page.locator('.env-tooltip')).toHaveText('Budget for the second half');
    await expect(dock.panel('budget')).toBeHidden();
    await expect(dock.panel('budget')).toHaveJSProperty('inert', true);

    // The window controls minimize, maximize and close, with tooltips.
    await notes.getByRole('button', { name: 'Minimize' }).hover();
    await expect(page.locator('.env-tooltip')).toHaveText('Minimize');
    await notes.getByRole('button', { name: 'Minimize' }).click();
    await expect.poll(() => lastLog(page)).toBe('mode notes minimized');
    await expect(dock.panel('notes')).toBeHidden();
    await expect(dock.panel('notes')).toHaveAttribute('data-mode', 'minimized');
    await expect(dock.tabs.getByRole('button')).toHaveText(['Meeting notes', '', 'Budget', '']);
    // The open panel left moves to the inline end.
    const alone = await box(report);
    const region = await box(dock.root);
    expect(region.x + region.width - (alone.x + alone.width)).toBeCloseTo(24, 0);

    await report.getByRole('button', { name: 'Maximize' }).click();
    await expect(report).toHaveAttribute('data-mode', 'maximized');
    await expect(dock.root).toHaveAttribute('data-filled', 'true');
    const filled = await box(report);
    const filledRegion = await box(dock.root);
    expect(filled.x).toBeCloseTo(filledRegion.x, 0);
    expect(filled.y).toBeCloseTo(filledRegion.y, 0);
    expect(filled.width).toBeCloseTo(filledRegion.width, 0);
    expect(filled.y + filled.height).toBeCloseTo((await box(dock.tabs)).y, 0);
    // A maximized panel has no resize handle, and its toggle restores it.
    await expect(report.getByRole('separator', { name: 'Resize Quarterly report' })).toHaveCount(0);
    await report.getByRole('button', { name: 'Restore', exact: true }).click();
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(dock.root).not.toHaveAttribute('data-filled');
    await expect(report.getByRole('separator', { name: 'Resize Quarterly report' })).toHaveCount(1);

    // A tab brings its panel back to the row and activates it.
    await dock.tabs.getByRole('button', { name: 'Show Meeting notes' }).click();
    await expect(notes).toBeVisible();
    await expect(notes).toHaveAttribute('data-mode', 'open');
    expect((await logOf(page)).slice(-2)).toEqual(['mode notes open', 'activate notes']);
    // Pressing inside a panel activates it.
    await report.getByText('Paragraph 1 of Quarterly report.').click();
    await expect.poll(() => lastLog(page)).toBe('activate report');
    await expect(report).toHaveAttribute('data-active', 'true');

    await notes.getByRole('button', { name: 'Close', exact: true }).click();
    await expect.poll(() => logOf(page)).toContain('close notes');
    await expect(dock.panel('notes')).toHaveCount(0);
    await dock.tabs.getByRole('button', { name: 'Close Budget' }).click();
    await expect.poll(() => logOf(page)).toContain('close budget');
    await expect(dock.tabs).toHaveCount(0);
    await expect(dock.root).not.toHaveAttribute('data-tabs');

    // The page beneath stays usable around the panels.
    await page.getByRole('button', { name: 'Page action light' }).click();
    await expect.poll(() => lastLog(page)).toBe('page');
    expect(errors).toEqual([]);
  });

  test(
    'content keeps its draft, focus and scroll positions through modes and reorders',
    { tag: '@engines' },
    async ({ page }) => {
      const errors = collectErrors(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(dockFixture);
      const dock = dockOf(page);
      const report = dock.panel('report');
      const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
      const content = report.locator(':scope > .env-panel-dock-content');
      const list = report.getByRole('list', { name: 'Sections of Quarterly report light' });
      const mounts = page.getByTestId('dock-mounts-light');
      const scrolls = async () => [
        await content.evaluate((element) => element.scrollTop),
        await list.evaluate((element) => element.scrollTop),
      ];
      await expect(mounts).toHaveText('report:1 notes:1 budget:1');
      await draft.fill('Unsent changes');
      // Focus inside a panel activates it.
      await expect(report).toHaveAttribute('data-active', 'true');
      await content.evaluate((element) => (element.scrollTop = 120));
      await list.evaluate((element) => (element.scrollTop = 60));

      // The application's shortcuts change the mode while focus stays in the draft.
      await page.keyboard.press('Alt+KeyX');
      await expect(report).toHaveAttribute('data-mode', 'maximized');
      await expect(draft).toBeFocused();
      await expect(draft).toHaveValue('Unsent changes');
      expect(await scrolls()).toEqual([120, 60]);
      await page.keyboard.press('Alt+KeyO');
      await expect(report).toHaveAttribute('data-mode', 'open');
      await expect(draft).toBeFocused();
      expect(await scrolls()).toEqual([120, 60]);

      // Minimizing hands focus to the tab; the tab brings the panel back to the draft.
      await page.keyboard.press('Alt+KeyM');
      const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
      await expect(tab).toBeFocused();
      await expect(report).toBeHidden();
      await page.keyboard.press('Enter');
      await expect(report).toBeVisible();
      await expect(draft).toBeFocused();
      await expect(draft).toHaveValue('Unsent changes');
      expect(await scrolls()).toEqual([120, 60]);

      // Focus in a menu the panel opened moves to the tab too when the panel is minimized; the menu
      // closes with Escape, and focus returns to the menu's trigger with the panel.
      const more = report.getByRole('button', { name: 'More actions for Quarterly report light' });
      await more.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('menuitem', { name: 'Share' })).toBeFocused();
      await page.keyboard.press('Alt+KeyM');
      await expect(tab).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).toHaveCount(0);
      await expect(tab).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(report).toBeVisible();
      await expect(more).toBeFocused();
      await draft.focus();

      // Reordering moves panels without losing focus, the draft or the scroll positions, also in a
      // panel without focus. The focused draft is in view, so the browser need not reveal it.
      const notesContent = dock.panel('notes').locator(':scope > .env-panel-dock-content');
      await notesContent.evaluate((element) => (element.scrollTop = 150));
      await content.evaluate((element) => (element.scrollTop = 0));
      const order = () =>
        dock.row.evaluate((row) =>
          [...row.querySelectorAll(':scope > section')].map(
            (section) => (section as HTMLElement).dataset.panelId,
          ),
        );
      expect(await order()).toEqual(['report', 'notes', 'budget']);
      await page.keyboard.press('Alt+KeyR');
      await expect.poll(order).toEqual(['budget', 'notes', 'report']);
      await expect(draft).toBeFocused();
      expect(await scrolls()).toEqual([0, 60]);
      expect(await notesContent.evaluate((element) => element.scrollTop)).toBe(150);
      await page.keyboard.type(' and more');
      await expect(draft).toHaveValue('Unsent changes and more');

      // Maximized and minimized from the window controls, it is the same content.
      await report.getByRole('button', { name: 'Maximize' }).click();
      await report.getByRole('button', { name: 'Minimize' }).click();
      await dock.tabs.getByRole('button', { name: 'Show Quarterly report' }).click();
      await expect(report).toHaveAttribute('data-mode', 'open');
      await expect(draft).toHaveValue('Unsent changes and more');
      await expect(draft).toBeFocused();
      await expect(mounts).toHaveText('report:1 notes:1 budget:1');
      expect(errors).toEqual([]);
    },
  );

  test(
    'the top edge resizes a panel with the pointer and the keyboard',
    { tag: '@engines' },
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(dockFixture);
      const dock = dockOf(page);
      const report = dock.panel('report');
      const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
      await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
      await expect(handle).toHaveAttribute('tabindex', '0');
      await expect(handle).toHaveAttribute('aria-controls', (await report.getAttribute('id'))!);
      // Without a height of its own, a panel takes 85% of the room above the tabs.
      const room = Number(await handle.getAttribute('aria-valuemax'));
      const start = Number(await handle.getAttribute('aria-valuenow'));
      expect(start).toBe(Math.round(room * 0.85));
      expect(Number(await handle.getAttribute('aria-valuemin'))).toBe(240);
      // The height reads as a share of that room.
      await expect(handle).toHaveAttribute('aria-valuetext', '85%');
      expect((await box(report)).height).toBeCloseTo(start, 0);

      // Dragging reports the new height once, when the drag ends.
      const edge = await box(handle);
      await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
      await page.mouse.down();
      await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2 + 100, { steps: 5 });
      await expect(report).toHaveAttribute('data-resizing', 'true');
      await expect.poll(async () => Math.round((await box(report)).height)).toBe(start - 100);
      expect(await lastLog(page)).not.toMatch(/^height/);
      await page.mouse.up();
      await expect(report).not.toHaveAttribute('data-resizing');
      await expect.poll(() => lastLog(page)).toBe(`height report ${start - 100}`);
      await expect(handle).toHaveAttribute('aria-valuenow', String(start - 100));

      // The arrow keys move by 16 px, 64 with Shift; Home and End reach the bounds.
      await handle.focus();
      await page.keyboard.press('ArrowUp');
      await expect(handle).toHaveAttribute('aria-valuenow', String(start - 84));
      await page.keyboard.press('Shift+ArrowUp');
      await expect(handle).toHaveAttribute('aria-valuenow', String(start - 20));
      await page.keyboard.press('ArrowDown');
      await expect(handle).toHaveAttribute('aria-valuenow', String(start - 36));
      await expect.poll(() => lastLog(page)).toBe(`height report ${start - 36}`);
      await page.keyboard.press('Home');
      await expect(handle).toHaveAttribute('aria-valuenow', '240');
      await expect(handle).toHaveAttribute('aria-valuetext', `${Math.round((240 / room) * 100)}%`);
      expect((await box(report)).height).toBeCloseTo(240, 0);
      await page.keyboard.press('End');
      await expect(handle).toHaveAttribute('aria-valuenow', String(room));
      expect((await box(report)).height).toBeCloseTo(room, 0);
      // Keys with Alt, Ctrl or ⌘ are the application's.
      await page.keyboard.press('Control+ArrowDown');
      await expect(handle).toHaveAttribute('aria-valuenow', String(room));

      // Dragging past a bound stops at it.
      const top = await box(handle);
      await page.mouse.move(top.x + top.width / 2, top.y + top.height / 2);
      await page.mouse.down();
      await page.mouse.move(top.x + top.width / 2, top.y - 200, { steps: 4 });
      await page.mouse.up();
      await expect(handle).toHaveAttribute('aria-valuenow', String(room));

      // A shorter region holds the panel within its room without changing the chosen height.
      const entries = (await logOf(page)).length;
      await dock.frame.evaluate((element) => (element.style.blockSize = '30rem'));
      // The room is the dock's height above the tabs, less the gutter for shadows.
      const shorter = await dock.root.evaluate(
        (element) =>
          element.clientHeight -
          element.querySelector<HTMLElement>('.env-panel-dock-strip')!.offsetHeight -
          24,
      );
      expect(shorter).toBeLessThan(room);
      await expect(handle).toHaveAttribute('aria-valuemax', String(shorter));
      await expect(handle).toHaveAttribute('aria-valuenow', String(shorter));
      expect((await box(report)).height).toBeCloseTo(shorter, 0);
      expect((await logOf(page)).length).toBe(entries);
      await dock.frame.evaluate((element) => (element.style.blockSize = ''));
      await expect(handle).toHaveAttribute('aria-valuenow', String(room));

      // A panel's own bounds hold its height: its default 85% stops at its maxHeight.
      const notesHandle = dock
        .panel('notes')
        .getByRole('separator', { name: 'Resize Meeting notes' });
      await expect(notesHandle).toHaveAttribute('aria-valuemin', '200');
      await expect(notesHandle).toHaveAttribute('aria-valuemax', '400');
      await expect(notesHandle).toHaveAttribute('aria-valuenow', '400');
      await notesHandle.focus();
      await page.keyboard.press('Home');
      await expect(notesHandle).toHaveAttribute('aria-valuenow', '200');
      expect((await box(dock.panel('notes'))).height).toBeCloseTo(200, 0);
    },
  );

  test('open panels share the row down to their minimum width, then the row scrolls', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const notes = dock.panel('notes');
    // With room, open panels take their preferred width: 32 rem, or the panel's own.
    await dock.frame.evaluate((element) => (element.style.inlineSize = '1100px'));
    await expect.poll(async () => Math.round((await box(report)).width)).toBe(512);
    expect(Math.round((await box(notes)).width)).toBe(448);
    await expect(dock.row).not.toHaveAttribute('data-overflowing');
    expect(await dock.row.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe(
      'none',
    );
    // Short of room, they shrink in proportion to their preferred widths.
    await dock.frame.evaluate((element) => (element.style.inlineSize = '700px'));
    const shortfall = 512 + 448 - (700 - 2 - 48 - 8);
    await expect
      .poll(async () => (await box(report)).width)
      .toBeCloseTo(512 - (shortfall * 512) / 960, 0);
    expect((await box(notes)).width).toBeCloseTo(448 - (shortfall * 448) / 960, 0);

    // Past their minimum widths, 20 rem or the panel's own, the row scrolls sideways and keeps the
    // newest panel in view.
    await page.getByRole('button', { name: 'Open document light' }).click();
    const newest = dock.root.getByRole('region', { name: 'Roadmap 1' });
    await expect(newest).toBeVisible();
    await expect(dock.row).toHaveAttribute('data-overflowing', 'true');
    for (const [panel, width] of [
      [report, 320],
      [notes, 288],
      [newest, 320],
    ] as const)
      expect(Math.round((await box(panel)).width)).toBe(width);
    const rootBox = await box(dock.root);
    const newestBox = await box(newest);
    expect(newestBox.x + newestBox.width).toBeCloseTo(rootBox.x + rootBox.width - 24, 0);
    expect((await box(report)).x).toBeLessThan(rootBox.x);
    // An overflowing row takes the pointer, so its scrollbar works; otherwise presses pass through.
    expect(await dock.row.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe(
      'auto',
    );
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.root.getByRole('region', { name: 'Release checklist 2' });
    const latestEnd = async () => {
      const region = await box(dock.root);
      const latestBox = await box(latest);
      return Math.round(latestBox.x + latestBox.width - (region.x + region.width - 24));
    };
    await expect.poll(latestEnd).toBe(0);
    // The newest panel stays in view as the region narrows further.
    await dock.frame.evaluate((element) => (element.style.inlineSize = '660px'));
    await expect.poll(latestEnd).toBe(0);
    // Focus in a panel out of view scrolls the row to it; the page itself never scrolls sideways.
    await report.getByRole('button', { name: 'Edit Quarterly report light' }).focus();
    await expect
      .poll(async () => (await box(report.getByRole('button', { name: 'Minimize' }))).x)
      .toBeGreaterThan(rootBox.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test('a narrow dock shows one panel at a time across the region', async ({ page }) => {
    const errors = collectErrors(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const notes = dock.panel('notes');
    await expect(dock.root).not.toHaveAttribute('data-stacked');
    await dock.frame.evaluate((element) => (element.style.inlineSize = '24rem'));
    await expect(dock.root).toHaveAttribute('data-stacked', 'true');
    await expect.poll(() => logOf(page)).toEqual(['stacked true']);
    // The active panel fills the region above the tabs; the other open panel waits as a tab.
    const rootBox = await box(dock.root);
    const sheet = await box(notes);
    expect(sheet.x).toBeCloseTo(rootBox.x, 0);
    expect(sheet.y).toBeCloseTo(rootBox.y, 0);
    expect(sheet.width).toBeCloseTo(rootBox.width, 0);
    expect(sheet.y + sheet.height).toBeCloseTo((await box(dock.tabs)).y, 0);
    await expect(report).toBeHidden();
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(dock.tabs.getByRole('button', { name: /^Show/ })).toHaveText([
      'Quarterly report',
      'Budget',
    ]);
    // A sheet already fills the region: no Maximize, and no resize handle.
    await expect(notes.getByRole('button', { name: 'Maximize' })).toHaveCount(0);
    await expect(notes.getByRole('button', { name: 'Minimize' })).toBeVisible();
    await expect(notes.getByRole('separator', { name: /^Resize Meeting notes/ })).toHaveCount(0);
    // While a panel covers the region, the page beneath takes no presses.
    const action = await box(page.getByRole('button', { name: 'Page action light' }));
    expect(
      await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('.env-panel-dock') !== null,
        { x: action.x + action.width / 2, y: action.y + action.height / 2 },
      ),
    ).toBe(true);

    // Another panel's tab brings it across the region and focus into it.
    await dock.tabs.getByRole('button', { name: 'Show Quarterly report' }).click();
    await expect(report).toBeVisible();
    await expect(notes).toBeHidden();
    await expect.poll(() => lastLog(page)).toBe('activate report');
    await expect
      .poll(() => report.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    // Minimizing the shown panel shows the one before it.
    await report.getByRole('button', { name: 'Minimize' }).click();
    await expect(notes).toBeVisible();
    await expect(dock.tabs.getByRole('button', { name: 'Show Quarterly report' })).toBeFocused();

    // A newly opened panel takes the region; tabs that overflow their strip scroll sideways with a
    // vertical wheel.
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    await expect(dock.root.getByRole('region', { name: 'Release checklist 2' })).toBeVisible();
    await expect
      .poll(() => dock.tabs.evaluate((element) => element.scrollWidth > element.clientWidth))
      .toBe(true);
    const tab = await box(dock.tabs.getByRole('listitem').first());
    await page.mouse.move(tab.x + tab.width / 2, tab.y + tab.height / 2);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => dock.tabs.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await dock.tabs.getByRole('button', { name: 'Close Roadmap 1' }).click();
    await dock.root
      .getByRole('region', { name: 'Release checklist 2' })
      .getByRole('button', { name: 'Close', exact: true })
      .click();
    await expect(notes).toBeVisible();

    // Wide again, open panels sit side by side.
    await dock.frame.evaluate((element) => (element.style.inlineSize = ''));
    await expect(dock.root).not.toHaveAttribute('data-stacked');
    await expect.poll(async () => (await logOf(page)).at(-1)).toBe('stacked false');
    await expect(notes).toBeVisible();
    await expect(notes.getByRole('button', { name: 'Maximize' })).toBeVisible();

    // A phone stacks the dock without overflowing the page.
    await page.setViewportSize({ width: 360, height: 740 });
    await expect(dock.root).toHaveAttribute('data-stacked', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });

  test('the keyboard alone reaches, minimizes, restores and closes panels', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    await page.getByRole('button', { name: 'Page action light' }).focus();
    // Each panel's resize handle comes first, then its header: the application's actions and the
    // window controls, then its content.
    const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
    const edit = report.getByRole('button', { name: 'Edit Quarterly report light' });
    const minimize = report.getByRole('button', { name: 'Minimize' });
    await tabTo(page, handle, 1);
    await tabTo(page, edit, 1);
    await tabTo(
      page,
      report.getByRole('button', { name: 'More actions for Quarterly report light' }),
      1,
    );
    await tabTo(page, minimize, 1);
    await expect(minimize).toHaveCSS('outline-style', 'solid');
    await tabTo(page, report.getByRole('button', { name: 'Maximize' }), 1);
    await tabTo(page, report.getByRole('button', { name: 'Close', exact: true }), 1);
    await tabTo(page, report.getByRole('textbox', { name: 'Draft of Quarterly report light' }), 2);

    // Enter on Minimize hands focus to the tab; Enter there brings the panel back.
    await page.keyboard.press('Shift+Tab');
    await expect(report.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(minimize).toBeFocused();
    await page.keyboard.press('Enter');
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    await expect(tab).toBeFocused();
    await expect(tab).toHaveCSS('outline-style', 'solid');
    // The tab's close button follows it.
    await page.keyboard.press('Tab');
    await expect(dock.tabs.getByRole('button', { name: 'Close Quarterly report' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Space');
    await expect(report).toBeVisible();
    // Focus returns to the content that last had it, not to the control that minimized it.
    await expect(
      report.getByRole('textbox', { name: 'Draft of Quarterly report light' }),
    ).toBeFocused();

    // Closing a tab moves focus to the tab in its place.
    await dock.tabs.getByRole('button', { name: 'Close Budget' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => lastLog(page)).toBe('close budget');
    await expect(dock.tabs).toHaveCount(0);
    // Closing the focused panel moves focus to the panel that remains, which becomes active.
    await report.getByRole('button', { name: 'Close', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect
      .poll(async () => (await logOf(page)).slice(-2))
      .toEqual(['close report', 'activate notes']);
    const notes = dock.panel('notes');
    await expect
      .poll(() => notes.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    expect(errors).toEqual([]);
  });

  test('a right-to-left dock mirrors to its inline end', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    await dock.frame.evaluate((element) => element.setAttribute('dir', 'rtl'));
    const rootBox = await box(dock.root);
    const report = await box(dock.panel('report'));
    const notes = await box(dock.panel('notes'));
    const tab = await box(dock.tabs.getByRole('listitem'));
    expect(notes.x + notes.width).toBeLessThanOrEqual(report.x);
    expect(notes.x - rootBox.x).toBeCloseTo(24, 0);
    expect(tab.x - rootBox.x).toBeCloseTo(24, 0);
    // The header's title keeps the wider padding at its start, on the right.
    const header = dock.panel('report').locator('.env-panel-dock-header');
    await expect(header).toHaveCSS('padding-right', '24px');
    await expect(header).toHaveCSS('padding-left', '12px');
    // An overflowing row keeps the newest panel in view at the inline end, on the left.
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    const latest = dock.root.getByRole('region', { name: 'Release checklist 2' });
    await expect(dock.row).toHaveAttribute('data-overflowing', 'true');
    await expect.poll(async () => Math.round((await box(latest)).x - rootBox.x)).toBe(24);
    // Resizing is unchanged: up still grows the panel.
    const handle = dock.panel('report').getByRole('separator', { name: 'Resize Quarterly report' });
    const height = Number(await handle.getAttribute('aria-valuenow'));
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(handle).toHaveAttribute('aria-valuenow', String(height - 16));
  });

  test('coarse pointers get a taller resize band, touch-sized tabs and controls', async ({
    browser,
  }) => {
    // A touch screen is a coarse pointer in every engine.
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 1024, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(dockFixture);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
    await expect(handle).toHaveCSS('height', '24px');
    expect(await handle.evaluate((element) => getComputedStyle(element, '::after').opacity)).toBe(
      '1',
    );
    // The header's small controls grow to the touch height, as every button does, so a press on
    // one never reaches the next.
    const minimize = report.getByRole('button', { name: 'Minimize' });
    await expect(minimize).toHaveCSS('height', '44px');
    await expect(minimize).toHaveCSS('width', '44px');
    // A tab holds its buttons at the touch height inside its top hairline.
    await expect(dock.tabs.getByRole('listitem')).toHaveCSS('height', '45px');
    for (const name of ['Show Budget', 'Close Budget']) {
      const button = dock.tabs.getByRole('button', { name, exact: true });
      await expect
        .poll(() => button.evaluate((element) => element.getBoundingClientRect().height))
        .toBe(44);
    }
    const close = dock.tabs.getByRole('button', { name: 'Close Budget' });
    await expect(close).toHaveCSS('width', '44px');
    await context.close();
  });

  test('panels rise into place, and only fade with reduced motion', async ({ page }) => {
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const light = '[data-testid="dock-region-light"]';
    // Waits until the entrances in the dock have ended, each target without its data-entering and
    // its animations, then presses a button and reads the animations the panels and tabs start, as
    // soon as one has: a busy engine may take more than a frame to start them. They are read from
    // the animationstart events rather than sampled at frames: on a busy engine one frame can take
    // longer than a whole entrance, which then starts and ends between two samples.
    const entrances = (button: Locator) =>
      button.evaluate(async (element, dock) => {
        const targets = () => [
          ...document.querySelectorAll<HTMLElement>(`${dock} [data-panel-id]`),
        ];
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
        for (let count = 0; count < 600; count++) {
          await frame();
          if (
            targets().every(
              (target) =>
                !target.hasAttribute('data-entering') && target.getAnimations().length === 0,
            )
          )
            break;
        }
        const started: string[] = [];
        // The event comes before the entrance's own animationend handler, so the target's style
        // still names the animation and its duration.
        const record = (event: AnimationEvent) => {
          const target = event.target as HTMLElement;
          if (!targets().includes(target)) return;
          const style = getComputedStyle(target);
          const names = style.animationName.split(/,\s*/);
          const durations = style.animationDuration.split(/,\s*/);
          const duration = durations[Math.max(0, names.indexOf(event.animationName))];
          started.push(
            `${target.tagName === 'LI' ? 'tab' : 'panel'} ${target.dataset.panelId} ${event.animationName} ${Math.round(parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000))}`,
          );
        };
        document.addEventListener('animationstart', record, true);
        try {
          (element as HTMLElement).click();
          for (let count = 0; count < 60; count++) {
            await frame();
            if (started.length > 0) return started;
          }
          return started;
        } finally {
          document.removeEventListener('animationstart', record, true);
        }
      }, light);
    const open = page.getByRole('button', { name: 'Open document light' });
    expect(await entrances(open)).toEqual(['panel extra-1 env-panel-dock-rise 240']);
    expect(await entrances(report.getByRole('button', { name: 'Maximize' }))).toEqual([
      'panel report env-panel-dock-grow 240',
    ]);
    expect(await entrances(report.getByRole('button', { name: 'Minimize' }))).toEqual([
      'tab report env-panel-dock-tab-rise 160',
    ]);
    // A panel brought back starts its entrance again.
    expect(
      await entrances(dock.tabs.getByRole('button', { name: 'Show Quarterly report' })),
    ).toEqual(['panel report env-panel-dock-rise 240']);
    // A reorder moves the panels and tabs without their entrances: none has started two frames on,
    // which a reorder renders in, as it is committed at once.
    const reorder = await report
      .getByRole('textbox', { name: /^Draft of/ })
      .evaluate(async (field, dock) => {
        const targets = () => [
          ...document.querySelectorAll<HTMLElement>(`${dock} [data-panel-id]`),
        ];
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
        for (let count = 0; count < 600; count++) {
          await frame();
          if (
            targets().every(
              (target) =>
                !target.hasAttribute('data-entering') && target.getAnimations().length === 0,
            )
          )
            break;
        }
        field.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'r', code: 'KeyR', altKey: true, bubbles: true }),
        );
        await frame();
        await frame();
        return targets().flatMap((target) =>
          target.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
        );
      }, light);
    await expect
      .poll(() =>
        dock.row.evaluate((row) =>
          [...row.querySelectorAll<HTMLElement>(':scope > section')].map(
            ({ dataset }) => dataset.panelId,
          ),
        ),
      )
      .toEqual(['extra-1', 'budget', 'notes', 'report']);
    expect(reorder).toEqual([]);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await entrances(open)).toEqual(['panel extra-2 env-motion-fade-in 160']);
    expect(await entrances(report.getByRole('button', { name: 'Maximize' }))).toEqual([
      'panel report env-panel-dock-fade-in 160',
    ]);
    expect(await entrances(report.getByRole('button', { name: 'Minimize' }))).toEqual([
      'tab report env-motion-fade-in 160',
    ]);
  });
});

test('a drag ends when the application maximizes its panel or the dock stacks meanwhile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
  const content = report.locator(':scope > .env-panel-dock-content');
  const start = Number(await handle.getAttribute('aria-valuenow'));
  const dragDown = async () => {
    const edge = await box(handle);
    await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
    await page.mouse.down();
    await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2 + 60, { steps: 3 });
    await expect(report).toHaveAttribute('data-resizing', 'true');
  };

  // The application's shortcut maximizes the panel while its edge is held; focus stays in the
  // draft, as a drag leaves focus where it is.
  await report.getByRole('textbox', { name: 'Draft of Quarterly report light' }).focus();
  await dragDown();
  await page.keyboard.press('Alt+KeyX');
  await expect(report).toHaveAttribute('data-mode', 'maximized');
  await expect(report).not.toHaveAttribute('data-resizing');
  await expect(content).toHaveCSS('pointer-events', 'auto');
  await page.mouse.up();
  await page.keyboard.press('Alt+KeyO');
  await expect(report).toHaveAttribute('data-mode', 'open');
  // The drag ended without a height, as a cancelled one does.
  await expect(handle).toHaveAttribute('aria-valuenow', String(start));
  expect((await box(report)).height).toBeCloseTo(start, 0);

  // The dock stacks while the edge is held.
  await dragDown();
  await dock.frame.evaluate((element) => (element.style.inlineSize = '24rem'));
  await expect(dock.root).toHaveAttribute('data-stacked', 'true');
  await expect(report).not.toHaveAttribute('data-resizing');
  await expect(content).toHaveCSS('pointer-events', 'auto');
  await page.mouse.up();
  await dock.frame.evaluate((element) => (element.style.inlineSize = ''));
  await expect(dock.root).not.toHaveAttribute('data-stacked');
  await expect(handle).toHaveAttribute('aria-valuenow', String(start));
  expect((await logOf(page)).filter((entry) => entry.startsWith('height'))).toEqual([]);
});

test('focus outside the dock stays there when the application hides a panel', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  // A button that removes itself as it is pressed leaves focus nowhere, without a blur.
  await report.getByRole('button', { name: 'Dismiss tip of Quarterly report light' }).click();
  await expect(report).toHaveAttribute('data-active', 'true');
  const action = page.getByRole('button', { name: 'Page action light' });
  await action.focus();
  await page.keyboard.press('Alt+KeyM');
  await expect(report).toHaveAttribute('data-mode', 'minimized');
  await expect(action).toBeFocused();
  // Focus in the panel still moves to its tab.
  await dock.tabs.getByRole('button', { name: 'Show Quarterly report' }).click();
  await report.getByRole('textbox', { name: 'Draft of Quarterly report light' }).focus();
  await page.keyboard.press('Alt+KeyM');
  await expect(dock.tabs.getByRole('button', { name: 'Show Quarterly report' })).toBeFocused();
});

test('focus stays in a panel whose focused edge or Maximize control goes with a new layout', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const holdsFocus = () => report.evaluate((element) => element.contains(document.activeElement));
  // A maximized panel has no resize handle.
  await report.getByRole('separator', { name: 'Resize Quarterly report' }).focus();
  await expect(report).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('Alt+KeyX');
  await expect(report).toHaveAttribute('data-mode', 'maximized');
  await expect.poll(holdsFocus).toBe(true);
  await page.keyboard.press('Alt+KeyO');
  await expect(report).toHaveAttribute('data-mode', 'open');

  // A stacked dock leaves out Maximize.
  const maximize = report.getByRole('button', { name: 'Maximize' });
  await maximize.focus();
  await dock.frame.evaluate((element) => (element.style.inlineSize = '24rem'));
  await expect(dock.root).toHaveAttribute('data-stacked', 'true');
  await expect(maximize).toHaveCount(0);
  await expect(report).toBeVisible();
  await expect.poll(holdsFocus).toBe(true);
});

test(
  'a control that takes focus beneath the sticky header comes out below it',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const report = dockOf(page).panel('report');
    const content = report.locator(':scope > .env-panel-dock-content');
    const header = report.locator('.env-panel-dock-header');
    const tip = report.getByRole('button', { name: 'Dismiss tip of Quarterly report light' });
    // The content scrolls until the tip lies entirely beneath the header.
    await content.evaluate((element) => {
      const header = element.querySelector('.env-panel-dock-header')!.getBoundingClientRect();
      const tip = [...element.querySelectorAll('button')]
        .find((button) => button.textContent?.startsWith('Dismiss tip'))!
        .getBoundingClientRect();
      element.scrollTop += tip.top - (header.top + (header.height - tip.height) / 2);
    });
    const [headerBefore, tipBefore] = await Promise.all([box(header), box(tip)]);
    expect(tipBefore.y).toBeGreaterThanOrEqual(headerBefore.y);
    expect(tipBefore.y + tipBefore.height).toBeLessThanOrEqual(
      headerBefore.y + headerBefore.height,
    );
    await tip.focus();
    const [headerBox, tipBox] = await Promise.all([box(header), box(tip)]);
    expect(tipBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  },
);

test(
  'a panel brought back shows the element its focus returns to',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const content = report.locator(':scope > .env-panel-dock-content');
    const header = report.locator('.env-panel-dock-header');
    const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    // The content scrolls on, leaving the focused draft out of sight.
    await draft.focus();
    await content.evaluate((element) => (element.scrollTop = element.scrollHeight));
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    const pageTop = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');
    await expect(draft).toBeFocused();
    // Where the draft then shows in the window, the page stays.
    expect(await page.evaluate(() => window.scrollY)).toBe(pageTop);
    const [contentBox, headerBox, draftBox] = await Promise.all([
      box(content),
      box(header),
      box(draft),
    ]);
    expect(draftBox.y + draftBox.height).toBeGreaterThan(headerBox.y + headerBox.height);
    expect(draftBox.y).toBeLessThan(contentBox.y + contentBox.height);

    // Where some of it shows, the scroll position people left stays.
    await content.evaluate((element) => (element.scrollTop = 100));
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(draft).toBeFocused();
    expect(await content.evaluate((element) => element.scrollTop)).toBe(100);
  },
);

test(
  'a panel brought back scrolls the page only to an element its focus returns to outside the window',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 300 });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const content = report.locator(':scope > .env-panel-dock-content');
    const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    await draft.focus();
    await content.evaluate((element) => (element.scrollTop = element.scrollHeight));
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    // The window shows only the bottom of the dock, below where the draft comes back.
    await dock.frame.evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().bottom + window.scrollY - innerHeight),
    );
    const pageTop = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Enter');
    await expect(draft).toBeFocused();
    // The content scrolls to the draft, and the page as little as shows it: the part of the draft
    // below the sticky header comes out at the window's top. WebKit may already have scrolled the
    // hidden content to the draft's caret, which leaves the field's top edge beneath the header.
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeLessThan(200);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(pageTop);
    const shownTop = await content.evaluate(
      (element, field) =>
        Math.max(
          field!.getBoundingClientRect().top,
          element.getBoundingClientRect().top +
            (parseFloat(getComputedStyle(element).scrollPaddingTop) || 0),
        ),
      await draft.elementHandle(),
    );
    expect(Math.abs(shownTop)).toBeLessThan(2);
  },
);

test(
  'a tab that takes focus scrolls the page only where the window leaves it out',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const draft = dock
      .panel('report')
      .getByRole('textbox', { name: 'Draft of Quarterly report light' });
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    // Some of the tab shows in the window, so the page stays as the panel minimizes.
    await draft.focus();
    const pageTop = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(pageTop);
    // Out of the window entirely, the tab comes into view at its bottom edge.
    await page.keyboard.press('Enter');
    await expect(draft).toBeFocused();
    await page.setViewportSize({ width: 1280, height: 560 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    const tabBox = await box(tab);
    expect(Math.abs(tabBox.y + tabBox.height - 560)).toBeLessThan(2);
  },
);

test(
  'a panel brought back reveals the element its focus returns to inside a scrolling list',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const content = report.locator(':scope > .env-panel-dock-content');
    const chat = report.getByRole('list', { name: 'Chat about Quarterly report light' });
    const quote = chat.getByRole('button', { name: 'Quote message 1 of Quarterly report light' });
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    // The chat scrolls on within the content, leaving the focused button out of sight.
    await quote.focus();
    await chat.evaluate((element) => (element.scrollTop = element.scrollHeight));
    const contentTop = await content.evaluate((element) => element.scrollTop);
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(quote).toBeFocused();
    // The chat scrolls back to the button; the content around it stays where it was.
    const [chatBox, quoteBox] = await Promise.all([box(chat), box(quote)]);
    expect(quoteBox.y).toBeGreaterThanOrEqual(chatBox.y - 1);
    expect(quoteBox.y + quoteBox.height).toBeLessThanOrEqual(chatBox.y + chatBox.height + 1);
    expect(await content.evaluate((element) => element.scrollTop)).toBe(contentTop);
  },
);

test(
  'a panel brought back reveals the element its focus returns to beside the view',
  { tag: '@engines' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const tags = report.getByRole('group', { name: 'Tags of Quarterly report light' });
    const first = tags.getByRole('button', { name: 'Finance tag of Quarterly report light' });
    const tab = dock.tabs.getByRole('button', { name: 'Show Quarterly report' });
    // The row of tags scrolls sideways, leaving the focused tag out of sight.
    await first.focus();
    await tags.evaluate((element) => (element.scrollLeft = element.scrollWidth));
    await page.keyboard.press('Alt+KeyM');
    await expect(tab).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(first).toBeFocused();
    const [tagsBox, firstBox] = await Promise.all([box(tags), box(first)]);
    expect(firstBox.x).toBeGreaterThanOrEqual(tagsBox.x - 1);
    expect(firstBox.x + firstBox.width).toBeLessThanOrEqual(tagsBox.x + tagsBox.width + 1);
  },
);

test('open panels leave the controls of a maximized one in view after the dock stacks and widens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const notes = dock.panel('notes');
  // The room of an open panel is the dock's height above the tabs, below the row's padding.
  const room = () =>
    dock.root.evaluate((element) => {
      const row = element.querySelector<HTMLElement>(':scope > .env-panel-dock-row')!;
      const strip = element.querySelector<HTMLElement>(':scope > .env-panel-dock-strip');
      return Math.floor(
        element.clientHeight -
          (strip?.offsetHeight ?? 0) -
          parseFloat(getComputedStyle(row).paddingTop),
      );
    });
  const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
  await notes.getByRole('button', { name: 'Maximize' }).click();
  await expect(notes).toHaveAttribute('data-mode', 'maximized');
  await expect(handle).toHaveAttribute('aria-valuemax', String(await room()));
  await dock.frame.evaluate((element) => (element.style.inlineSize = '24rem'));
  await expect(dock.root).toHaveAttribute('data-stacked', 'true');
  await dock.frame.evaluate((element) => (element.style.inlineSize = ''));
  await expect(dock.root).not.toHaveAttribute('data-stacked');
  await expect(handle).toHaveAttribute('aria-valuemax', String(await room()));
  const [panel, minimize] = await Promise.all([
    box(report),
    box(notes.getByRole('button', { name: 'Minimize' })),
  ]);
  expect(panel.y).toBeGreaterThanOrEqual(minimize.y + minimize.height);
});

test('content that scrolls itself as panels reorder keeps its own scroll position', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const chat = report.getByRole('list', { name: 'Chat about Quarterly report light' });
  const list = report.getByRole('list', { name: 'Sections of Quarterly report light' });
  const atNewest = () =>
    chat.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop);
  await expect.poll(atNewest).toBeLessThanOrEqual(1);
  await list.evaluate((element) => (element.scrollTop = 60));
  // The application reorders the panels and adds a message in the same update; the chat scrolls
  // to the new message, and the dock puts back only the positions the move lost.
  await report.getByRole('textbox', { name: 'Draft of Quarterly report light' }).focus();
  await page.keyboard.press('Alt+KeyN');
  await expect(chat.getByRole('listitem')).toHaveCount(9);
  await expect.poll(atNewest).toBeLessThanOrEqual(1);
  expect(await list.evaluate((element) => element.scrollTop)).toBe(60);
});

test('content that scrolls itself back to its start as panels reorder stays there', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const report = dockOf(page).panel('report');
  const chat = report.getByRole('list', { name: 'Chat about Quarterly report light' });
  const list = report.getByRole('list', { name: 'Sections of Quarterly report light' });
  await expect.poll(() => chat.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await list.evaluate((element) => (element.scrollTop = 60));
  // The application reorders the panels and rewinds the chat in the same update: the chat stays
  // at its start, which the dock does not take for a position the move lost.
  await report.getByRole('textbox', { name: 'Draft of Quarterly report light' }).focus();
  await page.keyboard.press('Alt+KeyT');
  await expect(dockOf(page).row.locator(':scope > section').first()).toHaveAttribute(
    'data-panel-id',
    'budget',
  );
  expect(await chat.evaluate((element) => element.scrollTop)).toBe(0);
  expect(await list.evaluate((element) => element.scrollTop)).toBe(60);
});

test('a hairline sets apart a header that a form in the content holds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const panel = page.getByTestId('passive-dock-light').locator('section[data-panel-id="first"]');
  const content = panel.locator(':scope > .env-panel-dock-content');
  const header = content.locator(':scope > form > .env-panel-dock-header');
  await expect(header).toHaveCSS('box-shadow', 'none');
  await content.evaluate((element) => (element.scrollTop = 40));
  await expect
    .poll(() => header.evaluate((element) => getComputedStyle(element).boxShadow))
    .toMatch(/ 0px 1px 0px 0px$/);
  // The header still sticks to the top of the content.
  const [contentBox, headerBox] = await Promise.all([box(content), box(header)]);
  expect(Math.abs(headerBox.y - contentBox.y)).toBeLessThan(1);
  await content.evaluate((element) => (element.scrollTop = 0));
  await expect(header).toHaveCSS('box-shadow', 'none');
});

test('a stacked dock shows the panel of a tab pressed, also without onActivate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const passive = page.getByTestId('passive-dock-light');
  const first = passive.locator('section[data-panel-id="first"]');
  const second = passive.locator('section[data-panel-id="second"]');
  await expect(passive.locator('.env-panel-dock')).toHaveAttribute('data-stacked', 'true');
  // The active panel shows first; the application never activates another.
  await expect(first).toBeVisible();
  await expect(second).toBeHidden();
  await passive.getByRole('button', { name: 'Show Second note light' }).click();
  await expect(second).toBeVisible();
  await expect(first).toBeHidden();
  await expect
    .poll(() => second.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  await passive.getByRole('button', { name: 'Show First note light' }).click();
  await expect(first).toBeVisible();
  await expect(second).toBeHidden();
});

test('a panel that opens shows in place of the panel a tab showed, also beside an active one', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const passive = page.getByTestId('passive-dock-light');
  const panel = (id: string) => passive.locator(`section[data-panel-id="${id}"]`);
  // The application marks the first note active and never activates another.
  await passive.getByRole('button', { name: 'Show Second note light' }).click();
  await expect(panel('second')).toBeVisible();
  await page.getByRole('button', { name: 'Add note light' }).click();
  await expect(panel('third')).toBeVisible();
  await expect(panel('second')).toBeHidden();
  await expect(panel('first')).toBeHidden();
});

test('a dock that minimizes rather than scrolls asks to minimize its least recently active panel', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('minimizing-dock-light');
  const row = scope.locator('.env-panel-dock > .env-panel-dock-row');
  const log = page.getByTestId('minimizing-log-light');
  const inRow = () =>
    row.evaluate((element) =>
      [...element.querySelectorAll<HTMLElement>(':scope > section[data-placement="row"]')].map(
        ({ dataset }) => dataset.panelId,
      ),
    );
  // Three panels do not fit side by side at their minimum widths: the least recently active one
  // that is not active waits as a tab, and the others share the row without scrolling it.
  await expect.poll(inRow).toEqual(['review', 'retro']);
  await expect(log).toHaveText('plan minimized');
  await expect(row).not.toHaveAttribute('data-overflowing');
  await expect(scope.getByRole('button', { name: 'Show Plan light' })).toBeVisible();
  // Brought back, that panel is active, and the next least recently active one makes room.
  await scope.getByRole('button', { name: 'Show Plan light' }).click();
  await expect.poll(inRow).toEqual(['plan', 'retro']);
  await expect(log).toHaveText('plan minimized,plan open,review minimized');
  await expect(row).not.toHaveAttribute('data-overflowing');
  // With room for all three, the dock brings back the panel it minimized.
  await scope.evaluate((element) => (element.style.inlineSize = '80rem'));
  await expect.poll(inRow).toEqual(['plan', 'review', 'retro']);
  await expect(log).toHaveText('plan minimized,plan open,review minimized,review open');
});

test('a narrow panel puts its actions and window controls above a title that keeps its words', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const title = report.getByRole('heading', { name: 'Quarterly report' });
  const minimize = report.getByRole('button', { name: 'Minimize' });
  // With room, the title and the controls share the first row.
  const [wideTitle, wideControl] = await Promise.all([box(title), box(minimize)]);
  expect(Math.abs(wideTitle.y - wideControl.y)).toBeLessThan(8);
  // At its minimum width the title would keep less than 10 rem beside the five controls, so they
  // take a row of their own above it.
  await dock.frame.evaluate((element) => (element.style.inlineSize = '700px'));
  await page.getByRole('button', { name: 'Open document light' }).click();
  await expect.poll(async () => Math.round((await box(report)).width)).toBe(320);
  await expect
    .poll(async () => {
      const [narrowTitle, narrowControl] = await Promise.all([box(title), box(minimize)]);
      return narrowControl.y + narrowControl.height <= narrowTitle.y;
    })
    .toBe(true);
  // The controls stay at the inline end, and the title wraps between words.
  const [headerBox, closeBox] = await Promise.all([
    box(report.locator('.env-panel-dock-header')),
    box(report.getByRole('button', { name: 'Close', exact: true })),
  ]);
  expect(headerBox.x + headerBox.width - (closeBox.x + closeBox.width)).toBeCloseTo(12, 0);
  expect(
    await title.evaluate((heading) => {
      const text = heading.firstChild!;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, 'Quarterly'.length);
      return range.getClientRects().length;
    }),
  ).toBe(1);
  await expect(title).toHaveCSS('overflow-wrap', 'break-word');
});

test('a hairline sets the header apart once the content scrolls beneath it, in both themes', async ({
  page,
}) => {
  await page.goto(dockFixture);
  for (const theme of ['light', 'dark']) {
    const panel = dockOf(page, theme).panel('report');
    const content = panel.locator(':scope > .env-panel-dock-content');
    const header = panel.locator('.env-panel-dock-header');
    const border = await panel.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--env-elevation-2-border)';
      element.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(header).toHaveCSS('box-shadow', 'none');
    await content.evaluate((element) => (element.scrollTop = 40));
    await expect
      .poll(() => header.evaluate((element) => getComputedStyle(element).boxShadow))
      .toBe(`${border} 0px 1px 0px 0px`);
    await content.evaluate((element) => (element.scrollTop = 0));
    await expect(header).toHaveCSS('box-shadow', 'none');
  }
  // The hairline fades in, and with reduced motion appears at once.
  const header = dockOf(page).panel('report').locator('.env-panel-dock-header');
  await expect(header).toHaveCSS('transition-duration', '0.12s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(header).toHaveCSS('transition-duration', '0s');
});

test('a panel that opens fills a stacked dock, also after a tab showed another', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const loose = page.getByTestId('loose-dock-light');
  const panel = (id: string) => loose.locator(`section[data-panel-id="${id}"]`);
  await expect(loose.locator('.env-panel-dock')).toHaveAttribute('data-stacked', 'true');
  // Without an active panel, the newest fills the dock; a tab shows its own panel instead.
  await expect(panel('why')).toBeVisible();
  await loose.getByRole('button', { name: 'Show Ex light' }).click();
  await expect(panel('ex')).toBeVisible();
  await expect(panel('why')).toBeHidden();
  // A panel that opens afterwards fills the dock.
  await page.getByRole('button', { name: 'Open note light' }).click();
  await expect(panel('zed-2')).toBeVisible();
  await expect(panel('zed-2')).not.toHaveAttribute('inert');
  await expect(panel('ex')).toBeHidden();
  await expect(loose.getByRole('button', { name: 'Show Ex light' })).toBeVisible();
});

test('a tab pressed while panels sit side by side leaves the newest to fill the dock once it stacks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const loose = page.getByTestId('loose-dock-light');
  const dock = loose.locator('.env-panel-dock');
  const panel = (id: string) => loose.locator(`section[data-panel-id="${id}"]`);
  await loose.evaluate((element) => (element.style.inlineSize = '60rem'));
  await expect(dock).not.toHaveAttribute('data-stacked');
  // Ex comes back from its tab, then people work in Why.
  await panel('ex').getByRole('button', { name: 'Minimize' }).click();
  await loose.getByRole('button', { name: 'Show Ex light' }).click();
  await expect(panel('ex')).toHaveAttribute('data-placement', 'row');
  await panel('why').getByRole('textbox', { name: 'Words of Why light' }).click();
  await loose.evaluate((element) => (element.style.inlineSize = ''));
  await expect(dock).toHaveAttribute('data-stacked', 'true');
  await expect(panel('why')).toBeVisible();
  await expect(panel('ex')).toBeHidden();
});

/** The panels in a dock's row, in order. */
function rowOf(scope: Locator) {
  const row = scope.locator('.env-panel-dock > .env-panel-dock-row');
  return {
    row,
    ids: () =>
      row.evaluate((element) =>
        [...element.querySelectorAll<HTMLElement>(':scope > section[data-placement="row"]')].map(
          ({ dataset }) => dataset.panelId,
        ),
      ),
  };
}

/** Lets the dock measure itself and hear the application's answers for a few frames. */
function frames(page: Page, count = 3) {
  return page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        const next = (left: number) =>
          left === 0 ? resolve() : requestAnimationFrame(() => next(left - 1));
        next(count);
      }),
    count,
  );
}

test('a dock that minimizes asks for nothing while it stacks, also as it first shows', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('stacking-dock-light');
  await expect(scope.locator('.env-panel-dock')).toHaveAttribute('data-stacked', 'true');
  await frames(page);
  await expect(page.getByTestId('stacking-log-light')).toHaveText('');
  await expect(scope.locator('section[data-panel-id="three"]')).toBeVisible();
  // openLabel names the tabs' buttons.
  await expect(scope.getByRole('button', { name: 'Bring back One' })).toBeVisible();
});

test('a dock that minimizes never takes back the panel people brought back', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('protective-dock-light');
  const log = page.getByTestId('protective-log-light');
  const { row, ids } = rowOf(scope);
  // The row fits one panel. The application marks Alpha active and activates no other.
  await expect.poll(ids).toEqual(['alpha']);
  await scope.getByRole('button', { name: 'Show Beta' }).click();
  await expect.poll(ids).toEqual(['alpha', 'beta']);
  await frames(page);
  // Neither the active panel nor the one brought back makes room: the row scrolls instead.
  await expect(log).toHaveText('beta open');
  await expect.poll(ids).toEqual(['alpha', 'beta']);
  await expect(row).toHaveAttribute('data-overflowing', 'true');
  // Focus goes with the panel brought back.
  await expect(scope.locator('section[data-panel-id="beta"]')).toBeFocused();
});

test('a dock that minimizes leaves a lone panel wider than the row in it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('lone-dock-light');
  const { row, ids } = rowOf(scope);
  await expect(row).toHaveAttribute('data-overflowing', 'true');
  await frames(page);
  await expect(page.getByTestId('lone-log-light')).toHaveText('');
  expect(await ids()).toEqual(['solo']);
});

test('a dock that minimizes keeps its panels where minimizing them would not end the scrolling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('wide-dock-light');
  const { row, ids } = rowOf(scope);
  // The active panel alone is wider than the row, so the others stay and the row scrolls.
  await expect(row).toHaveAttribute('data-overflowing', 'true');
  await frames(page);
  await expect(page.getByTestId('wide-log-light')).toHaveText('');
  expect(await ids()).toEqual(['draft', 'outline', 'canvas']);
});

test('a dock that minimizes asks for nothing as the application narrows it until it stacks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('squeezed-dock-light');
  const log = page.getByTestId('squeezed-log-light');
  const { ids } = rowOf(scope);
  await expect.poll(ids).toEqual(['p0', 'p1']);
  // The application's own state narrows the region below stackBelow, as a sidebar opening does,
  // in the same update that renders the dock.
  await page.getByRole('button', { name: 'Narrow squeezed light' }).click();
  await expect(scope.locator('.env-panel-dock')).toHaveAttribute('data-stacked', 'true');
  await frames(page);
  await expect(log).toHaveText('');
});

test('a dock that minimizes leaves a panel the application opens again until the region resizes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('reopening-dock-light');
  const log = page.getByTestId('reopening-log-light');
  const { ids } = rowOf(scope);
  // The application opens each panel the dock minimized again itself: the dock asks once for each,
  // then leaves the row to scroll.
  const once = 'p0 minimized,p0 reopened,p1 minimized,p1 reopened';
  await expect(log).toHaveText(once);
  await frames(page, 10);
  await expect(log).toHaveText(once);
  expect(await ids()).toEqual(['p0', 'p1', 'p2']);
  // Once the region changes size, the dock asks again, once for each.
  await scope.evaluate((element) => (element.style.inlineSize = '50rem'));
  await expect(log).toHaveText(`${once},${once}`);
  await frames(page, 10);
  await expect(log).toHaveText(`${once},${once}`);
});

test('a dock that minimizes keeps the panel that holds focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('typing-dock-light');
  const log = page.getByTestId('typing-log-light');
  const { ids } = rowOf(scope);
  const field = scope.getByRole('textbox', { name: 'Notes of Draft' });
  await field.click();
  await page.keyboard.type('Hello');
  // The application opens notes while people type in the draft, as when messages arrive.
  await page.keyboard.press('Alt+KeyO');
  await expect.poll(ids).toEqual(['draft', 'note-1']);
  await page.keyboard.press('Alt+KeyO');
  await expect(log).toHaveText('note-1 minimized');
  await expect.poll(ids).toEqual(['draft', 'note-2']);
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('Hello');
});

test('a dock that minimizes asks for the next panel when the application keeps one open', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('keeping-dock-light');
  const log = page.getByTestId('keeping-log-light');
  const { row, ids } = rowOf(scope);
  // Asked once for the pinned panel, which the application keeps without an answer for 5 seconds,
  // the dock minimizes the next.
  await expect(log).toHaveText('pinned minimized');
  await expect(log).toHaveText('pinned minimized,inbox minimized', { timeout: 10_000 });
  await expect.poll(ids).toEqual(['pinned', 'today']);
  await expect(row).not.toHaveAttribute('data-overflowing');
  await frames(page);
  await expect(log).toHaveText('pinned minimized,inbox minimized');
  // So it does here.
  await expect(scope.getByRole('button', { name: 'Return to Inbox' })).toBeVisible();
});

test('a dock that minimizes never alternates between minimizing and opening a panel', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('wider-dock-light');
  const log = page.getByTestId('wider-log-light');
  const { ids } = rowOf(scope);
  // Open panels take 420 px at the least, minimized ones less: the panel minimized to make room
  // stays a tab, as it would not fit at its width while open.
  await expect.poll(ids).toEqual(['p1']);
  await frames(page);
  await expect(log).toHaveText('p0 minimized');
  await expect(scope.getByRole('button', { name: 'Show P0' })).toBeVisible();
  // Only a region wide enough for it brings it back.
  await scope.evaluate((element) => (element.style.inlineSize = '60rem'));
  await expect.poll(ids).toEqual(['p0', 'p1']);
  await frames(page);
  await expect(log).toHaveText('p0 minimized,p0 open');
  expect(errors).toEqual([]);
});

test('a dock that minimizes waits for an answer that comes later, as in a transition', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto(dockFixture);
  const scope = page.getByTestId('late-dock-light');
  const log = page.getByTestId('late-log-light');
  const { ids } = rowOf(scope);
  // The application answers a second later: the dock asks for nothing else meanwhile, and one
  // panel makes room.
  await expect.poll(ids).toEqual(['p1', 'p2']);
  await page.clock.runFor(500);
  await expect(log).toHaveText('p0 minimized');
  expect(await ids()).toEqual(['p1', 'p2']);
  // With room for it again, the panel comes back, also with an answer that comes later.
  await scope.evaluate((element) => (element.style.inlineSize = '88rem'));
  await expect.poll(ids).toEqual(['p0', 'p1', 'p2']);
  await expect(log).toHaveText('p0 minimized,p0 open');
});

test('a panel that closes while the dock awaits its answer leaves the others open', async ({
  page,
}) => {
  // The page's clock stands still until the test moves it, so the application's answer, a second
  // after the dock asks, comes only after the panel has closed, however long the steps take. An
  // installed clock still runs on its own; pausing it is what stops it.
  const start = Date.now();
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start + 1000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('late-dock-light');
  const log = page.getByTestId('late-log-light');
  const { ids } = rowOf(scope);
  const first = scope.locator('section[data-panel-id="p0"]');
  // Asked to minimize, the panel closes before the application answers.
  await expect(log).toHaveText('p0 minimized');
  await first.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(first).toHaveCount(0);
  // The answer comes and renders the dock again; it asks for nothing else.
  const commits = () => scope.evaluate((frame) => Number(frame.dataset.commits));
  const before = await commits();
  await page.clock.runFor(1500);
  await expect.poll(commits).toBeGreaterThan(before);
  await expect(log).toHaveText('p0 minimized');
  expect(await ids()).toEqual(['p1', 'p2']);
});

test('panels a dock minimized come back as the region widens, and those people minimized stay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const scope = page.getByTestId('minimizing-dock-light');
  const log = page.getByTestId('minimizing-log-light');
  const { row, ids } = rowOf(scope);
  const minimize = (id: string) =>
    scope
      .locator(`section[data-panel-id="${id}"]`)
      .getByRole('button', { name: 'Minimize' })
      .click();
  await expect.poll(ids).toEqual(['review', 'retro']);
  await expect(log).toHaveText('plan minimized');
  // Room that people free does not bring the panel back.
  await minimize('review');
  await expect.poll(ids).toEqual(['retro']);
  await frames(page);
  await expect(log).toHaveText('plan minimized,review minimized');
  // A wider region does, while the panel people minimized stays a tab, also where it would fit.
  await scope.evaluate((element) => (element.style.inlineSize = '80rem'));
  await expect.poll(ids).toEqual(['plan', 'retro']);
  await frames(page);
  await expect(log).toHaveText('plan minimized,review minimized,plan open');
  // Narrowed again, the least recently active panel makes room once more.
  await scope.getByRole('button', { name: 'Show Review light' }).click();
  await expect.poll(ids).toEqual(['plan', 'review', 'retro']);
  await scope.evaluate((element) => (element.style.inlineSize = ''));
  await expect.poll(ids).toEqual(['review', 'retro']);
  await expect(log).toHaveText(
    'plan minimized,review minimized,plan open,review open,plan minimized',
  );
  await expect(row).not.toHaveAttribute('data-overflowing');
});

test('the dock and its window controls take their names from EnvUIProvider, and a header can leave the controls out', async ({
  page,
}) => {
  await page.goto(dockFixture);
  const scope = page.getByTestId('translated-dock');
  const entwurf = scope.locator('section[data-panel-id="entwurf"]');
  const notizen = scope.locator('section[data-panel-id="notizen"]');
  for (const name of ['Minimieren', 'Maximieren', 'Schließen'])
    await expect(entwurf.getByRole('button', { name, exact: true })).toBeVisible();
  await expect(entwurf.getByRole('separator', { name: 'Größe von Entwurf ändern' })).toBeVisible();
  const tabs = scope.getByRole('list', { name: 'Ausgeblendete Bereiche' });
  await expect(tabs.getByRole('button', { name: 'Plan anzeigen' })).toBeVisible();
  await expect(tabs.getByRole('button', { name: 'Plan schließen' })).toBeVisible();
  // controls={false} leaves the window controls out and keeps the application's actions.
  await expect(notizen.getByRole('button', { name: 'Minimieren' })).toHaveCount(0);
  await expect(notizen.getByRole('button', { name: 'Notizen bearbeiten' })).toBeVisible();
  // The application's actions and the window controls are ghost buttons; the tab's close button is
  // a CloseButton.
  for (const button of [
    entwurf.getByRole('button', { name: 'Entwurf bearbeiten' }),
    entwurf.getByRole('button', { name: 'Minimieren' }),
    entwurf.getByRole('button', { name: 'Schließen', exact: true }),
    tabs.getByRole('button', { name: 'Plan schließen' }),
  ])
    await expect(button).toHaveAttribute('data-variant', 'ghost');
  // Maximize reads Restore in the provider's words once the panel fills the region.
  await entwurf.getByRole('button', { name: 'Maximieren' }).click();
  await expect(entwurf.getByRole('button', { name: 'Wiederherstellen' })).toBeVisible();
});
