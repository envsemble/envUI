import { test, expect } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

test('public component, stylesheet, new export and Markdown documentation update live', async ({
  page,
}) => {
  const buttonSource = resolve('packages/ui/src/actions/Button.tsx');
  const stylesheet = resolve('packages/ui/src/styles/Button.css');
  const index = resolve('packages/ui/src/index.ts');
  const preview = resolve('apps/catalogue/src/previews/Forms.tsx');
  const documentation = resolve('docs/components/fields.md');
  const newComponent = resolve('packages/ui/src/LiveAcceptance.tsx');
  const paths = [buttonSource, stylesheet, index, preview, documentation];
  const originals = await Promise.all(paths.map((path) => readFile(path, 'utf8')));
  const version = await readFile('packages/ui/package.json', 'utf8');
  try {
    await page.goto(`${catalogueUrl}/#/components/fields/preview`);
    await page.evaluate(() => {
      (window as unknown as { liveProof: string }).liveProof = 'same-document';
    });
    await page
      .locator('.docs-preview')
      .first()
      .locator('.docs-example')
      .first()
      .getByRole('textbox', { name: 'Project name', exact: true })
      .and(page.locator('[name="project"]'))
      .fill('Preserved draft');
    await writeFile(
      buttonSource,
      originals[0].replace(
        /<ActionElement(\s+)\{\.\.\.props\}/,
        '<ActionElement$1{...props} data-env-live="updated"',
      ),
    );
    await expect(page.getByRole('tab', { name: 'Preview', exact: true })).toHaveAttribute(
      'data-env-live',
      'updated',
    );
    await writeFile(stylesheet, `${originals[1]}\n.env-button { padding-inline-start: 1.5rem; }\n`);
    await expect(page.getByRole('tab', { name: 'Preview', exact: true })).toHaveCSS(
      'padding-left',
      '24px',
    );
    await expect(
      page
        .locator('.docs-preview')
        .last()
        .locator('.docs-example')
        .first()
        .getByRole('textbox', { name: 'Project name', exact: true })
        .and(page.locator('[name="project"]')),
    ).toHaveValue('Preserved draft');
    expect(await page.evaluate(() => (window as unknown as { liveProof: string }).liveProof)).toBe(
      'same-document',
    );

    await writeFile(
      newComponent,
      'export function LiveAcceptance() { return <span data-testid="live-new-component">New shared component</span>; }\n',
    );
    await writeFile(
      index,
      `${originals[2]}\nexport { LiveAcceptance } from './LiveAcceptance.js';\n`,
    );
    await writeFile(
      preview,
      `import { LiveAcceptance } from '@envsemble/envui';\n` +
        originals[3].replace('<InputExamples />', '<LiveAcceptance /><InputExamples />'),
    );
    await expect(page.getByTestId('live-new-component')).toHaveText('New shared component');
    await writeFile(documentation, `${originals[4]}\nLive documentation acceptance.\n`);
    await page
      .locator('.docs-page-header')
      .getByRole('tab', { name: 'Usage', exact: true })
      .click();
    await expect(page.getByText('Live documentation acceptance.', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { liveProof: string }).liveProof)).toBe(
      'same-document',
    );
    expect(await readFile('packages/ui/package.json', 'utf8')).toBe(version);
  } finally {
    await Promise.all(paths.map((path, index) => writeFile(path, originals[index])));
    await unlink(newComponent).catch(() => {});
  }
});
