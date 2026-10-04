import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:8766');
});

test('HEX drafts validate, normalize and recover without committing invalid colors', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`color-picker-${theme}`);
    const picker = scope.getByRole('group', { name: 'Controlled color', exact: true });
    const field = picker.getByRole('textbox', { name: 'Controlled color HEX' });
    await field.fill('FFAA00');
    await expect(field).toHaveValue('#ffaa00');
    await expect(scope.getByTestId('color-changes')).toHaveText('1');
    await field.fill('#12');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(picker.getByRole('status')).toContainText('Use six hexadecimal digits');
    const description = await field.getAttribute('aria-describedby');
    expect(description).toContain('-error');
    expect(await field.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
    await expect(scope.getByTestId('color-changes')).toHaveText('1');
    await picker.getByRole('slider', { name: 'Hue', exact: true }).focus();
    await expect(field).toHaveValue('#ffaa00');
    await expect(field).not.toHaveAttribute('aria-invalid', 'true');
    await expect(picker.getByRole('status')).toContainText('previous color has been restored');
    await field.fill('');
    expect(await field.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
    await scope.getByRole('button', { name: 'Replace selected color' }).click();
    await expect(field).toHaveValue('#ff0000');
    await expect(scope.getByTestId('color-changes')).toHaveText('1');
  }
});

test('color-area and hue controls support keyboard and pointer interaction with visible focus', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const picker = page
      .getByTestId(`color-picker-${theme}`)
      .getByRole('group', { name: 'Controlled color', exact: true });
    const field = picker.getByRole('textbox');
    const hue = picker.getByRole('slider', { name: 'Hue', exact: true });
    await hue.focus();
    await hue.press('ArrowRight');
    await expect(field).not.toHaveValue('#1a73e8');
    const focus = await hue.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, color: style.outlineColor };
    });
    expect(parseFloat(focus.width)).toBeGreaterThan(0);
    expect(focus.color).not.toBe('rgba(0, 0, 0, 0)');
    const before = await field.inputValue();
    const area = picker.getByRole('slider', { name: 'Color', exact: true });
    await area.focus();
    await area.press('ArrowLeft');
    await expect(field).not.toHaveValue(before);
    await area.click({ position: { x: 10, y: 10 } });
    await expect(field).toHaveValue(/^#[0-9a-f]{6}$/);
    expect(await area.getAttribute('aria-valuetext')).toContain('Saturation');
    const bounds = (await area.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * 0.2, bounds.y + bounds.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * 0.4, bounds.y + bounds.height * 0.4);
    const firstDragColor = await field.inputValue();
    await page.mouse.move(bounds.x + bounds.width * 0.7, bounds.y + bounds.height * 0.7);
    await expect(field).not.toHaveValue(firstDragColor);
    await page.mouse.up();
    await expect(area).toBeFocused();
  }
});

test('rejected and same-value clamped changes keep the whole controlled picker synchronized', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`color-picker-${theme}`);
    const picker = scope.getByRole('group', { name: 'Controlled color', exact: true });
    const field = picker.getByRole('textbox');
    const hue = picker.getByRole('slider', { name: 'Hue', exact: true });
    const area = picker.getByRole('slider', { name: 'Color', exact: true });
    const acceptedHue = await hue.getAttribute('aria-valuenow');
    const acceptedArea = await area.getAttribute('aria-valuetext');
    const pointer = picker.locator('.react-colorful__saturation-pointer');
    const acceptedPointer = await pointer.getAttribute('style');
    let changes = 0;
    for (const policy of ['Reject', 'Clamp']) {
      await scope.getByRole('button', { name: `${policy} color changes` }).click();
      await hue.press('ArrowRight');
      await expect(scope.getByTestId('color-changes')).toHaveText(String(++changes));
      await expect(hue).toHaveAttribute('aria-valuenow', acceptedHue!);
      await expect(hue).toBeFocused();
      await area.press('ArrowLeft');
      await expect(scope.getByTestId('color-changes')).toHaveText(String(++changes));
      await expect(area).toHaveAttribute('aria-valuetext', acceptedArea!);
      await expect(pointer).toHaveAttribute('style', acceptedPointer!);
      await expect(area).toBeFocused();
      await field.fill('#abcdef');
      await expect(scope.getByTestId('color-changes')).toHaveText(String(++changes));
      await expect(field).toHaveValue('#1a73e8');
      await expect(hue).toHaveAttribute('aria-valuenow', acceptedHue!);
      await scope.getByTestId('color-form').evaluate((form: HTMLFormElement) => form.reset());
      await expect(field).toHaveValue('#1a73e8');
      await expect(area).toHaveAttribute('aria-valuetext', acceptedArea!);
      await expect(scope.getByTestId('color-changes')).toHaveText(String(changes));
    }
    await scope.getByRole('button', { name: 'Accept color changes' }).click();
    await hue.press('ArrowRight');
    await expect(field).not.toHaveValue('#1a73e8');
    await expect(hue).toBeFocused();
  }
});

