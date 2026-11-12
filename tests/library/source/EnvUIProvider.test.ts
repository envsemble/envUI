// EnvUIProvider, rendered on the server: the locale it sets is the one the components inside read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { EnvUIProvider, useLocale } = await importSource('EnvUIProvider', [
  "export { EnvUIProvider, useLocale } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

function LocaleProbe() {
  return h('output', null, useLocale() ?? 'runtime');
}

test('EnvUIProvider sets the locale components read', () => {
  // Outside a provider, components take the runtime's locale.
  assert.equal(renderToStaticMarkup(h(LocaleProbe)), '<output>runtime</output>');
  assert.equal(
    renderToStaticMarkup(h(EnvUIProvider, { locale: 'de-CH' }, h(LocaleProbe))),
    '<output>de-CH</output>',
  );
});
