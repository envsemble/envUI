import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { fixtureUrl as fixtureServer } from './helpers/Servers';

const fixtureUrl = `${fixtureServer}/RichText.html`;
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
      // A tooltip shows the name, which is no native title.
      await expect(button).not.toHaveAttribute('title');
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

test(
  "a code block scrolls rather than wraps: the document's styles win over ProseMirror's base",
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}?fixture=form`);
    const editor = page
      .getByTestId('rich-text-form')
      .getByRole('textbox', { name: 'Rich source', exact: true });
    await replace(editor, '``` ');
    await editor.pressSequentially('const answer = 42;');
    const block = editor.locator('pre');
    await expect(block).toHaveText('const answer = 42;');
    await expect(block).toHaveCSS('white-space', 'pre');
    // The base styles are envUI's, in its cascade layer: Tiptap adds no style element of its own.
    await expect(page.locator('style[data-tiptap-style]')).toHaveCount(0);
    await expect(editor).toHaveCSS('position', 'relative');
  },
);

test(
  "ProseMirror's separator stays inline under an unlayered img reset, adding no line",
  { tag: '@engines' },
  async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'ProseMirror adds the separator in Chromium and WebKit');
    await page.goto(`${fixtureUrl}?fixture=form`);
    const editor = page
      .getByTestId('rich-text-form')
      .getByRole('textbox', { name: 'Rich source', exact: true });
    // A reference, which isn't editable, that ends the paragraph makes ProseMirror add its separator.
    await replace(editor, '@river');
    await page.getByRole('option', { name: referenceLabel, exact: true }).click();
    if (/\s$/.test((await editor.locator('p').first().textContent()) ?? ''))
      await page.keyboard.press('Backspace');
    const paragraph = editor.locator('p').first();
    const separator = paragraph.locator('img.ProseMirror-separator').last();
    await expect(separator).toBeAttached();
    const before = await paragraph.evaluate((element) => element.getBoundingClientRect().height);
    // An application reset outside any cascade layer, as Tailwind's preflight has.
    await page.addStyleTag({ content: 'img { display: block; height: auto; margin: 1rem; }' });
    await expect(separator).toHaveCSS('display', 'inline');
    await expect(separator).toHaveCSS('margin-top', '0px');
    expect(await paragraph.evaluate((element) => element.getBoundingClientRect().height)).toBe(
      before,
    );
  },
);

