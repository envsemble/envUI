import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked } from 'marked';
import ts from 'typescript';
import { optionTable, siteInlineCode, siteStructure } from '../scripts/SiteContent.mjs';
import {
  examplesDirectory,
  isPropsTable,
  readDocumentation,
  readProps,
  specimensDirectory,
} from '../scripts/GenerateDocumentation.mjs';

/**
 * Component pages not on the template yet, which keep their hand-written props tables. Convert a
 * page as docs/component-pages.md describes, then remove it here; the list only shrinks.
 */
const unconverted = [];

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
/** Pages with the template's sections: component and pattern pages. */
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
        `${page.path} names ${name}'s color property ${property}, under In code's Customize`,
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

test('pages not on the template are listed, and only those', () => {
  const legacy = components.filter((document) => !document.sections).map(({ id }) => id);
  assert.deepEqual(
    legacy.sort(),
    [...unconverted].sort(),
    'A converted page leaves `unconverted` in this test; a new page starts on the template.',
  );
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
  for (const document of sectioned)
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

test('every specimen file is placed by its page', () => {
  const placed = new Set();
  for (const document of sectioned)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'specimen') placed.add(`${document.id}/${block.name}`);
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
 * A page's Markdown as the Site shows it: without its changelog, its developer-only part, "## In
 * code", and the lists of what envUI and the application provide, which its page in the Docs shows.
 */
function siteMarkdown(document) {
  return document.markdown
    .replace(/\n## Changelog\n[\s\S]*$/, '\n')
    .replace(/\n## In code\n[\s\S]*?(?=\n## |$)/, '\n')
    .replace(/\n### (?:envUI provides|You provide)\n[\s\S]*?(?=\n#{2,3} |$)/g, '\n');
}

test('a page the Site shows links nowhere in the Docs', () => {
  // The Site reaches the Docs only through a page's API button and the Docs link at the top: a
  // component or pattern page links to other pages of the Site, a foundation's without a heading,
  // since a foundation's headings are in its guide in the Docs.
  const links = sectioned
    .filter((document) => document.id !== 'field')
    .flatMap((document) =>
      [...siteMarkdown(document).matchAll(/\]\(([^)\s]+)\)/g)]
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
  assert.deepEqual(links, [], 'Link these to a page of the Site, or say it without the link.');
});

/**
 * Pages whose Site speaks plain language: no inline code outside the Code disclosures under its
 * figures, with what developers need in the page's "## In code" and in Accessibility's lists of
 * what envUI and the application provide. The list grows until it holds every page, and then goes.
 */
const plainPages = ['button', 'card', 'text-field', 'sheet', 'forms'];

test("a plain page's Site shows no inline code", (t) => {
  const found = sectioned
    .filter((document) => plainPages.includes(document.id))
    .flatMap((document) =>
      siteInlineCode(document).map(({ where, code }) => `${document.path}, ${where}: ${code}`),
    );
  assert.deepEqual(
    found,
    [],
    'The Site speaks plain language: say it in words, and move the code to "## In code".',
  );
  // The pages still to rewrite, with the inline code their Site shows; Field's page is in the Docs.
  const left = sectioned
    .filter((document) => !plainPages.includes(document.id) && document.id !== 'field')
    .map((document) => [document.id, siteInlineCode(document).length])
    .filter(([, count]) => count);
  t.diagnostic(
    `Inline code on the Site of the other pages: ${left.reduce((sum, [, count]) => sum + count, 0)} on ${left.length} pages (${left
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => `${id} ${count}`)
      .join(', ')}).`,
  );
});

/** The count of what a check found on each of the other pages, most first, as one line. */
const tally = (counts) =>
  `${counts.reduce((sum, [, count]) => sum + count, 0)} on ${counts.length} pages (${counts
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => `${id} ${count}`)
    .join(', ')})`;

test("a plain page's Site text is in titled blocks", (t) => {
  const found = sectioned
    .filter((document) => plainPages.includes(document.id))
    .flatMap((document) =>
      siteStructure(document).map(
        ({ where, kind, text }) => `${document.path}, ${where}, ${kind}: ${text}`,
      ),
    );
  assert.deepEqual(
    found,
    [],
    'Every piece of Site text is in a titled block, a heading and one short paragraph: give loose text a "###" heading, or fold it into the block it belongs to.',
  );
  // The pages still to rewrite, with the loose text their Site shows.
  const left = sectioned
    .filter((document) => !plainPages.includes(document.id) && document.id !== 'field')
    .map((document) => [document.id, siteStructure(document).length])
    .filter(([, count]) => count);
  t.diagnostic(`Loose text on the Site of the other pages: ${tally(left)}.`);
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

test("a plain page's option table after a variants figure names the figure's variants", (t) => {
  const found = sectioned
    .filter((document) => plainPages.includes(document.id))
    .flatMap((document) => unmatchedOptions(document).map((text) => `${document.path}, ${text}`));
  assert.deepEqual(
    found,
    [],
    "Name the options as the variants figure's legend does, in its order.",
  );
  const left = sectioned
    .filter((document) => !plainPages.includes(document.id))
    .map((document) => [document.id, unmatchedOptions(document).length])
    .filter(([, count]) => count);
  t.diagnostic(
    `Option tables not named as their variants figure on the other pages: ${tally(left)}.`,
  );
});
