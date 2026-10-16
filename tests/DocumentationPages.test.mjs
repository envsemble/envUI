import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked } from 'marked';
import ts from 'typescript';
import {
  examplesDirectory,
  isPropsTable,
  readDocumentation,
  readProps,
  specimensDirectory,
} from '../scripts/GenerateDocumentation.mjs';

/**
 * Component pages not on the template yet. They keep their hand-written props tables and their
 * catalogue preview in apps/catalogue/src/previews (the switch in ComponentPreview.tsx). Convert a
 * page as docs/component-pages.md describes, then remove it here; the list only shrinks.
 */
const unconverted = ['chips'];

/** Exports that no page lists in its components yet; the list only shrinks. */
const undocumentedExports = [];

/**
 * Modules an example may import: only what an application can, so its source can be copied, and
 * each icon by its own path, as the setup guide asks, rather than through the icons barrel.
 */
const publicModules =
  /^(?:react|@envsemble\/envui(?:\/(?:content|diff|rich-text|icons\/[A-Za-z\d]+))?)$/;

/**
 * Every module a source loads: static imports and re-exports, imports for their side effects, and
 * import() and require() with a literal path.
 */
function moduleSpecifiers(source) {
  const file = ts.createSourceFile('Example.tsx', source, ts.ScriptTarget.Latest, true);
  const specifiers = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      specifiers.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    )
      specifiers.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return specifiers;
}

const props = readProps();
const documents = readDocumentation();
const components = documents.filter((document) => document.path.startsWith('components/'));

test('every public export is documented on exactly one page', () => {
  const homes = new Map();
  for (const document of documents)
    for (const name of document.frontmatter?.components ?? [])
      homes.set(name, [...(homes.get(name) ?? []), document.path]);
  const runtime = Object.keys(props.exports).filter((name) => !name.includes('.'));
  const missing = runtime.filter((name) => !homes.has(name) && !undocumentedExports.includes(name));
  assert.deepEqual(missing, [], 'Exports without a page: add them to a page’s components.');
  const repeated = [...homes].filter(([, paths]) => paths.length > 1);
  assert.deepEqual(repeated, [], 'An export belongs to one page; mention it elsewhere instead.');
  for (const name of undocumentedExports)
    assert.ok(!homes.has(name), `${name} has a page now; remove it from undocumentedExports.`);
  for (const name of homes.keys())
    assert.ok(props.exports[name], `A page lists ${name}, which envUI does not export.`);
});

test('every alternative a page suggests has a page to link to', () => {
  // As the catalogue links them: a part such as Menu.Item goes to its namespace's page.
  const documented = new Set(
    documents.flatMap((document) => document.frontmatter?.components ?? []),
  );
  for (const document of components)
    for (const { use } of document.frontmatter?.avoidWhen ?? [])
      if (use)
        assert.ok(
          documented.has(use.split('.')[0]),
          `${document.path} suggests ${use}, which no page documents.`,
        );
});

test('pages not on the template are listed, and only those', () => {
  const legacy = components.filter((document) => !document.sections).map(({ id }) => id);
  assert.deepEqual(
    legacy.sort(),
    [...unconverted].sort(),
    'A converted page leaves `unconverted` in this test; a new page starts on the template.',
  );
});

test('only pages not on the template keep a preview family in ComponentPreview.tsx', () => {
  const source = readFileSync(
    new URL('../apps/catalogue/src/previews/ComponentPreview.tsx', import.meta.url),
    'utf8',
  );
  const cases = [...source.matchAll(/case '([a-z-]+)':/g)].map((match) => match[1]);
  assert.deepEqual(cases.sort(), [...unconverted].sort());
});

test('pages on the template list no props by hand', () => {
  for (const document of components.filter((page) => page.sections)) {
    const tables = marked.lexer(document.markdown).filter(isPropsTable);
    assert.equal(tables.length, 0, `${document.path} has a hand-written props table.`);
    assert.ok(
      !/^#{2,3} Props\b/m.test(document.markdown),
      `${document.path} writes its Props section by hand; it is generated.`,
    );
  }
});

/** The example or specimen files of every page, by page. */
function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readdirSync(join(directory, entry.name))
        .filter((name) => name.endsWith('.tsx'))
        .map((name) => ({
          page: entry.name,
          name: name.slice(0, -4),
          path: join(directory, entry.name, name),
        })),
    );
}

test('every example file is referenced once, by its page, and imports only public modules', () => {
  const referenced = new Map();
  for (const document of components)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'example') {
          const key = `${document.id}/${block.name}`;
          referenced.set(key, (referenced.get(key) ?? 0) + 1);
        }
  for (const { page, name, path } of files(examplesDirectory)) {
    const key = `${page}/${name}`;
    assert.equal(
      referenced.get(key),
      1,
      `examples/${key}.tsx must be in its page’s Examples once.`,
    );
    const source = readFileSync(path, 'utf8');
    assert.match(
      source,
      /^export default function [A-Z]/m,
      `examples/${key}.tsx default-exports a component.`,
    );
    for (const specifier of moduleSpecifiers(source))
      assert.match(
        specifier,
        publicModules,
        `examples/${key}.tsx imports ${specifier}; examples use only public entries.`,
      );
    assert.doesNotMatch(source, /\bdocs-[a-z]/, `examples/${key}.tsx uses a catalogue class.`);
  }
});

test('the import check reads every way a source loads a module', () => {
  assert.deepEqual(
    moduleSpecifiers(
      [
        "import 'side-effect';",
        "import { Button } from '@envsemble/envui';",
        "import type { ButtonProps } from '@envsemble/envui';",
        "export { Home } from '@envsemble/envui/icons/Home';",
        "const Editor = lazy(() => import('./Editor'));",
        "const legacy = require('legacy');",
      ].join('\n'),
    ),
    [
      'side-effect',
      '@envsemble/envui',
      '@envsemble/envui',
      '@envsemble/envui/icons/Home',
      './Editor',
      'legacy',
    ],
  );
  assert.doesNotMatch('@envsemble/envui/icons', publicModules);
  assert.match('@envsemble/envui/icons/Home', publicModules);
});

test('every specimen file is placed by its page', () => {
  const placed = new Set();
  for (const document of components)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'specimen') placed.add(`${document.id}/${block.name}`);
  for (const { page, name } of files(specimensDirectory))
    assert.ok(
      placed.has(`${page}/${name}`),
      `specimens/${page}/${name}.tsx is not placed on its page.`,
    );
});
