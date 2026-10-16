import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { marked } from 'marked';
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
const unconverted = [
  'alert',
  'animated-number',
  'app-shell',
  'avatar',
  'badge',
  'breadcrumbs',
  'calendar-heatmap',
  'card',
  'checkbox',
  'chips',
  'code',
  'color-picker',
  'combobox',
  'command-palette',
  'composer',
  'date-picker',
  'disclosure',
  'document-tabs',
  'drop-zone',
  'empty-state',
  'hover-card',
  'kbd',
  'list',
  'markdown',
  'menubar',
  'panel-dock',
  'popover',
  'rich-text',
  'stat',
];

/**
 * Exports documented on foundations/colors.md, which the palette step is rewriting; they get its
 * frontmatter once that lands.
 */
const undocumentedExports = [
  'Theme',
  'ThemePreferenceProvider',
  'ThemeToggle',
  'useTheme',
  'useThemePreference',
];

/** Modules an example may import: only what an application can, so its source can be copied. */
const publicModules =
  /^(?:react|@envsemble\/envui(?:\/(?:content|diff|rich-text|icons(?:\/[A-Za-z\d]+)?))?)$/;

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
    for (const [, specifier] of source.matchAll(/^\s*(?:import|export)\b[^'"]*?from\s+'([^']+)'/gm))
      assert.match(
        specifier,
        publicModules,
        `examples/${key}.tsx imports ${specifier}; examples use only public entries.`,
      );
    assert.doesNotMatch(source, /\bdocs-[a-z]/, `examples/${key}.tsx uses a catalogue class.`);
  }
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
