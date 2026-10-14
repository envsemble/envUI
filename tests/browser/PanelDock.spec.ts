import { test, expect, type Locator, type Page } from '@playwright/test';
import { catalogueUrl, fixtureUrl } from './Servers';

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
    chips: root.getByRole('list', { name: 'Hidden panels' }),
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
  test('panels open side by side, minimize to chips, maximize, restore and close', async ({
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
    // on the strip of chips along the bottom.
    const frameBox = await dock.frame.evaluate((element) =>
      element.getBoundingClientRect().toJSON(),
    );
    const rootBox = await box(dock.root);
    expect(rootBox.x).toBeCloseTo(frameBox.x + 1, 0);
    expect(rootBox.width).toBeCloseTo(frameBox.width - 2, 0);
    expect(rootBox.height).toBeCloseTo(frameBox.height - 2, 0);
    const reportBox = await box(report);
    const notesBox = await box(notes);
    const stripBox = await box(dock.chips);
    expect(notesBox.x - (reportBox.x + reportBox.width)).toBeCloseTo(8, 0);
    expect(rootBox.x + rootBox.width - (notesBox.x + notesBox.width)).toBeCloseTo(24, 0);
    expect(reportBox.y + reportBox.height).toBeCloseTo(stripBox.y, 0);
    expect(notesBox.y + notesBox.height).toBeCloseTo(stripBox.y, 0);
    expect(stripBox.y + stripBox.height).toBeCloseTo(rootBox.y + rootBox.height, 0);

    // A minimized panel is a chip with its label, an attention dot described for assistive
    // technology, a tooltip and a close button.
    await expect(dock.chips.getByRole('listitem')).toHaveCount(1);
    const budget = dock.chips.getByRole('button', { name: 'Show Budget', exact: true });
    await expect(budget).toHaveText('Budget');
    await expect(budget).toHaveAccessibleDescription('Unsaved changes');
    await expect(dock.chips.locator('li[data-panel-id="budget"]')).toHaveAttribute(
      'data-attention',
      'true',
    );
    await expect(dock.chips.getByRole('button', { name: 'Close Budget' })).toBeVisible();
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
    await expect(dock.chips.getByRole('button')).toHaveText(['Meeting notes', '', 'Budget', '']);
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
    expect(filled.y + filled.height).toBeCloseTo((await box(dock.chips)).y, 0);
    // A maximized panel has no resize handle, and its toggle restores it.
    await expect(report.getByRole('separator')).toHaveCount(0);
    await report.getByRole('button', { name: 'Restore', exact: true }).click();
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(dock.root).not.toHaveAttribute('data-filled');
    await expect(report.getByRole('separator')).toHaveCount(1);

    // A chip brings its panel back to the row and activates it.
    await dock.chips.getByRole('button', { name: 'Show Meeting notes' }).click();
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
    await dock.chips.getByRole('button', { name: 'Close Budget' }).click();
    await expect.poll(() => logOf(page)).toContain('close budget');
    await expect(dock.chips).toHaveCount(0);
    await expect(dock.root).not.toHaveAttribute('data-chips');

    // The page beneath stays usable around the panels.
    await page.getByRole('button', { name: 'Page action light' }).click();
    await expect.poll(() => lastLog(page)).toBe('page');
    expect(errors).toEqual([]);
  });

  test('content keeps its draft, focus and scroll positions through modes and reorders', async ({
    page,
  }) => {
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

    // Minimizing hands focus to the chip; the chip brings the panel back to the draft.
    await page.keyboard.press('Alt+KeyM');
    const chip = dock.chips.getByRole('button', { name: 'Show Quarterly report' });
    await expect(chip).toBeFocused();
    await expect(report).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(report).toBeVisible();
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue('Unsent changes');
    expect(await scrolls()).toEqual([120, 60]);

    // Focus in a menu the panel opened moves to the chip too when the panel is minimized; the menu
    // closes with Escape, and focus returns to the menu's trigger with the panel.
    const more = report.getByRole('button', { name: 'More actions for Quarterly report light' });
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Share' })).toBeFocused();
    await page.keyboard.press('Alt+KeyM');
    await expect(chip).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(chip).toBeFocused();
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
    await dock.chips.getByRole('button', { name: 'Show Quarterly report' }).click();
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(draft).toHaveValue('Unsent changes and more');
    await expect(draft).toBeFocused();
    await expect(mounts).toHaveText('report:1 notes:1 budget:1');
    expect(errors).toEqual([]);
  });

  test('the top edge resizes a panel with the pointer and the keyboard', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const handle = report.getByRole('separator', { name: 'Resize Quarterly report' });
    await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(handle).toHaveAttribute('tabindex', '0');
    await expect(handle).toHaveAttribute('aria-controls', (await report.getAttribute('id'))!);
    // Without a height of its own, a panel takes 85% of the room above the chips.
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
    // The room is the dock's height above the chips, less the gutter for shadows.
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
  });

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
    // The active panel fills the region above the chips; the other open panel waits as a chip.
    const rootBox = await box(dock.root);
    const sheet = await box(notes);
    expect(sheet.x).toBeCloseTo(rootBox.x, 0);
    expect(sheet.y).toBeCloseTo(rootBox.y, 0);
    expect(sheet.width).toBeCloseTo(rootBox.width, 0);
    expect(sheet.y + sheet.height).toBeCloseTo((await box(dock.chips)).y, 0);
    await expect(report).toBeHidden();
    await expect(report).toHaveAttribute('data-mode', 'open');
    await expect(dock.chips.getByRole('button', { name: /^Show/ })).toHaveText([
      'Quarterly report',
      'Budget',
    ]);
    // A sheet already fills the region: no Maximize, and no resize handle.
    await expect(notes.getByRole('button', { name: 'Maximize' })).toHaveCount(0);
    await expect(notes.getByRole('button', { name: 'Minimize' })).toBeVisible();
    await expect(notes.getByRole('separator')).toHaveCount(0);
    // While a panel covers the region, the page beneath takes no presses.
    const action = await box(page.getByRole('button', { name: 'Page action light' }));
    expect(
      await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('.env-panel-dock') !== null,
        { x: action.x + action.width / 2, y: action.y + action.height / 2 },
      ),
    ).toBe(true);

    // Another panel's chip brings it across the region and focus into it.
    await dock.chips.getByRole('button', { name: 'Show Quarterly report' }).click();
    await expect(report).toBeVisible();
    await expect(notes).toBeHidden();
    await expect.poll(() => lastLog(page)).toBe('activate report');
    await expect
      .poll(() => report.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    // Minimizing the shown panel shows the one before it.
    await report.getByRole('button', { name: 'Minimize' }).click();
    await expect(notes).toBeVisible();
    await expect(dock.chips.getByRole('button', { name: 'Show Quarterly report' })).toBeFocused();

    // A newly opened panel takes the region; chips that overflow their strip scroll sideways with a
    // vertical wheel.
    await page.getByRole('button', { name: 'Open document light' }).click();
    await page.getByRole('button', { name: 'Open document light' }).click();
    await expect(dock.root.getByRole('region', { name: 'Release checklist 2' })).toBeVisible();
    await expect
      .poll(() => dock.chips.evaluate((element) => element.scrollWidth > element.clientWidth))
      .toBe(true);
    const chip = await box(dock.chips.getByRole('listitem').first());
    await page.mouse.move(chip.x + chip.width / 2, chip.y + chip.height / 2);
    await page.mouse.wheel(0, 120);
    await expect
      .poll(() => dock.chips.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await dock.chips.getByRole('button', { name: 'Close Roadmap 1' }).click();
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

    // Enter on Minimize hands focus to the chip; Enter there brings the panel back.
    await page.keyboard.press('Shift+Tab');
    await expect(report.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(minimize).toBeFocused();
    await page.keyboard.press('Enter');
    const chip = dock.chips.getByRole('button', { name: 'Show Quarterly report' });
    await expect(chip).toBeFocused();
    await expect(chip).toHaveCSS('outline-style', 'solid');
    // The chip's close button follows it.
    await page.keyboard.press('Tab');
    await expect(dock.chips.getByRole('button', { name: 'Close Quarterly report' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Space');
    await expect(report).toBeVisible();
    // Focus returns to the content that last had it, not to the control that minimized it.
    await expect(
      report.getByRole('textbox', { name: 'Draft of Quarterly report light' }),
    ).toBeFocused();

    // Closing a chip moves focus to the chip in its place.
    await dock.chips.getByRole('button', { name: 'Close Budget' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => lastLog(page)).toBe('close budget');
    await expect(dock.chips).toHaveCount(0);
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

  test('panels take the dialog surface and chips the popup surface in both themes', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const backgrounds = new Set<string>();
    for (const theme of ['light', 'dark']) {
      const dock = dockOf(page, theme);
      const panel = dock.panel('report');
      const tokens = await panel.evaluate((element) => {
        const probe = document.createElement('span');
        element.append(probe);
        const resolve = (value: string) => {
          probe.style.color = value;
          return getComputedStyle(probe).color;
        };
        const result = {
          dialog: resolve('var(--color-dialog)'),
          border: resolve('var(--color-popup-border)'),
          popup: resolve('var(--color-popup)'),
          text: resolve('var(--color-text-primary)'),
          muted: resolve('var(--color-text-muted)'),
          icon: resolve('var(--color-icon)'),
          canvas: resolve('var(--color-canvas)'),
        };
        probe.remove();
        return result;
      });
      const style = (locator: Locator, property: string) =>
        locator.evaluate(
          (element, name) => getComputedStyle(element).getPropertyValue(name),
          property,
        );
      expect(await style(panel, 'background-color')).toBe(tokens.dialog);
      expect(await style(panel, 'border-top-color')).toBe(tokens.border);
      expect(await style(panel, 'border-top-width')).toBe('1px');
      expect(await style(panel, 'border-bottom-width')).toBe('0px');
      expect(await style(panel, 'border-top-left-radius')).toBe('28px');
      expect(await style(panel, 'border-bottom-left-radius')).toBe('0px');
      expect(await style(panel, 'box-shadow')).not.toBe('none');
      const header = panel.locator('.env-panel-dock-header');
      expect(await style(header, 'background-color')).toBe(tokens.dialog);
      expect(await style(header, 'position')).toBe('sticky');
      expect(await style(panel.getByRole('heading', { level: 2 }), 'color')).toBe(tokens.text);
      expect(await style(panel.getByText(`Edited by Alex Morgan · ${theme}`), 'color')).toBe(
        tokens.muted,
      );
      const minimize = panel.getByRole('button', { name: 'Minimize' });
      expect(await style(minimize, 'color')).toBe(tokens.icon);
      expect((await box(minimize)).height).toBeCloseTo(32, 0);
      const chip = dock.chips.getByRole('listitem');
      expect(await style(chip, 'background-color')).toBe(tokens.popup);
      expect(await style(chip, 'border-top-color')).toBe(tokens.border);
      expect(await style(dock.chips.getByRole('button', { name: 'Show Budget' }), 'color')).toBe(
        tokens.text,
      );
      // A filling panel covers the page with the canvas around the chips.
      await panel.getByRole('button', { name: 'Maximize' }).click();
      await expect(dock.root).toHaveCSS('background-color', tokens.canvas);
      await panel.getByRole('button', { name: 'Restore', exact: true }).click();
      backgrounds.add(tokens.dialog);
    }
    expect(backgrounds.size).toBe(2);
  });

  test('a right-to-left dock mirrors to its inline end', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(dockFixture);
    const dock = dockOf(page);
    await dock.frame.evaluate((element) => element.setAttribute('dir', 'rtl'));
    const rootBox = await box(dock.root);
    const report = await box(dock.panel('report'));
    const notes = await box(dock.panel('notes'));
    const chip = await box(dock.chips.getByRole('listitem'));
    expect(notes.x + notes.width).toBeLessThanOrEqual(report.x);
    expect(notes.x - rootBox.x).toBeCloseTo(24, 0);
    expect(chip.x - rootBox.x).toBeCloseTo(24, 0);
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
    const handle = dock.panel('report').getByRole('separator');
    const height = Number(await handle.getAttribute('aria-valuenow'));
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    await expect(handle).toHaveAttribute('aria-valuenow', String(height - 16));
  });

  test('coarse pointers get a taller resize band and touch-sized controls', async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Only one engine emulates touch with a coarse pointer.');
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
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
    await expect(report.getByRole('button', { name: 'Minimize' })).toHaveCSS('height', '44px');
    await expect(dock.chips.getByRole('listitem')).toHaveCSS('height', '44px');
    await expect(dock.chips.getByRole('button', { name: 'Close Budget' })).toHaveCSS(
      'width',
      '32px',
    );
    await context.close();
  });

  test('panels rise into place, and only fade with reduced motion', async ({ page }) => {
    await page.goto(dockFixture);
    const dock = dockOf(page);
    const report = dock.panel('report');
    const animation = (locator: Locator) =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.animationName, style.animationDuration];
      });
    expect(await animation(report)).toEqual(['env-panel-dock-rise', '0.24s']);
    await report.getByRole('button', { name: 'Maximize' }).click();
    expect(await animation(report)).toEqual(['env-panel-dock-grow', '0.24s']);
    await report.getByRole('button', { name: 'Minimize' }).click();
    const chip = dock.chips.locator('li[data-panel-id="report"]');
    expect(await animation(chip)).toEqual(['env-panel-dock-chip-rise', '0.16s']);
    // A panel brought back starts its entrance again.
    const started = await chip.getByRole('button', { name: 'Show Quarterly report' }).evaluate(
      (button) =>
        new Promise<string[]>((resolve) => {
          const panel = document.querySelector<HTMLElement>(
            '[data-testid="dock-region-light"] section[data-panel-id="report"]',
          )!;
          button.click();
          requestAnimationFrame(() =>
            resolve(
              panel.getAnimations().map((running) => (running as CSSAnimation).animationName),
            ),
          );
        }),
    );
    expect(started).toEqual(['env-panel-dock-rise']);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await animation(report)).toEqual(['env-motion-fade-in', '0.16s']);
    await report.getByRole('button', { name: 'Maximize' }).click();
    expect(await animation(report)).toEqual(['env-panel-dock-fade-in', '0.16s']);
    await report.getByRole('button', { name: 'Minimize' }).click();
    expect(await animation(chip)).toEqual(['env-motion-fade-in', '0.16s']);
  });
});

