import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const offline = pathToFileURL(resolve('dist/envUI.html')).href;

/** A live example of the rich text page, by its file name. */
function example(page: Page, name: string) {
  return page.locator(`.docs-live-example[data-example="${name}"]`);
}

test('rich text documentation inserts references and opens them from saved content', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/overview`);
  await expect(
    page.getByRole('heading', { name: 'RichText', exact: true, level: 1 }),
  ).toBeVisible();
  const editor = example(page, 'References').getByRole('textbox', {
    name: 'Comment',
    exact: true,
  });
  await editor.fill('Ask @');
  const people = page.getByRole('listbox', { name: 'People', exact: true });
  await expect(people.getByRole('option', { name: 'Alex Morgan' })).toBeVisible();
  await editor.press('ArrowDown');
  await editor.press('Enter');
  await expect(editor).toContainText('@Sam Lee');
  await expect(people).toHaveCount(0);
  await editor.pressSequentially('about #sup');
  const topics = page.getByRole('listbox', { name: 'Topics', exact: true });
  await expect(topics.getByRole('option', { name: 'Support', exact: true })).toBeVisible();
  await editor.press('Enter');
  await expect(editor).toContainText('#Support');
  await expect(topics).toHaveCount(0);

  const saved = example(page, 'SavedContent');
  await saved.getByRole('link', { name: '@Priya Shah', exact: true }).click();
  await expect(saved.getByRole('status')).toHaveText('Opened Priya Shah');
  await saved.getByRole('link', { name: 'launch plan', exact: true }).click();
  await expect(saved.getByRole('status')).toHaveText('Opened /docs/launch-plan');
});

test('rich text documentation previews Markdown, uploads through the application and keeps documents across themes', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/overview`);
  const notes = example(page, 'EditAndPreview');
  const editor = notes.getByRole('textbox', { name: 'Meeting notes', exact: true });
  await expect(editor).toContainText('Launch review');
  await editor.focus();
  await editor.press('ControlOrMeta+End');
  await editor.press('Enter');
  await editor.pressSequentially('Next review on Friday');
  await expect(notes.locator('.env-rich-text')).toContainText('Next review on Friday');

  const brief = example(page, 'UploadsAndLinks');
  await brief.locator('input[type="file"]').setInputFiles({
    name: 'Meeting.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Sample attachment'),
  });
  const attached = brief.getByRole('textbox', { name: 'Project brief', exact: true });
  await expect(attached.getByRole('link', { name: 'Meeting.txt', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(brief).toHaveAttribute('data-env-theme', 'dark');
  await expect(attached).toContainText('Meeting.txt');
  await expect(editor).toContainText('Next review on Friday');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('rich text documentation runs slash commands and documents the editor in every view', async ({
  page,
}) => {
  await page.goto(`${offline}#/components/rich-text/overview`);
  const editor = example(page, 'SlashCommands').getByRole('textbox', {
    name: 'Weekly notes',
    exact: true,
  });
  await editor.fill('/');
  const commands = page.getByRole('listbox', { name: 'Commands', exact: true });
  await expect(commands.getByRole('option', { name: 'Heading', exact: true })).toBeVisible();
  await expect(commands.getByRole('option', { name: 'Meeting agenda', exact: true })).toBeVisible();
  await editor.press('Enter');
  await editor.pressSequentially('A new heading');
  await expect(editor.locator('h2')).toHaveText('A new heading');

  const tabs = page.locator('.docs-page-header');
  for (const [view, heading] of [
    ['Guidelines', 'States and behaviour'],
    ['Accessibility', 'Keyboard'],
    ['Props', 'RichTextEditor'],
  ]) {
    await tabs.getByRole('tab', { name: view, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
});
