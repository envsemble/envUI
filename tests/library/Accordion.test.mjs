// Accordion's markup as a skeleton: one busy region whose missing titles the style sheet draws as
// bars. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { importSource } from '../support/ImportSource.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../support/Markup.mjs';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const { Accordion } = await importSource('Accordion', [
  "export * as Accordion from './packages/ui/src/content/Accordion.tsx';",
]);

test('a skeleton is one busy region: titles become bars and indicators shapes', () => {
  const root = firstElement(
    renderToStaticMarkup(
      h(
        Accordion.Root,
        { skeleton: true },
        h(Accordion.Item, { title: undefined }),
        h(Accordion.Item, { title: 'Loaded title' }),
      ),
    ),
  );
  assert.equal(root.attributes['data-env-skeleton'], '');
  assert.equal(root.attributes['aria-busy'], 'true');
  // Only the root is busy; the items inside are its inert content.
  const elements = elementsOf(root);
  assert.equal(elements.filter((element) => 'aria-busy' in element.attributes).length, 1);
  const items = elements.filter((element) => hasClass(element, 'env-accordion-item'));
  assert.equal(items.length, 2);
  // A missing title renders an empty label, which the style sheet draws as a bar.
  const labels = elements.filter((element) => hasClass(element, 'env-accordion-label'));
  assert.deepEqual(labels.map(textOf), ['', 'Loaded title']);
  const css = readFileSync(join(repositoryRoot, 'packages/ui/src/styles/Accordion.css'), 'utf8');
  assert.match(
    css,
    /\[data-env-skeleton\] \.env-accordion-label \{[^}]*--env-skeleton-placeholder: inline-block;/,
  );
});
