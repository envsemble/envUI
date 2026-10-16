import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import {
  contextTokens,
  duplicateTokens,
  overridingCustomProperties,
} from '../packages/ui/terrazzo.config.mjs';
import { buildTokens } from '../scripts/BuildTokens.mjs';

// The token build's guards, on copies of the tokens built into a scratch folder, and the custom
// properties the library's style sheets read.

const repository = fileURLToPath(new URL('../', import.meta.url));
const library = join(repository, 'packages/ui');
let scratch;

before(async () => {
  scratch = await mkdtemp(join(tmpdir(), 'envui-tokens-'));
});
after(async () => {
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

/**
 * Builds a copy of the tokens after `change` edits the parsed files it names, into a scratch
 * folder that has the library's TokensHandwritten.css, with `handwritten` appended to it, and
 * returns the folder.
 */
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
    /(?:row\.padding-inline and row-padding-inline|row-padding-inline and row\.padding-inline) both become --row-padding-inline/,
  );
});

test('two tokens that the CSS output names alike fail the build', async () => {
  // plugin-css writes a name only with letters, digits and hyphens: space.4+ would be --space-4.
  await assert.rejects(
    buildChanged('collision-written', {
      'base/space.tokens.json': (tokens) => {
        tokens.space['4+'] = { $value: { value: 1.25, unit: 'rem' } };
      },
    }),
    /space\.4\+ and space\.4 both become --space-4|space\.4 and space\.4\+ both become --space-4/,
  );
});

test('a token whose path does not spell its custom property fails the build', async () => {
  await assert.rejects(
    buildChanged('unspelled', {
      'base/space.tokens.json': (tokens) => {
        tokens.space['huge+'] = { $value: { value: 8, unit: 'rem' } };
      },
    }),
    /space\.huge\+ becomes --space-huge, not --space-huge\+/,
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
  // The dark scheme overrides the base set, which is how themes work, but only once.
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
    /TokensHandwritten\.css declares --viewport-gutter, which the token viewport\.gutter becomes/,
  );
});

test('only a coarse pointer lets TokensHandwritten.css change a token', () => {
  const declared = (css) => [...overridingCustomProperties(css)];
  // The touch sizes change a token only under a coarse pointer, also inside another at-rule.
  assert.deepEqual(declared('@media (pointer: coarse) { .env-theme { --a: 1; } }'), []);
  assert.deepEqual(declared('@media (pointer:coarse){@layer x{.env-theme{--a:1}}}'), []);
  assert.deepEqual(declared('@layer x { @media (pointer: coarse) { .env-theme { --a: 1 } } }'), []);
  // Any other at-rule can apply in every theme, and a contrast belongs in the tokens.
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
  // In any rule, whatever the selector; strings and parentheses end no declaration.
  assert.deepEqual(
    declared(".env-theme[data-env-theme='dark'] { content: ';}'; --b: url(a;b); --c: 1 }"),
    ['--b', '--c'],
  );
});

test('a token that TokensHandwritten.css declares under another at-rule fails the build', async () => {
  await assert.rejects(
    buildChanged(
      'handwritten-layer',
      {},
      {
        handwritten: '\n@layer env.tokens {\n  .env-theme {\n    --control-height: 3rem;\n  }\n}\n',
      },
    ),
    /TokensHandwritten\.css declares --control-height, which the token control\.height becomes/,
  );
  await assert.rejects(
    buildChanged(
      'handwritten-contrast',
      {},
      {
        handwritten:
          '\n@media (prefers-contrast: more) {\n  .env-theme { --control-height: 3rem; }\n}\n',
      },
    ),
    /TokensHandwritten\.css declares --control-height/,
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
            fontSize: '{font.size.body-small}',
            fontWeight: '{body.font-weight}',
            lineHeight: 1.4,
            letterSpacing: { value: 0, unit: 'rem' },
          },
        },
      };
    },
  });
  const css = await readFile(join(directory, 'src/styles/Tokens.css'), 'utf8');
  assert.match(css, /--text-label-font-size: var\(--font-size-body-small\);/);
  assert.match(css, /--text-label: var\(--text-label-font-weight\)/);
  const list = JSON.parse(await readFile(join(directory, 'src/generated/tokens.json'), 'utf8'));
  const label = list.tokens.find((token) => token.id === 'text.label');
  assert.deepEqual(label.values.dark.resolved, {
    'font-family': "'envUI Inter', sans-serif",
    'font-size': '0.875rem',
    'font-weight': '400',
    'line-height': '1.4',
    'letter-spacing': '0rem',
  });
  // The typed module still type-checks with a composite value.
  const module = join(directory, 'src/generated/tokens.ts');
  const program = ts.createProgram([module], {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
    skipLibCheck: true,
  });
  const problems = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  assert.deepEqual(problems, []);
});

