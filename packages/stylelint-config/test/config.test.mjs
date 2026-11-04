import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import stylelint from 'stylelint';
import config, { hairlineProperties, rawColorFunction, stackingValues } from '../index.js';
import { expectedTokens, libraryTokensUrl, tokensUrl } from '../scripts/SyncTokens.mjs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
/** Values with nested fallbacks that the ESLint plugin's no-raw-colors tests read too. */
const nestedFallbacks = JSON.parse(
  readFileSync(new URL('../../../tests/lint/NestedFallbacks.json', import.meta.url), 'utf8'),
);

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

test("envUI's part classes and state attributes, the theme boundary and the application's own classes pass", async () => {
  await passes('.card > .env-card-title { margin: 0; }');
  await passes('.list:has(.env-list-item[data-selected]) { margin: 0; }');
  await passes('@scope (.env-dialog) to (.env-dialog-body) { p { margin: 0; } }');
  await passes('.env-theme { --env-font-size-body: 1.0625rem; }');
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
    'Raw color rgb(0 0 0 / 20%) in box-shadow: use an envUI color token instead, one of the var(--env-color-fg-…), var(--env-color-bg-…) or var(--env-color-border-…) roles, so the color follows the theme and keeps its contrast. (declaration-property-value-disallowed-list)',
  );
  assert.equal(
    (await message('.a { color: #fff; }')).text,
    'Raw color #fff: use an envUI color token instead, one of the var(--env-color-fg-…), var(--env-color-bg-…) or var(--env-color-border-…) roles, so the color follows the theme and keeps its contrast. (color-no-hex)',
  );
  assert.equal(
    (await message('.a { background: oklch(0.6 0.15 250); }')).text,
    'Raw color oklch(0.6 0.15 250) in background: use an envUI color token instead, such as var(--env-color-bg-default) or another var(--env-color-bg-…) role, so the color follows the theme and keeps its contrast. (declaration-property-value-disallowed-list)',
  );
  assert.match(
    (await message('.a { border-color: rgb(0 0 0); }')).text,
    /such as var\(--env-color-border-default\) or another var\(--env-color-border-…\) role/,
  );
  await passes('.a { color: var(--env-color-fg-default); background: transparent; }');
  await passes('.a { color: hsl(from var(--env-color-fg-link) h s calc(l - 10)); }');
  // Channels that all come from custom properties, and colors inside a CSS string.
  await passes(
    '.a { color: oklch(var(--l) var(--c) var(--h)); background: rgb(var(--rgb) / 50%); }',
  );
  await passes('.a { color: color(display-p3 var(--r) var(--g) var(--b)); }');
  await passes(`.a { content: "rgb(1 2 3)"; } .b { content: 'it\\'s hsl(0 0% 0%)'; }`);
  assert.deepEqual(
    await lint('.a { color: oklch(var(--l) 0.15 var(--h)); }\n.b { content: "a" rgb(1 2 3); }'),
    [
      { rule: 'declaration-property-value-disallowed-list', text: 'oklch(var(--l) 0.15 var(--h))' },
      { rule: 'declaration-property-value-disallowed-list', text: '"a" rgb(1 2 3)' },
    ],
  );
  assert.match(
    (await message('.a { background: rgb(var(--x)), url("rgb(0 0 0)"), hsl(0 0% 0%); }')).text,
    /^Raw color hsl\(0 0% 0%\) in background/,
  );
  await passes(
    '.a { background: color-mix(in srgb, var(--env-color-bg-default) 80%, transparent); }',
  );
  await passes('.a { fill: currentColor; }');
});

