import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import stylelint from 'stylelint';
import config, { hairlineProperties, rawColorFunction, stackingValues } from '../src/index.js';
import { lintPackages, staleFiles } from '../../../scripts/build/SyncLintPackages.ts';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const colorValues = JSON.parse(
  readFileSync(new URL('../../../tests/lint/ColorValues.json', import.meta.url), 'utf8'),
);

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

async function message(code) {
  const { results } = await stylelint.lint({ code, config });
  assert.equal(results[0].warnings.length, 1, JSON.stringify(results[0].warnings));
  return results[0].warnings[0];
}

const isApplicationOrMistypedExampleName = (name) =>
  name.startsWith('--app-') || name.endsWith('-defualt');

const passes = async (code) => assert.deepEqual(await lint(code), [], code);

async function fixed(code) {
  const result = await stylelint.lint({ code, config, fix: true });
  return result.code;
}

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

test('px is reported outside hairlines and offsets, and fixed to rem', async () => {
  assert.deepEqual(
    await lint(
      [
        '.c { width: calc(100% - 24px); }',
        '@media (min-width: 600px) { .d { margin: 0; } }',
        '.e { font-size: 14px; }',
        '.f { --card-border-radius: 4px; }',
        '.g { border-spacing: 2px; }',
        '.h { --divider-color: 1px; }',
      ].join('\n'),
      { lines: true },
    ),
    [
      { rule: 'envui/no-px', line: 1, text: '24px' },
      { rule: 'envui/no-px', line: 2, text: '600px' },
      { rule: 'envui/no-px', line: 3, text: '14px' },
      { rule: 'envui/no-px', line: 4, text: '4px' },
      { rule: 'envui/no-px', line: 5, text: '2px' },
      { rule: 'envui/no-px', line: 6, text: '1px' },
    ],
  );
  assert.equal(
    (await message('.a { font-size: 14px; }')).text,
    "14px: write 0.875rem instead, so the size follows the reader's font size; px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets. (envui/no-px)",
  );
  assert.equal(
    await fixed('.a { width: calc(100% - 24px); height: 1px; } @media (min-width: 600px) {}'),
    '.a { width: calc(100% - 1.5rem); height: 1px; } @media (min-width: 37.5rem) {}',
  );
  await passes(
    [
      '.a { border: 1px solid var(--env-color-border-default); outline: 2px solid; outline-offset: 2px; }',
      '.b { box-shadow: 0 1px 2px var(--shadow); text-underline-offset: 3px; border-inline-start-width: 1px; }',
      '.c { --card-border-width: 1px; --focus-ring-offset: 2px; }',
      '.d { padding: var(--env-space-4); margin: var(--space, 8px); inset-block-start: env(safe-area-inset-top, 20px); }',
    ].join('\n'),
  );
});

test("spacing and radius lengths off envUI's scales are reported with the step to write", async () => {
  assert.deepEqual(
    (
      await lint('.a { padding: 8px 0.6rem; gap: 2rem; margin: -0.5rem auto; border-radius: 4px; }')
    ).map(({ text }) => text),
    ['8px', '0.6rem', '2rem', '-0.5rem', '4px'],
  );
  assert.equal(
    (await message('.a { gap: 0.5rem; }')).text,
    "0.5rem in gap: write var(--env-space-2) instead, envUI's spacing step of that size. (envui/no-off-scale-values)",
  );
  assert.equal(
    (await message('.a { border-radius: 0.6rem; }')).text,
    "0.6rem in border-radius is off envUI's radius scale: write the nearest step, var(--env-radius-sm) (0.5rem), or another var(--env-radius-…) step. (envui/no-off-scale-values)",
  );
  await passes(
    '.a { margin: 0 auto; padding: 0; gap: 5%; inline-size: 13rem; inset: calc(var(--env-space-2) + 1px); }',
  );
});

test('positioning offsets and hairline corrections are not spacing, so the scales leave them alone', async () => {
  await passes(
    [
      '.a { position: absolute; inset-block-start: 3.5rem; inset-inline: 0.3rem auto; }',
      '.b { margin-inline-start: -1px; margin-block: 1px 0; padding-block-end: 0.0625rem; }',
      '.c { position: relative; top: -1px; inset-inline-end: 1px; }',
    ].join('\n'),
  );
  assert.deepEqual(
    (await lint('.a { inset-block-start: 24px; top: 2px; margin: -2px; }')).map(
      ({ rule, text }) => `${rule} ${text}`,
    ),
    ['envui/no-px 24px', 'envui/no-px 2px', 'envui/no-off-scale-values -2px'],
  );
});

test('lengths in units other than rem and px, alone or in a calculation, are not checked against the scales', async () => {
  await passes(
    '.a { margin-inline: calc(50% - 50vw); padding-inline: 1ch; margin-block: 0.5em; inset-block-start: 100dvh; }',
  );
});

