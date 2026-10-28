// Badge's markup: a label, or with count a compact count named for assistive technology, which the
// style sheet reads by data-count.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/Badge.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: "export { Badge } from './packages/ui/src/content/Badge.tsx';",
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  // The style sheets the modules import are the browser's concern.
  loader: { '.css': 'empty' },
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: output,
  logLevel: 'error',
});
const { Badge } = await import(pathToFileURL(output).href);

test('a badge shows its label in its tone and variant', () => {
  const markup = renderToStaticMarkup(h(Badge, { tone: 'success' }, 'Done'));
  assert.equal(
    markup,
    '<span class="env-badge" data-tone="success" data-variant="soft"><span class="env-badge-label">Done</span></span>',
  );
});

test('a badge with count is a compact count, the number alone its name', () => {
  const markup = renderToStaticMarkup(h(Badge, { count: 12 }));
  assert.match(
    markup,
    /^<span class="env-badge" data-tone="neutral" data-variant="soft" data-count="">/,
  );
  assert.match(markup, /<span class="env-badge-label">12<\/span><\/span>$/);
  // Zero is a count too.
  assert.match(renderToStaticMarkup(h(Badge, { count: 0 })), /data-count="">.*>0<\/span>/);
});

test("a count's aria-label is read in place of the number, which is hidden", () => {
  const markup = renderToStaticMarkup(
    h(Badge, { count: '99+', 'aria-label': '120 unread', tone: 'accent', variant: 'solid' }),
  );
  assert.doesNotMatch(markup, /aria-label/);
  assert.match(markup, /data-tone="accent" data-variant="solid" data-count=""/);
  assert.match(markup, /<span class="env-badge-label" aria-hidden="true">99\+<\/span>/);
  assert.match(markup, /<span class="env-badge-count-label">120 unread<\/span>/);
});
