import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';
import { fixtureUrl } from './Servers';

const tooltips = `${fixtureUrl}/?fixture=tooltips`;

const adoption = `${fixtureUrl}/?fixture=adoption`;

/** The axe violations of the menu and popover triggers and whatever popup is open. */
async function overlayViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .include('[data-testid="overlay-triggers"]')
    .include('[role="tooltip"], [role="menu"], [role="dialog"]')
    .analyze();
  return violations.map(({ id, nodes }) => `${id}: ${nodes.length}`);
}

test.describe('Tooltip', () => {
  test('describes a named control while open, and adds nothing that repeats its name', async ({
    page,
  }) => {
    await page.goto(tooltips);
    const archive = page.getByRole('button', { name: 'Archive', exact: true });
    await expect(archive).not.toHaveAttribute('aria-describedby');
    await archive.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Moves it out of the list');
    await expect(archive).toHaveAccessibleDescription('Moves it out of the list');
    await page.mouse.move(1, 1);
    await expect(tooltip).toHaveCount(0);
    await expect(archive).not.toHaveAttribute('aria-describedby');

    // A control named by mixed content counts as named, read from the page as the tooltip opens.
    const archiveAll = page.getByRole('button', { name: 'Archive A', exact: true });
    await archiveAll.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Moves every item out of the list');
    await expect(archiveAll).toHaveAccessibleDescription('Moves every item out of the list');
    await page.mouse.move(1, 1);
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    const remove = page.getByRole('button', { name: 'Delete' });
    await remove.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Delete');
    await expect(remove).not.toHaveAttribute('aria-describedby');
  });

  test('reads the name as assistive technology does, and follows it while open', async ({
    page,
  }) => {
    await page.goto(tooltips);
    // Text hidden from assistive technology is no part of the name the tooltip repeats.
    const exportButton = page.getByRole('button', { name: 'Export', exact: true });
    await exportButton.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Export');
    await expect(exportButton).not.toHaveAttribute('aria-describedby');
    await page.mouse.move(1, 1);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    // A name that changes with the tooltip while it is open still counts as its words.
    const copy = page.getByRole('button', { name: 'Copy link' });
    await copy.focus();
    await expect(page.getByRole('tooltip')).toHaveText('Copy link');
    await expect(copy).not.toHaveAttribute('aria-describedby');
    await page.keyboard.press('c');
    await expect(page.getByRole('tooltip')).toHaveText('Copied');
    const copied = page.getByRole('button', { name: 'Copied' });
    await expect(copied).toHaveAccessibleName('Copied');
    await expect(copied).not.toHaveAttribute('aria-describedby');
  });

  test("a disabled control's stand-in isn't read again on each render of the page", async ({
    page,
  }) => {
    await page.goto(tooltips);
    await expect(page.getByRole('button', { name: 'Pin', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Counts what starts watching the stand-ins of the disabled toggle and link.
    await page.evaluate(() => {
      const counts = { watched: 0 };
      (window as unknown as { standIns: typeof counts }).standIns = counts;
      const observe = MutationObserver.prototype.observe;
      MutationObserver.prototype.observe = function (target, options) {
        if (
          target instanceof Element &&
          target.closest(
            '.env-tooltip-disabled-target:is([aria-label="Pin"], [aria-label="Billing"])',
          )
        )
          counts.watched += 1;
        return observe.call(this, target, options);
      };
    });
    // Renders the whole page, the two disabled controls unchanged.
    await page.getByRole('button', { name: 'Toggle seats' }).click();
    await expect(page.getByRole('button', { name: 'Invite member' })).toBeEnabled();
    await page.getByRole('button', { name: 'Toggle seats' }).click();
    await expect(page.getByRole('button', { name: 'Invite member' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(
      await page.evaluate(() => (window as unknown as { standIns: { watched: number } }).standIns),
    ).toEqual({ watched: 0 });
    // The stand-in still follows its control's state.
    await page.getByRole('button', { name: 'Toggle pinned' }).click();
    await expect(page.getByRole('button', { name: 'Pin', exact: true })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('a disabled control is one named, disabled tab stop that opens its tooltip', async ({
    page,
  }) => {
    await page.goto(tooltips);
    const invite = page.getByRole('button', { name: 'Invite member' });
    // One control for assistive technology: the wrapper, which carries the name and the state.
    await expect(invite).toHaveCount(1);
    await expect(invite).toHaveClass('env-tooltip-disabled-target');
    await expect(invite).toHaveAttribute('aria-disabled', 'true');
    await expect(invite).toHaveAttribute('tabindex', '0');
    await invite.focus();
    await expect(page.getByRole('tooltip')).toHaveText('No seats left');
    await expect(invite).toHaveAccessibleDescription('No seats left');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    // The wrapper takes the role of what it wraps, such as a link.
    const billing = page.getByRole('link', { name: 'Billing' });
    await expect(billing).toHaveCount(1);
    await expect(billing).toHaveClass('env-tooltip-disabled-target');
    await expect(billing).toHaveAttribute('aria-disabled', 'true');

    // Enabled, the control itself is the trigger again.
    await page.getByRole('button', { name: 'Toggle seats' }).click();
    const enabled = page.getByRole('button', { name: 'Invite member' });
    await expect(enabled).toBeEnabled();
    await expect(enabled).not.toHaveClass(/env-tooltip-disabled-target/);
  });

  test('a disabled control named by mixed content keeps its name, with no render loop', async ({
    page,
  }) => {
    await page.goto(tooltips);
    // The stand-in hides the control it names; the name, read from the hidden control, stays.
    const archiveAll = page.getByRole('button', { name: 'Archive all B', exact: true });
    await expect(archiveAll).toHaveClass('env-tooltip-disabled-target');
    await expect(archiveAll).toHaveAttribute('aria-disabled', 'true');
    const mutations = await archiveAll.evaluate(
      (wrapper) =>
        new Promise<number>((resolve) => {
          let count = 0;
          const observer = new MutationObserver((records) => (count += records.length));
          observer.observe(wrapper, { attributes: true, subtree: true, childList: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(count);
          }, 500);
        }),
    );
    expect(mutations).toBeLessThan(10);
    await archiveAll.focus();
    await expect(page.getByRole('tooltip')).toHaveText('Nothing to archive');
    await expect(archiveAll).toHaveAccessibleDescription('Nothing to archive');
  });

  test('a hidden label that aria-labelledby references directly names the control', async ({
    page,
  }) => {
    await page.goto(tooltips);
    const rename = page.getByRole('button', { name: 'Rename file', exact: true });
    await rename.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Gives the file a new name');
    await expect(rename).toHaveAccessibleDescription('Gives the file a new name');
  });

  test('a disabled control keeps valid ARIA: a toggle keeps its state, a checkbox its own role', async ({
    page,
  }) => {
    await page.goto(tooltips);
    // A disabled toggle's wrapper stands in as the button, pressed, and follows its state.
    const pin = page.getByRole('button', { name: 'Pin', exact: true });
    await expect(pin).toHaveCount(1);
    await expect(pin).toHaveClass('env-tooltip-disabled-target');
    await expect(pin).toHaveAttribute('aria-disabled', 'true');
    await expect(pin).toHaveAttribute('aria-pressed', 'true');
    // With the wrappers rendered, none takes a role that needs a state it lacks, such as a
    // checkbox without aria-checked.
    const roles = await page
      .locator('.env-tooltip-disabled-target')
      .evaluateAll((wrappers) => wrappers.map((wrapper) => wrapper.getAttribute('role')));
    expect(roles.length).toBeGreaterThan(0);
    for (const role of roles) expect([null, 'button', 'link', 'tab', 'menuitem']).toContain(role);
    await page.getByRole('button', { name: 'Toggle pinned' }).click();
    await expect(pin).toHaveAttribute('aria-pressed', 'false');

    // A disabled checkbox has no stand-in: the checkbox itself stays exposed, checked and
    // disabled, and its wrapper is no tab stop.
    const notify = page.getByRole('checkbox', { name: 'Notify owners' });
    await expect(notify).toHaveCount(1);
    await expect(notify).toBeChecked();
    await expect(notify).toBeDisabled();
    const wrapper = page.locator('.env-tooltip-disabled-target', { has: notify });
    await expect(wrapper).not.toHaveAttribute('role');
    await expect(wrapper).not.toHaveAttribute('tabindex');
    await wrapper.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Owners are always notified');
  });

  test(
    'in right-to-left text, inline-end opens tooltips and popovers to the left of the trigger',
    { tag: '@engines' },
    async ({ page }) => {
      await page.goto(tooltips);
      const forward = page.getByRole('button', { name: 'Forward' });
      await forward.hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toHaveText('Next step');
      await expect(tooltip.locator('xpath=ancestor::*[@dir][1]')).toHaveAttribute('dir', 'rtl');
      await expect
        .poll(async () => {
          const [popup, trigger] = [(await tooltip.boundingBox())!, (await forward.boundingBox())!];
          return popup.x + popup.width <= trigger.x + 1;
        })
        .toBe(true);
      await page.mouse.move(1, 1);

      const details = page.getByRole('button', { name: 'Details rtl' });
      await details.click();
      const popover = page.getByRole('dialog', { name: 'Step details' });
      await expect(popover).toBeVisible();
      await expect
        .poll(async () => {
          const [popup, trigger] = [(await popover.boundingBox())!, (await details.boundingBox())!];
          return popup.x + popup.width <= trigger.x + 1;
        })
        .toBe(true);
    },
  );

  test('a Kbd in a tooltip takes key caps for its dark fill', async ({ page }) => {
    await page.goto(tooltips);
    await page.getByRole('button', { name: 'Save' }).hover();
    // popupClassName reaches the popup.
    const tooltip = page.locator('[role="tooltip"].fixture-shortcut-tooltip');
    await expect(tooltip).toBeVisible();
    const colors = await tooltip.evaluate((element) => {
      const key = element.querySelector('.env-kbd')!;
      return {
        tooltip: getComputedStyle(element).color,
        key: getComputedStyle(key).color,
        keyFill: getComputedStyle(key).backgroundColor,
      };
    });
    // The key's label is the tooltip's own light text, on no fill of its own.
    expect(colors.key).toBe(colors.tooltip);
    expect(colors.keyFill).toBe('rgba(0, 0, 0, 0)');
  });

  test('names an icon-only menu trigger, which keeps its menu, ARIA and focus', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(tooltips);
    const more = page.getByRole('button', { name: 'More actions' });
    const menu = page.getByRole('menu', { name: 'Row actions' });
    const tooltip = page.getByRole('tooltip');
    const counts = page.getByTestId('overlay-counts');
    // The menu button's props and ref reach the button through the Tooltip.
    await expect(more).toHaveAttribute('aria-haspopup', 'menu');
    await expect(more).not.toHaveAttribute('aria-expanded', 'true');

    // Hover: the tooltip shows the button's name, so it describes nothing.
    await more.hover();
    await expect(tooltip).toHaveText('More actions');
    await expect(more).not.toHaveAttribute('aria-describedby');
    expect(await overlayViolations(page)).toEqual([]);

    // A press opens the menu once and closes the tooltip, which stays closed while the menu is open.
    await more.click();
    await expect(menu).toBeVisible();
    await expect(tooltip).toHaveCount(0);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(more).toHaveAttribute('aria-controls', (await menu.getAttribute('id'))!);
    await expect(counts).toHaveText('1 presses, 1 menu opens, 0 popover opens');
    // The menu opens beside the button, which the Tooltip's ref reached.
    const [button, popup] = [(await more.boundingBox())!, (await menu.boundingBox())!];
    expect(popup.y).toBeGreaterThanOrEqual(button.y + button.height - 1);
    expect(await overlayViolations(page)).toEqual([]);
    // The pointer leaving and coming back onto the button opens no tooltip while the menu is open:
    // past the tooltip's delay of 0 and its opening animation, it still hasn't opened.
    await page.mouse.move(1, 1);
    await more.hover();
    await page.clock.runFor(300);
    await expect(menu).toBeVisible();
    await expect(tooltip).toHaveCount(0);

    // Esc closes the menu first and returns focus to the button, which opens no tooltip: one Esc.
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(more).toBeFocused();
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await page.clock.runFor(300);
    await expect(tooltip).toHaveCount(0);
    // The pointer coming back onto the button opens it again.
    await page.mouse.move(1, 1);
    await more.hover();
    await expect(tooltip).toHaveText('More actions');
    await page.mouse.move(1, 1);
    await expect(tooltip).toHaveCount(0);

    // Keyboard: focus opens the tooltip at once; Enter opens the menu in its place, Esc closes the
    // menu and focus returns to the button.
    await page.getByRole('button', { name: 'Filters' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(more).toBeFocused();
    // The Filters tooltip may still be fading out.
    await expect(page.getByRole('tooltip', { name: 'More actions' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeFocused();
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(more).toBeFocused();
    await expect(counts).toHaveText('2 presses, 2 menu opens, 0 popover opens');
  });

  test('around a popover, describes its named icon-only trigger, which keeps its popover', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(tooltips);
    const filters = page.getByRole('button', { name: 'Filters' });
    const popover = page.getByRole('dialog', { name: 'Filters' });
    const tooltip = page.getByRole('tooltip');
    await expect(filters).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(filters).toHaveAttribute('aria-expanded', 'false');

    // Its own name stays; the tooltip describes it while open.
    await filters.hover();
    await expect(tooltip).toHaveText('Show only some items');
    await expect(filters).toHaveAccessibleName('Filters');
    await expect(filters).toHaveAccessibleDescription('Show only some items');
    expect(await overlayViolations(page)).toEqual([]);

    await filters.click();
    await expect(popover).toBeVisible();
    await expect(tooltip).toHaveCount(0);
    await expect(filters).toHaveAttribute('aria-expanded', 'true');
    await expect(filters).toHaveAttribute('aria-controls', (await popover.getAttribute('id'))!);
    await expect(page.getByTestId('overlay-counts')).toHaveText(
      '0 presses, 0 menu opens, 1 popover opens',
    );
    await expect(popover.getByRole('button', { name: 'Only open items' })).toBeFocused();
    expect(await overlayViolations(page)).toEqual([]);
    // The pointer leaving and coming back onto the button opens no tooltip while the popover is
    // open: past the tooltip's delay of 0 and its opening animation, it still hasn't opened.
    await page.mouse.move(1, 1);
    await filters.hover();
    await page.clock.runFor(300);
    await expect(popover).toBeVisible();
    await expect(tooltip).toHaveCount(0);

    // Esc closes the popover first and returns focus to the button, which opens no tooltip.
    await page.keyboard.press('Escape');
    await expect(popover).toHaveCount(0);
    await expect(filters).toBeFocused();
    await expect(filters).toHaveAttribute('aria-expanded', 'false');
    await page.clock.runFor(300);
    await expect(tooltip).toHaveCount(0);

    // Focus from the keyboard opens the tooltip; Enter opens the popover in its place.
    await page.mouse.move(1, 1);
    await page.getByRole('button', { name: 'More actions' }).focus();
    await page.keyboard.press('Tab');
    await expect(filters).toBeFocused();
    // The More actions tooltip may still be fading out.
    await expect(page.getByRole('tooltip', { name: 'Show only some items' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(popover).toBeVisible();
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(popover).toHaveCount(0);
    await expect(filters).toBeFocused();
  });

  test('once a click outside closes the popover and moves focus away, focus on its trigger opens the tooltip', async ({
    page,
  }) => {
    await page.goto(tooltips);
    const filters = page.getByRole('button', { name: 'Filters' });
    const archive = page.getByRole('button', { name: 'Archive', exact: true });
    await filters.click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await archive.click();
    await expect(page.getByRole('dialog', { name: 'Filters' })).toHaveCount(0);
    // WebKit doesn't focus a button it clicks, and returns focus to the trigger instead.
    await archive.evaluate((element) => element.focus());
    await page.mouse.move(1, 1);
    // Focus from code, as an application gives it, rather than the popover's returning focus.
    await filters.evaluate((element) => element.focus({ focusVisible: true } as FocusOptions));
    await expect(page.getByRole('tooltip', { name: 'Show only some items' })).toBeVisible();
  });

  test('around a HoverCard, or as its trigger, shows no tooltip but the card', async ({ page }) => {
    await page.clock.install();
    await page.goto(`${tooltips}&warnings`);
    const tooltip = page.getByRole('tooltip');
    for (const [name, card] of [
      ['Ada Lovelace', 'Ada card'],
      ['Alan Turing', 'Alan card'],
    ]) {
      await page.getByRole('link', { name }).hover();
      await expect(page.getByText(card)).toBeVisible();
      // Past the tooltip's delay of 0 and its opening animation, it still hasn't opened.
      await page.clock.runFor(300);
      await expect(tooltip).toHaveCount(0);
      await page.mouse.move(1, 1);
      await expect(page.getByText(card)).toHaveCount(0);
    }
  });

  test("describes a control of the application's own that takes a trigger prop", async ({
    page,
  }) => {
    await page.goto(tooltips);
    const badge = page.getByRole('button', { name: 'Badge button' });
    await badge.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Shows the badge');
    await expect(badge).toHaveAccessibleDescription('Shows the badge');
  });

  test('says while developing when its child takes no props or ref', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`${tooltips}&warnings`);
    await expect(page.getByText('Plain text')).toBeVisible();
    await expect(page.getByRole('button', { name: 'In a fragment' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ref-less' })).toBeVisible();
    await expect
      .poll(() => errors.filter((error) => error.startsWith('envUI: A Tooltip')).length)
      .toBe(4);
    const reports = errors.join(' ');
    expect(reports).toContain('it got string');
    expect(reports).toContain('it got a Fragment');
    expect(reports).toContain("child, RefLessButton, doesn't pass the ref");
    expect(reports).toContain('around a HoverCard');
  });

  test('Tooltip keeps opening on hover after its control is enabled or disabled', async ({
    page,
  }) => {
    await page.goto(adoption);
    const invite = page.getByRole('button', { name: 'Invite member' });
    const toggle = page.getByRole('button', { name: 'Toggle seats' });
    await toggle.click();
    await expect(invite).toBeDisabled();
    // Disabled, the control is the wrapper that carries its name and reports it disabled.
    await expect(invite).toHaveClass('env-tooltip-disabled-target');
    await invite.hover();
    await expect(page.locator('.env-tooltip')).toHaveText('No seats left');
    await page.mouse.move(1, 1);
    await expect(page.locator('.env-tooltip')).toHaveCount(0);
    // Enabled again, the control itself is the trigger, and hovering it opens the tooltip.
    await toggle.click();
    await expect(invite).toBeEnabled();
    await invite.hover();
    await expect(page.locator('.env-tooltip')).toHaveText('Invite a member');
  });

  test('a tooltip stays open while the pointer moves onto it', async ({ page }) => {
    await page.clock.install();
    await page.goto(tooltips);
    const item = page.getByRole('button', { name: 'Archive', exact: true });
    const tooltip = page.locator('.env-tooltip');
    await item.hover();
    await expect(tooltip).toHaveText('Moves it out of the list');
    await expect(page.locator('.env-tooltip-positioner')).not.toHaveCSS('pointer-events', 'none');
    // Hovering the tooltip itself keeps it, so its text can be read or magnified (WCAG 1.4.13).
    const box = (await tooltip.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await page.clock.runFor(600);
    await expect(tooltip).toHaveText('Moves it out of the list');
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  });

  test.describe('on a touch screen', () => {
    test.use({ hasTouch: true });

    test(
      'a tap opens the menu or popover and no tooltip',
      { tag: '@engines' },
      async ({ page }) => {
        await page.clock.install();
        await page.goto(tooltips);
        const tooltip = page.getByRole('tooltip');
        await page.getByRole('button', { name: 'More actions' }).tap();
        await expect(page.getByRole('menu', { name: 'Row actions' })).toBeVisible();
        await expect(page.getByTestId('overlay-counts')).toHaveText(
          '1 presses, 1 menu opens, 0 popover opens',
        );
        await expect(tooltip).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toHaveCount(0);

        await page.getByRole('button', { name: 'Filters' }).tap();
        await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
        // Past the tooltip's delay of 0 and its opening animation, it still hasn't opened.
        await page.clock.runFor(300);
        await expect(tooltip).toHaveCount(0);
      },
    );
  });
});

test('a text trigger takes a quiet dotted underline, a button trigger none', async ({ page }) => {
  await page.goto(tooltips);
  const text = page.getByTestId('tooltip-text-trigger');
  await expect(text).toHaveClass(/\benv-hover-detail\b/);
  const style = await text.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      line: computed.textDecorationLine,
      decoration: computed.textDecorationStyle,
      cursor: computed.cursor,
    };
  });
  expect(style).toMatchObject({ line: 'underline', decoration: 'dotted' });
  expect(style.cursor).not.toBe('help');
  await text.focus();
  await expect(page.getByRole('tooltip')).toHaveText('Central European Time');

  const button = page.getByRole('button', { name: 'Archive', exact: true });
  await expect(button).not.toHaveClass(/\benv-hover-detail\b/);
  expect(await button.evaluate((element) => getComputedStyle(element).textDecorationLine)).toBe(
    'none',
  );
});