test('equivalent color forms are treated alike', async () => {
  // The comma form's last argument is the alpha, as the one after the slash is.
  await passes('.a { color: rgba(var(--rgb), 0.5); background: rgb(var(--rgb) / 50%); }');
  await passes('.a { color: rgba(var(--r), var(--g), var(--b), 0.5); }');
  await passes('.a { color: rgb(var(--brand-rgb)); background: rgb(var(--rgb, var(--other))); }');
  // Fallbacks nest: each is var()s whose own fallbacks are var()s, as the ESLint rule reads them.
  for (const value of nestedFallbacks.custom) await passes(`.a { color: ${value}; }`);
  for (const value of nestedFallbacks.raw)
    assert.deepEqual(await lint(`.a { color: ${value}; }`), [
      { rule: 'declaration-property-value-disallowed-list', text: value },
    ]);
  // A fallback is a color as much as the value, and each channel is a var().
  assert.deepEqual(
    await lint(
      [
        '.a { color: rgb(var(--rgb, 255 0 0)); }',
        '.b { color: var(--accent, #0b57d0); }',
        '.c { color: var(--accent, red); }',
        '.d { color: rgb(calc(255) calc(0) calc(0)); }',
        '.e { color: hsl(none none none); }',
        '.f { color: rgb(var(--r), var(--g), 0); }',
      ].join('\n'),
    ),
    [
      { rule: 'declaration-property-value-disallowed-list', text: 'rgb(var(--rgb, 255 0 0))' },
      { rule: 'color-no-hex', text: '#0b57d0' },
      { rule: 'color-named', text: 'red' },
      {
        rule: 'declaration-property-value-disallowed-list',
        text: 'rgb(calc(255) calc(0) calc(0))',
      },
      { rule: 'declaration-property-value-disallowed-list', text: 'hsl(none none none)' },
      { rule: 'declaration-property-value-disallowed-list', text: 'rgb(var(--r), var(--g), 0)' },
    ],
  );
  assert.match(
    (await message('.a { color: rgb(var(--rgb, 255 0 0)); }')).text,
    /^Raw color rgb\(var\(--rgb, 255 0 0\)\) in color/,
  );
});

test('a literal z-index is reported, and stacking tokens pass', async () => {
  assert.deepEqual(await lint('.a { z-index: 10; }\n.b { z-index: -1; }'), [
    { rule: 'declaration-property-value-allowed-list', text: '10' },
    { rule: 'declaration-property-value-allowed-list', text: '-1' },
  ]);
  // The message names envUI's stacking tokens.
  assert.equal(
    (await message('.a { z-index: 999; }')).text,
    "Literal z-index 999: use an envUI stacking token (--env-z-…) instead, such as var(--env-z-sticky) for a sticky header or var(--env-z-modal) for a modal layer, with calc() for a step between two, so the application's layers keep one order with envUI's popups and dialogs. (declaration-property-value-allowed-list)",
  );
  await passes('.a { z-index: auto; }');
  await passes('.a { z-index: var(--env-z-popup); }');
  await passes('.a { z-index: calc(var(--env-z-sticky) + 1); }');
  await passes('.a { z-index: var(--app-z-modal); }');
  await passes('.a { z-index: calc(var(--app-z-modal) + 1); }');
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
        // Radii and table spacing scale, also in custom properties named for a border.
        '.f { --card-border-radius: 4px; }',
        '.g { border-spacing: 2px; }',
        '.h { --divider-color: 1px; }',
      ].join('\n'),
      { lines: true },
    ),
    // The rule marks the unit, once on each line.
    [1, 2, 3, 4, 5, 6, 7, 8].map((line) => ({ rule: 'unit-disallowed-list', line, text: 'px' })),
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

test("the token names are the library's when the repository has its token list", () => {
  const copy = JSON.parse(readFileSync(tokensUrl, 'utf8'));
  if (existsSync(libraryTokensUrl)) {
    assert.equal(
      readFileSync(tokensUrl, 'utf8'),
      expectedTokens(),
      "data/tokens.json is behind the library's token list: run npm run sync:tokens --workspace @envsemble/stylelint-config-envui.",
    );
    assert.equal(copy.source, 'packages/ui/src/generated/tokens.json');
  } else assert.equal(copy.source, 'embedded');
});