test('a task item keeps its checkbox beside its text in the editor and in the view', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=form`);
  const editor = page
    .getByTestId('rich-text-form')
    .getByRole('textbox', { name: 'Rich source', exact: true });
  await replace(editor, '[ ] Review the outline');
  await expect(page.getByTestId('rich-text-source')).toHaveText('- [ ] Review the outline');
  const items = [
    editor.locator('ul[data-type="taskList"] > li'),
    page.getByTestId('rich-text-preview').locator('ul[data-type="taskList"] > li'),
  ];
  for (const item of items) {
    const [checkbox, text] = await Promise.all([
      item.getByRole('checkbox').boundingBox(),
      item.getByText('Review the outline', { exact: true }).boundingBox(),
    ]);
    expect(text!.x).toBeGreaterThan(checkbox!.x + checkbox!.width);
    expect(
      Math.abs(text!.y + text!.height / 2 - (checkbox!.y + checkbox!.height / 2)),
    ).toBeLessThan(8);
  }
  // The task's row is as tall in the view as in the editor.
  const [edited, shown] = await Promise.all(items.map((item) => item.boundingBox()));
  expect(Math.abs(edited!.height - shown!.height)).toBeLessThan(1);
});

test(
  'formatting, native history, form submission and reset use Markdown values',
  { tag: '@engines' },
  async ({ page }) => {
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
  },
);

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

test(
  'generic at, hash and slash sources support arrow selection, Escape and IME Enter',
  { tag: '@engines' },
  async ({ page }) => {
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
  },
);

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
  // Up from the first block wraps to the last command, and the list scrolls to keep it in view.
  await replace(editor, '/');
  const list = page.locator('.env-rich-text-suggestions');
  await expect(list.getByRole('option')).toHaveCount(8);
  await editor.press('ArrowUp');
  const last = list.getByRole('option', { name: 'Host greeting', exact: true });
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(async () => {
      const [shown, option] = await Promise.all([list.boundingBox(), last.boundingBox()]);
      return option!.y + option!.height <= shown!.y + shown!.height + 1;
    })
    .toBe(true);
});

test('async sources handle loading, stale resolutions, empty results, failures and cancellation', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=remote`);
  const scope = page.getByTestId('rich-text-remote');
  const editor = scope.getByRole('textbox');
  // Records the text each suggestions status has as it mounts.
  await page.evaluate(() => {
    const mounted: string[] = [];
    (window as unknown as { statusesAtMount: string[] }).statusesAtMount = mounted;
    new MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node instanceof Element)
            for (const status of node.querySelectorAll('.env-listbox [role="status"]'))
              mounted.push(status.textContent ?? '');
    }).observe(document.body, { childList: true, subtree: true });
  });
  await replace(editor, '@old');
  const old = await requestIndex(page, 'old');
  const menu = page.getByRole('listbox', { name: 'Remote references' });
  // The status beside the list says why it has no options; only options sit in the list.
  const status = page.locator('.env-rich-text-suggestions').getByRole('status');
  const noOptionsIsAccessible = async () => {
    await expect(menu.getByRole('option')).toHaveCount(0);
    await expect(menu.getByRole('status')).toHaveCount(0);
    const { violations } = await new AxeBuilder({ page })
      .include('.env-rich-text-suggestions')
      .analyze();
    expect(violations.map(({ id, nodes }) => `${id}: ${nodes.length}`)).toEqual([]);
  };
  await expect(menu).toHaveAttribute('aria-busy', 'true');
  await expect(status).toContainText('Loading suggestions');
  // The status mounted empty and took its message afterwards, so the message is announced.
  expect(
    await page.evaluate(() => (window as unknown as { statusesAtMount: string[] }).statusesAtMount),
  ).toEqual(['']);
  await replace(editor, '@new');
  const latest = await requestIndex(page, 'new');
  await expect
    .poll(() => page.evaluate((index) => window.richTextFixture.requests[index].aborted, old))
    .toBe(true);
  await resolveRequest(page, latest, 'Latest result');
  await expect(menu.getByRole('option')).toHaveText('Latest result');
  await expect(status).toBeEmpty();
  await resolveRequest(page, old, 'Stale result');
  await expect(menu.getByRole('option')).toHaveText('Latest result');
  await replace(editor, '@empty');
  await resolveRequest(page, await requestIndex(page, 'empty'));
  await expect(status).toHaveText('No results');
  await noOptionsIsAccessible();
  await replace(editor, '@error');
  const failed = await requestIndex(page, 'error');
  await page.evaluate((index) => window.richTextFixture.requests[index].reject(), failed);
  await expect(status).toContainText('Suggestions could not load');
  await noOptionsIsAccessible();
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
  await expect(scope.locator('.env-editor-status')).toContainText('unsafe URL');
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
  await expect(scope.locator('.env-editor-status')).toContainText('document changed during upload');
  await expect(scope.getByRole('textbox')).toHaveText('New document');
  await expect(scope.getByRole('link')).toHaveCount(0);
});

