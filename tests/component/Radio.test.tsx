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
    hover: token('--env-color-bg-item-hover'),
    text: token('--env-color-fg-default'),
  };
  probe.remove();
  await page.getByRole('radio', { name: /Viewer/ }).click();
  await mouse.move(0, 0);
  await expect.poll(() => css(chosen, 'background-color')).toBe('rgba(0, 0, 0, 0)');
  expect(css(chosen, 'color')).toBe(tokens.text);
  expect(css(other, 'background-color')).toBe('rgba(0, 0, 0, 0)');
  const chosenBox = box(chosen);
  await mouse.move(chosenBox.x + chosenBox.width / 2, chosenBox.y + chosenBox.height / 2);
  await expect.poll(() => css(chosen, 'background-color')).toBe(tokens.hover);
});

test(
  'vertical radio rows follow the surface as List rows do: plain rows parted by hairlines, filled tiles with the selected fill',
  { tags: ['engines'] },
  async () => {
    const rowsOf = () =>
      page
        .getByRole('group', { name: 'Reach this computer via' })
        .getByRole('radio')
        .elements()
        .map(rootOf);
    const listRows = () =>
      page.getByRole('list', { name: 'Remote access' }).getByRole('listitem').elements();
    mount(surfaces, { search: 'surface=plain' });
    const [first, chosen] = rowsOf();
    const [firstListRow] = listRows();
    expect(css(first!, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(chosen!, 'background-color')).toBe('rgba(0, 0, 0, 0)');
    expect(css(first!, 'padding-left')).toBe(css(firstListRow!, 'padding-left'));
    expect(css(first!, 'border-top-left-radius')).toBe('0px');
    expect(css(chosen!, 'border-top-width')).toBe(css(listRows()[1]!, 'border-top-width'));
    expect(css(chosen!, 'border-top-color')).toBe(css(listRows()[1]!, 'border-top-color'));

    mount(surfaces, { search: 'surface=filled' });
    const [tile, chosenTile, lastTile] = rowsOf();
    const [listTile] = listRows();
    expect(css(tile!, 'background-color')).toBe(css(listTile!, 'background-color'));
    expect(css(tile!, 'border-top-left-radius')).toBe(css(listTile!, 'border-top-left-radius'));
    expect(css(tile!, 'border-top-left-radius')).not.toBe('0px');
    expect(css(chosenTile!, 'border-top-width')).toBe('0px');
    expect(css(chosenTile!, 'background-color')).not.toBe(css(tile!, 'background-color'));
    expect(css(lastTile!, 'border-bottom-left-radius')).toBe(
      css(listRows()[2]!, 'border-bottom-left-radius'),
    );
  },
);