test('a radius past the largest step is pointed to the full radius', async () => {
  assert.equal(
    (await message('.a { border-radius: 9999px; }')).text,
    "9999px in border-radius is past envUI's largest radius step: write var(--env-radius-full) for a fully rounded corner. (envui/no-off-scale-values)",
  );
});

test('a radius a little past the largest step is pointed to the nearest step', async () => {
  assert.match((await message('.a { border-radius: 2rem; }')).text, /--env-radius-xl/);
});

test('an --env- name envUI does not define is reported, with the nearest public name', async () => {
  assert.equal(
    (await message('.a { color: var(--env-color-fg-defualt); }')).text,
    '--env-color-fg-defualt is not an envUI token or public property: write var(--env-color-fg-default) instead. (envui/no-unknown-custom-properties)',
  );
  assert.equal(
    (await message('.a { --env-card-inset: 1rem; }')).text,
    "--env-card-inset is not an envUI token or public property: set an envUI token, or name the application's own property outside --env-, such as --app-card-inset. (envui/no-unknown-custom-properties)",
  );
  await passes(
    '.a { --env-button-container: var(--env-color-bg-muted); color: var(--env-color-fg-default); --app-gap: 1rem; }',
  );
});

test('the members of a composite type token are known names', async () => {
  await passes('.a { letter-spacing: var(--env-type-headline-letter-spacing); }');
});

test('token pairs that break contrast are reported', async () => {
  assert.deepEqual(
    (
      await lint(
        [
          '.a { color: var(--env-color-fg-on-emphasis); background: var(--env-color-bg-default); }',
          '.b { background-color: var(--env-color-fg-default); color: var(--env-color-fg-on-emphasis); }',
          '.c { color: var(--env-color-bg-page); }',
        ].join('\n'),
      )
    ).map(({ rule, text }) => `${rule} ${text}`),
    [
      'envui/no-contrast-breaking-pairs --env-color-fg-on-emphasis',
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
      'envui/no-contrast-breaking-pairs --env-color-bg-page',
    ],
  );
  await passes(
    '.a { color: var(--env-color-fg-on-emphasis); background: var(--env-color-bg-accent-emphasis-hover); }',
  );
  await passes(
    '.a { background: color-mix(in oklch, var(--env-color-fg-default) 8%, transparent); }',
  );
});

test('a text color as the fill of a label that sets its font or text but inherits its color is reported', async () => {
  assert.deepEqual(
    (
      await lint(
        [
          '.a { background: var(--env-color-fg-default); font: var(--env-type-body-sm); }',
          '.b { background-color: var(--env-color-fg-muted); line-height: 1.5; }',
          '.c { background: var(--env-color-fg-accent); text-transform: uppercase; }',
          '.d { background: var(--env-color-fg-default); font-weight: 600; }',
        ].join('\n'),
      )
    ).map(({ rule, text }) => `${rule} ${text}`),
    [
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
      'envui/no-contrast-breaking-pairs --env-color-fg-muted',
      'envui/no-contrast-breaking-pairs --env-color-fg-accent',
      'envui/no-contrast-breaking-pairs --env-color-fg-default',
    ],
  );
});

test('a text color as the fill of a masked icon, or of a shape that sets no text property, passes', async () => {
  await passes(
    [
      '.a { mask: url("icon.svg") center / contain no-repeat; background-color: var(--env-color-fg-muted); color: var(--env-color-fg-default); }',
      '.b { -webkit-mask-image: url("icon.svg"); background: var(--env-color-fg-default); }',
      '.status-dot { inline-size: 0.5rem; block-size: 0.5rem; background: var(--env-color-fg-success); }',
      '.separator { inline-size: 100%; background-color: var(--env-color-fg-muted); }',
    ].join('\n'),
  );
});

test('removing the outline on :focus-visible without another ring is reported', async () => {
  assert.equal(
    (await message('.a:focus-visible { outline: none; }')).text,
    "outline: none on :focus-visible removes the focus ring: leave envUI's focus ring, or draw another ring, such as box-shadow: 0 0 0 2px var(--env-color-border-focus). (envui/no-focus-outline-removal)",
  );
  await passes(
    '.a:focus-visible { outline: 0; box-shadow: 0 0 0 2px var(--env-color-border-focus); }',
  );
  await passes(
    '.a:focus-visible { outline: none; } .a:focus-visible .b { outline: 2px solid var(--env-color-border-focus); }',
  );
  await passes('.a:focus-visible::before { outline: 0; }');
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

test("envUI's own style sheets take px from the list this config ships", async () => {
  const repositoryConfig = new URL('../../../stylelint.config.mjs', import.meta.url);
  if (!existsSync(repositoryConfig)) return;
  const { default: repository } = await import(repositoryConfig);
  const pxLists = [repository, ...repository.overrides]
    .map(({ rules }) => rules['unit-disallowed-list']?.[1]?.ignoreProperties?.px)
    .filter(Boolean);
  assert.ok(pxLists.length >= 2, 'the repository sets px for components and for tokens');
  for (const list of pxLists) assert.equal(list, hairlineProperties);
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
