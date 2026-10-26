import { test, expect } from '@playwright/test';
import { catalogueUrl } from './Servers';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

test('public component, stylesheet, new export and Markdown documentation update live', async ({
  page,
}) => {
  const buttonSource = resolve('packages/ui/src/actions/internal/ButtonBase.tsx');
  const stylesheet = resolve('packages/ui/src/styles/Button.css');
  const index = resolve('packages/ui/src/index.ts');
  const example = resolve('apps/site/src/examples/text-field/FieldsBesideButtons.tsx');
  const documentation = resolve('docs/components/text-field.md');
  const newComponent = resolve('packages/ui/src/LiveAcceptance.tsx');
  const paths = [buttonSource, stylesheet, index, example, documentation];
  const originals = await Promise.all(paths.map((path) => readFile(path, 'utf8')));
  const version = await readFile('packages/ui/package.json', 'utf8');
  try {
    await page.goto(`${catalogueUrl}/components/text-field`);
    await page.evaluate(() => {
      (window as unknown as { liveProof: string }).liveProof = 'same-document';
    });
    // The overview's first example holds a draft that hot updates must keep.
    const projectName = page
      .getByRole('group', { name: 'TextField example', exact: true })
      .getByRole('textbox', { name: 'Project name', exact: true })
      .and(page.locator('[name="project"]'));
    await projectName.fill('Preserved draft');
    // A Button of the site's own: the page's link to the Docs.
    const docsLink = page
      .locator('.docs-page-actions')
      .getByRole('link', { name: 'Docs', exact: true });
    await writeFile(
      buttonSource,
      originals[0].replace(
        /<ActionElement(\s+)\{\.\.\.props\}/,
        '<ActionElement$1{...props} data-env-live="updated"',
      ),
    );
    await expect(docsLink).toHaveAttribute('data-env-live', 'updated');
    await writeFile(stylesheet, `${originals[1]}\n.env-button { padding-inline-start: 1.5rem; }\n`);
    await expect(docsLink).toHaveCSS('padding-left', '24px');
    await expect(projectName).toHaveValue('Preserved draft');
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
    // An example file uses the new export as an application would.
    const editedExample =
      `import { LiveAcceptance } from '@envsemble/envui';\n` +
      originals[3].replace(/(<(?:Row|Column)[^>]*>)/, '$1<LiveAcceptance />');
    expect(editedExample).toContain('<LiveAcceptance />');
    await writeFile(example, editedExample);
    await expect(
      page
        .getByRole('group', { name: 'Sizes example', exact: true })
        .getByTestId('live-new-component'),
    ).toHaveText('New shared component');
    // A guideline added to the Markdown shows on the page.
    const editedDocumentation = originals[4].replace(
      /### Labels\r?\n/,
      '$&\nLive documentation acceptance.\n',
    );
    expect(editedDocumentation).toContain('Live documentation acceptance.');
    await writeFile(documentation, editedDocumentation);
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
