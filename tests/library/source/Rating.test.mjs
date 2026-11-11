// Rating's markup: stars filled to the value in half steps, named once as an image, and numbers in
// the provider's locale and messages, with DiffStat and AnimatedNumber beside it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.mjs';
import { declarations } from '../../support/CssDeclarations.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Rating, DiffStat, AnimatedNumber, EnvUIProvider } = await importSource('Rating', [
  "export { Rating } from './packages/ui/src/data-display/Rating.tsx';",
  "export { DiffStat } from './packages/ui/src/data-display/DiffStat.tsx';",
  "export { AnimatedNumber } from './packages/ui/src/data-display/AnimatedNumber.tsx';",
  "export { EnvUIProvider } from './packages/ui/src/foundations/EnvUIProvider.tsx';",
]);

const render = (element) => firstElement(renderToStaticMarkup(element));
const byClass = (root, name) => elementsOf(root).filter((element) => hasClass(element, name));
const image = (root) => elementsOf(root).find((element) => element.attributes.role === 'img');

test('a rating fills its stars to the value in half steps and is named once', () => {
  const half = render(h(Rating, { value: 3.5, showValue: true }));
  // One image named by the rating; the number beside it is hidden from assistive technology.
  assert.equal(image(half).attributes['aria-label'], '3.5 out of 5 stars');
  const [value] = byClass(half, 'env-rating-value');
  assert.equal(textOf(value), '3.5');
  assert.equal(value.attributes['aria-hidden'], 'true');
  const stars = byClass(half, 'env-rating-star');
  assert.deepEqual(
    stars.map((star) => star.attributes['data-fill']),
    ['full', 'full', 'full', 'half', undefined],
  );
  // Only the half star holds a half fill.
  assert.equal(byClass(stars[3], 'env-rating-star-half').length, 1);
  assert.equal(byClass(half, 'env-rating-star-half').length, 1);
  // Other scales, values kept within the scale, and the label in another wording.
  assert.equal(byClass(render(h(Rating, { value: 7, max: 10 })), 'env-rating-star').length, 10);
  const over = render(h(Rating, { value: 9, formatLabel: (shown, max) => `${shown}/${max}` }));
  assert.equal(image(over).attributes['aria-label'], '5/5');
});

test("the half fill covers the star's inline-start half, the right one in right-to-left text", () => {
  const sheet = readFileSync(join(repositoryRoot, 'packages/ui/src/styles/Rating.css'), 'utf8');
  const half = Object.fromEntries(
    declarations(sheet)
      .filter(({ selector }) => selector === '.env-rating-star-half')
      .map(({ prop, value }) => [prop, value]),
  );
  assert.equal(half.position, 'absolute');
  assert.equal(half['inset-inline-start'], '0');
  assert.equal(half['inline-size'], '50%');
  assert.equal(half.overflow, 'hidden');
});

test("ratings, changes and rolling numbers follow the provider's locale and messages", () => {
  const german = (child) => render(h(EnvUIProvider, { locale: 'de-DE' }, child));
  const rating = german(h(Rating, { value: 4.5, showValue: true }));
  assert.equal(textOf(byClass(rating, 'env-rating-value')[0]), '4,5');
  assert.equal(image(rating).attributes['aria-label'], '4,5 out of 5 stars');
  const named = german(
    h(
      EnvUIProvider,
      { messages: { rating: { label: ({ value, max }) => `${value} von ${max} Sternen` } } },
      h(Rating, { value: 3.5 }),
    ),
  );
  assert.equal(image(named).attributes['aria-label'], '3,5 von 5 Sternen');
  const diff = german(h(DiffStat, { additions: 1234, deletions: 5 }));
  assert.equal(textOf(byClass(diff, 'env-diff-stat-additions')[0]), '+1.234');
  assert.equal(
    textOf(byClass(diff, 'env-diff-stat-label')[0]),
    '1.234 added lines and 5 removed lines',
  );
  assert.equal(textOf(german(h(AnimatedNumber, { value: 12800 }))), '12.800');
});
