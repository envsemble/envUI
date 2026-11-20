import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as choiceControls from '../fixture/ChoiceControls.fixture.tsx';
import * as surfaces from '../fixture/Surfaces.fixture.tsx';
import { box, css, keyboard, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const rootOf = (input: Element) => input.closest('label')!;

test('keyboard focus rings the circle around the radio, side by side and stacked, and an option takes no fill', async () => {
  mount(choiceControls);
  (page.getByRole('switch', { name: 'Alerts', exact: true }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  await expect.element(page.getByRole('radio', { name: 'Team', exact: true })).toHaveFocus();
  await keyboard.press('ArrowRight');
  const solo = page.getByRole('radio', { name: 'Solo', exact: true });
  await expect.element(solo).toHaveFocus();
  if (solo.element().matches(':focus-visible')) {
    const ring = solo.element().closest('.env-radio-control')!;
    expect(css(ring, 'outline-style')).toBe('solid');
    expect(Number.parseFloat(css(ring, 'outline-width'))).toBe(2);
  }
  (page.getByRole('radio', { name: /Viewer/ }).element() as HTMLElement).focus();
  await keyboard.press('ArrowDown');
  const editor = page.getByRole('radio', { name: /Editor/ });
  await expect.element(editor).toHaveFocus();
  if (editor.element().matches(':focus-visible')) {
    expect(css(editor.element().closest('.env-radio-control')!, 'outline-style')).toBe('solid');
    expect(css(rootOf(editor.element()), 'outline-style')).toBe('none');
  }

  const role = page.getByRole('group', { name: 'Role' }).element();
  const chosen = rootOf(page.getByRole('radio', { name: /Viewer/ }).element());
  const other = rootOf(editor.element());
  (editor.element() as HTMLElement).blur();
  const probe = document.createElement('div');
  role.append(probe);
  const token = (name: string) => {
    probe.style.backgroundColor = `var(${name})`;
    return getComputedStyle(probe).backgroundColor;
  };
  const tokens = { text: token('--env-color-fg-default') };
  probe.remove();
  const label = rootOf(page.getByRole('radio', { name: /Viewer/ }).element()).querySelector(
    '.env-radio-label',
  )!;
  const labelBox = box(label);
  await mouse.click(labelBox.x + 2, labelBox.y + labelBox.height / 2);
  await expect.element(page.getByRole('radio', { name: /Viewer/ })).toBeChecked();
  await mouse.move(0, 0);
  expect(css(chosen, 'background-color')).toBe('rgba(0, 0, 0, 0)');
  expect(css(chosen, 'color')).toBe(tokens.text);
  const otherBox = box(other);
  await mouse.move(otherBox.x + otherBox.width / 2, otherBox.y + otherBox.height / 2);
  expect(css(other, 'background-color')).toBe('rgba(0, 0, 0, 0)');
});

test(
  'a vertical group stacks its radios before their labels, with the description under the label and aligned with it',
  { tags: ['engines'] },
  async () => {
    mount(surfaces);
    const options = page
      .getByRole('group', { name: 'Reach this computer via' })
      .getByRole('radio')
      .elements();
    const [first, second] = options.map(rootOf);
    expect(first!.classList.contains('env-connected-row')).toBe(false);
    expect(css(first!, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(first!, 'border-top-left-radius')).toBe('0px');
    const input = box(options[0]!);
    expect(input.width).toBeCloseTo(20, 0);
    expect(box(first!.querySelector('.env-radio-control')!).width).toBeCloseTo(40, 0);
    const label = box(first!.querySelector('.env-radio-label-content')!);
    const description = box(first!.querySelector('.env-radio-description')!);
    expect(input.x + input.width).toBeLessThanOrEqual(label.x);
    expect(description.x).toBeCloseTo(label.x, 0);
    expect(description.y).toBeGreaterThanOrEqual(label.y + label.height - 1);
    expect(box(second!).y).toBeGreaterThan(box(first!).y + box(first!).height);
  },
);
