import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked } from 'marked';
import ts from 'typescript';
import { optionTable } from '../../apps/site/src/documentation/CatalogueContent.ts';
import {
  catalogueInlineCode,
  catalogueProse,
  catalogueStructure,
  catalogueText,
  longParagraphs,
  paragraphLength,
  technicalText,
} from '../../scripts/docs/validation/CatalogueWording.ts';
import { examplesDirectory, specimensDirectory } from '../../scripts/RepositoryPaths.ts';
import { isPropsTable } from '../../scripts/docs/MarkdownBlocks.ts';
import { readDocumentation } from '../../scripts/docs/DocumentationReader.ts';
import { readProps } from '../../scripts/docs/PageStructure.ts';

const undocumentedExports = [];

const publicModules =
  /^(?:react|@envsemble\/envui(?:\/(?:code|markdown|diff|color|icons\/[A-Za-z\d]+))?)$/;

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
const sectioned = documents.filter((document) => document.sections);

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

test('every component and foundation page is in the one-file structure', () => {
  const outside = documents
    .filter((document) => /^(components|foundations)\//.test(document.path))
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
        "export { IconHome } from '@envsemble/envui/icons/Home';",
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
      `specimens/${page}/${name}.tsx is not placed on its page, nor the playback of an example of its name: rename a playback with its example.`,
    );
});

test('every playback is named after an example of its page, and plays no other', () => {
  const examples = new Set(files(examplesDirectory).map(({ page, name }) => `${page}/${name}`));
  const playbacks = new Set(
    files(specimensDirectory)
      .map(({ page, name }) => `${page}/${name}`)
      .filter((key) => examples.has(key)),
  );
  for (const document of sectioned)
    for (const section of document.sections ?? [])
      for (const block of section.blocks)
        if (block.kind === 'example' && (block.motion || block.specimen))
          playbacks.add(`${document.id}/${block.name}`);
  for (const key of playbacks) {
    assert.ok(
      examples.has(key),
      `specimens/${key}.tsx plays examples/${key}.tsx, which is missing.`,
    );
    const source = readFileSync(join(specimensDirectory, `${key}.tsx`), 'utf8');
    for (const specifier of moduleSpecifiers(source)) {
      const example = /\/examples\/([\w-]+\/\w+)$/.exec(specifier)?.[1];
      assert.ok(
        !example || example === key,
        `specimens/${key}.tsx plays examples/${key}.tsx but imports examples/${example}.tsx.`,
      );
    }
  }
});

function envuiImports(source) {
  const file = ts.createSourceFile('Example.tsx', source, ts.ScriptTarget.Latest, true);
  const names: string[] = [];
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue;
    const from = ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text;
    if (!from || !/^@envsemble\/envui(?:\/(?:code|markdown|diff))?$/.test(from)) continue;
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
        "import { CodeBlock } from '@envsemble/envui/code';",
        "import { IconClose } from '@envsemble/envui/icons/Close';",
        "import { useState } from 'react';",
      ].join('\n'),
    ),
    ['Button', 'Row', 'CodeBlock'],
  );
});

test('every page an avoidWhen entry sends readers to is indexed', () => {
  const ids = new Set(documents.map(({ id }) => id));
  for (const document of documents)
    for (const { see } of document.frontmatter?.avoidWhen ?? [])
      if (see) assert.ok(ids.has(see) && see !== document.id, `${document.path} sees ${see}.`);
});

const commonWords = new Set(
  'a an the and or of to in on for with its it is as by at from that this be are which what who than into one their your can own such when where how all any so not no but if has have each'.split(
    ' ',
  ),
);

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
  const repeats = sectioned.flatMap((document) => {
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

const catalogueMarkdown = (document) =>
  catalogueProse(document)
    .flatMap(({ blocks }) =>
      blocks.flatMap((block) => (block.kind === 'markdown' ? [block.markdown] : [])),
    )
    .join('\n');

test('a page of the catalogue links nowhere in the Docs', () => {
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
          if (/^components\/[a-z-]+\.md$/.test(path)) return false;
          return !(/^foundations\/[a-z-]+\.md$/.test(path) && !fragment);
        })
        .map((href) => `${document.path}: ${href}`),
    );
  assert.deepEqual(links, [], 'Link these to a page of the catalogue, or say it without the link.');
});

