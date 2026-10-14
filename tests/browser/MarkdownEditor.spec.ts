import { expect, test } from '@playwright/test';
import { fixtureUrl as fixtureServer } from './Servers';

const fixtureUrl = `${fixtureServer}/?fixture=markdown`;

test('inactive preview avoids rendering and highlighting work while retaining custom link state', async ({
  page,
}) => {
  let highlightingImports = 0;
  page.on('request', (request) => {
    if (/\/CodeHighlighting\.(?:ts|js)(?:\?|$)/.test(request.url())) highlightingImports++;
  });
  await page.goto(fixtureUrl);
  const form = page.getByTestId('markdown-form');
  const source = form.getByRole('textbox', { name: 'Workload source' });
  const originalSource = await source.inputValue();
  const initialLinkRenders = await page.evaluate(() => window.markdownPreviewWork.linkRenders);
  await source.focus();
  await source.evaluate((input: HTMLTextAreaElement) =>
    input.setSelectionRange(input.value.length, input.value.length),
  );
  await source.pressSequentially('abcdefghijklmnopqrst');
  const afterTyping = await page.evaluate(() => window.markdownPreviewWork.linkRenders);
  console.log(
    JSON.stringify({
      workload: '40 Markdown links and 20 Write edits',
      initialLinkRenders,
      writeLinkRenders: afterTyping - initialLinkRenders,
      highlightingImports,
    }),
  );
  expect(initialLinkRenders).toBe(0);
  expect(afterTyping).toBe(0);
  expect(highlightingImports).toBe(0);

  await form.getByRole('tab', { name: 'Preview', exact: true }).click();
  const link = form.getByRole('link', { name: 'Reference 0', exact: true });
  await expect(link).toBeVisible();
  await expect(form.locator('.env-markdown')).toContainText('abcdefghijklmnopqrst');
  await expect.poll(() => highlightingImports).toBe(1);
  await link.click();
  await expect(link).toHaveAttribute('data-visits', '1');
  const activeLinkRenders = await page.evaluate(() => window.markdownPreviewWork.linkRenders);
  await form.getByRole('tab', { name: 'Write', exact: true }).click();
  await source.pressSequentially(' uvwxyz');
  expect(await page.evaluate(() => window.markdownPreviewWork.linkRenders)).toBe(activeLinkRenders);
  await form.getByRole('tab', { name: 'Preview', exact: true }).click();
  await expect(form.locator('.env-markdown')).toContainText('abcdefghijklmnopqrst uvwxyz');
  await expect(link).toHaveAttribute('data-visits', '1');
  await form.getByRole('button', { name: 'Submit Markdown', exact: true }).click();
  await expect(page.getByTestId('markdown-submitted')).toHaveText(
    `${originalSource}abcdefghijklmnopqrst uvwxyz`,
  );
});

