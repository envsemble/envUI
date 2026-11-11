import axe from 'axe-core';
import { expect, test } from 'vitest';
import { page, server, type Locator } from 'vitest/browser';
import { RichTextEditingFixture } from '../fixture/RichTextEditor.fixture.tsx';
import { addStyle, box, collectErrors, css, keyboard, mouse, shown } from './Browser.ts';
import { mount } from './Mount.tsx';

/** The editing fixture, with only the sections asked for, as `?section=` gives them. */
const open = (...sections: string[]) =>
  mount(
    { default: RichTextEditingFixture },
    { search: sections.map((section) => `section=${section}`).join('&') },
  );

const referenceId = 'record/"42"[a]';
const referenceLabel = 'River [east] "quote", slash/ amp&!';
const fixtureState = () => window.richTextFixture;
const text = (testId: string) => () => page.getByTestId(testId).element().textContent;
const focus = (target: Locator | Element) =>
  (target instanceof Element ? (target as HTMLElement) : (target.element() as HTMLElement)).focus();
const isShown = (locator: Locator) => expect.poll(() => shown(locator)).toBe(true);
const isGone = (locator: Locator) => expect.poll(() => locator.query()).toBeNull();
/** The editor's text, as Playwright's toHaveText reads it, its whitespace collapsed. */
const editorText = (editor: Locator) => () =>
  editor.element().textContent?.replace(/\s+/g, ' ').trim();
/** An editable editor once its document has loaded. */
async function editorIn(scope: Locator, name?: string) {
  const editor = scope.getByRole('textbox', name ? { name, exact: true } : undefined);
  await expect.poll(() => editor.query()?.getAttribute('contenteditable')).not.toBeUndefined();
  await expect.poll(() => editor.query() !== null).toBe(true);
  return editor;
}

async function replace(editor: Locator, value: string) {
  focus(editor);
  await keyboard.press('ControlOrMeta+A');
  await keyboard.press('Backspace');
  if (value) await keyboard.type(value);
}

/** The index of the last request for a query, or -1. */
function lastIndexOf(requests: readonly { query: string }[], query: string) {
  for (let index = requests.length - 1; index >= 0; index--)
    if (requests[index]!.query === query) return index;
  return -1;
}

async function requestIndex(query: string) {
  const find = () => lastIndexOf(fixtureState().requests, query);
  await expect.poll(find).toBeGreaterThanOrEqual(0);
  return find();
}

function resolveRequest(index: number, label?: string) {
  fixtureState().requests[index]!.resolve(label ? [{ id: label, label }] : []);
}

async function uploadIndex(file: string) {
  const find = () => lastIndexOf(fixtureState().uploads, file);
  await expect.poll(find).toBeGreaterThanOrEqual(0);
  return find();
}

/** Picks a file in an editor's file input, as a person choosing it in the file picker. */
const upload = (scope: Locator, name: string, type: string) =>
  page
    .elementLocator(scope.element().querySelector('input[type=file]')!)
    .upload(new File(['fixture'], name, { type }));

