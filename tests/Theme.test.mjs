// Theme on the server: the attributes it writes, and its development warning about a theme that is
// neither light nor dark, as JavaScript that passes 0.x's useTheme() to it would.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Theme, useTheme } from '../packages/ui/dist/index.js';

/** Renders on the server and returns the markup and what was reported through console.error. */
function render(element) {
  const errors = [];
  const original = console.error;
  console.error = (...values) => errors.push(values.join(' '));
  try {
    return { markup: renderToString(element), errors };
  } finally {
    console.error = original;
  }
}

test('Theme warns once in development about a theme that is not light or dark', () => {
  const portal = { theme: 'dark', contrast: 'high' };
  const { errors } = render(
    h('div', null, h(Theme, { theme: portal }, 'a'), h(Theme, { theme: portal }, 'b')),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /"light" or "dark", not \{"theme":"dark","contrast":"high"\}/);
  assert.match(errors[0], /<Theme \{\.\.\.useTheme\(\)\}>/);
  assert.equal(render(h(Theme, { theme: 'dark' }, 'c')).errors.length, 0);
});

test('a Theme without a contrast takes a data-env-contrast written on it, and the prop wins', () => {
  function Inner() {
    return h('output', null, useTheme().contrast);
  }
  const attribute = render(
    h(Theme, { theme: 'light', 'data-env-contrast': 'high' }, h(Inner)),
  ).markup;
  assert.match(attribute, /data-env-contrast="high"/);
  assert.match(attribute, /<output>high<\/output>/);
  const prop = render(
    h(Theme, { theme: 'light', contrast: 'standard', 'data-env-contrast': 'high' }, h(Inner)),
  ).markup;
  assert.match(prop, /data-env-contrast="standard"/);
  assert.match(prop, /<output>standard<\/output>/);
});