test('disabled and read-only pickers prevent interaction and retain native field behavior', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`color-picker-${theme}`);
    const disabled = scope.getByRole('group', { name: 'Disabled color', exact: true });
    await expect(disabled.getByRole('textbox')).toBeDisabled();
    await expect(disabled.getByRole('slider')).toHaveCount(0);
    await disabled.locator('.react-colorful__interactive').first().click({ force: true });
    await expect(disabled.getByRole('textbox')).toHaveValue('#ea4335');
    const readOnly = scope.getByRole('group', { name: 'Read only color', exact: true });
    await expect(readOnly.getByRole('textbox')).toHaveAttribute('readonly', '');
    await readOnly.getByRole('textbox').focus();
    await expect(readOnly.getByRole('textbox')).toBeFocused();
    await readOnly.getByRole('textbox').press('ArrowUp');
    await expect(readOnly.getByRole('textbox')).toHaveValue('#6750a4');
    await expect(readOnly.getByRole('slider')).toHaveCount(0);
    await scope.getByRole('checkbox', { name: 'Disable color editing' }).check();
    const controlled = scope.getByRole('group', { name: 'Controlled color', exact: true });
    await expect(controlled.getByRole('textbox')).toBeDisabled();
    await expect(controlled.getByRole('slider')).toHaveCount(0);
    await scope.getByRole('checkbox', { name: 'Disable color editing' }).uncheck();
    await expect(controlled.getByRole('slider')).toHaveCount(2);
    await controlled.getByRole('slider', { name: 'Hue', exact: true }).press('ArrowRight');
    await expect(controlled.getByRole('textbox')).not.toHaveValue('#1a73e8');
  }
});

test('native submission and reset preserve controlled values and respect canceled resets', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    const scope = page.getByTestId(`color-picker-${theme}`);
    const controlled = scope.getByRole('textbox', { name: 'Controlled color HEX', exact: true });
    const uncontrolled = scope.getByRole('textbox', { name: 'Uncontrolled color HEX' });
    const external = scope.getByRole('textbox', { name: 'External color HEX' });
    await controlled.fill('#abcdef');
    await uncontrolled.fill('#123456');
    await external.fill('#654321');
    await scope.getByRole('button', { name: 'Submit colors' }).click();
    await expect(scope.getByTestId('color-values')).toHaveText(
      JSON.stringify({
        controlledColor: '#abcdef',
        uncontrolledColor: '#123456',
        readOnlyColor: '#6750a4',
        externalColor: '#654321',
      }),
    );
    await scope.getByRole('button', { name: 'Reset colors' }).click();
    await expect(controlled).toHaveValue('#abcdef');
    await expect(uncontrolled).toHaveValue('#34a853');
    await expect(external).toHaveValue('#112233');
    await expect(scope.getByTestId('color-changes')).toHaveText('1');
    await scope.getByRole('checkbox', { name: 'Prevent color reset' }).check();
    await uncontrolled.fill('#12');
    await scope.getByTestId('color-form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(uncontrolled).toHaveValue('#12');
    await expect(uncontrolled).toHaveAttribute('aria-invalid', 'true');
    await scope.getByRole('checkbox', { name: 'Prevent color reset' }).uncheck();
    await uncontrolled.fill('#12');
    await scope.getByTestId('color-form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(uncontrolled).toHaveValue('#34a853');
    expect(await uncontrolled.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(
      true,
    );
  }
});
