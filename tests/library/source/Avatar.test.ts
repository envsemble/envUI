import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Avatar } = await importSource('Avatar', [
  "export { Avatar } from './packages/ui/src/data-display/Avatar.tsx';",
]);

test("an element as fallback is placed on the hue's fill in place of the initials", () => {
  const markup = renderToStaticMarkup(
    h(Avatar, { name: 'Deploy bot', hue: 'sage', fallback: h('svg', { 'data-bot': '' }) }),
  );
  assert.match(markup, /data-hue="sage"/);
  assert.match(
    markup,
    /<span class="env-avatar-fallback"><span class="env-avatar-fallback-content" data-env-slot="row"><svg data-bot=""><\/svg><\/span><\/span>/,
  );
  assert.doesNotMatch(markup, /env-avatar-fallback-(initials|person)|>DB</);
});

test('a badge is placed after the picture, inside the avatar and hidden with it', () => {
  const markup = renderToStaticMarkup(
    h(Avatar, { name: 'Sam Lee', badge: h('span', { 'data-presence': 'online' }) }),
  );
  assert.match(markup, /^<span [^>]*aria-hidden="true"/);
  assert.match(
    markup,
    /<span class="env-avatar-badge" data-env-slot="row"><span data-presence="online"><\/span><\/span><\/span>$/,
  );
  assert.doesNotMatch(renderToStaticMarkup(h(Avatar, { name: 'Sam Lee' })), /env-avatar-badge/);
});