test('the formatting toolbar uses named SVG icon buttons, wraps its groups at narrow widths, and is one tab stop in groups the arrow keys cross', async () => {
  open('upload');
  const scope = page.getByTestId('rich-text-upload');
  const toolbar = scope.getByRole('toolbar', { name: 'Rich text formatting' });
  const button = (name: string) => toolbar.getByRole('button', { name, exact: true });
  const labels = [
    'Heading',
    'Bold',
    'Italic',
    'Strikethrough',
    'Bulleted list',
    'Numbered list',
    'Task list',
    'Quote',
    'Inline code',
    'Code block',
    'Insert link',
    'Insert table',
    'Undo',
    'Redo',
    'Attach files',
  ];
  await isShown(toolbar);
  // The toolbar's buttons that Tab stops at.
  const tabStops = () =>
    toolbar
      .getByRole('button')
      .elements()
      .filter((each) => (each as HTMLElement).tabIndex === 0)
      .map((each) => each.getAttribute('aria-label'));
  // Text styles, lists, blocks, links and tables, history and the editor's own, a line between
  // each.
  expect(toolbar.getByRole('group').elements()).toHaveLength(6);
  expect(toolbar.getByRole('separator').elements()).toHaveLength(5);
  // Marks are toggle buttons.
  await expect.element(button('Bold')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(tabStops).toEqual(['Heading']);
  focus(button('Heading'));
  for (const [key, name] of [
    ['ArrowRight', 'Bold'],
    ['ArrowRight', 'Italic'],
    ['ArrowRight', 'Strikethrough'],
    ['ArrowRight', 'Inline code'],
    // Across the line into the next group.
    ['ArrowRight', 'Bulleted list'],
    ['ArrowLeft', 'Inline code'],
    ['ArrowLeft', 'Strikethrough'],
    ['ArrowLeft', 'Italic'],
    ['ArrowLeft', 'Bold'],
    ['ArrowLeft', 'Heading'],
    // The keys go round from the first to the last, passing over Undo and Redo, unavailable.
    ['ArrowLeft', 'Attach files'],
    ['ArrowRight', 'Heading'],
    ['ArrowLeft', 'Attach files'],
    ['ArrowLeft', 'Insert table'],
  ] as const) {
    await keyboard.press(key);
    await expect.element(button(name)).toHaveFocus();
  }
  // The button last focused is the one tab stop; Tab leaves the toolbar for the document.
  await expect.poll(tabStops).toEqual(['Insert table']);
  await keyboard.press('Tab');
  await expect.element(scope.getByRole('textbox')).toHaveFocus();
  await keyboard.press('Shift+Tab');
  await expect.element(button('Insert table')).toHaveFocus();

  for (const width of [1200, 390]) {
    await page.viewport(width, 900);
    await isShown(toolbar);
    expect(toolbar.getByRole('button').elements()).toHaveLength(labels.length);
    for (const label of labels) {
      const each = button(label).element();
      // A tooltip shows the name, which is no native title.
      expect(each.hasAttribute('title')).toBe(false);
      expect(each.querySelectorAll('svg[aria-hidden="true"] path').length).toBeGreaterThan(0);
    }
    const root = toolbar.element();
    await expect
      .poll(() => root.parentElement!.getBoundingClientRect().right)
      .toBeLessThanOrEqual(width);
    const buttons = [...root.querySelectorAll('button')].map((each) => ({
      text: each.textContent,
      bounds: each.getBoundingClientRect(),
    }));
    // The visible box: the toolbar's, inside its room for focus rings, where it clips.
    const visible = root.parentElement!.getBoundingClientRect();
    const separators = [...root.querySelectorAll('[role="separator"]')].map((separator) =>
      separator.getBoundingClientRect(),
    );
    const rows = new Set(buttons.map((each) => Math.round(each.bounds.top)));
    for (const each of buttons) {
      expect(each.text).toBe('');
      expect(each.bounds.width).toBeGreaterThanOrEqual(32);
      expect(each.bounds.height).toBeLessThanOrEqual(48);
      // Every button stays in view: the groups wrap rather than scroll.
      expect(each.bounds.left).toBeGreaterThanOrEqual(visible.left);
      expect(each.bounds.right).toBeLessThanOrEqual(visible.right);
    }
    if (width === 1200) expect(rows.size).toBe(1);
    else expect(rows.size).toBeGreaterThan(1);
    // A separator shows only between two groups of a row: one a wrapped row starts with lies
    // outside the visible box, and no row ends with one.
    for (const separator of separators) {
      const inView = separator.right > visible.left && separator.left < visible.right;
      const row = buttons.filter((each) => Math.abs(each.bounds.top - separator.top) < 12);
      const before = row.some((each) => each.bounds.right <= separator.left);
      const after = row.some((each) => each.bounds.left >= separator.right);
      expect(inView).toBe(before && after);
    }
    focus(button('Heading'));
    await keyboard.press('ArrowRight');
    await expect.element(button('Bold')).toHaveFocus();
  }
});

test('theme and renderer changes preserve uncontrolled content, history and keyboard reference actions', async () => {
  open('themed');
  const scope = page.getByTestId('rich-text-themed');
  const editor = await editorIn(scope);
  await replace(editor, '@');
  await page.getByRole('option', { name: 'Second person' }).click();
  focus(editor);
  await keyboard.press('ControlOrMeta+A');
  await scope.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect
    .poll(() => editor.element().querySelector('strong')?.textContent?.trim())
    .toBe('First Second person');
  await scope.getByRole('button', { name: 'Switch rich theme', exact: true }).click();
  await expect.element(scope).toHaveAttribute('data-env-theme', 'dark');
  expect(editorText(editor)()).toContain('First Second person');
  await scope.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(() => editor.element().querySelector('strong')).toBeNull();
  expect(editorText(editor)()).toContain('First Second person');
  const reference = editor.getByTestId('rich-text-custom-reference');
  await expect.element(reference).toHaveAttribute('data-readonly', 'false');
  await scope.getByRole('button', { name: 'Toggle themed read only', exact: true }).click();
  await expect.element(reference).toHaveAttribute('data-readonly', 'true');
  await scope.getByRole('button', { name: 'Change rich reference renderer', exact: true }).click();
  await expect.poll(() => reference.element().textContent).toBe('Updated Second person');
  const action = editor.getByRole('button', { name: 'Updated Second person', exact: true });
  focus(action);
  await keyboard.press('Enter');
  await expect.poll(text('rich-text-keyboard-clicks')).toBe('1');
  const viewAction = scope
    .getByTestId('rich-text-keyboard-view')
    .getByRole('button', { name: '@Second person', exact: true });
  focus(viewAction);
  await keyboard.press('Space');
  await expect.poll(text('rich-text-keyboard-clicks')).toBe('2');
});

test(
  "a code block scrolls rather than wraps: the document's styles win over ProseMirror's base",
  { tags: ['engines'] },
  async () => {
    open('form');
    const editor = await editorIn(page.getByTestId('rich-text-form'), 'Rich source');
    await replace(editor, '``` ');
    await keyboard.type('const answer = 42;');
    await expect
      .poll(() => editor.element().querySelector('pre')?.textContent)
      .toBe('const answer = 42;');
    expect(css(editor.element().querySelector('pre')!, 'white-space')).toBe('pre');
    // The base styles are envUI's, in its cascade layer: Tiptap adds no style element of its own.
    expect(document.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0);
    expect(css(editor, 'position')).toBe('relative');
  },
);

test(
  "ProseMirror's separator stays inline under an unlayered img reset, adding no line",
  { tags: ['engines'] },
  async () => {
    // ProseMirror adds the separator in Chromium and WebKit.
    if (server.browser === 'firefox') return;
    open('form');
    const editor = await editorIn(page.getByTestId('rich-text-form'), 'Rich source');
    // A reference, which isn't editable, that ends the paragraph makes ProseMirror add its
    // separator.
    await replace(editor, '@river');
    await page.getByRole('option', { name: referenceLabel, exact: true }).click();
    const paragraph = () => editor.element().querySelector('p')!;
    if (/\s$/.test(paragraph().textContent ?? '')) await keyboard.press('Backspace');
    await expect
      .poll(() => paragraph().querySelectorAll('img.ProseMirror-separator').length)
      .toBeGreaterThan(0);
    const separator = [...paragraph().querySelectorAll('img.ProseMirror-separator')].at(-1)!;
    const before = paragraph().getBoundingClientRect().height;
    // An application reset outside any cascade layer, as Tailwind's preflight has.
    addStyle('img { display: block; height: auto; margin: 1rem; }');
    expect(css(separator, 'display')).toBe('inline');
    expect(css(separator, 'margin-top')).toBe('0px');
    expect(paragraph().getBoundingClientRect().height).toBe(before);
  },
);

test(
  'formatting, native history, form submission and reset use Markdown values',
  { tags: ['engines'] },
  async () => {
    open('form');
    const form = page.getByTestId('rich-text-form');
    const editor = await editorIn(form, 'Rich source');
    const strong = () => editor.element().querySelector('strong');
    focus(editor);
    await keyboard.press('ControlOrMeta+A');
    await form.getByRole('button', { name: 'Bold', exact: true }).click();
    await expect.poll(() => strong()?.textContent).toBe('alpha');
    await expect.poll(text('rich-text-source')).toBe('**alpha**');
    await form.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect.poll(strong).toBeNull();
    await form.getByRole('button', { name: 'Redo', exact: true }).click();
    await expect.poll(() => strong()?.textContent).toBe('alpha');
    await form.getByRole('button', { name: 'Submit rich text', exact: true }).click();
    await expect.poll(text('rich-text-submitted')).toBe('**alpha**');
    await form.getByRole('button', { name: 'Reset rich text', exact: true }).click();
    await expect.poll(editorText(editor)).toBe('alpha');
    expect(strong()).toBeNull();
    await page.getByRole('button', { name: 'Toggle form disabled', exact: true }).click();
    await expect.element(editor).toHaveAttribute('contenteditable', 'false');
    await form.getByRole('button', { name: 'Submit rich text', exact: true }).click();
    await expect.poll(text('rich-text-submitted')).toBe('missing');
  },
);

test('references preserve punctuation and stable identities through editor and shared view Markdown roundtrips', async () => {
  open('form');
  const editor = await editorIn(page.getByTestId('rich-text-form'), 'Rich source');
  await replace(editor, '@river');
  await page.getByRole('option', { name: referenceLabel, exact: true }).click();
  await expect.poll(text('rich-text-source')).toContain(`id="${encodeURIComponent(referenceId)}"`);
  const serialized = text('rich-text-source')()!;
  expect(serialized).toContain(`label="${encodeURIComponent(referenceLabel)}"`);
  await page.getByRole('button', { name: 'Reparse rich text', exact: true }).click();
  await expect.poll(text('rich-text-source')).toBe(serialized);
  await expect
    .poll(() =>
      editor.element().querySelector('a[data-reference-id]')?.getAttribute('data-reference-id'),
    )
    .toBe(referenceId);
  const preview = page.getByTestId('rich-text-preview');
  await expect
    .poll(() => preview.getByRole('link').query()?.textContent)
    .toBe(`@${referenceLabel}`);
  await preview.getByRole('link').click();
  await expect
    .poll(text('rich-text-reference-click'))
    .toBe(`${referenceId}|${referenceLabel}|application-record|@`);
  const readonly = page.getByTestId('rich-text-readonly').getByRole('textbox');
  await expect.element(readonly).toHaveAttribute('contenteditable', 'false');
  await readonly.getByRole('link').click();
  await expect.poll(text('rich-text-reference-click')).toBe(`editor:${referenceId}`);
});

test(
  'generic at, hash and slash sources support arrow selection, Escape and IME Enter',
  { tags: ['engines'] },
  async () => {
    open('form');
    const editor = await editorIn(page.getByTestId('rich-text-form'), 'Rich source');
    await replace(editor, '@');
    const people = page.getByRole('listbox', { name: 'People', exact: true });
    await isShown(people);
    await keyboard.press('ArrowDown');
    const second = people.getByRole('option', { name: 'Second person' });
    await expect.element(second).toHaveAttribute('aria-selected', 'true');
    await expect.element(editor).toHaveAttribute('aria-activedescendant', second.element().id);
    await keyboard.press('ArrowUp');
    await expect
      .element(people.getByRole('option', { name: referenceLabel, exact: true }))
      .toHaveAttribute('aria-selected', 'true');
    editor.element().dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(editor.element().querySelectorAll('[data-reference-id]')).toHaveLength(0);
    await replace(editor, '');
    await replace(editor, '@');
    await isShown(people);
    await keyboard.press('ArrowDown');
    await keyboard.press('Enter');
    await expect.poll(editorText(editor)).toContain('@Second person');
    await isGone(people);
    await replace(editor, '#');
    await isShown(page.getByRole('listbox', { name: 'Records', exact: true }));
    await keyboard.press('Escape');
    await isGone(page.getByRole('listbox'));
    expect(editorText(editor)()).toBe('#');
    await replace(editor, '');
    await replace(editor, '#road');
    await page.getByRole('option', { name: 'Roadmap issue' }).click();
    await expect.poll(editorText(editor)).toContain('#Roadmap issue');
    await replace(editor, '/release');
    await isShown(page.getByRole('listbox', { name: 'Files', exact: true }));
    await keyboard.press('Enter');
    await expect.poll(editorText(editor)).toContain('/Release file');
  },
);

test('slash commands execute standard Tiptap blocks and application actions', async () => {
  open('commands');
  const editor = await editorIn(page.getByTestId('rich-text-commands'));
  await replace(editor, '/heading');
  await page.getByRole('option', { name: 'Heading', exact: true }).click();
  await keyboard.type('A heading');
  await expect.poll(() => editor.element().querySelector('h2')?.textContent).toBe('A heading');
  await replace(editor, '/host');
  await page.getByRole('option', { name: 'Host greeting', exact: true }).click();
  await expect.poll(editorText(editor)).toBe('Hello from host');
  await isGone(page.getByRole('listbox'));
  // Up from the first block wraps to the last command, and the list scrolls to keep it in view.
  await replace(editor, '/');
  const list = () => document.querySelector('.env-rich-text-suggestions')!;
  await expect.poll(() => list()?.querySelectorAll('[role="option"]').length).toBe(8);
  await keyboard.press('ArrowUp');
  const last = page
    .elementLocator(list())
    .getByRole('option', { name: 'Host greeting', exact: true });
  await expect.element(last).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(() => {
      const shownBox = box(list());
      const option = box(last);
      return option.y + option.height <= shownBox.y + shownBox.height + 1;
    })
    .toBe(true);
});

test('async sources handle loading, stale resolutions, empty results, failures and cancellation', async () => {
  // Records the text each suggestions status has as it mounts.
  const mounted: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes)
        if (node instanceof Element)
          for (const status of node.querySelectorAll('.env-listbox [role="status"]'))
            mounted.push(status.textContent ?? '');
  });
  observer.observe(document.body, { childList: true, subtree: true });
  try {
    open('remote');
    const scope = page.getByTestId('rich-text-remote');
    const editor = await editorIn(scope);
    await replace(editor, '@old');
    const old = await requestIndex('old');
    const menu = page.getByRole('listbox', { name: 'Remote references' });
    // The status beside the list says why it has no options; only options sit in the list.
    const status = () =>
      document.querySelector('.env-rich-text-suggestions [role="status"]')?.textContent ?? null;
    const options = () =>
      menu
        .getByRole('option')
        .elements()
        .map((each) => each.textContent);
    const noOptionsIsAccessible = async () => {
      expect(options()).toEqual([]);
      expect(menu.getByRole('status').elements()).toHaveLength(0);
      const { violations } = await axe.run(document.querySelector('.env-rich-text-suggestions')!);
      expect(violations.map(({ id, nodes }) => `${id}: ${nodes.length}`)).toEqual([]);
    };
    await expect.element(menu).toHaveAttribute('aria-busy', 'true');
    await expect.poll(status).toContain('Loading suggestions');
    // The status mounted empty and took its message afterwards, so the message is announced.
    expect(mounted).toEqual(['']);
    await replace(editor, '@new');
    const latest = await requestIndex('new');
    await expect.poll(() => fixtureState().requests[old]!.aborted).toBe(true);
    resolveRequest(latest, 'Latest result');
    await expect.poll(options).toEqual(['Latest result']);
    expect(status()).toBe('');
    resolveRequest(old, 'Stale result');
    await expect.poll(options).toEqual(['Latest result']);
    await replace(editor, '@empty');
    resolveRequest(await requestIndex('empty'));
    await expect.poll(status).toBe('No results');
    await noOptionsIsAccessible();
    await replace(editor, '@error');
    fixtureState().requests[await requestIndex('error')]!.reject();
    await expect.poll(status).toContain('Suggestions could not load');
    await noOptionsIsAccessible();
    for (const mode of ['escape', 'disabled', 'read only'] as const) {
      focus(editor);
      await keyboard.press('ControlOrMeta+A');
      await keyboard.press('Backspace');
      await keyboard.type(`@${mode.replaceAll(' ', '')}`);
      const pending = await requestIndex(mode.replaceAll(' ', ''));
      if (mode === 'escape') await keyboard.press('Escape');
      else await scope.getByRole('button', { name: `Toggle remote ${mode}`, exact: true }).click();
      await isGone(menu);
      await expect.poll(() => fixtureState().requests[pending]!.aborted).toBe(true);
      resolveRequest(pending, 'Cancelled result');
      expect(editorText(editor)()).not.toContain('Cancelled result');
      if (mode !== 'escape') {
        await scope.getByRole('button', { name: `Toggle remote ${mode}`, exact: true }).click();
        await expect.element(editor).toHaveAttribute('contenteditable', 'true');
      }
    }
  } finally {
    observer.disconnect();
  }
});

