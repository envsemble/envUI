import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked } from 'marked';
import ts from 'typescript';
import {
  longParagraphs,
  optionTable,
  paragraphLength,
  catalogueInlineCode,
  catalogueStructure,
  catalogueText,
  technicalText,
  withoutCodeColumns,
} from '../apps/site/src/shared/CatalogueContent.ts';
import {
  examplesDirectory,
  isPropsTable,
  readDocumentation,
  readProps,
  specimensDirectory,
} from '../scripts/docs/GenerateDocumentation.ts';

/** Exports without a page that lists them in its frontmatter; the list only shrinks. */
const undocumentedExports = [];

/**
 * Modules an example may import: only what an application can, so its source can be copied, and
 * each icon by its own path, as the setup guide asks, rather than through the icons barrel.
 */
const publicModules =
  /^(?:react|@envsemble\/envui(?:\/(?:content|diff|rich-text|color|icons\/[A-Za-z\d]+))?)$/;

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
/** Pages in the one-file structure: component, pattern and foundation pages. */
const sectioned = documents.filter((document) => document.sections);
/** Pattern pages, which list what they compose. */
const compositions = documents.filter((document) => document.frontmatter?.composes);

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

test("every component's page names each of its color properties", () => {
  const parts = JSON.parse(
    readFileSync(new URL('../docs/generated/parts.json', import.meta.url), 'utf8'),
  );
  for (const [name, entry] of Object.entries(parts.components)) {
    if (!entry.colors?.length) continue;
    const page = documents.find((document) => document.frontmatter?.components?.includes(name));
    assert.ok(page, `${name} has color properties but no page`);
    for (const { property } of entry.colors)
      assert.ok(
        page.markdown.includes(`\`${property}\``),
        `${page.path} names ${name}'s color property ${property}, under Compose's Customize`,
      );
  }
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

test('every component, pattern and foundation page is in the one-file structure', () => {
  // The build reads a page of these kinds only in the structure, so none is left outside it.
  const outside = documents
    .filter((document) => /^(components|patterns|foundations)\//.test(document.path))
    .filter((document) => !document.sections || !document.frontmatter?.examples)
    .map(({ path }) => path);
  assert.deepEqual(outside, [], 'Write these pages as contributing/pages.md describes.');
});

test('pages list no props by hand', () => {
  for (const document of components) {
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
  // A foundation's figure with an example file of its name shows it as its code.
  const referenced = new Map();
  for (const document of sectioned)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'example' || (block.kind === 'figure' && block.code)) {
          const key = `${document.id}/${block.name}`;
          referenced.set(key, (referenced.get(key) ?? 0) + 1);
        }
  for (const { page, name, path } of files(examplesDirectory)) {
    const key = `${page}/${name}`;
    assert.equal(
      referenced.get(key),
      1,
      `examples/${key}.tsx must be on its page once, as an example.`,
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

test('every specimen file is placed by its page, or plays or holds the example it is named after', () => {
  const placed = new Set();
  for (const document of sectioned)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (
          block.kind === 'specimen' ||
          (block.kind === 'example' && (block.motion || block.specimen))
        )
          placed.add(`${document.id}/${block.name}`);
  for (const { page, name } of files(specimensDirectory))
    assert.ok(
      placed.has(`${page}/${name}`),
      `specimens/${page}/${name}.tsx is not placed on its page.`,
    );
});

/** The names a source imports from envUI's entries, icons apart: `import { Button, Row } …`. */
function envuiImports(source) {
  const file = ts.createSourceFile('Example.tsx', source, ts.ScriptTarget.Latest, true);
  const names = [];
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue;
    const from = ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text;
    if (!from || !/^@envsemble\/envui(?:\/(?:content|diff|rich-text))?$/.test(from)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements)
        if (!element.isTypeOnly) names.push((element.propertyName ?? element.name).text);
  }
  return names;
}

test('the import reader finds the runtime names a source takes from envUI', () => {
  assert.deepEqual(
    envuiImports(
      [
        "import { Button, type ButtonProps, Row as Line } from '@envsemble/envui';",
        "import type { Theme } from '@envsemble/envui';",
        "import { CodeBlock } from '@envsemble/envui/content';",
        "import { Close } from '@envsemble/envui/icons/Close';",
        "import { useState } from 'react';",
      ].join('\n'),
    ),
    ['Button', 'Row', 'CodeBlock'],
  );
});

test('a pattern composes only exports, and every export its files import', () => {
  for (const document of compositions) {
    const { composes } = document.frontmatter;
    for (const name of composes) {
      assert.ok(
        props.exports[name],
        `${document.path} composes ${name}, which envUI doesn't export.`,
      );
      assert.ok(!name.includes('.'), `${document.path} composes ${name}; list its namespace.`);
    }
    for (const section of document.sections)
      for (const block of section.blocks) {
        if (block.kind !== 'example') continue;
        const source = readFileSync(
          join(examplesDirectory, document.id, `${block.name}.tsx`),
          'utf8',
        );
        for (const name of envuiImports(source))
          if (props.exports[name])
            assert.ok(
              composes.includes(name),
              `examples/${document.id}/${block.name}.tsx imports ${name}; add it to the composes of ${document.path}.`,
            );
      }
  }
});

test('every page an avoidWhen entry sends readers to is indexed', () => {
  const ids = new Set(documents.map(({ id }) => id));
  for (const document of documents)
    for (const { see } of document.frontmatter?.avoidWhen ?? [])
      if (see) assert.ok(ids.has(see) && see !== document.id, `${document.path} sees ${see}.`);
});

test('the docs publish at least 8 patterns', () => {
  const count = documents.filter((document) => document.group === 'Patterns').length;
  assert.ok(count >= 8, `${count} patterns; 1.0 needs 8.`);
});

/** Words too common to say whether two sentences say the same thing. */
const commonWords = new Set(
  'a an the and or of to in on for with its it is as by at from that this be are which what who than into one their your can own such when where how all any so not no but if has have each'.split(
    ' ',
  ),
);

/**
 * The words that carry a sentence's meaning, without code, link targets or common words, and
 * without a plural's ending, so "panels" and "panel" count as one.
 */
function meaningfulWords(text) {
  const words = text
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, ' ')
    .toLowerCase()
    .match(/[a-z][a-z’'-]*/g);
  return new Set(
    (words ?? [])
      .filter((word) => !commonWords.has(word))
      .map((word) => word.replace(/(?<=..)(es|s)$/, '')),
  );
}

/** The first sentence of a page's Overview, where the section opens with text. */
function overviewOpening(document) {
  const first = document.sections.find((section) => section.id === 'overview')?.blocks[0];
  if (first?.kind !== 'markdown') return '';
  const paragraph =
    first.markdown
      .replace(/^## .*\n/, '')
      .trim()
      .split(/\n\s*\n/)[0] ?? '';
  if (/^(#|\||[-*+] |\d+[.)] |```|<!--)/.test(paragraph)) return '';
  return paragraph.replace(/\n/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z<`[*])/)[0];
}

test("a page's Overview doesn't open by saying its summary again", () => {
  // The banner shows the summary right above the Overview, so the Overview starts with what the
  // banner doesn't say.
  const repeats = sectioned.flatMap((document) => {
    // Naming the page's subject repeats nothing.
    const title = meaningfulWords(document.title);
    const opening = meaningfulWords(overviewOpening(document)).difference(title);
    const summary = meaningfulWords(document.summary);
    const shared = [...opening].filter((word) => summary.has(word));
    return shared.length >= 3 && shared.length / opening.size >= 0.35
      ? [`${document.path} (${shared.join(', ')})`]
      : [];
  });
  assert.deepEqual(
    repeats,
    [],
    "These Overviews open by saying the summary again; start with what the banner doesn't say.",
  );
});

/**
 * A page's Markdown as the catalogue shows it: without its changelog, its developer part, "##
 * Compose", the lists of what envUI and the application provide, and its tables' In code columns,
 * which its page in the Docs shows.
 */
function catalogueMarkdown(document) {
  return withoutCodeColumns(
    document.markdown
      .replace(/\n## Changelog\n[\s\S]*$/, '\n')
      .replace(/\n## Compose\n[\s\S]*?(?=\n## |$)/, '\n')
      .replace(/\n### (?:envUI provides|You provide)\n[\s\S]*?(?=\n#{2,3} |$)/g, '\n'),
  );
}

test('a page of the catalogue links nowhere in the Docs', () => {
  // The catalogue reaches the Docs only through a page's Docs button and the Docs link at the
  // top: a component or pattern page links to other pages of the catalogue, a foundation's
  // without a heading, since a foundation's headings are in its page in the Docs.
  const links = sectioned
    .filter((document) => document.id !== 'field')
    .flatMap((document) =>
      [...catalogueMarkdown(document).matchAll(/\]\(([^)\s]+)\)/g)]
        .map(([, href]) => href)
        .filter((href) => !/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href))
        .filter((href) => {
          const [path, fragment] = new URL(href, `https://envui.invalid/docs/${document.path}`).href
            .slice('https://envui.invalid/docs/'.length)
            .split('#');
          if (path === 'components/field.md') return true;
          if (/^(components|patterns)\/[a-z-]+\.md$/.test(path)) return false;
          return !(/^foundations\/[a-z-]+\.md$/.test(path) && !fragment);
        })
        .map((href) => `${document.path}: ${href}`),
    );
  assert.deepEqual(links, [], 'Link these to a page of the catalogue, or say it without the link.');
});

/** Every page the catalogue shows: Field's page is in the Docs only. */
const cataloguePages = () => sectioned.filter((document) => document.id !== 'field');

test("a page's catalogue shows no inline code", () => {
  const found = cataloguePages().flatMap((document) =>
    catalogueInlineCode(document).map(({ where, code }) => `${document.path}, ${where}: ${code}`),
  );
  assert.deepEqual(
    found,
    [],
    'The catalogue speaks plain language: say it in words, and move the code to "## Compose".',
  );
});

test("a page's catalogue text is in titled blocks", () => {
  const found = cataloguePages().flatMap((document) =>
    catalogueStructure(document).map(
      ({ where, kind, text }) => `${document.path}, ${where}, ${kind}: ${text}`,
    ),
  );
  assert.deepEqual(
    found,
    [],
    'Every piece of catalogue text is in a titled block, a heading and up to three short paragraphs: give loose text a "###" heading, or fold it into the block it belongs to.',
  );
});

test("a page's catalogue text is in short paragraphs", () => {
  const found = cataloguePages().flatMap((document) =>
    longParagraphs(document).map(
      ({ where, length, text }) => `${document.path}, ${where}, ${length} characters: ${text}`,
    ),
  );
  assert.deepEqual(
    found,
    [],
    `A paragraph of the catalogue is at most ${paragraphLength} characters, about three lines: split it into short paragraphs, one point each, or give a point a block of its own.`,
  );
});

/**
 * The option tables right after a variants figure whose names are not the figure's, in its order:
 * the legend shows each name in the tag the figure's callout shows.
 */
function unmatchedOptions(document) {
  const found = [];
  for (const section of document.sections ?? [])
    section.blocks.forEach((block, index) => {
      const next = section.blocks[index + 1];
      if (block.role !== 'variants' || next?.kind !== 'markdown') return;
      const table = optionTable(
        marked.lexer(next.markdown).find((token) => token.type !== 'space'),
      );
      if (!table) return;
      const names = table.options.map(({ name }) => name);
      const labels = (block.legend ?? []).map(({ label }) => label);
      if (names.join('|') !== labels.join('|'))
        found.push(`${section.title}: ${names.join(', ')} for ${labels.join(', ')}`);
    });
  return found;
}

test("an option table after a variants figure names the figure's variants", () => {
  const found = sectioned.flatMap((document) =>
    unmatchedOptions(document).map((text) => `${document.path}, ${text}`),
  );
  assert.deepEqual(
    found,
    [],
    "Name the options as the variants figure's legend does, in its order.",
  );
});

test('technical text is found in words, and plain words are left alone', () => {
  const kinds = (text) => technicalText(text).map(({ kind }) => kind);
  assert.deepEqual(kinds('Use --env-color-bg-page here'), ['token']);
  assert.deepEqual(kinds('The env-card-title part'), ['class name']);
  assert.deepEqual(kinds('#1e1f21 or #fff'), ['hex color', 'hex color']);
  assert.deepEqual(kinds('0.25 rem, 32px and 150ms'), ['length', 'length', 'length']);
  assert.deepEqual(kinds('A 50% radius'), ['percentage']);
  assert.deepEqual(kinds('At least 4.5:1'), ['ratio']);
  assert.deepEqual(kinds('Set variant="ghost"'), ['code']);
  assert.deepEqual(kinds('Call onValueChange'), ['identifier']);
  assert.deepEqual(
    kinds('More room between sections, step 1, 4 people, version 1.0.0, Ctrl + K, envUI on macOS.'),
    [],
  );
});

/** The technical text in a page's catalogue Markdown, as plain words: keys are written as <kbd>. */
const catalogueTechnicalText = (document) =>
  catalogueText(document).flatMap(({ markdown, text }) =>
    technicalText((markdown ?? text).replace(/`[^`]*`/g, '').replace(/<\/?kbd>/g, '')),
  );

test("a component page's catalogue shows no technical text", () => {
  // The catalogue is for people looking at envUI: lengths, tokens, percentages and code names go
  // in the page's Compose, which its page in the Docs shows.
  const found = cataloguePages()
    .filter((document) => document.path.startsWith('components/'))
    .flatMap((document) =>
      catalogueTechnicalText(document).map(({ kind, text }) => `${document.path}: ${kind} ${text}`),
    );
  assert.deepEqual(found, [], 'Say it in words, and move the value to "## Compose".');
});

test("the technical text in each page's catalogue Markdown is counted, for the rewrite to come", (t) => {
  // Reporting only, like CataloguePlainLanguage.spec.ts's count of the rendered pages: the catalogue shows no
  // token names, hex colors, lengths, percentages or code, which belong to the page in the Docs.
  // Inline code is already rejected above; this counts what plain words still carry.
  const counts = cataloguePages().flatMap((document) => {
    const found = catalogueTechnicalText(document);
    return found.length
      ? [`${document.path}: ${found.length} (${found.map(({ text }) => text).join(', ')})`]
      : [];
  });
  t.diagnostic(
    counts.length
      ? `Technical text in the catalogue's Markdown:\n${counts.join('\n')}`
      : 'No technical text in the catalogue Markdown.',
  );
});
