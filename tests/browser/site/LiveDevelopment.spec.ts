import { test, expect } from '@playwright/test';
import { siteDevUrl } from '../support/Servers';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const edits = [
  'data-env-live',
  '.env-button { padding-inline-start: 1.5rem; }',
  'LiveAcceptance',
  'Live documentation acceptance.',
];

function served(path: string) {
  const inSite = relative(resolve('apps/site'), path);
  const address = inSite.startsWith('..') ? `/@fs/${path.replace(/^\//, '')}` : `/${inSite}`;
  return fetch(`${siteDevUrl}${address.replaceAll('\\', '/')}`);
}

async function editedOnServer(files: string[]) {
  const edited = await Promise.all(
    files.map(async (path) => {
      const text = await (await served(path)).text();
      return edits.some((edit) => text.includes(edit)) ? [path] : [];
    }),
  );
  return edited.flat();
}

test('public component, stylesheet, new export and Markdown documentation update live', async ({
  page,
}) => {
  const buttonSource = resolve('packages/ui/src/actions/internal/ButtonBase.tsx');
  const stylesheet = resolve('packages/ui/src/styles/Button.css');
  const index = resolve('packages/ui/src/index.ts');
  const example = resolve('apps/site/src/examples/text-field/FieldsBesideButtons.tsx');
  const documentation = resolve('docs/components/text-field.md');
  const newComponent = resolve('packages/ui/src/LiveAcceptance.tsx');
  const modules = [buttonSource, stylesheet, index, example, newComponent];
  const paths = [buttonSource, stylesheet, index, example, documentation];
  const generated = [
    resolve('apps/site/src/generated/pages/text-field.json'),
    resolve('apps/site/src/generated/Documentation.ts'),
  ];
  const originals = await Promise.all(paths.map((path) => readFile(path, 'utf8')));
  const version = await readFile('packages/ui/package.json', 'utf8');
  await expect.poll(() => editedOnServer([...modules, ...generated])).toEqual([]);
  try {
    await page.goto(`${siteDevUrl}/components/text-field`);
    await page.evaluate(() => {
      (window as unknown as { liveProof: string }).liveProof = 'same-document';
    });
    const projectName = page
      .getByRole('group', { name: 'TextField example', exact: true })
      .getByRole('textbox', { name: 'Project name', exact: true })
      .and(page.locator('[name="project"]'));
    await projectName.fill('Preserved draft');
    const displayButton = page
      .locator('.site-top-bar .site-wide-only')
      .getByRole('button', { name: 'Display', exact: true });
    await writeFile(
      buttonSource,
      originals[0].replace(
        /<ActionElement(\s+)\{\.\.\.props\}/,
        '<ActionElement$1{...props} data-env-live="updated"',
      ),
    );
    await expect(displayButton).toHaveAttribute('data-env-live', 'updated');
    await writeFile(stylesheet, `${originals[1]}\n.env-button { padding-inline-start: 1.5rem; }\n`);
    await expect(displayButton).toHaveCSS('padding-left', '24px');
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
    const editedDocumentation = originals[4].replace(
      /### Sizes\r?\n/,
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
    await Promise.all(
      paths.map(async (path, index) => {
        if ((await readFile(path, 'utf8')) !== originals[index])
          await writeFile(path, originals[index]);
      }),
    );
    await unlink(newComponent).catch(() => {});
  }
});
