import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, posix, relative } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import {
  contextTokens,
  cssDeclarations,
  duplicateTokens,
  migrationNames,
  overridingCustomProperties,
} from '../packages/ui/terrazzo.config.mjs';
import {
  buildTokens,
  codemodsMapFile,
  formatted,
  migrationCopies,
  migrationGuideFile,
  migrationGuideList,
  migrationMapSection,
  withGuideList,
  mapFragmentText,
} from '../scripts/BuildTokens.mjs';

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
    /(?:row\.padding-inline and row-padding-inline|row-padding-inline and row\.padding-inline) both become --env-row-padding-inline/,
  );
});

test('two tokens that the CSS output names alike fail the build', async () => {
  // plugin-css writes a name only with letters, digits and hyphens: space.4+ would be --env-space-4.
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
    /TokensHandwritten\.css declares --env-viewport-gutter, which the token viewport\.gutter becomes/,
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
  assert.match(css, /--env-text-label-font-size: var\(--env-font-size-body-small\);/);
  assert.match(css, /--env-text-label: var\(--env-text-label-font-weight\)/);
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
  // The dark scheme adds a part, --env-text-label-font-style, which another token already becomes.
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
  const css = await readFile(join(directory, 'src/styles/Tokens.css'), 'utf8');
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

/**
 * Custom properties that Base UI's positioners set, for the popup inside, as documented in Base
 * UI's API reference for each positioner part. They count as set inline by a module that renders
 * a positioner (`<BaseMenu.Positioner>`): a dialog or a toast list has none.
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
 * Each needs its place in the documentation: the components' color properties, which
 * docs/generated/parts.json lists, are read so where an unset one must leave its declaration
 * invalid, such as a surface's text color, or the layered fill of a container no one set.
 */
const applicationHooks = Object.values(
  JSON.parse(readFileSync(new URL('../docs/generated/parts.json', import.meta.url), 'utf8'))
    .components,
).flatMap((entry) => (entry.colors ?? []).map((color) => color.property));

/**
 * Classes that an element always carries with another component's, so a rule for the first also
 * sees what is declared for the second: Card renders its root as a Surface (`<Surface
 * render={…}>`), which adds env-surface beside env-card, and Select's trigger is a Button.
 */
const impliedClasses = {
  'env-card': ['env-surface'],
  'env-select-trigger': ['env-button'],
};

/** The token build's style sheets: what they declare is defined only through `.env-theme`. */
const tokenStyleSheets = new Set(['Tokens.css', 'TokensHandwritten.css']);

/**
 * The pieces of `text` between its top-level characters that `separates` accepts, outside quotes,
 * brackets and parentheses, with each separator as a piece of its own.
 */
function splitOutside(text, separates) {
  const pieces = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (const character of text) {
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[') depth += 1;
    else if (character === ')' || character === ']') depth -= 1;
    else if (depth === 0 && separates(character)) {
      pieces.push(current, character);
      current = '';
      continue;
    }
    current += character;
  }
  return [...pieces, current];
}

/** The complex selectors of a selector list. */
const selectorList = (selector) =>
  splitOutside(selector, (character) => character === ',')
    .filter((piece) => piece !== ',')
    .map((piece) => piece.trim());

/**
 * The compounds of a complex selector that match its subject or an ancestor of it: the last one,
 * and each that a descendant or child combinator follows. The one before `+` or `~` is a sibling.
 */
function subjectAndAncestors(complex) {
  const compounds = [];
  for (const piece of splitOutside(complex, (character) => ' >+~'.includes(character))) {
    if (' >+~'.includes(piece) && piece.length === 1) {
      if (compounds.length > 0 && piece !== ' ') compounds.at(-1).combinator = piece;
      continue;
    }
    if (piece) compounds.push({ compound: piece, combinator: ' ' });
  }
  return compounds
    .filter(({ combinator }, index) => index === compounds.length - 1 || '> '.includes(combinator))
    .map(({ compound }) => compound);
}

/** Whether a complex selector is one compound, with no combinator. */
const isCompound = (selector) =>
  splitOutside(selector, (character) => ' >+~'.includes(character)).filter((piece) => piece.trim())
    .length === 1;

/** The simple selectors of a compound: `.a`, `#b`, `[c='d']`, `:e(f)`, `::g` and a type. */
function simpleSelectors(compound) {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (const [index, character] of [...compound].entries()) {
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (
      depth === 0 &&
      ('.#['.includes(character) || (character === ':' && compound[index - 1] !== ':'))
    ) {
      if (current) parts.push(current);
      current = '';
    }
    if (!quote && (character === '(' || character === '[')) depth += 1;
    else if (!quote && (character === ')' || character === ']')) depth -= 1;
    current += character;
  }
  return current ? [...parts, current] : parts;
}

/** The simple selectors of a compound, with the classes that impliedClasses adds to it. */
function withImplied(compound, implied) {
  const parts = simpleSelectors(compound);
  const classes = parts.filter((part) => part.startsWith('.')).map((part) => part.slice(1));
  return new Set([
    ...parts,
    ...classes.flatMap((name) => implied[name] ?? []).map((name) => `.${name}`),
  ]);
}

/** The at-rules that limit where a declaration applies: all but @layer. */
const conditions = (atRules) =>
  atRules
    .filter((prelude) => !/^@layer\b/.test(prelude))
    .map((prelude) => prelude.replace(/\s+/g, ''));

/** The theme boundary's conditions in a selector: data-env-theme and data-env-contrast. */
const themeConditions = (selector) =>
  new Set(selector.match(/(?::not\()?\[data-env-(?:theme|contrast)[^\]]*\]/g) ?? []);

const subset = (small, large) => [...small].every((item) => large.has(item));

/**
 * The var() reads without a fallback in `styleSheets` (file name to CSS) that are not defined for
 * every element that reads them, as `--name in File.css: selector`. A read is defined when, under
 * the at-rules of the read (a declaration under `@media (pointer: coarse)` defines a read under
 * that media query only; @layer limits nothing), and for each complex selector of its rule:
 *
 * - a rule declares it for the same element or an ancestor, in any style sheet: one compound
 *   selector, every part of which the read's subject, or a compound the read names as its
 *   ancestor, also has, with `.env-theme` an ancestor of every element and the classes
 *   impliedClasses adds. The base token set (Tokens.css's `.env-theme`) and TokensHandwritten.css
 *   define a property this way, but not their dark, high-contrast or coarse-pointer rules;
 * - or the read's own style sheet declares it, for an element of the component that the sheet
 *   knows, in a rule that conditions on no theme (data-env-theme, data-env-contrast) the read
 *   doesn't; the token style sheets don't count here;
 * - or a module of `modules` (path to source) sets it inline (`'--name':`, `style['--name'] =`
 *   or `setProperty('--name'`), or renders a Base UI positioner, which sets those of
 *   `positioned`, and that module, or one that imports it, names a class of the read's selector:
 *   the component renders the element, or its ancestor, with the property;
 * - or `external` lists it: the application sets it.
 */
function undefinedReads({
  styleSheets,
  modules = {},
  positioned = [],
  external = [],
  implied = impliedClasses,
}) {
  const declarations = Object.entries(styleSheets).flatMap(([file, css]) =>
    cssDeclarations(css).map((declaration) => ({ ...declaration, file })),
  );
  const declaring = new Map();
  for (const declaration of declarations)
    if (declaration.property.startsWith('--') && declaration.selector)
      declaring.set(declaration.property, [
        ...(declaring.get(declaration.property) ?? []),
        { ...declaration, conditions: new Set(conditions(declaration.atRules)) },
      ]);

  const withoutExtension = (path) => path.replace(/\.(?:[cm]?js|tsx?)$/, '');
  const moduleIds = new Map(Object.keys(modules).map((path) => [withoutExtension(path), path]));
  const importers = new Map();
  for (const [path, source] of Object.entries(modules))
    for (const [, specifier] of source.matchAll(
      /(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.{1,2}\/[^'"]+)['"]/g,
    )) {
      const target = moduleIds.get(withoutExtension(posix.join(posix.dirname(path), specifier)));
      if (target) importers.set(target, [...(importers.get(target) ?? []), path]);
    }
  const classesNamed = new Map(
    Object.entries(modules).map(([path, source]) => [
      path,
      new Set(source.match(/(?<![\w-])env-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []),
    ]),
  );
  const inline = new Map();
  const setInline = (name, path) => inline.set(name, [...(inline.get(name) ?? []), path]);
  for (const [path, source] of Object.entries(modules)) {
    for (const match of source.matchAll(
      /['"](--[\w-]+)['"]\s*:|\[\s*['"](--[\w-]+)['"]\s*\]\s*=(?!=)|setProperty\(\s*['"](--[\w-]+)['"]/g,
    ))
      setInline(match[1] ?? match[2] ?? match[3], path);
    if (/<(?:\w+\.)?Positioner\b/.test(source))
      for (const name of positioned) setInline(name, path);
  }

  const defines = (name, complex, file, readConditions) => {
    if (external.includes(name)) return true;
    const compounds = [...subjectAndAncestors(complex), '.env-theme'].map((compound) =>
      withImplied(compound, implied),
    );
    const readThemes = themeConditions(complex);
    const sameElementOrAncestor = (declared) =>
      selectorList(declared.selector).some(
        (selector) =>
          isCompound(selector) &&
          compounds.some((parts) =>
            simpleSelectors(selector).every((part) => part === '*' || parts.has(part)),
          ),
      );
    const ownSheet = (declared) =>
      declared.file === file &&
      !tokenStyleSheets.has(file) &&
      selectorList(declared.selector).some((selector) =>
        subset(themeConditions(selector), readThemes),
      );
    if (
      (declaring.get(name) ?? []).some(
        (declared) =>
          subset(declared.conditions, readConditions) &&
          (sameElementOrAncestor(declared) || ownSheet(declared)),
      )
    )
      return true;
    const classes = new Set(
      [...compounds].flatMap((parts) =>
        [...parts].filter((part) => part.startsWith('.')).map((part) => part.slice(1)),
      ),
    );
    classes.delete('env-theme');
    return (inline.get(name) ?? []).some((path) =>
      [path, ...(importers.get(path) ?? [])].some((renderer) =>
        [...classes].some((className) => classesNamed.get(renderer).has(className)),
      ),
    );
  };

  const problems = new Set();
  for (const { file, selector, value, atRules } of declarations) {
    if (!selector) continue;
    const readConditions = new Set(conditions(atRules));
    for (const [, name] of value.matchAll(/var\(\s*(--[\w-]+)\s*\)/g))
      for (const complex of selectorList(selector))
        if (!defines(name, complex, file, readConditions))
          problems.add(`${name} in ${file}: ${complex}`);
  }
  return [...problems];
}

/** The reads of a style sheet `Foo.css` among `styleSheets`, with the token sheets of the tests. */
function undefinedReadsOf(css, { styleSheets = {}, modules = {}, implied = {} } = {}) {
  return undefinedReads({
    styleSheets: {
      'Tokens.css': `.env-theme { --base: 1rem; --alias: var(--base); }
        .env-theme[data-env-theme='dark'] { --dark: 1rem; }
        .env-theme[data-env-contrast='high'] { --high: 1rem; }
        @media (prefers-contrast: more) { .env-theme:not([data-env-contrast='standard']) { --contrast: 1rem; } }`,
      'TokensHandwritten.css': `.env-theme { --handwritten: 1rem; }
        @media (pointer: coarse) { .env-theme { --coarse: 1rem; } }`,
      ...styleSheets,
      'Foo.css': css,
    },
    modules,
    implied,
  });
}

test('a property is defined by the base tokens, the hand-written tokens and the theme', () => {
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--base) var(--handwritten); }'), []);
  // The token sheets' own reads are checked too, and so are fallbacks that read a property.
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--missing, 1rem); }'), []);
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--other, var(--missing)); }'), [
    '--missing in Foo.css: .env-foo',
  ]);
  // Any style sheet may declare a property on the theme boundary for every element.
  assert.deepEqual(
    undefinedReadsOf('.env-foo { font: var(--font-code); }', {
      styleSheets: { 'Code.css': '.env-theme { --font-code: monospace; }' },
    }),
    [],
  );
});

