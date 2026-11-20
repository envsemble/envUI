import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as affixes from '../fixture/Affixes.fixture.tsx';
import * as commandPalette from '../fixture/CommandPalette.fixture.tsx';
import * as composer from '../fixture/Composer.fixture.tsx';
import * as forms from '../fixture/Forms.fixture.tsx';
import { css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

function bodySize(element: Element) {
  const probe = document.createElement('span');
  probe.style.font = 'var(--env-type-body)';
  element.closest('.env-theme')!.append(probe);
  const size = getComputedStyle(probe).fontSize;
  probe.remove();
  return size;
}

const fontSize = (element: Element) => css(element, 'font-size');

test('entered text keeps the body size with a mouse, and is 16 px on touch screens, so focusing a field does not zoom the page', async () => {
  mount(forms);
  const name = () => page.getByRole('textbox', { name: 'Project name', exact: true }).element();
  const notes = () => page.getByRole('textbox', { name: 'Notes', exact: true }).element();
  expect(fontSize(name())).toBe(bodySize(name()));
  expect(fontSize(notes())).toBe(bodySize(notes()));

  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 844);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    mount(forms);
    expect(fontSize(name())).toBe('16px');
    expect(fontSize(notes())).toBe('16px');

    mount(affixes);
    const scope = page.getByTestId('affixes-light');
    const price = scope.getByRole('textbox', { name: 'Price', exact: true }).element();
    expect(fontSize(price)).toBe('16px');
    expect(fontSize(price.parentElement!.querySelector('.env-text-field-prefix')!)).toBe('16px');

    mount(adoption);
    expect(fontSize(page.getByRole('searchbox', { name: 'Search members' }).element())).toBe(
      '16px',
    );

    mount(commandPalette);
    await page.getByRole('button', { name: 'Quick open light' }).click();
    await expect.poll(() => document.querySelector('.env-command-palette-input')).not.toBeNull();
    expect(fontSize(document.querySelector('.env-command-palette-input')!)).toBe('16px');

    mount(composer);
    expect(fontSize(page.getByRole('textbox', { name: 'Message light' }).element())).toBe('16px');
  } finally {
    await commands.emulateTouch(false);
  }
});