test('tab changes retain the native textarea, selection, resize, history and reset behavior', async ({
  page,
}) => {
  await page.goto(fixtureUrl);
  const form = page.getByTestId('markdown-form');
  const source = form.getByRole('textbox', { name: 'Workload source' });
  const original = await source.inputValue();
  const nativeInput = await source.elementHandle();
  await source.fill('alpha');
  await source.evaluate((input: HTMLTextAreaElement) => input.setSelectionRange(0, 5));
  await form.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(source).toHaveValue('**alpha**');
  await form.getByRole('button', { name: 'Resize text area', exact: true }).press('ArrowDown');
  const resizedHeight = await source.evaluate((input: HTMLTextAreaElement) => input.style.height);
  const selectedRange = await source.evaluate((input: HTMLTextAreaElement) => [
    input.selectionStart,
    input.selectionEnd,
  ]);
  await form.getByRole('tab', { name: 'Preview', exact: true }).click();
  await form.getByRole('button', { name: 'Submit Markdown', exact: true }).click();
  await expect(page.getByTestId('markdown-submitted')).toHaveText('**alpha**');
  await form.getByRole('tab', { name: 'Write', exact: true }).click();
  expect(
    await nativeInput!.evaluate((input) => input === document.querySelector('[name="source"]')),
  ).toBe(true);
  expect(await source.evaluate((input: HTMLTextAreaElement) => input.style.height)).toBe(
    resizedHeight,
  );
  expect(
    await source.evaluate((input: HTMLTextAreaElement) => [
      input.selectionStart,
      input.selectionEnd,
    ]),
  ).toEqual(selectedRange);
  await form.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(source).toHaveValue('alpha');
  await form.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(source).toHaveValue('**alpha**');
  await form.getByRole('tab', { name: 'Preview', exact: true }).click();
  await form.getByRole('button', { name: 'Reset Markdown', exact: true }).click();
  await expect(form.locator('.env-markdown')).toContainText('Reference 39');
  await form.getByRole('tab', { name: 'Write', exact: true }).click();
  await expect(source).toHaveValue(original);
  await expect(form.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
});

test('active preview reflects controlled replacements and preview options without stale activation', async ({
  page,
}) => {
  await page.goto(fixtureUrl);
  const scope = page.getByTestId('controlled-markdown');
  await scope.getByRole('tab', { name: 'Preview', exact: true }).click();
  await expect(scope.getByRole('heading', { name: 'Original heading', level: 2 })).toBeVisible();
  await scope.getByRole('button', { name: 'Replace Markdown document' }).click();
  await expect(scope.getByRole('heading', { name: 'Replacement heading', level: 2 })).toBeVisible();
  await expect(scope.getByRole('link', { name: 'Updated', exact: true })).toHaveAttribute(
    'href',
    '/updated',
  );
  await scope.getByRole('button', { name: 'Change preview heading offset' }).click();
  await expect(scope.getByRole('heading', { name: 'Replacement heading', level: 3 })).toBeVisible();
});

test('submitting an empty preview reveals and focuses the required native source', async ({
  page,
}) => {
  await page.goto(fixtureUrl);
  const form = page.getByTestId('required-markdown');
  await form.getByRole('tab', { name: 'Preview', exact: true }).click();
  await expect(form.getByText('Nothing to preview.')).toBeVisible();
  // Finish closing Write before native validation opens it again.
  await expect(
    form.getByRole('tabpanel', { name: 'Write', exact: true, includeHidden: true }),
  ).toBeHidden();
  await form.getByRole('button', { name: 'Submit required Markdown' }).click();
  await expect(form.getByRole('tab', { name: 'Write', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(form.getByRole('textbox', { name: 'Required source' })).toBeFocused();
  await expect(form.getByTestId('required-markdown-submissions')).toHaveText('0');
});

for (const change of ['remove', 'replace'] as const) {
  test(`a delayed highlighting import skips ${change === 'remove' ? 'unmounted' : 'superseded'} source`, async ({
    page,
  }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    let notifyRequest!: () => void;
    const requested = new Promise<void>((resolve) => {
      notifyRequest = resolve;
    });
    await page.route(/\/CodeHighlighting\.(?:ts|js)(?:\?|$)/, async (route) => {
      notifyRequest();
      await held;
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window.delayedHighlighting = { sources: [], loaded: true };
          export async function highlightCode(source) {
            window.delayedHighlighting.sources.push(source);
            return source.split(/\\r\\n|\\r|\\n/).map(content => [{content, light: {}, dark: {}}]);
          }`,
      });
    });
    await page.goto(fixtureUrl);
    const scope = page.getByTestId('highlight-lifecycle');
    await scope.getByRole('button', { name: 'Show code workload' }).click();
    await requested;
    await scope
      .getByRole('button', {
        name: change === 'remove' ? 'Remove code workload' : 'Replace code workload',
      })
      .click();
    release();
    await page.waitForFunction(
      () =>
        (window as unknown as { delayedHighlighting?: { loaded: boolean } }).delayedHighlighting
          ?.loaded,
    );
    const sources = await page.evaluate(
      () =>
        (window as unknown as { delayedHighlighting: { sources: string[] } }).delayedHighlighting
          .sources,
    );
    expect(sources).toEqual(change === 'remove' ? [] : ['const latest = 2;']);
    if (change === 'replace') await expect(scope.locator('code')).toHaveText('const latest = 2;');
  });
}
