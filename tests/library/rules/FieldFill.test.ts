import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const styles = styleSheetsDirectory;

test('no style sheet paints with the field fill, a token left to applications', () => {
  const uses: string[] = [];
  for (const name of readdirSync(styles))
    if (name.endsWith('.css')) {
      const css = readFileSync(join(styles, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [index, line] of css.split('\n').entries())
        if (line.includes('var(--env-color-bg-field)'))
          uses.push(`${name}:${index + 1}: ${line.trim()}`);
    }
  assert.deepEqual(uses, []);
});
