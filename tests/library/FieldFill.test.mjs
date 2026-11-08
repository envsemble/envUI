// Fields have no fill of their own, and neither do the parts inside or beside them, such as a rich
// text document's code blocks or ColorPickerButton: they take the background of what they sit on,
// or a neutral layer of the text color. The field fill, --env-color-bg-field, stays a token for
// applications, and envUI's style sheets don't paint with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const styles = fileURLToPath(new URL('../../packages/ui/src/styles/', import.meta.url));

test('no style sheet paints with the field fill', () => {
  const uses = [];
  for (const name of readdirSync(styles))
    if (name.endsWith('.css') && name !== 'Tokens.css') {
      const css = readFileSync(join(styles, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [index, line] of css.split('\n').entries())
        if (line.includes('var(--env-color-bg-field)'))
          uses.push(`${name}:${index + 1}: ${line.trim()}`);
    }
  assert.deepEqual(uses, []);
});
