import { beforeEach, expect, test } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import * as fixture from '../fixture/MarkdownEditor.fixture.tsx';
import { keyboard, shown } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

beforeEach(() => {
  mount(fixture);
});

const tab = (scope: Locator, name: string) => scope.getByRole('tab', { name, exact: true });
const button = (scope: Locator, name: string) => scope.getByRole('button', { name, exact: true });
const textarea = (locator: Locator) => locator.element() as HTMLTextAreaElement;
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);

test(
  'tab changes retain the native textarea, selection, resize, history and reset behavior, and the toolbar is one tab stop',
  { tags: ['engines'] },
  async () => {
    const form = page.getByTestId('markdown-form');
    const source = form.getByRole('textbox', { name: 'Workload source' });
    const original = textarea(source).value;
    const nativeInput = textarea(source);
    const submitted = () => page.getByTestId('markdown-submitted').element().textContent;

    // The formatting toolbar is one tab stop, in groups the arrow keys cross: text styles, lists,
    // blocks, links and history, a line between each.
    const toolbar = form.getByRole('toolbar').first();
    expect(toolbar.getByRole('group').elements()).toHaveLength(5);
    expect(toolbar.getByRole('separator').elements()).toHaveLength(4);
    await expect
      .poll(
        () =>
          toolbar
            .getByRole('button')
            .elements()
            .filter((each) => (each as HTMLElement).tabIndex === 0).length,
      )
      .toBe(1);
    (button(toolbar, 'Inline code').element() as HTMLElement).focus();
    await keyboard.press('ArrowRight');
    await expect.element(button(toolbar, 'Bulleted list')).toHaveFocus();
    await keyboard.press('ArrowLeft');
    await expect.element(button(toolbar, 'Inline code')).toHaveFocus();
    // Formatting the source can't be told from the caret, so its buttons act once, not as toggles.
    await expect.element(button(toolbar, 'Bold')).not.toHaveAttribute('aria-pressed');

    await source.fill('alpha');
    textarea(source).setSelectionRange(0, 5);
    await button(form, 'Bold').click();
    await expect.element(source).toHaveValue('**alpha**');
    (
      form
        .getByRole('separator', { name: 'Resize text area', exact: true })
        .element() as HTMLElement
    ).focus();
    await keyboard.press('ArrowDown');
    const resizedHeight = textarea(source).style.height;
    const selectedRange = [textarea(source).selectionStart, textarea(source).selectionEnd];
    await tab(form, 'Preview').click();
    await button(form, 'Submit Markdown').click();
    await expect.poll(submitted).toBe('**alpha**');
    await tab(form, 'Write').click();
    expect(nativeInput).toBe(document.querySelector('[name="source"]'));
    expect(textarea(source).style.height).toBe(resizedHeight);
    expect([textarea(source).selectionStart, textarea(source).selectionEnd]).toEqual(selectedRange);
    await button(form, 'Undo').click();
    await expect.element(source).toHaveValue('alpha');
    await button(form, 'Redo').click();
    await expect.element(source).toHaveValue('**alpha**');
    await tab(form, 'Preview').click();
    await button(form, 'Reset Markdown').click();
    await expect
      .poll(() => form.element().querySelector('.env-markdown')?.textContent)
      .toContain('Reference 39');
    await tab(form, 'Write').click();
    await expect.element(source).toHaveValue(original);
    await expect.element(button(form, 'Undo')).toBeDisabled();
  },
);

test('active preview reflects controlled replacements and preview options without stale activation', async () => {
  const scope = page.getByTestId('controlled-markdown');
  await tab(scope, 'Preview').click();
  await isShown(scope.getByRole('heading', { name: 'Original heading', level: 2 }));
  await scope.getByRole('button', { name: 'Replace Markdown document' }).click();
  await isShown(scope.getByRole('heading', { name: 'Replacement heading', level: 2 }));
  await expect
    .element(scope.getByRole('link', { name: 'Updated', exact: true }))
    .toHaveAttribute('href', '/updated');
  await scope.getByRole('button', { name: 'Change preview heading offset' }).click();
  await isShown(scope.getByRole('heading', { name: 'Replacement heading', level: 3 }));
});

test('submitting an empty preview reveals and focuses the required native source', async () => {
  const form = page.getByTestId('required-markdown');
  await tab(form, 'Preview').click();
  await isShown(form.getByText('Nothing to preview.'));
  // Finish closing Write before native validation opens it again.
  const write = form
    .element()
    .querySelector<HTMLElement>(
      `[role="tabpanel"][aria-labelledby="${tab(form, 'Write').element().id}"]`,
    )!;
  await expect.poll(() => shown(page.elementLocator(write))).toBe(false);
  await form.getByRole('button', { name: 'Submit required Markdown' }).click();
  await expect.element(tab(form, 'Write')).toHaveAttribute('aria-selected', 'true');
  await expect.element(form.getByRole('textbox', { name: 'Required source' })).toHaveFocus();
  expect(form.getByTestId('required-markdown-submissions').element().textContent).toBe('0');
});