const cataloguePages = () => sectioned.filter((document) => document.id !== 'field');

const unwrittenSections = new Set(['Compose', 'Words to use', 'Changelog']);

function writtenProse(document) {
  const found = [];
  for (const token of marked.lexer(document.markdown))
    if (token.type === 'heading' && token.depth === 2 && unwrittenSections.has(token.text))
      found.push(`"## ${token.text}"`);
  for (const section of document.sections ?? []) {
    if (section.id === 'overview' || section.id === 'code') continue;
    let subsection = '';
    for (const block of section.blocks) {
      if (block.kind !== 'markdown') continue;
      for (const token of marked.lexer(block.markdown)) {
        if (token.type === 'space' || (token.type === 'heading' && token.depth === 2)) continue;
        if (token.type === 'heading' && token.depth === 3) {
          subsection = token.text;
          if (section.id === 'accessibility' && subsection !== 'Keyboard')
            found.push(`${section.title}: "### ${subsection}"`);
          continue;
        }
        if (token.type === 'table' && section.id === 'accessibility' && subsection === 'Keyboard')
          continue;
        found.push(`${section.title}: ${token.raw.trim().split('\n')[0].slice(0, 60)}`);
      }
    }
  }
  return found;
}

test('a component page holds its examples and reference, and no prose', () => {
  const found = components.flatMap((document) =>
    writtenProse(document).map((text) => `${document.path}, ${text}`),
  );
  assert.deepEqual(
    found,
    [],
    'A component page is its frontmatter, its examples under headings, their legends and specimens, and a keyboard table where its keys are not the ones people expect; its props, parts, color properties and import are generated. Say what it is for in summary, useWhen and avoidWhen, and let the API hold the rest.',
  );
});

test('the prose check finds text, written code and sections a component page does not write', () => {
  const markdown = (text) => ({ kind: 'markdown', markdown: text });
  const found = writtenProse({
    markdown: '## Variants\n\n## Compose\n\n### Usage\n',
    sections: [
      {
        id: 'variants',
        title: 'Variants',
        blocks: [markdown('## Variants\n\n### Sizes\n\nTwo sizes.\n')],
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        blocks: [
          markdown(
            '## Accessibility\n\n### Keyboard\n\n| Key | Action |\n| --- | --- |\n| <kbd>F6</kbd> | Moves. |\n\n### You provide\n\n- A label.\n',
          ),
        ],
      },
    ],
  });
  assert.deepEqual(found, [
    '"## Compose"',
    'Variants: Two sizes.',
    'Accessibility: "### You provide"',
    'Accessibility: - A label.',
  ]);
});

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

const catalogueTechnicalText = (document) =>
  catalogueText(document).flatMap(({ markdown, text }) =>
    technicalText((markdown ?? text).replace(/`[^`]*`/g, '').replace(/<\/?kbd>/g, '')),
  );

test("a component page's catalogue shows no technical text", () => {
  const found = cataloguePages()
    .filter((document) => document.path.startsWith('components/'))
    .flatMap((document) =>
      catalogueTechnicalText(document).map(({ kind, text }) => `${document.path}: ${kind} ${text}`),
    );
  assert.deepEqual(found, [], 'Say it in words, and move the value to "## Compose".');
});

test("every namespace of envUI's strings but the shared one shows on a component's page", async () => {
  const { readMessages } = await import('../../scripts/docs/Messages.ts');
  const documented = new Set(
    readDocumentation().flatMap((document) => document.frontmatter?.components ?? []),
  );
  for (const { namespace, components, strings } of readMessages()) {
    assert.ok(strings.length, `${namespace} has strings`);
    for (const string of strings) assert.ok(string.description, `${namespace}.${string.key}`);
    if (namespace === 'common') continue;
    assert.ok(
      components.some((name) => documented.has(name)),
      `${namespace} names no documented export: ${components.join(', ')}`,
    );
  }
});
