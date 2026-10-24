// An avatar shown as chosen: a ring and a check, a look only, which the control around it announces.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/AvatarSelected.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: "export { Avatar } from './packages/ui/src/content/Avatar.tsx';",
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: output,
  logLevel: 'error',
});
const { Avatar } = await import(pathToFileURL(output).href);

test('a selected avatar marks its state and draws a check hidden from assistive technology', () => {
  const markup = renderToStaticMarkup(h(Avatar, { name: 'Sam Lee', named: true, selected: true }));
  assert.match(markup, /data-selected=""/);
  assert.match(markup, /<span class="env-avatar-check" aria-hidden="true">/);
  // The avatar stays an image named by the person: the control around it says it is chosen.
  assert.match(markup, /role="img"/);
  assert.match(markup, /aria-label="Sam Lee"/);
  assert.doesNotMatch(markup, /aria-(selected|checked|pressed)/);
  const plain = renderToStaticMarkup(h(Avatar, { name: 'Sam Lee' }));
  assert.doesNotMatch(plain, /data-selected|env-avatar-check/);
});

test('the chosen look is a ring and a check, not color alone, with a forced-colors outline', () => {
  const css = readFileSync(join(repository, 'packages/ui/src/styles/Avatar.css'), 'utf8');
  assert.match(css, /\.env-avatar\[data-selected\] \{[^}]*box-shadow:/);
  assert.match(css, /\.env-avatar-check \{[^}]*position: absolute;/);
  assert.match(
    css,
    /@media \(forced-colors: active\) \{[^@]*\.env-avatar\[data-selected\] \{[^}]*outline:/,
  );
});
