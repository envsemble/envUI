import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import stylelint from 'stylelint';
import config from '../index.js';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

/** The rule and the marked text of each warning for some CSS in source order, with lines on request. */
async function lint(code, { lines = false } = {}) {
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

/** The message of the one warning some CSS gets. */
async function message(code) {
  const { results } = await stylelint.lint({ code, config });
  assert.equal(results[0].warnings.length, 1, JSON.stringify(results[0].warnings));
  return results[0].warnings[0];
}

const passes = async (code) => assert.deepEqual(await lint(code), [], code);

test('selectors of envUI classes are reported', async () => {
  assert.deepEqual(
    await lint(
      [
        '.card > .env-card-title { margin: 0; }',
        ':global(.env-dialog) .actions { gap: 1rem; }',
        '.list:has(.env-row-selected), .item:not(.env-row) { margin: 0; }',
        '[class*="env-button"] { margin: 0; }',
        "[class^='env-menu'] { margin: 0; }",
        '@scope (.env-dialog) to (.env-dialog-body) { p { margin: 0; } }',
        '.toolbar { & .env-icon-button { margin: 0; } }',
      ].join('\n'),
    ),
    [
      { rule: 'envui/no-private-classes', text: '.env-card-title' },
      { rule: 'envui/no-private-classes', text: '.env-dialog' },
      { rule: 'envui/no-private-classes', text: '.env-row-selected' },
      { rule: 'envui/no-private-classes', text: '.env-row' },
      { rule: 'envui/no-private-classes', text: '[class*="env-button' },
      { rule: 'envui/no-private-classes', text: "[class^='env-menu" },
      { rule: 'envui/no-private-classes', text: '.env-dialog' },
      { rule: 'envui/no-private-classes', text: '.env-dialog-body' },
      { rule: 'envui/no-private-classes', text: '.env-icon-button' },
    ],
  );
  const warning = await message('.env-button-primary { opacity: 0.8; }');
  assert.equal(
    warning.text,
    ".env-button-primary styles envUI's private markup, which can change in any envUI release. Use the component's props and envUI's tokens, or style a class of your own. (envui/no-private-classes)",
  );
  assert.equal(
    warning.url,
    'https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md#envuino-private-classes',
  );
});

test("the theme boundary, the theme attribute and the application's own classes pass", async () => {
  await passes('.env-theme { --font-size-body: 1.0625rem; }');
  await passes("[data-env-theme='dark'] .card { margin: 0; }");
  await passes('.my-env-banner, .environment { margin: 0; }');
  await passes('@scope (.card) { p { margin: 0; } }');
});

test('raw colors are reported, and colors from tokens pass', async () => {
  assert.deepEqual(
    await lint(
      [
        '.a { color: #fff; }',
        '.b { border: 1px solid red; }',
        '.c { background: rgb(0 0 0 / 50%); }',
        '.d { box-shadow: 0 0 0 1px hsl(210 20% 80%); }',
        '.e { color: oklch(0.6 0.15 250); }',
        '.f { --brand: #0b57d0; }',
      ].join('\n'),
    ),
    [
      { rule: 'color-no-hex', text: '#fff' },
      { rule: 'color-named', text: 'red' },
      { rule: 'declaration-property-value-disallowed-list', text: 'rgb(0 0 0 / 50%)' },
      { rule: 'declaration-property-value-disallowed-list', text: '0 0 0 1px hsl(210 20% 80%)' },
      { rule: 'declaration-property-value-disallowed-list', text: 'oklch(0.6 0.15 250)' },
      { rule: 'color-no-hex', text: '#0b57d0' },
    ],
  );
  assert.equal(
    (await message('.a { box-shadow: 0 1px 2px rgb(0 0 0 / 20%); }')).text,
    'Raw color rgb(0 0 0 / 20%) in box-shadow: use an envUI color token instead, such as var(--env-color-…), so the color follows the theme and keeps its contrast. (declaration-property-value-disallowed-list)',
  );
  assert.equal(
    (await message('.a { color: #fff; }')).text,
    'Raw color #fff: use an envUI color token instead, such as var(--env-color-…), so the color follows the theme and keeps its contrast. (color-no-hex)',
  );
  await passes('.a { color: var(--env-color-fg-default); background: transparent; }');
  await passes('.a { color: hsl(from var(--env-color-fg-link) h s calc(l - 10)); }');
  await passes(
    '.a { background: color-mix(in srgb, var(--env-color-bg-default) 80%, transparent); }',
  );
  await passes('.a { fill: currentColor; }');
});

test('a literal z-index is reported, and stacking tokens pass', async () => {
  assert.deepEqual(await lint('.a { z-index: 10; }\n.b { z-index: -1; }'), [
    { rule: 'declaration-property-value-allowed-list', text: '10' },
    { rule: 'declaration-property-value-allowed-list', text: '-1' },
  ]);
  assert.match(
    (await message('.a { z-index: 999; }')).text,
    /^Literal z-index 999: use a stacking token/,
  );
  await passes('.a { z-index: auto; }');
  await passes('.a { z-index: var(--env-z-modal); }');
  await passes('.a { z-index: calc(var(--env-z-modal) + 1); }');
});

test('px is reported outside hairlines and offsets', async () => {
  assert.deepEqual(
    await lint(
      [
        '.a { padding: 16px; }',
        '.b { border-radius: 4px; }',
        '.c { width: calc(100% - 24px); }',
        '@media (min-width: 600px) { .d { margin: 0; } }',
        '.e { font-size: 14px; }',
      ].join('\n'),
      { lines: true },
    ),
    // The rule marks the unit, once on each line.
    [1, 2, 3, 4, 5].map((line) => ({ rule: 'unit-disallowed-list', line, text: 'px' })),
  );
  assert.match(
    (await message('.a { gap: 8px; }')).text,
    /^Use rem instead of px, so the size follows/,
  );
  await passes(
    [
      '.a { border: 1px solid var(--env-color-border-default); outline: 2px solid; outline-offset: 2px; }',
      '.b { box-shadow: 0 1px 2px var(--shadow); text-underline-offset: 3px; border-inline-start-width: 1px; }',
      '.c { --card-border-width: 1px; --focus-ring-offset: 2px; }',
      '.d { padding: 1rem; margin: var(--space, 8px); inset-block-start: env(safe-area-inset-top, 20px); }',
    ].join('\n'),
  );
});

test('a disable comment with a reason lets one line through', async () => {
  await passes(
    '/* stylelint-disable-next-line color-no-hex -- the logo keeps its brand color */\n.logo { fill: #0b57d0; }',
  );
});

test('the config validates its plugin rule options', async () => {
  const { results } = await stylelint.lint({
    code: '.a {}',
    config: { ...config, rules: { 'envui/no-private-classes': [true, { allowed: ['x'] }] } },
  });
  assert.equal(results[0].invalidOptionWarnings.length, 1);
});

test('the README documents every rule the config sets', () => {
  for (const rule of Object.keys(config.rules))
    assert.ok(readme.includes(`\`${rule}\``), `the README names ${rule}`);
});