test('controlled replacements and rejected edits stay authoritative, and links use host callbacks', async () => {
  open('controlled', 'form');
  const scope = page.getByTestId('rich-text-controlled');
  const editor = await editorIn(scope);
  await replace(editor, 'accepted edit');
  await expect.poll(text('rich-text-last-change')).toBe('accepted edit');
  await scope.getByRole('button', { name: 'Replace rich text', exact: true }).click();
  await expect.poll(() => editor.element().querySelector('h2')?.textContent).toBe('Replacement');
  await expect
    .element(editor.getByRole('link', { name: 'updated' }))
    .toHaveAttribute('href', '/updated');
  await scope.getByRole('button', { name: 'Reject rich edits', exact: true }).click();
  focus(editor);
  await keyboard.press('End');
  await keyboard.type('!');
  await expect.poll(text('rich-text-last-change')).toContain('!');
  await expect.poll(editorText(editor)).toBe('Original guide');
  const formEditor = await editorIn(page.getByTestId('rich-text-form'));
  await replace(formEditor, 'guide');
  await keyboard.press('ControlOrMeta+A');
  await page
    .getByTestId('rich-text-form')
    .getByRole('button', { name: 'Insert link', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: /URL|Address/i }).fill('/guide');
  await dialog.getByRole('button', { name: /Insert link/i }).click();
  await page.getByTestId('rich-text-preview').getByRole('link', { name: 'guide' }).click();
  await expect.poll(text('rich-text-link-click')).toBe('/guide');
  await page.getByTestId('rich-text-readonly').getByRole('link', { name: 'guide' }).click();
  await expect.poll(text('rich-text-link-click')).toBe('editor:/guide');
});

