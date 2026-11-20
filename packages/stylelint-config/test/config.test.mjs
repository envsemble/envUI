import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import config from '../src/index.js';
import { lintPackages, staleFiles } from '../../../scripts/build/SyncLintPackages.ts';
import { lint, message, passes } from './Lint.mjs';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const colorValues = JSON.parse(
  readFileSync(new URL('../../../tests/support/ColorValues.json', import.meta.url), 'utf8'),
);

const isApplicationOrMistypedExampleName = (name) =>
  name.startsWith('--app-') || name.endsWith('-defualt');

test("envUI's part classes and state attributes, the theme boundary and the application's own classes pass", async () => {
  await passes('.card > .env-card-title { margin: 0; }');
  await passes('.list:has(.env-list-item[data-selected]) { margin: 0; }');
  await passes('@scope (.env-dialog) to (.env-dialog-body) { p { margin: 0; } }');
  await passes('.env-theme { --env-font-size-body: 1.0625rem; }');
  await passes("[data-env-theme='dark'] .card { margin: 0; }");
  await passes('.my-env-banner, .environment { margin: 0; }');
  await passes('@scope (.card) { p { margin: 0; } }');
});

test('raw colors are reported by the rule for their kind, with the tokens for their property', async () => {
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
  await passes(`.a { content: "rgb(1 2 3)"; } .b { content: 'it\\'s hsl(0 0% 0%)'; }`);
  assert.deepEqual(await lint('.b { content: "a" rgb(1 2 3); }'), [
    { rule: 'declaration-property-value-disallowed-list', text: '"a" rgb(1 2 3)' },
  ]);
  assert.match(
    (await message('.a { background: rgb(var(--x)), url("rgb(0 0 0)"), hsl(0 0% 0%); }')).text,
    /^Raw color hsl\(0 0% 0%\) in background/,
  );
});

test('color values are read as the ESLint plugin reads them', async () => {
  for (const value of colorValues.accepted) await passes(`.a { color: ${value}; }`);
  for (const entry of colorValues.rejected) {
    const [value, color] = Array.isArray(entry) ? entry : [entry, entry];
    const { text } = await message(`.a { color: ${value}; }`);
    assert.ok(
      [`Raw color ${color}: `, `Raw color ${color} in color: `].some((start) =>
        text.startsWith(start),
      ),
      `${value}: ${text}`,
    );
  }
});

test('a literal z-index is reported, and stacking tokens pass', async () => {
  assert.deepEqual(await lint('.a { z-index: 10; }\n.b { z-index: -1; }'), [
    { rule: 'declaration-property-value-allowed-list', text: '10' },
    { rule: 'declaration-property-value-allowed-list', text: '-1' },
  ]);
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

test('a disable comment lets one line through', async () => {
  await passes('/* stylelint-disable-next-line color-no-hex */\n.logo { fill: #0b57d0; }');
});

test("the token names, their helper, the color policy, the custom properties and the scales are the repository's, copied", () => {
  const directory = lintPackages['@envsemble/stylelint-config-envui'];
  assert.deepEqual(
    staleFiles().filter((path) => path.startsWith(`${directory}/`)),
    [],
    'Run npm run tokens:build.',
  );
});

test('every token the messages and the README name exists in the library', () => {
  const library = JSON.parse(
    readFileSync(new URL('../../ui/src/generated/tokens.json', import.meta.url), 'utf8'),
  ).tokens.map((token) => token.cssVariable);
  const rules = config.rules;
  const messages = [
    rules['color-no-hex'][1].message('#fff'),
    rules['color-named'][1].message('red'),
    ...['color', 'background', 'border-color', 'outline', 'fill', 'box-shadow', '--brand'].map(
      (property) =>
        rules['declaration-property-value-disallowed-list'][1].message(property, 'rgb(0 0 0)'),
    ),
    rules['declaration-property-value-allowed-list'][1].message('z-index', '10'),
  ];
  const named = [...messages, readme].flatMap((text) => [
    ...text.matchAll(/var\((--[\w-]+)(…)?/g),
    ...text.matchAll(/(?<![\w-])(--(?:env-)?(?:color|z)-[\w-]*)(…)?/g),
  ]);
  assert.ok(named.length > 0, 'the messages name tokens');
  for (const [, name, family] of named) {
    if (isApplicationOrMistypedExampleName(name)) continue;
    if (family)
      assert.ok(
        library.some((token) => token.startsWith(name)),
        `${name}… names no envUI token`,
      );
    else assert.ok(library.includes(name), `${name} is not an envUI token`);
  }
});

test('keywords, data URLs, backdrop filters and stroke widths pass', async () => {
  await passes('.a { z-index: inherit; } .b { z-index: initial; } .c { z-index: unset; }');
  await passes(
    `.a { background: url("data:image/svg+xml,%3Csvg fill='rgb(0 0 0)' stroke='hsl(0 0% 50%)'/%3E"); }`,
  );
  await passes(`.a { mask: url('data:image/svg+xml;utf8,<svg fill="rgb(1 2 3)"/>'); }`);
  await passes('.a { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }');
  await passes('.a { stroke-width: 1px; }');
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

test('an application rounds, spaces and gaps a region component through its own class with tokens', async () => {
  await passes(
    '.app-inbox.env-panes { border-radius: var(--env-radius-lg); margin: var(--env-space-4); }',
  );
  await passes(
    '.app-drafts .env-document-tabs { border-start-start-radius: var(--env-radius-md); }',
  );
  await passes(
    '.app-editor { border-radius: var(--env-radius-surface); gap: var(--env-space-2); }',
  );
});