test('the catalogue shows open, minimized and maximized panels whose drafts survive', async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${catalogueUrl}/#/components/panel-dock/preview`);
  const examples = page.locator('.docs-preview .docs-example');
  const docked = examples.filter({ has: page.getByRole('heading', { name: 'Docked panels' }) });
  const maximized = examples.filter({
    has: page.getByRole('heading', { name: 'Maximized panel' }),
  });
  const report = docked.getByRole('region', { name: 'Quarterly report' });
  await expect(report).toHaveAttribute('data-mode', 'open');
  await expect(docked.getByRole('region', { name: 'Meeting notes' })).toHaveAttribute(
    'data-mode',
    'open',
  );
  await expect(docked.getByRole('button', { name: 'Show Budget' })).toHaveAccessibleDescription(
    'Unsaved changes',
  );
  await expect(maximized.getByRole('region', { name: 'Quarterly report' })).toHaveAttribute(
    'data-mode',
    'maximized',
  );
  await expect(maximized.getByRole('region', { name: 'Meeting notes' })).toHaveAttribute(
    'data-mode',
    'open',
  );

  // A draft survives minimizing, maximizing and restoring its panel, and a theme change.
  const draft = report.getByRole('textbox', { name: 'Draft' });
  await draft.fill('Ask for the regional numbers.');
  await report.getByRole('button', { name: 'Minimize' }).click();
  const chip = docked.getByRole('button', { name: 'Show Quarterly report' });
  await expect(chip).toHaveAccessibleDescription('Unsaved changes');
  await chip.click();
  await report.getByRole('button', { name: 'Maximize' }).click();
  await expect(report).toHaveAttribute('data-mode', 'maximized');
  await report.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(report).toHaveAttribute('data-mode', 'open');
  await expect(draft).toHaveValue('Ask for the regional numbers.');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(draft).toHaveValue('Ask for the regional numbers.');

  // A narrow region stacks the dock.
  await docked.getByRole('button', { name: 'Narrow region' }).click();
  await expect(docked.locator('.env-panel-dock')).toHaveAttribute('data-stacked', 'true');
  await expect(draft).toHaveValue('Ask for the regional numbers.');
  expect(errors).toEqual([]);
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
  // Focus in the panel still moves to its chip.
  await dock.chips.getByRole('button', { name: 'Show Quarterly report' }).click();
  await report.getByRole('textbox', { name: 'Draft of Quarterly report light' }).focus();
  await page.keyboard.press('Alt+KeyM');
  await expect(dock.chips.getByRole('button', { name: 'Show Quarterly report' })).toBeFocused();
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

test('a control that takes focus beneath the sticky header comes out below it', async ({
  page,
}) => {
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
  expect(tipBefore.y + tipBefore.height).toBeLessThanOrEqual(headerBefore.y + headerBefore.height);
  await tip.focus();
  const [headerBox, tipBox] = await Promise.all([box(header), box(tip)]);
  expect(tipBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
});

test('a panel brought back shows the element its focus returns to', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const content = report.locator(':scope > .env-panel-dock-content');
  const header = report.locator('.env-panel-dock-header');
  const draft = report.getByRole('textbox', { name: 'Draft of Quarterly report light' });
  const chip = dock.chips.getByRole('button', { name: 'Show Quarterly report' });
  // The content scrolls on, leaving the focused draft out of sight.
  await draft.focus();
  await content.evaluate((element) => (element.scrollTop = element.scrollHeight));
  await page.keyboard.press('Alt+KeyM');
  await expect(chip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(draft).toBeFocused();
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
  await expect(chip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(draft).toBeFocused();
  expect(await content.evaluate((element) => element.scrollTop)).toBe(100);
});

test('open panels leave the controls of a maximized one in view after the dock stacks and widens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(dockFixture);
  const dock = dockOf(page);
  const report = dock.panel('report');
  const notes = dock.panel('notes');
  // The room of an open panel is the dock's height above the chips, below the row's padding.
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
  await expect(chat.getByRole('listitem')).toHaveCount(5);
  await expect.poll(atNewest).toBeLessThanOrEqual(1);
  expect(await list.evaluate((element) => element.scrollTop)).toBe(60);
});

test('a stacked dock shows the panel of a chip pressed, also without onActivate', async ({
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