test('upload hooks insert safe images and file references, accept host cancellation and reject unsafe URLs', async () => {
  open('upload');
  const scope = page.getByTestId('rich-text-upload');
  await editorIn(scope);
  const uploaded = text('rich-text-upload-source');
  await upload(scope, 'photo.png', 'image/png');
  fixtureState().uploads[await uploadIndex('photo.png')]!.resolve({
    kind: 'image',
    url: '/photo.png',
    label: 'Photo',
  });
  await expect
    .element(scope.getByRole('img', { name: 'Photo' }))
    .toHaveAttribute('src', '/photo.png');
  await expect.poll(uploaded).toContain('![Photo](/photo.png)');
  await upload(scope, 'notes.pdf', 'application/pdf');
  fixtureState().uploads[await uploadIndex('notes.pdf')]!.resolve({
    kind: 'file',
    id: 'file-stable',
    url: '/notes.pdf',
    label: 'Notes',
  });
  await expect
    .element(scope.getByRole('link', { name: 'Notes' }))
    .toHaveAttribute('data-reference-id', 'file-stable');
  const source = uploaded();
  await upload(scope, 'cancel.txt', 'text/plain');
  fixtureState().uploads[await uploadIndex('cancel.txt')]!.resolve(null);
  await expect
    .element(scope.getByRole('button', { name: 'Attach files', exact: true }))
    .toBeEnabled();
  expect(uploaded()).toBe(source);
  await upload(scope, 'unsafe.txt', 'text/plain');
  fixtureState().uploads[await uploadIndex('unsafe.txt')]!.resolve({
    kind: 'file',
    url: 'javascript:alert(1)',
    label: 'Unsafe',
  });
  await expect
    .poll(() => scope.element().querySelector('.env-editor-status')?.textContent)
    .toContain('unsafe URL');
  expect(scope.getByRole('link', { name: 'Unsafe', exact: true }).query()).toBeNull();
  expect(uploaded()).toBe(source);
});

