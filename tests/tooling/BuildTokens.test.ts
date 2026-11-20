import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import {
  cssDeclarations,
  overridingCustomProperties,
} from '../../scripts/build/tokens/CssDeclarations.ts';
import { contextTokens, duplicateTokens } from '../../scripts/build/tokens/TokenSources.ts';
import { withoutRepeatedValues } from '../../scripts/build/tokens/TokensCss.ts';
import { buildTokens } from '../../scripts/build/BuildTokens.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const library = join(repositoryRoot, 'packages/ui');
let scratch;

before(async () => {
  scratch = await mkdtemp(join(tmpdir(), 'envui-tokens-'));
});
after(async () => {
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

async function buildChanged(name, change, { handwritten = '' } = {}) {
  const directory = join(scratch, name);
  await cp(join(library, 'tokens'), join(directory, 'tokens'), { recursive: true });
  await mkdir(join(directory, 'src/styles'), { recursive: true });
  const css = await readFile(join(library, 'src/styles/TokensHandwritten.css'), 'utf8');
  await writeFile(join(directory, 'src/styles/TokensHandwritten.css'), css + handwritten);
  for (const [file, edit] of Object.entries(change)) {
    const path = join(directory, 'tokens', file);
    const tokens = JSON.parse(await readFile(path, 'utf8'));
    edit(tokens);
    await writeFile(path, JSON.stringify(tokens));
  }
  await buildTokens({
    tokensDirectory: pathToFileURL(join(directory, 'tokens/')),
    outDir: pathToFileURL(join(directory, 'src/')),
  });
  return directory;
}

test('two tokens that become one custom property fail the build', async () => {
  await assert.rejects(
    buildChanged('collision', {
      'base/space.tokens.json': (tokens) => {
        tokens['row-padding-inline'] = { $type: 'dimension', $value: { value: 2, unit: 'rem' } };
      },
    }),
    /(?:row\.padding-inline and row-padding-inline|row-padding-inline and row\.padding-inline) both become --env-row-padding-inline/,
  );
});

test('two tokens that the CSS output names alike fail the build', async () => {
  await assert.rejects(
    buildChanged('collision-written', {
      'base/space.tokens.json': (tokens) => {
        tokens.space['4+'] = { $value: { value: 1.25, unit: 'rem' } };
      },
    }),
    /space\.4\+ and space\.4 both become --env-space-4|space\.4 and space\.4\+ both become --env-space-4/,
  );
});

test('a token whose path does not spell its custom property fails the build', async () => {
  await assert.rejects(
    buildChanged('unspelled', {
      'base/space.tokens.json': (tokens) => {
        tokens.space['huge+'] = { $value: { value: 8, unit: 'rem' } };
      },
    }),
    /space\.huge\+ becomes --env-space-huge, not --env-space-huge\+/,
  );
});

test('a token that two files of the base set declare fails the build', async () => {
  await assert.rejects(
    buildChanged('duplicate', {
      'base/size.tokens.json': (tokens) => {
        tokens.space = { 4: { $type: 'dimension', $value: { value: 3, unit: 'rem' } } };
      },
    }),
    /space\.4 is declared in both base\/space\.tokens\.json and base\/size\.tokens\.json, which the base set merges/,
  );
});

test('a token that two files of one modifier context declare fails the build', async () => {
  await assert.rejects(
    buildChanged('duplicate-context', {
      'color-scheme/dark.tokens.json': (tokens) => {
        tokens['contrast-high'] = {
          color: { bg: { page: { hover: { $type: 'color', $value: '{palette.neutral.90}' } } } },
        };
      },
    }),
    /contrast-high\.color\.bg\.page\.hover is declared in both color-scheme\/dark\.tokens\.json and color-scheme\/dark-contrast-high\.tokens\.json, which the dark context of colorScheme merges/,
  );
});

test('the modifier contexts override tokens of the base set, which is no duplicate', async () => {
  const list = JSON.parse(await readFile(join(library, 'src/generated/tokens.json'), 'utf8'));
  const base = new Set(list.tokens.map((token) => token.id));
  assert.ok(contextTokens('colorScheme', 'dark').some((id) => base.has(id)));
  assert.ok(contextTokens('contrast', 'high').some((id) => base.has(id)));
  assert.deepEqual(duplicateTokens(), []);
});

test('a token that TokensHandwritten.css also declares for every theme fails the build', async () => {
  await assert.rejects(
    buildChanged('handwritten', {
      'base/space.tokens.json': (tokens) => {
        tokens.viewport = {
          $type: 'dimension',
          gutter: { $value: { value: 1, unit: 'rem' } },
        };
      },
    }),
    /TokensHandwritten\.css declares --env-viewport-gutter, which the token viewport\.gutter becomes/,
  );
});

test('only a coarse pointer lets TokensHandwritten.css change a token', () => {
  const declared = (css) => [...overridingCustomProperties(css)];
  assert.deepEqual(declared('@media (pointer: coarse) { .env-theme { --a: 1; } }'), []);
  assert.deepEqual(declared('@media (pointer:coarse){@layer x{.env-theme{--a:1}}}'), []);
  assert.deepEqual(declared('@layer x { @media (pointer: coarse) { .env-theme { --a: 1 } } }'), []);
  for (const wrapper of [
    '@layer env.tokens',
    '@supports (color: oklch(0 0 0))',
    '@media (prefers-contrast: more)',
    '@media (min-width: 40rem)',
    '@media (pointer: coarse), (prefers-contrast: more)',
    '@media not (pointer: coarse)',
    '@container (min-width: 1px)',
  ])
    assert.deepEqual(declared(`${wrapper} { .env-theme { --a: 1; } }`), ['--a'], wrapper);
  assert.deepEqual(
    declared(".env-theme[data-env-theme='dark'] { content: ';}'; --b: url(a;b); --c: 1 }"),
    ['--b', '--c'],
  );
});

test('a theme rule leaves out a value its element takes from the rules below anyway', () => {
  const css = withoutRepeatedValues(`.env-theme {
  --a: 1;
  --b: 1;
  --c: 1;
}
.env-theme[data-env-theme='dark'] {
  --a: 1;
  --b: 2;
  --c: 2;
}
.env-theme[data-env-contrast='high'] {
  --a: 1;
  --b: 3;
  --c: 1;
}
@media (prefers-contrast: more) {
  .env-theme:not([data-env-contrast='standard']) {
  --a: 1;
  --b: 3;
  --c: 1;
}
}
.env-theme[data-env-theme='dark'][data-env-contrast='high'] {
  --a: 1;
  --b: 3;
  --c: 2;
}
`);
  const declared = (selector) =>
    cssDeclarations(css)
      .filter((declaration) => declaration.selector === selector)
      .map(({ property, value }) => `${property}: ${value}`);
  assert.deepEqual(declared('.env-theme'), ['--a: 1', '--b: 1', '--c: 1']);
  assert.deepEqual(declared(".env-theme[data-env-theme='dark']"), ['--b: 2', '--c: 2']);
  assert.deepEqual(declared(".env-theme[data-env-contrast='high']"), ['--b: 3']);
  assert.deepEqual(declared(".env-theme:not([data-env-contrast='standard'])"), ['--b: 3']);
  assert.deepEqual(declared(".env-theme[data-env-theme='dark'][data-env-contrast='high']"), []);
});

test('a token that TokensHandwritten.css declares under another at-rule fails the build', async () => {
  await assert.rejects(
    buildChanged(
      'handwritten-layer',
      {},
      {
        handwritten:
          '\n@layer env.tokens {\n  .env-theme {\n    --env-control-height: 3rem;\n  }\n}\n',
      },
    ),
    /TokensHandwritten\.css declares --env-control-height, which the token control\.height becomes/,
  );
  await assert.rejects(
    buildChanged(
      'handwritten-contrast',
      {},
      {
        handwritten:
          '\n@media (prefers-contrast: more) {\n  .env-theme { --env-control-height: 3rem; }\n}\n',
      },
    ),
    /TokensHandwritten\.css declares --env-control-height/,
  );
});

test('a typography token builds, with a custom property for each part', async () => {
  const directory = await buildChanged('typography', {
    'base/typography.tokens.json': (tokens) => {
      tokens.text = {
        $type: 'typography',
        label: {
          $value: {
            fontFamily: '{font.family}',
            fontSize: '{font.size.body-sm}',
            fontWeight: '{font.weight.body}',
            lineHeight: 1.4,
            letterSpacing: { value: 0, unit: 'rem' },
          },
        },
      };
    },
  });
  const css = await readFile(join(directory, 'src/generated/Tokens.css'), 'utf8');
  assert.match(css, /--env-text-label-font-size: var\(--env-font-size-body-sm\);/);
  assert.match(css, /--env-text-label: var\(--env-text-label-font-weight\)/);
  const list = JSON.parse(await readFile(join(directory, 'src/generated/tokens.json'), 'utf8'));
  const label = list.tokens.find((token) => token.id === 'text.label');
  assert.deepEqual(label.values.dark.resolved, {
    'font-family': "'envUI Geist', sans-serif",
    'font-size': '0.875rem',
    'font-weight': '400',
    'line-height': '1.4',
    'letter-spacing': '0rem',
  });
});

const textLabel = (extra = {}) => ({
  $type: 'typography',
  $value: {
    fontFamily: '{font.family}',
    fontSize: '{font.size.body-sm}',
    fontWeight: '{font.weight.body}',
    lineHeight: 1.4,
    letterSpacing: { value: 0, unit: 'rem' },
    ...extra,
  },
});

test('a part that only one theme gives a composite token cannot clash either', async () => {
  await assert.rejects(
    buildChanged('typography-theme-part', {
      'base/typography.tokens.json': (tokens) => {
        tokens.text = {
          label: textLabel(),
          'label-font-style': { $type: 'number', $value: 1 },
        };
      },
      'color-scheme/dark.tokens.json': (tokens) => {
        tokens.text = { label: textLabel({ fontStyle: 'italic' }) };
      },
    }),
    /text\.label and text\.label-font-style both become --env-text-label-font-style/,
  );
});

test('a typography token that aliases another reads the parts the other declares', async () => {
  const directory = await buildChanged('typography-alias', {
    'base/typography.tokens.json': (tokens) => {
      tokens.text = {
        label: textLabel(),
        caption: { $type: 'typography', $value: '{text.label}' },
      };
    },
  });
  const css = await readFile(join(directory, 'src/generated/Tokens.css'), 'utf8');
  assert.match(css, /--env-text-caption-font-size: var\(--env-text-label-font-size\);/);
  const declared = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name));
  const undeclared = [...css.matchAll(/var\((--[\w-]+)\)/g)]
    .map(([, name]) => name)
    .filter((name) => !declared.has(name));
  assert.deepEqual(undeclared, []);
  const list = JSON.parse(await readFile(join(directory, 'src/generated/tokens.json'), 'utf8'));
  const resolved = (id) => list.tokens.find((token) => token.id === id).values.dark.resolved;
  assert.equal(resolved('text.caption')['font-size'], '0.875rem');
  assert.deepEqual(resolved('text.caption'), resolved('text.label'));
});