test('a property only the dark, high-contrast or coarse-pointer tokens declare is not defined', () => {
  for (const name of ['--dark', '--high', '--contrast', '--coarse'])
    assert.deepEqual(undefinedReadsOf(`.env-foo { margin: var(${name}); }`), [
      `${name} in Foo.css: .env-foo`,
    ]);
  // A read under the same condition, or for the same theme, sees it.
  assert.deepEqual(
    undefinedReadsOf('@media (pointer: coarse) { .env-foo { margin: var(--coarse); } }'),
    [],
  );
  assert.deepEqual(
    undefinedReadsOf(".env-theme[data-env-theme='dark'] .env-foo { margin: var(--dark); }"),
    [],
  );
});

test("a property another component's style sheet declares is defined only for its elements", () => {
  const styleSheets = { 'Other.css': '.env-other { --other: 1rem; }' };
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--other); }', { styleSheets }), [
    '--other in Foo.css: .env-foo',
  ]);
  // The same element, an ancestor the selector names, or a class the element always carries.
  for (const css of [
    '.env-other.env-foo:hover { margin: var(--other); }',
    '.env-other > .env-bar .env-foo { margin: var(--other); }',
  ])
    assert.deepEqual(undefinedReadsOf(css, { styleSheets }), [], css);
  assert.deepEqual(
    undefinedReadsOf('.env-foo { margin: var(--other); }', {
      styleSheets,
      implied: { 'env-foo': ['env-other'] },
    }),
    [],
  );
  // A sibling is no ancestor, and each selector of a list must see it.
  assert.deepEqual(
    undefinedReadsOf('.env-other + .env-foo, .env-other .env-bar { margin: var(--other); }', {
      styleSheets,
    }),
    ['--other in Foo.css: .env-other + .env-foo'],
  );
});

