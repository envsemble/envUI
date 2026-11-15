import assert from 'node:assert/strict';
import { test } from 'node:test';
import stylelint from 'stylelint';
import {
  noStyleSheetComments,
  styleSheetCommentRuleName,
} from '../../scripts/lint/NoStyleSheetComments.ts';

const config = {
  plugins: [noStyleSheetComments],
  rules: { [styleSheetCommentRuleName]: true },
};

async function warnings(code: string) {
  const { results } = await stylelint.lint({ code, config });
  return results[0].warnings.map(({ rule, text }) => ({ rule, text }));
}

const passes = async (code: string) => assert.deepEqual(await warnings(code), [], code);

async function fails(code: string, message: RegExp) {
  const found = await warnings(code);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0].rule, styleSheetCommentRuleName);
  assert.match(found[0].text, message);
}

const nameItInTheCode = /Name it in the code instead/;
const dropTheReason = /Drop the reason/;

test('a stylelint-disable directive without a reason passes', async () => {
  await passes('/* stylelint-disable-next-line color-no-hex */\n.logo { fill: #0b57d0; }');
  await passes('/* stylelint-disable */\n.logo { fill: red; }\n/* stylelint-enable */');
});

test('prettier-ignore passes', () =>
  passes('.grid {\n  /* prettier-ignore */\n  grid-template: "a b" "c d";\n}'));

test('a contrast marker the contrast tests read passes', () =>
  passes('.thumb {\n  /* contrast: segmented-control-thumb */\n  background: red;\n}'));

test('a contrast marker with more words is reported', () =>
  fails(
    '.thumb {\n  /* contrast: the thumb, on purpose */\n  background: red;\n}',
    nameItInTheCode,
  ));

test('a licence header at the top of the style sheet passes', () =>
  passes('/* Copyright 2026 Example. Released under the MIT License. */\n.logo { fill: red; }'));

test('a comment before a rule is reported', () =>
  fails('/* The logo. */\n.logo { fill: red; }', nameItInTheCode));

test('a comment inside a rule is reported', () =>
  fails('.logo {\n  /* Brand red. */\n  fill: red;\n}', nameItInTheCode));

test('a comment inside a value is reported', () =>
  fails('.logo { fill: red /* brand */; }', nameItInTheCode));

test('a comment inside a selector is reported', () =>
  fails('.logo /* mark */ .path { fill: red; }', nameItInTheCode));

test('licence words below the top of the style sheet are reported', () =>
  fails('.logo { fill: red; }\n/* MIT License */', nameItInTheCode));

test('a reason after a stylelint-disable directive is reported', () =>
  fails(
    '/* stylelint-disable-next-line color-no-hex -- the brand colour */\n.logo { fill: #0b57d0; }',
    dropTheReason,
  ));
