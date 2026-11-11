// The color scheme each theme boundary sets, read from the style sheets that declare it: every
// boundary sets its own, so a nested one and one at high contrast take their theme's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { declarations } from '../support/CssDeclarations.mjs';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const sheets = ['packages/ui/src/styles', 'packages/ui/src/generated'];

test('each theme boundary sets its color scheme, also nested and at high contrast', async () => {
  const schemes = [];
  for (const folder of sheets)
    for (const file of await readdir(join(repositoryRoot, folder)))
      if (file.endsWith('.css'))
        for (const declaration of declarations(
          await readFile(join(repositoryRoot, folder, file), 'utf8'),
        ))
          if (declaration.prop === 'color-scheme')
            schemes.push(`${declaration.selector} ${declaration.value}`);
  // Each boundary, .env-theme, is light unless it is dark itself, whatever it sits in; contrast
  // leaves the scheme to the theme.
  assert.deepEqual(schemes.sort(), ['.env-theme light', ".env-theme[data-env-theme='dark'] dark"]);
});
