// The documentation's search: one document per page, export, prop and token, from the same sources
// as the catalogue and the packaged docs (docs/, docs/generated/props.json and the token list), and
// the MiniSearch index the catalogue loads, written to apps/catalogue/src/generated/SearchIndex.json
// by GenerateDocumentation.mjs. The catalogue opens it with ⌘K or Ctrl+K, hosted and offline.
//
// searchDocuments() is plain data, so other tools can index the same documents: each names the page
// it is found on by its document id (the file name in docs/, or a catalogue page such as `tokens`),
// and, where it is part of a page, the page's view and the element id of its place there.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import MiniSearch from 'minisearch';
import { plainText } from './MarkdownHeadings.mjs';
import { indexOptions, nameKey } from './SearchTerms.mjs';
import { exportSection, headingSlugger, propSection, tokenSection } from './SearchAnchors.mjs';

export const searchIndexFile = fileURLToPath(
  new URL('../apps/catalogue/src/generated/SearchIndex.json', import.meta.url),
);
export const tokensFile = fileURLToPath(
  new URL('../packages/ui/src/generated/tokens.json', import.meta.url),
);

/**
 * @typedef {'component' | 'export' | 'prop' | 'token' | 'foundation' | 'pattern' | 'guide' | 'page'} SearchKind
 * @typedef {{
 *   id: string;
 *   kind: SearchKind;
 *   title: string;
 *   detail: string;
 *   aliases: string;
 *   keywords: string;
 *   owner: string;
 *   text: string;
 *   page: string;
 *   view?: 'props' | 'usage';
 *   section?: string;
 * }} SearchDocument
 */

/** Pages of the catalogue that no file in docs/ writes. */
export const cataloguePages = [
  {
    page: 'overview',
    title: 'Overview',
    aliases: ['home', 'components overview', 'catalogue'],
  },
  {
    page: 'tokens',
    title: 'Design tokens',
    aliases: ['token reference', 'CSS custom properties', 'CSS variables'],
  },
  { page: 'templates', title: 'Templates', aliases: ['page templates'] },
  { page: 'changelog', title: 'Changelog', aliases: ['release notes', 'releases', 'versions'] },
];

export { exportSection, propSection, tokenSection, headingSlug } from './SearchAnchors.mjs';

const kindOfGroup = (group) =>
  group === 'Foundations'
    ? 'foundation'
    : group === 'Patterns'
      ? 'pattern'
      : group === 'Setup and workflows'
        ? 'guide'
        : 'component';

/** Every export a page documents, with namespaces expanded to their parts. */
function documentedExports(names, props) {
  return names.flatMap((name) => {
    const entry = props?.exports[name];
    if (!entry) return [];
    return entry.kind === 'namespace' ? [name, ...entry.parts] : [name];
  });
}

const sentence = (text, length = 240) =>
  text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text;

/**
 * The headed sections of a page's Markdown, in order, each with the id its rendered heading takes
 * and the Markdown under it up to the next heading, its code fences apart.
 */
function sectionsOf(markdown) {
  const slug = headingSlugger();
  const sections = [];
  let current;
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'heading') {
      current = { slug: slug(plainText(token.tokens)), prose: token.text, code: '' };
      sections.push(current);
    } else if (current) {
      if (token.type === 'code') current.code += `${token.text}\n`;
      else current.prose += `\n${token.raw}`;
    }
  }
  return sections;
}

const mentions = (text, name) =>
  new RegExp(`(?<![\\w.])${name.replace(/[.$]/g, '\\$&')}(?![\\w])`).test(text);

/**
 * Where a page that has no Props view says the most about an export: the first section whose code
 * uses it, on its own page and then on the foundations, else the first that names it. Returns the
 * page's document and the section's id, or the page alone when no section names the export.
 */
function placeOf(name, home, documents) {
  const foundations = documents.filter(
    (document) => document.group === 'Foundations' && document !== home,
  );
  for (const where of ['code', 'prose'])
    for (const document of [home, ...foundations]) {
      const section = sectionsOf(document.markdown).find((entry) => mentions(entry[where], name));
      if (section) return { document, section: section.slug };
    }
  return { document: home };
}

/** The route parts of a document's place: the Usage view of a reference page, at its section. */
function placeRoute({ document, section }) {
  const reference = document.group === 'Foundations' || document.path.startsWith('components/');
  return {
    page: document.id,
    ...(reference && { view: 'usage' }),
    ...(section && { section }),
  };
}

/**
 * The search documents of the documentation: `documents` as readDocumentation() returns them,
 * `props` as docs/generated/props.json and `tokens` as the token list holds them. Every export in
 * props.json is found, as the page that documents it when it shares its name, and else as an export
 * of its own, at its props on a page with a Props view, or else at the section of the page that
 * shows it; an export that no page lists is placed where the documentation shows it.
 * @returns {SearchDocument[]}
 */
