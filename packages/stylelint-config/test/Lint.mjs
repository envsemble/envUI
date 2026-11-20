import assert from 'node:assert/strict';
import stylelint from 'stylelint';
import config from '../src/index.js';

export async function lint(code, { lines = false } = {}) {
  const { results } = await stylelint.lint({ code, config });
  const [result] = results;
  assert.deepEqual(result.invalidOptionWarnings, [], 'the config is valid');
  return result.warnings
    .sort((a, b) => a.line - b.line || a.column - b.column)
    .map(({ rule, line, column, endColumn }) => ({
      rule,
      ...(lines ? { line } : {}),
      text: code.split('\n')[line - 1].slice(column - 1, endColumn - 1),
    }));
}

export async function message(code) {
  const { results } = await stylelint.lint({ code, config });
  assert.equal(results[0].warnings.length, 1, JSON.stringify(results[0].warnings));
  return results[0].warnings[0];
}

export const passes = async (code) => assert.deepEqual(await lint(code), [], code);

export async function fixed(code) {
  const result = await stylelint.lint({ code, config, fix: true });
  return result.code;
}
