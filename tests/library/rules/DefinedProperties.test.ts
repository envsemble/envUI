import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, posix, relative } from 'node:path';
import { test } from 'node:test';
import { cssDeclarations } from '../../../scripts/build/tokens/CssDeclarations.ts';
import { baseUiPositionerProperties } from '../../../scripts/lint/BaseUiProperties.ts';
import { partsFile, repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const library = join(repositoryRoot, 'packages/ui');

const applicationColorProperties = Object.values(
  JSON.parse(readFileSync(partsFile, 'utf8')).components,
).flatMap((entry) => (entry.colors ?? []).map((color) => color.property));

const impliedClasses = {
  'env-card': ['env-surface'],
  'env-select-trigger': ['env-button'],
};

const tokenStyleSheets = new Set(['Tokens.css', 'TokensHandwritten.css']);

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

const selectorList = (selector) =>
  splitOutside(selector, (character) => character === ',')
    .filter((piece) => piece !== ',')
    .map((piece) => piece.trim());

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

const isCompound = (selector) =>
  splitOutside(selector, (character) => ' >+~'.includes(character)).filter((piece) => piece.trim())
    .length === 1;

function simpleSelectors(compound) {
  const parts: string[] = [];
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

function withImplied(compound, implied) {
  const parts = simpleSelectors(compound);
  const classes = parts.filter((part) => part.startsWith('.')).map((part) => part.slice(1));
  return new Set([
    ...parts,
    ...classes.flatMap((name) => implied[name] ?? []).map((name) => `.${name}`),
  ]);
}

const conditions = (atRules) =>
  atRules
    .filter((prelude) => !/^@layer\b/.test(prelude))
    .map((prelude) => prelude.replace(/\s+/g, ''));

const themeConditions = (selector) =>
  new Set(selector.match(/(?::not\()?\[data-env-(?:theme|contrast)[^\]]*\]/g) ?? []);

const subset = (small, large) => [...small].every((item) => large.has(item));

const tieBreakingTypeSelector = ':not(env-none)';
const matchesAll = (part) => part === '*' || part === tieBreakingTypeSelector;

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
            simpleSelectors(selector).every((part) => matchesAll(part) || parts.has(part)),
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
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--missing, 1rem); }'), []);
  assert.deepEqual(undefinedReadsOf('.env-foo { margin: var(--other, var(--missing)); }'), [
    '--missing in Foo.css: .env-foo',
  ]);
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
  for (const css of [
    '.env-other.env-foo:hover { margin: var(--other); }',
    '.env-other > .env-navigation-bar .env-foo { margin: var(--other); }',
  ])
    assert.deepEqual(undefinedReadsOf(css, { styleSheets }), [], css);
  assert.deepEqual(
    undefinedReadsOf('.env-foo { margin: var(--other); }', {
      styleSheets,
      implied: { 'env-foo': ['env-other'] },
    }),
    [],
  );
  assert.deepEqual(
    undefinedReadsOf(
      '.env-other + .env-foo, .env-other .env-navigation-bar { margin: var(--other); }',
      {
        styleSheets,
      },
    ),
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
  assert.deepEqual(
    undefinedReadsOf('@layer env { .env-foo { --own: 1rem; } } .env-foo { margin: var(--own); }'),
    [],
  );
});

test('a property set inline is defined only by the component that renders the element', () => {
  const css = '.env-foo-cell { margin: var(--env-foo-mix); }';
  const sets = "export const style = { '--env-foo-mix': '1rem' };";
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
  const styleSheets = {
    ...(await sources(join(library, 'src/styles'), ['.css'])),
    'Tokens.css': await readFile(join(library, 'src/generated/Tokens.css'), 'utf8'),
  };
  const problems = undefinedReads({
    styleSheets,
    modules: await sources(join(library, 'src'), ['.ts', '.tsx']),
    positioned: baseUiPositionerProperties,
    external: applicationColorProperties,
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
  const generated = await readFile(join(library, 'src/generated/Tokens.css'), 'utf8');
  const defined = new Set(
    [...`${generated}\n${handwritten}`.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name),
  );
  const unknown = [...handwritten.matchAll(/var\(\s*(--[\w-]+)/g)]
    .map(([, name]) => name)
    .filter((name) => !defined.has(name));
  assert.deepEqual(unknown, []);
});