test('the document takes the field look: border, variants, error and a disabled field with a readable label', async ({
  page,
}) => {
  await page.goto(`${fixtureUrl}?fixture=field`);
  const scope = page.getByTestId('rich-text-field');
  const box = (name: string) =>
    scope
      .getByRole('textbox', { name, exact: true })
      .locator('xpath=ancestor::*[contains(@class, "env-text-field-control")][1]');
  const color = (token: string) =>
    scope.evaluate((element, value) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${value})`;
      element.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    }, token);
  // Outlined, the field's border is the field border, which holds 3:1 against the page.
  const outline = scope
    .getByRole('textbox', { name: 'Dialog notes' })
    .or(scope.getByRole('textbox', { name: 'Controlled notes' }))
    .first();
  await expect(
    outline.locator(
      'xpath=ancestor::*[contains(@class, "env-text-field-control")][1]/*[contains(@class, "env-text-field-border")]',
    ),
  ).toHaveCSS('border-top-color', await color('--env-color-border-default'));
  // Ghost draws no border or fill at rest.
  await expect(box('Ghost notes')).toHaveAttribute('data-variant', 'ghost');
  await expect(box('Ghost notes')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  // The error makes the document invalid and its border the error color.
  const invalid = scope.getByRole('textbox', { name: 'Invalid notes' });
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAccessibleDescription('Say what changed. Write at least a sentence.');
  await expect(box('Invalid notes').locator(':scope > .env-text-field-border')).toHaveCSS(
    'border-top-color',
    await color('--env-color-fg-danger'),
  );
  // Disabled, the document dims, and its label keeps the text color.
  const disabled = scope.getByRole('textbox', { name: 'Disabled notes' });
  await expect(box('Disabled notes')).toHaveCSS('opacity', /^0\.\d+$/);
  const label = scope.getByText('Disabled notes', { exact: true });
  await expect(label).toHaveCSS('color', await color('--env-color-fg-default'));
  expect(
    await label.evaluate((element) => {
      let opacity = 1;
      for (let node: Element | null = element; node; node = node.parentElement)
        opacity *= Number(getComputedStyle(node).opacity);
      return opacity;
    }),
  ).toBe(1);
  await expect(disabled).toHaveAttribute('contenteditable', 'false');
});

test(
  'suggestions show above a Dialog the editor sits in and close as Tab leaves the editor',
  { tag: '@engines' },
  async ({ page }) => {
    await page.goto(`${fixtureUrl}?fixture=field`);
    await page.getByRole('button', { name: 'Open notes dialog' }).click();
    const dialog = page.getByRole('dialog', { name: 'Notes dialog' });
    const editor = dialog.getByRole('textbox', { name: 'Dialog notes' });
    await editor.click();
    await editor.pressSequentially('@');
    const people = page.getByRole('listbox', { name: 'People', exact: true });
    await expect(people).toBeVisible();
    // The list is inside the dialog, and on top where it shows.
    await expect(dialog.getByRole('listbox', { name: 'People', exact: true })).toBeVisible();
    const option = people.getByRole('option', { name: 'Second person' });
    const center = await option.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return Boolean(top && element.contains(top));
    });
    expect(center).toBe(true);
    // Picking an option keeps the dialog open.
    await option.click();
    await expect(dialog).toBeVisible();
    await expect(editor).toContainText('@Second person');
    // Tab leaves the editor and closes the list.
    await editor.pressSequentially(' @');
    await expect(people).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(editor).not.toBeFocused();
  },
);

test('a controlled editor replaces documents with references and tasks without a flushSync warning', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text());
  });
  await page.goto(`${fixtureUrl}?fixture=field`);
  const scope = page.getByTestId('rich-text-field');
  const editor = scope.getByRole('textbox', { name: 'Controlled notes' });
  await expect(editor.locator('[data-reference-id="person-2"]').first()).toBeVisible();
  // Tasks are envUI checkboxes, named by their text.
  await expect(editor.getByRole('checkbox', { name: 'Check the totals' })).toHaveClass(
    /env-checkbox-input/,
  );
  await scope.getByRole('button', { name: 'Replace controlled notes' }).click();
  await expect(editor.getByRole('checkbox', { name: 'Send it' })).toBeChecked();
  // Pressing a task's checkbox checks it in the document.
  await editor.getByRole('checkbox', { name: 'Check the totals' }).check();
  await expect(editor.getByRole('checkbox', { name: 'Check the totals' })).toBeChecked();
  expect(errors.filter((text) => /flushSync/.test(text))).toEqual([]);
});

test('the formatting toolbar is one tab stop, in groups the arrow keys cross', async ({ page }) => {
  await page.goto(`${fixtureUrl}?fixture=upload`);
  const scope = page.getByTestId('rich-text-upload');
  const toolbar = scope.getByRole('toolbar', { name: 'Rich text formatting' });
  const button = (name: string) => toolbar.getByRole('button', { name, exact: true });
  /** The toolbar's buttons that Tab stops at. */
  const tabStops = () =>
    toolbar
      .getByRole('button')
      .evaluateAll((buttons) =>
        buttons.filter((each) => each.tabIndex === 0).map((each) => each.ariaLabel),
      );
  // Text styles, lists, blocks, links and tables, history and the editor's own, a line between each.
  await expect(toolbar.getByRole('group')).toHaveCount(6);
  await expect(toolbar.getByRole('separator')).toHaveCount(5);
  // Marks are toggle buttons.
  await expect(button('Bold')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(tabStops).toEqual(['Heading']);
  await button('Heading').focus();
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
    await page.keyboard.press(key);
    await expect(button(name)).toBeFocused();
  }
  // The button last focused is the one tab stop; Tab leaves the toolbar for the document.
  await expect.poll(tabStops).toEqual(['Insert table']);
  await page.keyboard.press('Tab');
  await expect(scope.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(button('Insert table')).toBeFocused();
});
