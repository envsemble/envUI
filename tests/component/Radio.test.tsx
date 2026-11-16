import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as choiceControls from '../fixture/ChoiceControls.fixture.tsx';
import * as surfaces from '../fixture/Surfaces.fixture.tsx';
import { box, css, keyboard, mouse } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const rootOf = (input: Element) => input.closest('label')!;

test('keyboard focus rings a radio side by side, and the whole row of a row radio', async () => {
  mount(choiceControls);
  (page.getByRole('switch', { name: 'Alerts', exact: true }).element() as HTMLElement).focus();
  await keyboard.press('Tab');
  await expect.element(page.getByRole('radio', { name: 'Team', exact: true })).toHaveFocus();
  await keyboard.press('ArrowRight');
  const solo = page.getByRole('radio', { name: 'Solo', exact: true });
  await expect.element(solo).toHaveFocus();
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
    row: token('--env-color-bg-list-item'),
    selected: token('--env-color-bg-selected'),
    text: token('--env-color-fg-default'),
  };
  probe.remove();
  await page.getByRole('radio', { name: /Viewer/ }).click();
  await mouse.move(0, 0);
  await expect.poll(() => css(chosen, 'background-color')).toBe(tokens.selected);
  expect(css(chosen, 'color')).toBe(tokens.text);
  expect(css(other, 'background-color')).toBe(tokens.row);
  const otherBox = box(other);
  await mouse.move(otherBox.x + otherBox.width / 2, otherBox.y + otherBox.height / 2);
  await expect.poll(() => css(other, 'background-color')).not.toBe(tokens.row);
});

test(
  'vertical radio rows are tiles as List rows are, with the selected fill',
  { tags: ['engines'] },
  async () => {
    const rowsOf = () =>
      page
        .getByRole('group', { name: 'Reach this computer via' })
        .getByRole('radio')
        .elements()
        .map(rootOf);
    const listRows = () =>
      page.getByRole('list', { name: 'Paired devices' }).getByRole('listitem').elements();
    mount(surfaces);
    const [tile, chosenTile, lastTile] = rowsOf();
    const [listTile, lastListTile] = listRows();
    expect(css(tile!, 'background-color')).toBe(css(listTile!, 'background-color'));
    expect(css(tile!, 'padding-left')).toBe(css(listTile!, 'padding-left'));
    expect(css(tile!, 'border-top-left-radius')).toBe(css(listTile!, 'border-top-left-radius'));
    expect(css(tile!, 'border-top-left-radius')).not.toBe('0px');
    expect(css(chosenTile!, 'border-top-width')).toBe('0px');
    expect(css(chosenTile!, 'background-color')).not.toBe(css(tile!, 'background-color'));
    expect(css(lastTile!, 'border-bottom-left-radius')).toBe(
      css(lastListTile!, 'border-bottom-left-radius'),
    );
  },
);
