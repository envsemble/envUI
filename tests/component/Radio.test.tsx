import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as choiceControls from '../fixture/ChoiceControls.fixture.tsx';
import { box, css, keyboard, mouse } from './Browser.ts';
import { mount } from './Mount.tsx';

/** The label a choice control's input sits in, its root. */
const rootOf = (input: Element) => input.closest('label')!;

test('keyboard focus rings a radio side by side, and the whole row of a row radio', async () => {
  mount(choiceControls);
  // Tab and the arrow keys move focus the way a keyboard user does, so the focus is visible.
  (page.getByRole('switch', { name: 'Alerts', exact: true }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  await expect.element(page.getByRole('radio', { name: 'Team', exact: true })).toHaveFocus();
  await keyboard.press('ArrowRight');
  const solo = page.getByRole('radio', { name: 'Solo', exact: true });
  await expect.element(solo).toHaveFocus();
  // WebKit gives a radio focused from the keyboard no :focus-visible; elsewhere the ring shows.
  if (solo.element().matches(':focus-visible')) {
    expect(css(solo, 'outline-style')).toBe('solid');
    expect(Number.parseFloat(css(solo, 'outline-width'))).toBe(2);
  }
  (page.getByRole('radio', { name: /Viewer/ }).element() as HTMLElement).focus();
  await keyboard.press('ArrowDown');
  const editor = page.getByRole('radio', { name: /Editor/ });
  await expect.element(editor).toHaveFocus();
  if (editor.element().matches(':focus-visible'))
    await expect.poll(() => css(rootOf(editor.element()), 'outline-style')).toBe('solid');

  // The chosen row takes the selection fill, its label the text color, also under the pointer.
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
  const tokens = {
    selected: token('--env-color-bg-selected'),
    selectedHover: token('--env-color-bg-selected-hover'),
    text: token('--env-color-fg-default'),
    muted: token('--env-color-bg-muted'),
  };
  probe.remove();
  // Arrowing to Editor chose it: choose Viewer again.
  await page.getByRole('radio', { name: /Viewer/ }).click();
  await mouse.move(0, 0);
  await expect.poll(() => css(chosen, 'background-color')).toBe(tokens.selected);
  expect(css(chosen, 'color')).toBe(tokens.text);
  expect(css(other, 'background-color')).toBe(tokens.muted);
  const chosenBox = box(chosen);
  await mouse.move(chosenBox.x + chosenBox.width / 2, chosenBox.y + chosenBox.height / 2);
  await expect.poll(() => css(chosen, 'background-color')).toBe(tokens.selectedHover);
});
