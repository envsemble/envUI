import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;

test('rich text documentation composes generic reference editing and matching saved output', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/preview`);
  await expect(
    page.getByRole('heading', { name: 'RichText', exact: true, level: 1 }),
  ).toBeVisible();
  const example = page.getByRole('tabpanel', { name: 'Editor', exact: true });
  const editor = page.getByRole('textbox', { name: 'Rich text notes', exact: true });
  await editor.fill('Ask @');
  const contacts = page.getByRole('listbox', { name: 'Contacts', exact: true });
  await expect(contacts.getByRole('option', { name: 'Ada Lin' })).toBeVisible();
  await editor.press('ArrowDown');
  await editor.press('Enter');
  await expect(editor).toContainText('@Sam Rivera');
  await expect(contacts).toHaveCount(0);
  await editor.press('End');
  await editor.press('Space');
  await editor.press('Slash');
  const files = page.getByRole('listbox', { name: 'Files', exact: true });
  await expect(files.getByRole('option', { name: 'Outline.pdf' })).toBeVisible();
  await editor.press('Enter');
  await expect(editor).toContainText('/Outline.pdf');

  const tabs = page.getByRole('tablist', { name: 'Rich text example', exact: true });
  await tabs.getByRole('tab', { name: 'Markdown source', exact: true }).click();
  const source = page.getByRole('tabpanel', { name: 'Markdown source', exact: true });
  await expect(source).toContainText('id="contact%3Asam"');
  await expect(source).toContainText('id="file%3Aoutline"');
  await tabs.getByRole('tab', { name: 'Read-only', exact: true }).click();
  const viewer = page.getByRole('tabpanel', { name: 'Read-only', exact: true });
  await expect(viewer.getByRole('link', { name: '@Sam Rivera', exact: true })).toBeVisible();
  await viewer.getByRole('link', { name: '/Outline.pdf', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Selected reference:' })).toHaveText(
    'Selected reference: Outline.pdf',
  );
  await tabs.getByRole('tab', { name: 'Editor', exact: true }).click();
  await expect(example.getByRole('textbox')).toContainText('@Sam Rivera');
});

test('rich text documentation demonstrates controlled updates, uploads and theme retention', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/preview`);
  await page.getByRole('button', { name: 'Load another draft', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Rich text notes', exact: true });
  await expect(editor).toContainText('Another draft');
  await expect(editor).toContainText('#Accessibility');
  await editor.focus();
  await editor.evaluate(async (element) => {
    // Let the editor process focus before moving its native selection.
    await new Promise(requestAnimationFrame);
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    await new Promise(requestAnimationFrame);
  });
  await editor.press('Enter');
  await editor.press('Shift+Digit3');
  const topics = page.getByRole('listbox', { name: 'Topics', exact: true });
  await expect(topics.getByRole('option', { name: 'Research', exact: true })).toBeVisible();
  await editor.press('ArrowDown');
  await editor.press('Enter');
  await expect(editor).toContainText('#Research');

  const editorPanel = page.getByRole('tabpanel', { name: 'Editor', exact: true });
  await editorPanel.locator('input[type="file"]').setInputFiles({
    name: 'Meeting.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Sample attachment'),
  });
  await expect(editor).toContainText('Meeting.txt');
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(editor).toContainText('#Research');
  await expect(page.locator('.docs-preview')).toHaveAttribute('data-env-theme', 'dark');
  const tabs = page.getByRole('tablist', { name: 'Rich text example', exact: true });
  await tabs.getByRole('tab', { name: 'Read-only', exact: true }).click();
  const viewer = page.getByRole('tabpanel', { name: 'Read-only', exact: true });
  await expect(viewer.getByRole('heading', { name: 'Another draft', exact: true })).toBeVisible();
  await expect(viewer.getByRole('link', { name: 'Meeting.txt', exact: true })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await tabs.getByRole('tab', { name: 'Markdown source', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Markdown source', exact: true })).toContainText(
    'id="file%3AMeeting.txt"',
  );
});

test('rich text documentation exposes optional slash commands and public usage contracts', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/preview`);
  const editor = page.getByRole('textbox', { name: 'Slash command notes', exact: true });
  await editor.fill('/');
  const commands = page.getByRole('listbox');
  await expect(commands.getByRole('option', { name: 'Heading', exact: true })).toBeVisible();
  await editor.press('Enter');
  await editor.pressSequentially('A new heading');
  await expect(editor.locator('h2')).toHaveText('A new heading');
  await page.locator('.docs-page-header').getByRole('tab', { name: 'Usage', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Edit and render the same document', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Application reference lookup', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Application attachments and links', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Tiptap commands and extension points', exact: true }),
  ).toBeVisible();
});
