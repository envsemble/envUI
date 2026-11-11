// Pager's markup: its links in the order given, each with its rel, and its strings from
// EnvUIProvider's messages. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import {
  elementsOf,
  findElement,
  firstElement,
  type MarkupElement,
  textOf,
} from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Pager, EnvUIProvider } = await importSource('Pager', [
  "export * as Pager from './packages/ui/src/navigation/Pager.tsx';",
  "export * from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

const links = (nav: MarkupElement) => elementsOf(nav).filter((element) => element.tag === 'a');

test('the previous link comes first and the next link last, with strings from messages', () => {
  const pager = (props: Record<string, unknown> | null, previous: string, next: string) =>
    h(
      Pager.Root,
      props,
      h(Pager.Previous, { href: '#introduction' }, previous),
      h(Pager.Next, { href: '#setup' }, next),
    );
  const mixed = firstElement(
    renderToString(pager({ 'aria-label': 'Mixed pager' }, 'Introduction', 'Setup')),
  );
  assert.equal(mixed.tag, 'nav');
  assert.equal(mixed.attributes['aria-label'], 'Mixed pager');
  assert.deepEqual(links(mixed).map(textOf), ['PreviousIntroduction', 'Up nextSetup']);
  assert.deepEqual(
    links(mixed).map((link) => link.attributes.rel),
    ['prev', 'next'],
  );
  // EnvUIProvider's messages name the landmark and caption the links.
  const translated = firstElement(
    renderToString(
      h(
        EnvUIProvider,
        { messages: { pager: { label: 'Seiten', previous: 'Zurück', next: 'Weiter' } } },
        pager(null, 'Einführung', 'Einrichtung'),
      ),
    ),
  );
  const nav = findElement(translated, (element) => element.tag === 'nav');
  assert.equal(nav.attributes['aria-label'], 'Seiten');
  assert.deepEqual(links(nav).map(textOf), ['ZurückEinführung', 'WeiterEinrichtung']);
});
