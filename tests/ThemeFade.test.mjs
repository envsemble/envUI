import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('the catalogue eases every color role of a theme switching inside an animated figure', () => {
  const tokens = read('packages/ui/src/styles/Tokens.css');
  const fade = read('apps/site/src/styles/ThemeFade.css');
  const roles = [
    ...new Set(
      [...tokens.matchAll(/^\s*(--env-color-(?:bg|fg|border)[a-z0-9-]*):/gm)].map(
        (match) => match[1],
      ),
    ),
  ].sort();
  const registered = [...fade.matchAll(/@property (--[a-z0-9-]+)/g)].map((match) => match[1]);
  const eased = fade
    .match(/transition-property:([^;]+);/)[1]
    .split(',')
    .map((name) => name.trim());
  assert.deepEqual([...registered].sort(), roles, 'each role is registered as a color');
  assert.deepEqual([...eased].sort(), roles, 'each role is eased');
});
