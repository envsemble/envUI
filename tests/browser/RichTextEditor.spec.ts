import { expect, test, type Locator, type Page } from '@playwright/test';
import { fixtureUrl as fixtureServer } from './Servers';

const fixtureUrl = `${fixtureServer}/rich-text.html`;
const referenceId = 'record/"42"[a]';
const referenceLabel = 'River [east] "quote", slash/ amp&!';

async function replace(editor: Locator, text: string) {
  await editor.focus();
  await editor.press('ControlOrMeta+A');
  await editor.press('Backspace');
  if (text) await editor.pressSequentially(text);
}

async function requestIndex(page: Page, query: string) {
  await expect
    .poll(() =>
      page.evaluate(
        (value) =>
          window.richTextFixture.requests.findLastIndex((request) => request.query === value),
        query,
      ),
    )
    .toBeGreaterThanOrEqual(0);
  return page.evaluate(
    (value) => window.richTextFixture.requests.findLastIndex((request) => request.query === value),
    query,
  );
}

async function resolveRequest(page: Page, index: number, label?: string) {
  await page.evaluate(
    ({ index, label }) =>
      window.richTextFixture.requests[index].resolve(label ? [{ id: label, label }] : []),
    { index, label },
  );
}

async function uploadIndex(page: Page, file: string) {
  await expect
    .poll(() =>
      page.evaluate(
        (name) => window.richTextFixture.uploads.findLastIndex((request) => request.query === name),
        file,
      ),
    )
    .toBeGreaterThanOrEqual(0);
  return page.evaluate(
    (name) => window.richTextFixture.uploads.findLastIndex((request) => request.query === name),
    file,
  );
}

test('formatting toolbar uses named SVG icon buttons and stays compact at narrow widths', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=upload`);
  const scope = page.getByTestId('rich-text-upload');
  const toolbar = scope.getByRole('toolbar', { name: 'Rich text formatting' });
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
  for (const width of [1200, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(toolbar).toBeVisible();
    await expect(toolbar.getByRole('button')).toHaveCount(labels.length);
    for (const label of labels) {
      const button = toolbar.getByRole('button', { name: label, exact: true });
      await expect(button).toHaveAttribute('title', label);
      await expect(button.locator('svg[aria-hidden="true"] path')).not.toHaveCount(0);
    }
    const geometry = await toolbar.evaluate((root) => {
      const bounds = root.getBoundingClientRect();
      const buttons = Array.from(root.querySelectorAll('button')).map((button) => ({
        text: button.textContent,
        bounds: button.getBoundingClientRect().toJSON(),
      }));
      const viewport = root.parentElement!;
      return {
        height: bounds.height,
        buttons,
        viewportWidth: viewport.clientWidth,
        viewportRight: viewport.getBoundingClientRect().right,
        scrollWidth: viewport.scrollWidth,
      };
    });
    expect(geometry.height).toBeLessThanOrEqual(48);
    expect(geometry.viewportRight).toBeLessThanOrEqual(width);
    for (const button of geometry.buttons) {
      expect(button.text).toBe('');
      expect(button.bounds.width).toBeGreaterThanOrEqual(32);
      expect(button.bounds.height).toBeLessThanOrEqual(48);
      expect(button.bounds.top).toBe(geometry.buttons[0].bounds.top);
    }
    if (width === 390) expect(geometry.scrollWidth).toBeGreaterThan(geometry.viewportWidth);
    await toolbar.getByRole('button', { name: 'Heading', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(toolbar.getByRole('button', { name: 'Bold', exact: true })).toBeFocused();
  }
});

test('theme and renderer changes preserve uncontrolled content, history and keyboard reference actions', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=themed`);
  const scope = page.getByTestId('rich-text-themed');
  const editor = scope.getByRole('textbox');
  await replace(editor, '@');
  await page.getByRole('option', { name: 'Second person' }).click();
  await editor.press('ControlOrMeta+A');
  await scope.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(editor.locator('strong')).toHaveText('First Second person');
  await scope.getByRole('button', { name: 'Switch rich theme', exact: true }).click();
  await expect(scope).toHaveAttribute('data-env-theme', 'dark');
  await expect(editor).toContainText('First Second person');
  await scope.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor.locator('strong')).toHaveCount(0);
  await expect(editor).toContainText('First Second person');
  const reference = editor.getByTestId('rich-text-custom-reference');
  await expect(reference).toHaveAttribute('data-readonly', 'false');
  await scope.getByRole('button', { name: 'Toggle themed read only', exact: true }).click();
  await expect(reference).toHaveAttribute('data-readonly', 'true');
  await scope.getByRole('button', { name: 'Change rich reference renderer', exact: true }).click();
  await expect(reference).toHaveText('Updated Second person');
  const action = editor.getByRole('button', { name: 'Updated Second person', exact: true });
  await action.focus();
  await action.press('Enter');
  await expect(scope.getByTestId('rich-text-keyboard-clicks')).toHaveText('1');
  const viewAction = scope
    .getByTestId('rich-text-keyboard-view')
    .getByRole('button', { name: '@Second person', exact: true });
  await viewAction.focus();
  await viewAction.press('Space');
  await expect(scope.getByTestId('rich-text-keyboard-clicks')).toHaveText('2');
});

