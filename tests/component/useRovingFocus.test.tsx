import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Primitives.fixture.tsx';
import { keyboard } from './Browser.ts';
import { mount } from './Mount.tsx';

// Primitives.fixture.tsx mounts a grid and a list that move focus with useRovingFocus among
// envUI's primitives.
beforeEach(() => {
  mount(fixture);
});

describe('useRovingFocus', () => {
  test('moves through a grid by rows and columns, skipping disabled cells', async () => {
    const grid = page.getByRole('grid', { name: 'Days ltr' });
    const cell = (name: string) => grid.getByRole('gridcell', { name, exact: true });
    await expect.element(cell('1')).toHaveAttribute('tabindex', '0');
    (cell('1').element() as HTMLElement).focus();
    await keyboard.press('ArrowDown');
    await expect.element(cell('8')).toHaveFocus();
    await keyboard.press('ArrowUp');
    await keyboard.press('ArrowRight');
    await keyboard.press('ArrowRight');
    await keyboard.press('ArrowRight');
    await expect.element(cell('4')).toHaveFocus();
    // Day 5 is disabled: the move skips to day 6.
    await keyboard.press('ArrowRight');
    await expect.element(cell('6')).toHaveFocus();
    await keyboard.press('End');
    await expect.element(cell('7')).toHaveFocus();
    await keyboard.press('Control+End');
    await expect.element(cell('14')).toHaveFocus();
    await expect.element(cell('14')).toHaveAttribute('tabindex', '0');
    await expect.element(cell('1')).toHaveAttribute('tabindex', '-1');
  });

  test('moves to an item as its name is typed', async () => {
    const list = page.getByTestId('roving-list');
    (list.getByRole('option', { name: 'Alex Morgan' }).element() as HTMLElement).focus();
    await keyboard.type('sa');
    await expect.element(list.getByRole('option', { name: 'Sam Lee' })).toHaveFocus();
    await keyboard.press('PageDown');
    await expect.element(list.getByRole('option', { name: 'Samir Haddad' })).toHaveFocus();
  });
});