test('a property its own style sheet declares only under a condition is not defined', () => {
  assert.deepEqual(
    undefinedReadsOf('.env-foo-root { --own: 1rem; } .env-foo-part { margin: var(--own); }'),
    [],
  );
  assert.deepEqual(
    undefinedReadsOf(
      '@media (hover: hover) { .env-foo:hover { --own: 1rem; } } .env-foo { margin: var(--own); }',
    ),
    ['--own in Foo.css: .env-foo'],
  );
  assert.deepEqual(
    undefinedReadsOf(
      ".env-theme[data-env-theme='dark'] .env-foo { --own: 1rem; } .env-foo { margin: var(--own); }",
    ),
    ['--own in Foo.css: .env-foo'],
  );
  // @layer limits nothing.
  assert.deepEqual(
    undefinedReadsOf('@layer env { .env-foo { --own: 1rem; } } .env-foo { margin: var(--own); }'),
    [],
  );
});

test('a property set inline is defined only by the component that renders the element', () => {
  const css = '.env-foo-cell { margin: var(--env-foo-mix); }';
  const sets = "export const style = { '--env-foo-mix': '1rem' };";
  // Any module that sets it is not enough: the module must render the reading rule's class.
  assert.deepEqual(undefinedReadsOf(css, { modules: { 'Other.tsx': sets } }), [
    '--env-foo-mix in Foo.css: .env-foo-cell',
  ]);
  for (const modules of [
    { 'content/Foo.tsx': `${sets}\nexport const Cell = () => <td className="env-foo-cell" />;` },
    {
      'content/internal/FooStyle.ts': sets,
      'content/Foo.tsx':
        "import { style } from './internal/FooStyle.js';\n<td className='env-foo-cell' />",
    },
    { 'Foo.tsx': "element.style.setProperty('--env-foo-mix', '1rem'); 'env-foo-cell';" },
    { 'Foo.tsx': "style['--env-foo-mix'] = '1rem'; 'env-foo-cell';" },
  ])
    assert.deepEqual(undefinedReadsOf(css, { modules }), [], Object.keys(modules).join());
});