/** A typography token for text.label, with the parts in `extra` besides the five DTCG requires. */
const textLabel = (extra = {}) => ({
  $type: 'typography',
  $value: {
    fontFamily: '{font.family}',
    fontSize: '{font.size.body-small}',
    fontWeight: '{body.font-weight}',
    lineHeight: 1.4,
    letterSpacing: { value: 0, unit: 'rem' },
    ...extra,
  },
});

test('a part that only one theme gives a composite token cannot clash either', async () => {
  // The dark scheme adds a part, --text-label-font-style, which another token already becomes.
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
    /text\.label and text\.label-font-style both become --text-label-font-style/,
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
  const css = await readFile(join(directory, 'src/styles/Tokens.css'), 'utf8');
  assert.match(css, /--text-caption-font-size: var\(--text-label-font-size\);/);
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

/**
 * Custom properties that Base UI's positioners and popups set on the elements envUI styles; they
 * are documented in Base UI's API reference for each part, not declared in a style sheet.
 */
const baseUiProperties = [
  '--anchor-height',
  '--anchor-width',
  '--available-height',
  '--available-width',
  '--transform-origin',
];

/**
 * Custom properties an application provides, which envUI's style sheets read without a fallback.
 * Each needs its place in the documentation; there are none yet.
 */
const applicationHooks = [];

async function files(directory, extensions) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter(
      (entry) => entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension)),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

test("every custom property the library's style sheets read is defined", async () => {
  const styles = await files(join(library, 'src/styles'), ['.css']);
  const declared = new Set();
  const reads = new Map();
  for (const file of styles) {
    const css = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) declared.add(name);
    // A var() without a fallback, which is invalid wherever its property is not set.
    for (const [, name] of css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g))
      reads.set(name, [...(reads.get(name) ?? []), relative(library, file).replaceAll('\\', '/')]);
  }
  // Properties that components set inline, such as a cell's '--env-calendar-heatmap-mix'.
  for (const file of await files(join(library, 'src'), ['.ts', '.tsx']))
    for (const [, name] of (await readFile(file, 'utf8')).matchAll(/['"](--[\w-]+)['"]\s*:/g))
      declared.add(name);
  const undefinedReads = [...reads]
    .filter(
      ([name]) =>
        !declared.has(name) && !baseUiProperties.includes(name) && !applicationHooks.includes(name),
    )
    .map(([name, where]) => `${name} in ${[...new Set(where)].join(', ')}`);
  assert.deepEqual(undefinedReads, [], 'Define each property, or document it as a hook.');
  assert.ok(reads.size > 100, 'the style sheets read the tokens');
});

test('the hand-written tokens read only tokens', async () => {
  const handwritten = await readFile(join(library, 'src/styles/TokensHandwritten.css'), 'utf8');
  const generated = await readFile(join(library, 'src/styles/Tokens.css'), 'utf8');
  const defined = new Set(
    [...`${generated}\n${handwritten}`.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name),
  );
  const unknown = [...handwritten.matchAll(/var\(\s*(--[\w-]+)/g)]
    .map(([, name]) => name)
    .filter((name) => !defined.has(name));
  assert.deepEqual(unknown, []);
});