test('every token the messages and the README name exists in the library', () => {
  const library = existsSync(libraryTokensUrl)
    ? JSON.parse(readFileSync(libraryTokensUrl, 'utf8')).tokens.map((token) => token.cssVariable)
    : Object.values(JSON.parse(readFileSync(tokensUrl, 'utf8')).tokens).flat();
  const rules = config.rules;
  const messages = [
    rules['color-no-hex'][1].message('#fff'),
    rules['color-named'][1].message('red'),
    ...['color', 'background', 'border-color', 'outline', 'fill', 'box-shadow', '--brand'].map(
      (property) =>
        rules['declaration-property-value-disallowed-list'][1].message(property, 'rgb(0 0 0)'),
    ),
    rules['declaration-property-value-allowed-list'][1].message('z-index', '10'),
    rules['unit-disallowed-list'][1].message('px'),
  ];
  const named = [...messages, readme].flatMap((text) => [
    ...text.matchAll(/var\((--[\w-]+)(…)?/g),
    // Bare names of envUI's color and stacking tokens, such as `--env-color-fg-default`.
    ...text.matchAll(/(?<![\w-])(--(?:env-)?(?:color|z)-[\w-]*)(…)?/g),
  ]);
  assert.ok(named.length > 0, 'the messages name tokens');
  for (const [, name, family] of named) {
    // The application's own custom properties, in examples.
    if (name.startsWith('--app-')) continue;
    if (family)
      assert.ok(
        library.some((token) => token.startsWith(name)),
        `${name}… names no envUI token`,
      );
    else assert.ok(library.includes(name), `${name} is not an envUI token`);
  }
});

test("envUI's own style sheets take px from the list this config ships", async () => {
  const repositoryConfig = new URL('../../../stylelint.config.mjs', import.meta.url);
  if (!existsSync(repositoryConfig)) return;
  const { default: repository } = await import(repositoryConfig);
  const pxLists = [repository, ...repository.overrides]
    .map(({ rules }) => rules['unit-disallowed-list']?.[1]?.ignoreProperties?.px)
    .filter(Boolean);
  assert.ok(pxLists.length >= 2, 'the repository sets px for components and for tokens');
  for (const list of pxLists) assert.equal(list, hairlineProperties);
  assert.equal(config.rules['unit-disallowed-list'][1].ignoreProperties.px, hairlineProperties);
  // The raw color functions and the z-index values, too.
  assert.deepEqual(repository.rules['declaration-property-value-disallowed-list'], {
    '/.*/': [rawColorFunction],
  });
  assert.equal(
    repository.rules['declaration-property-value-allowed-list']['z-index'],
    stackingValues,
  );
});

test('keywords, data URLs, backdrop filters and stroke widths pass', async () => {
  await passes('.a { z-index: inherit; } .b { z-index: initial; } .c { z-index: unset; }');
  await passes(
    `.a { background: url("data:image/svg+xml,%3Csvg fill='rgb(0 0 0)' stroke='hsl(0 0% 50%)'/%3E"); }`,
  );
  await passes(`.a { mask: url('data:image/svg+xml;utf8,<svg fill="rgb(1 2 3)"/>'); }`);
  await passes('.a { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }');
  await passes('.a { stroke-width: 1px; }');
  // A color after a url() is still the style's own.
  assert.deepEqual(await lint('.a { background: url("a.svg") no-repeat, rgb(1 1 1); }'), [
    {
      rule: 'declaration-property-value-disallowed-list',
      text: 'url("a.svg") no-repeat, rgb(1 1 1)',
    },
  ]);
  assert.match(
    (await message('.a { background: url("data:,rgb(0 0 0)"), rgb(1 1 1); }')).text,
    /^Raw color rgb\(1 1 1\) in background/,
  );
  assert.deepEqual(await lint('.a { z-index: 2; }'), [
    { rule: 'declaration-property-value-allowed-list', text: '2' },
  ]);
});