test("Base UI's positioner properties are defined only inside a positioner", () => {
  const css = '.env-foo-popup, .env-foo-dialog { transform-origin: var(--transform-origin); }';
  const modules = {
    'Popup.tsx':
      "<BasePopover.Positioner><BasePopover.Popup className='env-foo-popup' /></BasePopover.Positioner>",
    'Dialog.tsx': "<BaseDialog.Popup className='env-foo-dialog' />",
  };
  assert.deepEqual(
    undefinedReads({
      styleSheets: { 'Foo.css': css },
      modules,
      positioned: ['--transform-origin'],
      implied: {},
    }),
    ['--transform-origin in Foo.css: .env-foo-dialog'],
  );
});

test("every custom property the library's style sheets read is defined", async () => {
  const sources = async (directory, extensions) =>
    Object.fromEntries(
      await Promise.all(
        (await readdir(directory, { recursive: true, withFileTypes: true }))
          .filter(
            (entry) =>
              entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension)),
          )
          .map(async (entry) => [
            relative(directory, join(entry.parentPath, entry.name)).replaceAll('\\', '/'),
            await readFile(join(entry.parentPath, entry.name), 'utf8'),
          ]),
      ),
    );
  const styleSheets = await sources(join(library, 'src/styles'), ['.css']);
  const problems = undefinedReads({
    styleSheets,
    modules: await sources(join(library, 'src'), ['.ts', '.tsx']),
    positioned: baseUiProperties,
    external: applicationHooks,
  });
  assert.deepEqual(
    problems,
    [],
    'Define each property for every element that reads it, or document it as a hook.',
  );
  const reads = new Set(
    Object.values(styleSheets).flatMap((css) =>
      [...css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map(([, name]) => name),
    ),
  );
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

/** A migration map of each kind of entry, as the token build writes it. */
const sampleMigration = {
  names: {
    '--color-old-fill': {
      kind: 'alias',
      token: 'color.bg.default',
      cssVariable: '--env-color-bg-default',
    },
    '--color-old-scrim': {
      kind: 'alias',
      token: 'color.bg.overlay',
      cssVariable: '--env-color-bg-overlay',
      note: 'Translucent now.',
    },
    '--color-old-avatar': { kind: 'fixed', value: '#9fc1f8', component: 'Avatars' },
    '--color-old-initials': {
      kind: 'fixed',
      value: { light: '#004aa2', 'light-high-contrast': '#001d49' },
      component: 'Avatars',
    },
    '--color-old-gone': {
      kind: 'removed',
      token: 'color.bg.raised',
      cssVariable: '--env-color-bg-raised',
      note: 'Unused.',
    },
    '--state-old-shift': { kind: 'removed', note: 'The rule | is gone.' },
    '--radius-old': {
      kind: 'renamed',
      token: 'radius.sm',
      cssVariable: '--env-radius-sm',
      note: 'One scale.',
    },
    '--old-hook': { kind: 'renamed', cssVariable: '--env-old-hook' },
    '--space-1': { kind: 'prefixed', cssVariable: '--env-space-1' },
    '--space-2': { kind: 'prefixed', cssVariable: '--env-space-2' },
  },
};

test("the codemods' rename map takes the token migration map as its tokens section", () => {
  const section = migrationMapSection(sampleMigration);
  assert.match(section.$comment, /npm run tokens:build/);
  assert.deepEqual(Object.fromEntries(Object.entries(section).slice(1)), {
    '--color-old-fill': { to: '--env-color-bg-default' },
    '--color-old-scrim': { to: '--env-color-bg-overlay', note: 'Translucent now.' },
    '--color-old-avatar': { value: '#9fc1f8', component: 'Avatars' },
    '--color-old-initials': {
      value: { light: '#004aa2', 'light-high-contrast': '#001d49' },
      component: 'Avatars',
    },
    '--color-old-gone': { removed: true, to: '--env-color-bg-raised', note: 'Unused.' },
    '--state-old-shift': { removed: true, to: null, note: 'The rule | is gone.' },
    '--radius-old': { to: '--env-radius-sm', note: 'One scale.' },
    '--old-hook': { to: '--env-old-hook' },
    '--space-1': { to: '--env-space-1' },
    '--space-2': { to: '--env-space-2' },
  });
  // The fragment is the section alone, an entry on each line.
  const text = mapFragmentText({ $comment: 'One.', '--x': { to: '--y' } });
  assert.equal(text, '{\n  "$comment": "One.",\n  "--x": {"to":"--y"}\n}\n');
  assert.deepEqual(JSON.parse(text), { $comment: 'One.', '--x': { to: '--y' } });
});

test('the migration guide lists the token migration map between its markers', () => {
  const list = migrationGuideList(sampleMigration);
  assert.match(list, /\| `--color-old-gone` \| `--env-color-bg-raised` \| Unused\. \|/);
  assert.match(list, /\| `--state-old-shift` \| — \| The rule \\| is gone\. \|/);
  assert.match(list, /\| `--color-old-fill` \| `--env-color-bg-default` \| {2}\|/);
  assert.match(list, /\| `--color-old-avatar` \| Avatars \| `#9fc1f8` \|/);
  assert.match(
    list,
    /\| `--color-old-initials` \| Avatars \| `#004aa2` \(light\), `#001d49` \(light, high contrast\) \|/,
  );
  assert.match(list, /\| `--color-old-scrim` \| `--env-color-bg-overlay` \| Translucent now\. \|/);
  assert.match(list, /\| `--radius-old` \| `--env-radius-sm` \| One scale\. \|/);
  assert.match(list, /\| `--old-hook` \| `--env-old-hook` \| {2}\|/);
  assert.match(
    list,
    /Every other name only takes the prefix, `--space-1` as `--env-space-1`: `--space-1`, `--space-2`\./,
  );
  const guide =
    'Before.\n\n<!-- token-migration:start: note -->\nold\n<!-- token-migration:end -->\n\nAfter.\n';
  assert.equal(
    withGuideList(guide, 'new'),
    'Before.\n\n<!-- token-migration:start: note -->\n\nnew\n\n<!-- token-migration:end -->\n\nAfter.\n',
  );
  assert.throws(() => withGuideList('No markers.\n', 'new'), /needs the markers/);
});

test('the migration map takes each name once, from the sections of removed-tokens.json', () => {
  const isToken = (id) => ['color.bg.default', 'radius.sm', 'space.1'].includes(id);
  const properties = new Set(['--env-color-bg-default', '--env-radius-sm', '--env-space-1']);
  const names = migrationNames(
    {
      prefixed: ['--space-1'],
      renamed: {
        '--radius-standard': { replacement: 'radius.sm', note: 'One scale.' },
        '--line-height-body': { cssVariable: '--env-line-height-body' },
      },
      aliases: {
        '--color-pane': { replacement: 'color.bg.default', component: 'Panes' },
        '--color-white': { value: '#ffffff' },
      },
      removed: { '--scale': { replacement: null, note: 'Gone.' } },
    },
    { isToken, properties },
  );
  assert.deepEqual(names, {
    '--color-pane': {
      kind: 'alias',
      token: 'color.bg.default',
      cssVariable: '--env-color-bg-default',
      component: 'Panes',
    },
    '--color-white': { kind: 'fixed', value: '#ffffff' },
    '--line-height-body': { kind: 'renamed', cssVariable: '--env-line-height-body' },
    '--radius-standard': {
      kind: 'renamed',
      token: 'radius.sm',
      cssVariable: '--env-radius-sm',
      note: 'One scale.',
    },
    '--scale': { kind: 'removed', note: 'Gone.' },
    '--space-1': { kind: 'prefixed', cssVariable: '--env-space-1' },
  });
  const failing = (data) => () => migrationNames(data, { isToken, properties });
  assert.throws(failing({ prefixed: ['--space-9'] }), /no token becomes --env-space-9/);
  assert.throws(
    failing({ prefixed: ['--space-1'], removed: { '--space-1': { note: 'x' } } }),
    /lists --space-1 in both prefixed and removed/,
  );
  assert.throws(
    failing({ aliases: { '--color-x': { replacement: 'color.bg.gone' } } }),
    /which is no public token/,
  );
  assert.throws(failing({ aliases: { '--env-old': { value: '#fff' } } }), /already has the prefix/);
  // A name of 1.0's development has the prefix, unless a token still has it.
  assert.deepEqual(
    migrationNames(
      { renamed: { '--env-old-space': { replacement: 'space.1' } } },
      { isToken, properties },
    ),
    { '--env-old-space': { kind: 'renamed', token: 'space.1', cssVariable: '--env-space-1' } },
  );
  assert.throws(
    failing({ removed: { '--env-space-1': { note: 'x' } } }),
    /--env-space-1 in removed is a token's custom property/,
  );
  assert.throws(
    failing({ renamed: { '--hook': { cssVariable: '--hook-2' } } }),
    /needs a replacement token or an --env- cssVariable/,
  );
});

test("the codemods' rename map and the migration guide carry the token migration map", async () => {
  const migration = JSON.parse(
    await readFile(join(library, 'src/generated/token-migration.json'), 'utf8'),
  );
  const copies = await migrationCopies(migration);
  assert.deepEqual(
    copies.map(({ path }) => relative(repository, path).replaceAll('\\', '/')),
    ['packages/codemods/src/maps/v1/tokens/Tokens.json', 'docs/migration.md'],
  );
  for (const { path, contents } of copies)
    assert.equal(
      await readFile(path, 'utf8'),
      await formatted(path, contents),
      `${relative(repository, path)} is behind the token migration map: run npm run tokens:build.`,
    );
  // Every 0.7 name is in both, the map's entries in the migration map's order.
  const tokens = JSON.parse(await readFile(codemodsMapFile, 'utf8'));
  assert.deepEqual(Object.keys(tokens).slice(1), Object.keys(migration.names));
  const guide = await readFile(migrationGuideFile, 'utf8');
  for (const name of Object.keys(migration.names)) assert.ok(guide.includes(`\`${name}\``), name);
});

test('no style sheet or component reads or sets a custom property the migration map removes', async () => {
  const migration = JSON.parse(
    await readFile(join(library, 'src/generated/token-migration.json'), 'utf8'),
  );
  const removed = Object.entries(migration.names)
    .filter(([name, entry]) => entry.kind === 'removed' && name.startsWith('--env-'))
    .map(([name]) => name);
  assert.ok(removed.includes('--env-sidebar-width'));
  const files = (await readdir(join(library, 'src'), { recursive: true }))
    .filter((file) => /\.(css|tsx?)$/.test(file) && !file.includes('generated'))
    .map((file) => join(library, 'src', file));
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const name of removed)
      assert.ok(
        !new RegExp(`${name}(?![\\w-])`).test(source),
        `${relative(repository, file)} uses ${name}, which the migration map removes.`,
      );
  }
});
