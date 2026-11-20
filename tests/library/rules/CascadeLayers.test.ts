import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { declarations } from '../../support/StyleSheets.ts';
import { librarySourceDirectory, styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const sheets = [styleSheetsDirectory, join(librarySourceDirectory, 'generated')];

test('each theme boundary sets its color scheme, light unless it is dark itself, also nested and at high contrast', async () => {
  const schemes: string[] = [];
  for (const folder of sheets)
    for (const file of await readdir(folder))
      if (file.endsWith('.css'))
        for (const declaration of declarations(await readFile(join(folder, file), 'utf8')))
          if (declaration.prop === 'color-scheme')
            schemes.push(`${declaration.selector} ${declaration.value}`);
  assert.deepEqual(schemes.sort(), ['.env-theme light', ".env-theme[data-env-theme='dark'] dark"]);
});
