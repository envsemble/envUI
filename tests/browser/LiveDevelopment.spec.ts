import { test, expect } from '@playwright/test';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

test('public component, stylesheet and new export update live without version changes', async ({
  page,
}) => {
  const primitives = resolve('packages/ui/src/Primitives.tsx');
  const stylesheet = resolve('packages/ui/src/styles/Primitives.css');
  const index = resolve('packages/ui/src/index.ts');
  const preview = resolve('apps/docs/src/Previews.tsx');
  const newComponent = resolve('packages/ui/src/LiveAcceptance.tsx');
  const paths = [primitives, stylesheet, index, preview];
  const originals = await Promise.all(paths.map((path) => readFile(path, 'utf8')));
  const version = await readFile('packages/ui/package.json', 'utf8');
  try {
    await page.goto('http://127.0.0.1:8770/#/components/input/preview');
    await page.evaluate(() => {
      (window as unknown as { liveProof: string }).liveProof = 'same-document';
    });
    await page
      .locator('.docs-preview')
      .first()
      .getByRole('textbox', { name: 'Project name', exact: true })
      .fill('Preserved draft');
    await writeFile(
      primitives,
      originals[0].replace('type={type}', 'data-env-live="updated" type={type}'),
    );
    await expect(page.getByRole('button', { name: 'Reset examples' })).toHaveAttribute(
      'data-env-live',
      'updated',
    );
    await writeFile(stylesheet, `${originals[1]}\n.env-button { padding-inline-start: 1.5rem; }\n`);
    await expect(page.getByRole('button', { name: 'Reset examples' })).toHaveCSS(
      'padding-left',
      '24px',
    );
    await expect(
      page
        .locator('.docs-preview')
        .last()
        .getByRole('textbox', { name: 'Project name', exact: true }),
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
      `import { LiveAcceptance } from '@envsemble/ui';\n` +
        originals[3].replace(
          '<span>Examples share their state across both themes.</span>',
          '<span><LiveAcceptance /></span>',
        ),
    );
    await expect(page.getByTestId('live-new-component')).toHaveText('New shared component');
    expect(await readFile('packages/ui/package.json', 'utf8')).toBe(version);
  } finally {
    await Promise.all(paths.map((path, index) => writeFile(path, originals[index])));
    await unlink(newComponent).catch(() => {});
  }
});
