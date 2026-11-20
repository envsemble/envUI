import { test } from 'node:test';
import assert from 'node:assert/strict';
import { libraryStyleSheets } from '../../support/StyleSheets.ts';

test('no style sheet paints with the field fill, a token left to applications', () => {
  const uses: string[] = [];
  for (const { name, text } of libraryStyleSheets())
    for (const [index, line] of text.split('\n').entries())
      if (line.includes('var(--env-color-bg-field)'))
        uses.push(`${name}:${index + 1}: ${line.trim()}`);
  assert.deepEqual(uses, []);
});
