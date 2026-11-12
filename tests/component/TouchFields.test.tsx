import { expect, test } from 'vitest';
import { commands, page } from 'vitest/browser';
import * as adoption from '../fixture/Adoption.fixture.tsx';
import * as affixes from '../fixture/Affixes.fixture.tsx';
import * as commandPalette from '../fixture/CommandPalette.fixture.tsx';
import * as composer from '../fixture/Composer.fixture.tsx';
import * as forms from '../fixture/Forms.fixture.tsx';
import * as markdownEditor from '../fixture/MarkdownEditor.fixture.tsx';
import { RichTextEditingFixture } from '../fixture/RichTextEditor.fixture.tsx';
import { css } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const richText = { default: RichTextEditingFixture };

/**
 * The body size where an element sits: it follows the scale, compact under a fine pointer by
 * default, so it is read from the theme.
 */
function bodySize(element: Element) {
  const probe = document.createElement('span');
  probe.style.font = 'var(--env-type-body)';
  element.closest('.env-theme')!.append(probe);
  const size = getComputedStyle(probe).fontSize;
  probe.remove();
  return size;
}

const fontSize = (element: Element) => css(element, 'font-size');
const editable = () => document.querySelector('[contenteditable="true"]')!;

test('entered text keeps the body size with a mouse, and is 16 px on touch screens, so focusing a field does not zoom the page', async () => {
  mount(forms);
  const name = () => page.getByRole('textbox', { name: 'Project name', exact: true }).element();
  const notes = () => page.getByRole('textbox', { name: 'Notes', exact: true }).element();
  expect(fontSize(name())).toBe(bodySize(name()));
  expect(fontSize(notes())).toBe(bodySize(notes()));
  mount(richText);
  await expect.poll(() => document.querySelector('[contenteditable="true"]')).not.toBeNull();
  expect(fontSize(editable())).toBe(bodySize(editable()));

  // A phone-sized page with a touch screen, whose primary pointer is coarse.
  await commands.emulateTouch(true);
  try {
    await page.viewport(390, 844);
    expect(matchMedia('(pointer: coarse)').matches).toBe(true);
    mount(forms);
    expect(fontSize(name())).toBe('16px');
    expect(fontSize(notes())).toBe('16px');

    mount(affixes);
    const scope = page.getByTestId('affixes-light');
    // A label resting in an empty field stands in for its text, so it takes the same size.
    const address = [...scope.element().querySelectorAll('label')].find((label) =>
      label.textContent?.includes('Address'),
    )!;
    expect(fontSize(address)).toBe('16px');
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

    mount(markdownEditor);
    expect(fontSize(page.getByRole('textbox', { name: 'Workload source' }).element())).toBe('16px');

    mount(richText);
    // The editing host is the element that gets focus, so it takes the size, and so do paragraphs.
    await expect.poll(() => document.querySelector('[contenteditable="true"]')).not.toBeNull();
    expect(fontSize(editable())).toBe('16px');
    expect(fontSize(editable().querySelector('p')!)).toBe('16px');
  } finally {
    await commands.emulateTouch(false);
  }
});