test('pending uploads cancel on read-only changes and refuse to insert into changed documents', async () => {
  open('upload');
  const scope = page.getByTestId('rich-text-upload');
  const editor = await editorIn(scope);
  await upload(scope, 'pending.txt', 'text/plain');
  const pending = await uploadIndex('pending.txt');
  await scope.getByRole('button', { name: 'Toggle upload read only' }).click();
  await expect.poll(() => fixtureState().uploads[pending]!.aborted).toBe(true);
  fixtureState().uploads[pending]!.resolve({ kind: 'file', url: '/late', label: 'Late' });
  await expect.poll(() => scope.getByRole('link').elements().length).toBe(0);
  await scope.getByRole('button', { name: 'Toggle upload read only' }).click();
  await upload(scope, 'changed.txt', 'text/plain');
  const changed = await uploadIndex('changed.txt');
  await replace(editor, 'New document');
  fixtureState().uploads[changed]!.resolve({
    kind: 'file',
    url: '/changed',
    label: 'Old attachment',
  });
  await expect
    .poll(() => scope.element().querySelector('.env-editor-status')?.textContent)
    .toContain('document changed during upload');
  expect(editorText(editor)()).toBe('New document');
  expect(scope.getByRole('link').elements()).toHaveLength(0);
});

test(
  'suggestions show above a Dialog the editor sits in and close as Tab leaves the editor',
  { tags: ['engines'] },
  async () => {
    open('field');
    await page.getByRole('button', { name: 'Open notes dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Notes dialog' });
    const editor = await editorIn(dialog, 'Dialog notes');
    await editor.click();
    await keyboard.type('@');
    const people = page.getByRole('listbox', { name: 'People', exact: true });
    await isShown(people);
    // The list is inside the dialog, and on top where it shows.
    expect(dialog.element().contains(people.element())).toBe(true);
    const option = people.getByRole('option', { name: 'Second person' });
    const at = box(option);
    const top = document.elementFromPoint(at.x + at.width / 2, at.y + at.height / 2);
    expect(Boolean(top && option.element().contains(top))).toBe(true);
    // Picking an option keeps the dialog open.
    await option.click();
    await expect.element(dialog).toBeVisible();
    await expect.poll(editorText(editor)).toContain('@Second person');
    // Tab leaves the editor and closes the list.
    await keyboard.type(' @');
    await isShown(people);
    await keyboard.press('Tab');
    await isGone(page.getByRole('listbox'));
    await expect.element(editor).not.toHaveFocus();
  },
);

test('a controlled editor replaces documents with references and tasks without a flushSync warning', async () => {
  const errors = collectErrors();
  const warn = console.warn;
  const warnings: string[] = [];
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(' '));
    warn(...args);
  };
  try {
    open('field');
    const scope = page.getByTestId('rich-text-field');
    const editor = await editorIn(scope, 'Controlled notes');
    await expect
      .poll(() => editor.element().querySelector('[data-reference-id="person-2"]'))
      .not.toBeNull();
    // Tasks are envUI checkboxes, named by their text.
    const task = (name: string) => editor.getByRole('checkbox', { name });
    await expect
      .poll(() => task('Check the totals').query()?.classList.contains('env-checkbox-input'))
      .toBe(true);
    await scope.getByRole('button', { name: 'Replace controlled notes' }).click();
    await expect.element(task('Send it')).toBeChecked();
    // Pressing a task's checkbox checks it in the document.
    const at = box(task('Check the totals'));
    await mouse.click(at.x + at.width / 2, at.y + at.height / 2);
    await expect.element(task('Check the totals')).toBeChecked();
    expect([...errors, ...warnings].filter((each) => /flushSync/.test(each))).toEqual([]);
  } finally {
    console.warn = warn;
  }
});
