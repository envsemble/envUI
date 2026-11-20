import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as choiceControls from '../fixture/ChoiceControls.fixture.tsx';
import * as forms from '../fixture/Forms.fixture.tsx';
import { box, css, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const rootOf = (input: Element) => input.closest('label')!;

test("each control's ref reaches its input", async () => {
  mount(choiceControls);
  await page.getByRole('button', { name: 'Read refs' }).click();
  await expect
    .poll(() => page.getByTestId('choice-refs').element().textContent)
    .toBe('INPUT:checkbox INPUT:checkbox INPUT:radio');
  const subscribe = page.getByRole('checkbox', { name: 'Subscribe', exact: true });
  await page.getByText('Subscribe', { exact: true }).click();
  await expect.element(subscribe).toBeChecked();
});

test('a controlled mixed checkbox retains its DOM state when the owner retains mixed', async () => {
  mount(forms);
  const fixed = page.getByTestId('frozen-checkbox');
  const input = () => fixed.element() as HTMLInputElement;
  expect(input().indeterminate).toBe(true);
  await fixed.click();
  await expect.poll(() => page.getByTestId('frozen-request').element().textContent).toBe('true');
  await expect.element(fixed).toHaveAttribute('aria-checked', 'mixed');
  expect(input().indeterminate).toBe(true);
  expect(input().checked).toBe(false);
});

test('boxes and tracks follow the scale, on targets of 24 px, or the touch height on touch screens', async () => {
  for (const [scale, touch] of [
    ['comfortable', false],
    ['compact', false],
    ['compact', true],
  ] as const) {
    const label = `${scale}${touch ? ' touch' : ''}`;
    const size = scale === 'comfortable' ? 18 : 16;
    const target = touch ? 44 : 24;
    await commands.emulateTouch(touch);
    try {
      mount(choiceControls, { scale });
      const subscribe = page.getByRole('checkbox', { name: 'Subscribe', exact: true }).element();
      const subscribeBox = box(subscribe);
      expect([subscribeBox.width, subscribeBox.height].map(Math.round), label).toEqual([
        size,
        size,
      ]);
      expect(box(rootOf(subscribe)).height, label).toBeGreaterThanOrEqual(target);

      const alerts = page.getByRole('switch', { name: 'Alerts', exact: true }).element();
      const track = box(alerts);
      expect([track.width, track.height].map(Math.round), label).toEqual(
        scale === 'comfortable' ? [40, 24] : [36, 22],
      );
      await expect
        .poll(() => css(alerts, 'width', '::before'), { message: label })
        .toBe(scale === 'comfortable' ? '16px' : '14px');
      expect(box(rootOf(alerts)).height, label).toBeGreaterThanOrEqual(target);

      const select = page.getByRole('checkbox', { name: 'Select row', exact: true });
      const selectBox = box(select);
      expect([selectBox.width, selectBox.height].map(Math.round), label).toEqual([size, size]);
      const root = rootOf(select.element());
      expect(Math.round(box(root).width), label).toBe(size);
      expect(
        ['width', 'height'].map((property) =>
          Math.round(Number.parseFloat(css(root, property, '::before'))),
        ),
        label,
      ).toEqual([target, target]);
      const centerX = selectBox.x + selectBox.width / 2;
      const centerY = selectBox.y + selectBox.height / 2;
      const reach = target / 2 - 2;
      await mouse.click(centerX + reach, centerY);
      await expect.element(select, { message: label }).toBeChecked();
      await mouse.click(centerX - reach, centerY);
      await expect.element(select, { message: label }).not.toBeChecked();
      await mouse.click(centerX + target / 2 + 2, centerY);
      await expect.element(select, { message: label }).not.toBeChecked();
    } finally {
      await commands.emulateTouch(false);
    }
  }
});

test('a label placed at the start leads its track or box, and still names and toggles the control', async () => {
  mount({ default: forms.LabelFirstFixture });
  for (const [role, name] of [
    ['switch', 'Dark mode'],
    ['checkbox', 'Remember me'],
    ['radio', 'Team plan'],
  ] as const) {
    const control = page.getByRole(role, { name, exact: true });
    const root = control.element().closest('label')!;
    const text = root.querySelector(':scope > span:last-child')!;
    expect(box(text).x).toBeLessThan(box(control).x);
    await page.elementLocator(text).click();
    await expect.element(control).toBeChecked();
  }
  const sync = page.getByRole('switch', { name: 'Sync' });
  const syncText = sync.element().closest('label')!.querySelector(':scope > span:last-child')!;
  expect(box(syncText).x).toBeGreaterThan(box(sync).x);
});
