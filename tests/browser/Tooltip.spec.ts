import { test, expect } from '@playwright/test';
import { fixtureUrl } from './Servers';

const tooltips = `${fixtureUrl}/?fixture=tooltips`;

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

  test('in right-to-left text, inline-end opens tooltips and popovers to the left of the trigger', async ({
    page,
  }) => {
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
  });

  test('a Kbd in a tooltip takes key caps for its dark fill', async ({ page }) => {
    await page.goto(tooltips);
    await page.getByRole('button', { name: 'Save' }).hover();
    const tooltip = page.getByTestId('shortcut-tooltip');
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
});
