// Spinner's markup: hidden without a label, a progress bar named by one, and with showLabel a busy
// status with its label beside the arc, Loading by default in the provider's language.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/Spinner.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export { Spinner } from './packages/ui/src/feedback/Spinner.tsx';",
      "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
    ].join('\n'),
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
const { Spinner, EnvUIProvider } = await import(pathToFileURL(output).href);

test('a spinner without a label is hidden, and with one a progress bar it names', () => {
  assert.match(renderToStaticMarkup(h(Spinner)), /^<span aria-hidden="true" class="env-spinner"/);
  const named = renderToStaticMarkup(h(Spinner, { label: 'Refreshing members' }));
  assert.match(named, /role="progressbar" aria-label="Refreshing members"/);
  assert.doesNotMatch(named, /env-spinner-label/);
});

test('with showLabel, a busy status shows the label beside the arc', () => {
  const markup = renderToStaticMarkup(h(Spinner, { label: 'Loading project', showLabel: true }));
  assert.match(
    markup,
    /^<span role="status" aria-busy="true" data-show-label="" class="env-spinner" data-size="md">/,
  );
  assert.doesNotMatch(markup, /aria-label|progressbar/);
  assert.match(markup, /<svg [^>]*aria-hidden="true">/);
  assert.match(markup, /<span class="env-spinner-label">Loading project<\/span><\/span>$/);
});

test("without a label, showLabel says Loading, in the provider's language", () => {
  assert.match(
    renderToStaticMarkup(h(Spinner, { showLabel: true })),
    /<span class="env-spinner-label">Loading<\/span>/,
  );
  const translated = renderToStaticMarkup(
    h(
      EnvUIProvider,
      { messages: { common: { loading: 'Wird geladen' } } },
      h(Spinner, { showLabel: true }),
    ),
  );
  assert.match(translated, /<span class="env-spinner-label">Wird geladen<\/span>/);
});