test('a task item keeps its checkbox beside its text in the editor and in the view', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=form`);
  const editor = page
    .getByTestId('rich-text-form')
    .getByRole('textbox', { name: 'Rich source', exact: true });
  await replace(editor, '[ ] Review the outline');
  await expect(page.getByTestId('rich-text-source')).toHaveText('- [ ] Review the outline');
  for (const item of [
    editor.locator('ul[data-type="taskList"] > li'),
    page.getByTestId('rich-text-preview').locator('ul[data-type="taskList"] > li'),
  ]) {
    const [checkbox, text] = await Promise.all([
      item.getByRole('checkbox').boundingBox(),
      item.getByText('Review the outline', { exact: true }).boundingBox(),
    ]);
    expect(text!.x).toBeGreaterThan(checkbox!.x + checkbox!.width);
    expect(
      Math.abs(text!.y + text!.height / 2 - (checkbox!.y + checkbox!.height / 2)),
    ).toBeLessThan(8);
  }
});

test('formatting, native history, form submission and reset use Markdown values', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=form`);
  const form = page.getByTestId('rich-text-form');
  const editor = form.getByRole('textbox', { name: 'Rich source', exact: true });
  await editor.focus();
  await editor.press('ControlOrMeta+A');
  await form.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(editor.locator('strong')).toHaveText('alpha');
  await expect(page.getByTestId('rich-text-source')).toHaveText('**alpha**');
  await form.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(editor.locator('strong')).toHaveCount(0);
  await form.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(editor.locator('strong')).toHaveText('alpha');
  await form.getByRole('button', { name: 'Submit rich text', exact: true }).click();
  await expect(page.getByTestId('rich-text-submitted')).toHaveText('**alpha**');
  await form.getByRole('button', { name: 'Reset rich text', exact: true }).click();
  await expect(editor).toHaveText('alpha');
  await expect(editor.locator('strong')).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle form disabled', exact: true }).click();
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await form.getByRole('button', { name: 'Submit rich text', exact: true }).click();
  await expect(page.getByTestId('rich-text-submitted')).toHaveText('missing');
});