export function searchDocuments({ documents, props, tokens }) {
  /** @type {SearchDocument[]} */
  const results = [];
  /** The page that lists each export, by its name. */
  const homes = new Map();
  for (const document of documents) {
    if (document.id === 'index') continue;
    const kind = kindOfGroup(document.group);
    const frontmatter = document.frontmatter ?? {};
    const exports = documentedExports(frontmatter.components ?? [], props);
    for (const name of exports) homes.set(name, document);
    results.push({
      id: `page:${document.id}`,
      kind,
      title: document.title,
      detail: kind === 'component' ? document.group : kind === 'guide' ? 'Guide' : document.group,
      aliases: (frontmatter.aliases ?? []).join('\n'),
      keywords: exports.join(' '),
      owner: '',
      text: [document.summary, ...(frontmatter.useWhen ?? [])].join('\n'),
      page: document.id,
    });
  }
  const pages = new Set(results.map(({ title }) => title));
  const setup = documents.find((document) => document.id === 'setup');
  for (const [name, entry] of Object.entries(props.exports)) {
    // A namespace is found as the page of its name, such as Menu; one documented on another page,
    // such as ListDetail on SplitPane's or WindowFrame on AppShell's, as an export that leads to its
    // first part's props.
    if (entry.kind === 'namespace' && pages.has(name)) continue;
    const home = homes.get(name) ?? setup;
    // Only a page on the template has a Props view with a place for each export and prop; on
    // another page, both lead to the section that shows the export.
    const where = home.sections ? undefined : placeOf(name, home, documents);
    const place = where && placeRoute(where);
    // The page a result opens, which its detail names.
    const destination = where?.document ?? home;
    const own = (section) => place ?? { page: home.id, view: 'props', section };
    if (!(homes.get(name)?.title === name && pages.has(name)))
      results.push({
        id: `export:${name}`,
        kind: 'export',
        title: name,
        detail: name.includes('.') ? `Part of ${name.split('.')[0]}` : destination.title,
        aliases: '',
        keywords: home.title,
        owner: '',
        text: sentence(entry.description ?? ''),
        ...own(exportSection(entry.kind === 'namespace' ? (entry.parts?.[0] ?? name) : name)),
      });
    if (entry.kind !== 'component') continue;
    for (const prop of entry.props)
      results.push({
        id: `prop:${name}.${prop.name}`,
        kind: 'prop',
        title: prop.name,
        detail: `${name} prop`,
        aliases: '',
        keywords: `${name}.${prop.name}`,
        owner: name,
        text: sentence(prop.description ?? ''),
        ...own(propSection(name, prop.name)),
      });
  }
  for (const token of tokens.tokens) {
    const aliasOf = token.values?.light?.aliasOf;
    results.push({
      id: `token:${token.id}`,
      kind: 'token',
      title: token.cssVariable,
      detail: `${token.type} token`,
      aliases: '',
      keywords: [token.id, token.type, aliasOf].filter(Boolean).join(' '),
      owner: '',
      // Its names before 1.0, such as the 0.7 alias --color-text-muted, find it too.
      text: [
        sentence(token.description ?? ''),
        ...(tokens.formerNames?.[token.cssVariable] ?? []).map((name) => `Before 1.0: ${name}.`),
      ].join(' '),
      page: 'tokens',
      section: tokenSection(token.cssVariable),
    });
  }
  return results;
}

/** The catalogue's own pages, as search documents. */
function catalogueDocuments() {
  return cataloguePages.map(({ page, title, aliases }) => ({
    id: `page:${page}`,
    kind: 'page',
    title,
    detail: 'Page',
    aliases: aliases.join('\n'),
    keywords: '',
    owner: '',
    text: '',
    page,
  }));
}

/** The catalogue's MiniSearch index, serialized, of the documentation and the catalogue's pages. */
export function buildSearchIndex({ documents, props, tokens = readTokens() }) {
  const index = new MiniSearch(indexOptions);
  index.addAll(
    [...catalogueDocuments(), ...searchDocuments({ documents, props, tokens })].map(withNames),
  );
  return JSON.stringify(index);
}

/**
 * A search document with the names a query may give it whole, folded as queries are: its title,
 * each topic of a page's title, an export's name written out in words, its aliases, a prop as its export and name (Button variant), never its name alone, and a token as
 * its name too (color.fg.muted). A query that is one of them ranks the document first.
 */
function withNames(document) {
  const parted = !['export', 'prop', 'token'].includes(document.kind);
  const names = [
    // A prop's name alone is no whole name of it: many exports share it, such as variant.
    ...(document.owner ? [] : [document.title]),
    // Each topic a page's title names, such as spacing and shape for Spacing & shape.
    ...(parted ? document.title.split(/\s*(?:&|,|\band\b)\s*/) : []),
    // An export's name written out, such as copy button for CopyButton.
    ...(document.kind === 'export' ? [document.title.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')] : []),
    ...document.aliases.split('\n'),
    ...(document.owner ? [`${document.owner} ${document.title}`] : []),
    ...(document.kind === 'token' ? [document.id.replace(/^token:/, '')] : []),
  ];
  return { ...document, names: [...new Set(names.map(nameKey).filter(Boolean))] };
}

/**
 * The token list, with each token's names before 1.0 (formerNames, by its custom property) from the
 * token migration map beside it.
 */
export function readTokens() {
  const list = JSON.parse(readFileSync(tokensFile, 'utf8'));
  const migrationFile = fileURLToPath(new URL('token-migration.json', pathToFileURL(tokensFile)));
  const formerNames = {};
  if (existsSync(migrationFile))
    for (const [name, entry] of Object.entries(
      JSON.parse(readFileSync(migrationFile, 'utf8')).names,
    ))
      if (entry.cssVariable && (entry.kind === 'alias' || entry.kind === 'renamed'))
        (formerNames[entry.cssVariable] ??= []).push(name);
  return { ...list, formerNames };
}

/** Writes the catalogue's index when it changed. */
export function writeSearchIndex(sources) {
  const json = buildSearchIndex(sources);
  mkdirSync(dirname(searchIndexFile), { recursive: true });
  if (!existsSync(searchIndexFile) || readFileSync(searchIndexFile, 'utf8') !== json)
    writeFileSync(searchIndexFile, json);
  return json;
}
