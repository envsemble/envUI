import assert from 'node:assert/strict';
import { test } from 'node:test';
import stylelint from 'stylelint';
import { fontWeightFromToken, fontWeightRuleName } from '../../scripts/lint/FontWeightFromToken.ts';

const config = { plugins: [fontWeightFromToken], rules: { [fontWeightRuleName]: true } };

async function rejected(code: string) {
  const { results } = await stylelint.lint({ code, config });
  return results[0]!.warnings.map(({ rule, text, column, endColumn }) => {
    assert.equal(rule, fontWeightRuleName);
    return { weight: /weight (\S+) in/.exec(text)?.[1], column, endColumn };
  });
}

test('a font shorthand whose weight comes from a token passes', async () => {
  assert.deepEqual(await rejected('.a { font: var(--type-body); }'), []);
  assert.deepEqual(
    await rejected('.a { font: var(--env-label-font-weight) 1rem/1.5 var(--env-font-sans); }'),
    [],
  );
});

test('a line height after the slash is not a weight', async () => {
  assert.deepEqual(await rejected('.a { font: 1rem/1.5 sans-serif; }'), []);
  assert.deepEqual(await rejected('.a { font: 1rem / 2 sans-serif; }'), []);
});

test('numbers inside a function are not a weight', async () => {
  assert.deepEqual(await rejected('.a { font: calc(1rem + 2px) / 1.5 sans-serif; }'), []);
});

test('a literal weight, as a number or a keyword, fails at the weight itself', async () => {
  assert.deepEqual(await rejected('.a { font: 600 1rem/1.5 sans-serif; }'), [
    { weight: '600', column: 12, endColumn: 15 },
  ]);
  assert.deepEqual(await rejected('.a { font: bold 1rem sans-serif; }'), [
    { weight: 'bold', column: 12, endColumn: 16 },
  ]);
  assert.deepEqual(await rejected('.a { font: italic lighter 1rem serif; }'), [
    { weight: 'lighter', column: 19, endColumn: 26 },
  ]);
});

test('only the font shorthand is checked', async () => {
  assert.deepEqual(await rejected('.a { font-size: 600px; }'), []);
});