test('references preserve punctuation and stable identities through editor and shared view Markdown roundtrips', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=form`);
  const editor = page
    .getByTestId('rich-text-form')
    .getByRole('textbox', { name: 'Rich source', exact: true });
  await replace(editor, '@river');
  await page.getByRole('option', { name: referenceLabel, exact: true }).click();
  const serialized = await page.getByTestId('rich-text-source').textContent();
  expect(serialized).toContain(`id="${encodeURIComponent(referenceId)}"`);
  expect(serialized).toContain(`label="${encodeURIComponent(referenceLabel)}"`);
  await page.getByRole('button', { name: 'Reparse rich text', exact: true }).click();
  await expect(page.getByTestId('rich-text-source')).toHaveText(serialized!);
  await expect(editor.locator('a[data-reference-id]')).toHaveAttribute(
    'data-reference-id',
    referenceId,
  );
  const preview = page.getByTestId('rich-text-preview');
  await expect(preview.getByRole('link')).toHaveText(`@${referenceLabel}`);
  await preview.getByRole('link').click();
  await expect(page.getByTestId('rich-text-reference-click')).toHaveText(
    `${referenceId}|${referenceLabel}|application-record|@`,
  );
  const readonly = page.getByTestId('rich-text-readonly').getByRole('textbox');
  await expect(readonly).toHaveAttribute('contenteditable', 'false');
  await readonly.getByRole('link').click();
  await expect(page.getByTestId('rich-text-reference-click')).toHaveText(`editor:${referenceId}`);
});

test('generic at, hash and slash sources support arrow selection, Escape and IME Enter', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=form`);
  const editor = page
    .getByTestId('rich-text-form')
    .getByRole('textbox', { name: 'Rich source', exact: true });
  await replace(editor, '@');
  const people = page.getByRole('listbox', { name: 'People', exact: true });
  await expect(people).toBeVisible();
  await editor.press('ArrowDown');
  await expect(people.getByRole('option', { name: 'Second person' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(editor).toHaveAttribute(
    'aria-activedescendant',
    (await people.getByRole('option', { name: 'Second person' }).getAttribute('id'))!,
  );
  await editor.press('ArrowUp');
  await expect(people.getByRole('option', { name: referenceLabel, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await editor.evaluate((element) =>
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  await expect(editor.locator('[data-reference-id]')).toHaveCount(0);
  await replace(editor, '');
  await replace(editor, '@');
  await expect(people).toBeVisible();
  await editor.press('ArrowDown');
  await editor.press('Enter');
  await expect(editor).toContainText('@Second person');
  await expect(people).toHaveCount(0);
  await replace(editor, '#');
  await expect(page.getByRole('listbox', { name: 'Records', exact: true })).toBeVisible();
  await editor.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(editor).toHaveText('#');
  await replace(editor, '');
  await replace(editor, '#road');
  await page.getByRole('option', { name: 'Roadmap issue' }).click();
  await expect(editor).toContainText('#Roadmap issue');
  await replace(editor, '/release');
  await expect(page.getByRole('listbox', { name: 'Files', exact: true })).toBeVisible();
  await editor.press('Enter');
  await expect(editor).toContainText('/Release file');
});

test('slash commands execute standard Tiptap blocks and application actions', async ({ page }) => {
  await page.goto(`${fixtureUrl}?fixture=commands`);
  const editor = page.getByTestId('rich-text-commands').getByRole('textbox');
  await replace(editor, '/heading');
  await page.getByRole('option', { name: 'Heading', exact: true }).click();
  await editor.pressSequentially('A heading');
  await expect(editor.locator('h2')).toHaveText('A heading');
  await replace(editor, '/host');
  await page.getByRole('option', { name: 'Host greeting', exact: true }).click();
  await expect(editor).toHaveText('Hello from host');
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('async sources handle loading, stale resolutions, empty results, failures and cancellation', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=remote`);
  const scope = page.getByTestId('rich-text-remote');
  const editor = scope.getByRole('textbox');
  await replace(editor, '@old');
  const old = await requestIndex(page, 'old');
  const menu = page.getByRole('listbox', { name: 'Remote references' });
  await expect(menu).toHaveAttribute('aria-busy', 'true');
  await expect(menu).toContainText('Loading suggestions');
  await replace(editor, '@new');
  const latest = await requestIndex(page, 'new');
  await expect
    .poll(() => page.evaluate((index) => window.richTextFixture.requests[index].aborted, old))
    .toBe(true);
  await resolveRequest(page, latest, 'Latest result');
  await expect(menu.getByRole('option')).toHaveText('Latest result');
  await resolveRequest(page, old, 'Stale result');
  await expect(menu.getByRole('option')).toHaveText('Latest result');
  await replace(editor, '@empty');
  await resolveRequest(page, await requestIndex(page, 'empty'));
  await expect(menu).toContainText('No results');
  await replace(editor, '@error');
  const failed = await requestIndex(page, 'error');
  await page.evaluate((index) => window.richTextFixture.requests[index].reject(), failed);
  await expect(menu).toContainText('Suggestions could not load');
  for (const mode of ['escape', 'disabled', 'read only'] as const) {
    await editor.focus();
    await editor.press('ControlOrMeta+A');
    await editor.press('Backspace');
    await editor.pressSequentially(`@${mode.replaceAll(' ', '')}`);
    const pending = await requestIndex(page, mode.replaceAll(' ', ''));
    if (mode === 'escape') await editor.press('Escape');
    else await scope.getByRole('button', { name: `Toggle remote ${mode}`, exact: true }).click();
    await expect(menu).toHaveCount(0);
    await expect
      .poll(() => page.evaluate((index) => window.richTextFixture.requests[index].aborted, pending))
      .toBe(true);
    await resolveRequest(page, pending, 'Cancelled result');
    await expect(editor).not.toContainText('Cancelled result');
    if (mode !== 'escape') {
      await scope.getByRole('button', { name: `Toggle remote ${mode}`, exact: true }).click();
      await expect(editor).toHaveAttribute('contenteditable', 'true');
    }
  }
});

test('controlled replacements and rejected edits stay authoritative, and links use host callbacks', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=controlled&fixture=form`);
  const scope = page.getByTestId('rich-text-controlled');
  const editor = scope.getByRole('textbox');
  await replace(editor, 'accepted edit');
  await expect(scope.getByTestId('rich-text-last-change')).toHaveText('accepted edit');
  await scope.getByRole('button', { name: 'Replace rich text', exact: true }).click();
  await expect(editor.locator('h2')).toHaveText('Replacement');
  await expect(editor.getByRole('link', { name: 'updated' })).toHaveAttribute('href', '/updated');
  await scope.getByRole('button', { name: 'Reject rich edits', exact: true }).click();
  await editor.focus();
  await editor.press('End');
  await editor.pressSequentially('!');
  await expect(scope.getByTestId('rich-text-last-change')).toContainText('!');
  await expect(editor).toHaveText('Original guide');
  const formEditor = page.getByTestId('rich-text-form').getByRole('textbox');
  await replace(formEditor, 'guide');
  await formEditor.press('ControlOrMeta+A');
  await page
    .getByTestId('rich-text-form')
    .getByRole('button', { name: 'Insert link', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: /URL|Address/i }).fill('/guide');
  await dialog.getByRole('button', { name: /Insert link/i }).click();
  await page.getByTestId('rich-text-preview').getByRole('link', { name: 'guide' }).click();
  await expect(page.getByTestId('rich-text-link-click')).toHaveText('/guide');
  await page.getByTestId('rich-text-readonly').getByRole('link', { name: 'guide' }).click();
  await expect(page.getByTestId('rich-text-link-click')).toHaveText('editor:/guide');
});

test('upload hooks insert safe images and file references, accept host cancellation and reject unsafe URLs', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=upload`);
  const scope = page.getByTestId('rich-text-upload');
  const files = scope.locator('input[type=file]');
  await files.setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('fixture'),
  });
  const image = await uploadIndex(page, 'photo.png');
  await page.evaluate(
    (index) =>
      window.richTextFixture.uploads[index].resolve({
        kind: 'image',
        url: '/photo.png',
        label: 'Photo',
      }),
    image,
  );
  await expect(scope.getByRole('img', { name: 'Photo' })).toHaveAttribute('src', '/photo.png');
  await expect(scope.getByTestId('rich-text-upload-source')).toContainText('![Photo](/photo.png)');
  await files.setInputFiles({
    name: 'notes.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('fixture'),
  });
  const file = await uploadIndex(page, 'notes.pdf');
  await page.evaluate(
    (index) =>
      window.richTextFixture.uploads[index].resolve({
        kind: 'file',
        id: 'file-stable',
        url: '/notes.pdf',
        label: 'Notes',
      }),
    file,
  );
  await expect(scope.getByRole('link', { name: 'Notes' })).toHaveAttribute(
    'data-reference-id',
    'file-stable',
  );
  const source = await scope.getByTestId('rich-text-upload-source').textContent();
  await files.setInputFiles({
    name: 'cancel.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('fixture'),
  });
  await page.evaluate(
    (index) => window.richTextFixture.uploads[index].resolve(null),
    await uploadIndex(page, 'cancel.txt'),
  );
  await expect(scope.getByRole('button', { name: 'Attach files', exact: true })).toBeEnabled();
  await expect(scope.getByTestId('rich-text-upload-source')).toHaveText(source!);
  await files.setInputFiles({
    name: 'unsafe.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('fixture'),
  });
  await page.evaluate(
    (index) =>
      window.richTextFixture.uploads[index].resolve({
        kind: 'file',
        url: 'javascript:alert(1)',
        label: 'Unsafe',
      }),
    await uploadIndex(page, 'unsafe.txt'),
  );
  await expect(scope.locator('.env-markdown-editor-status')).toContainText('unsafe URL');
  await expect(scope.getByRole('link', { name: 'Unsafe', exact: true })).toHaveCount(0);
  await expect(scope.getByTestId('rich-text-upload-source')).toHaveText(source!);
});

test('pending uploads cancel on read-only changes and refuse to insert into changed documents', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=upload`);
  const scope = page.getByTestId('rich-text-upload');
  const files = scope.locator('input[type=file]');
  await files.setInputFiles({
    name: 'pending.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('fixture'),
  });
  const pending = await uploadIndex(page, 'pending.txt');
  await scope.getByRole('button', { name: 'Toggle upload read only' }).click();
  await expect
    .poll(() => page.evaluate((index) => window.richTextFixture.uploads[index].aborted, pending))
    .toBe(true);
  await page.evaluate(
    (index) =>
      window.richTextFixture.uploads[index].resolve({ kind: 'file', url: '/late', label: 'Late' }),
    pending,
  );
  await expect(scope.getByRole('link')).toHaveCount(0);
  await scope.getByRole('button', { name: 'Toggle upload read only' }).click();
  await files.setInputFiles({
    name: 'changed.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('fixture'),
  });
  const changed = await uploadIndex(page, 'changed.txt');
  await replace(scope.getByRole('textbox'), 'New document');
  await page.evaluate(
    (index) =>
      window.richTextFixture.uploads[index].resolve({
        kind: 'file',
        url: '/changed',
        label: 'Old attachment',
      }),
    changed,
  );
  await expect(scope.locator('.env-markdown-editor-status')).toContainText(
    'document changed during upload',
  );
  await expect(scope.getByRole('textbox')).toHaveText('New document');
  await expect(scope.getByRole('link')).toHaveCount(0);
});
