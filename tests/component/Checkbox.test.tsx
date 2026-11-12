import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as choiceControls from '../fixture/ChoiceControls.fixture.tsx';
import * as forms from '../fixture/Forms.fixture.tsx';
import { box, css, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

/** The label a choice control's input sits in, its root. */
const rootOf = (input: Element) => input.closest('label')!;

test("each control's ref reaches its input", async () => {
  mount(choiceControls);
  await page.getByRole('button', { name: 'Read refs' }).click();
  await expect
    .poll(() => page.getByTestId('choice-refs').element().textContent)
    .toBe('INPUT:checkbox INPUT:checkbox INPUT:radio');
  // The label still toggles the box.
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

      // The switch's track and thumb.
      const alerts = page.getByRole('switch', { name: 'Alerts', exact: true }).element();
      const track = box(alerts);
      expect([track.width, track.height].map(Math.round), label).toEqual(
        scale === 'comfortable' ? [40, 24] : [36, 22],
      );
      await expect
        .poll(() => css(alerts, 'width', '::before'), { message: label })
        .toBe(scale === 'comfortable' ? '16px' : '14px');
      expect(box(rootOf(alerts)).height, label).toBeGreaterThanOrEqual(target);

      // A checkbox without a visible label takes presses across the target, its box and its
      // row's width in the layout staying as drawn.
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
      // A press just inside the target, beside the box, toggles it; one just outside doesn't.
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
