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
import { fileURLToPath } from 'node:url';
import MiniSearch from 'minisearch';
import { indexOptions } from './SearchTerms.mjs';

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
 *   text: string;
 *   page: string;
 *   view?: 'props';
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

/** The element id of an export's props on its page's Props view. */
export const exportSection = (name) => `props-${name}`;
/** The element id of a prop's row in its export's table. */
export const propSection = (name, prop) => `props-${name}-${prop}`;
/** The element id of a token's row in the token reference: --color-fg-muted is token-color-fg-muted. */
export const tokenSection = (cssVariable) => `token-${cssVariable.replace(/^--/, '')}`;

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
 * The search documents of the documentation: `documents` as readDocumentation() returns them,
 * `props` as docs/generated/props.json and `tokens` as the token list holds them.
 * @returns {SearchDocument[]}
 */
export function searchDocuments({ documents, props, tokens }) {
  /** @type {SearchDocument[]} */
  const results = [];
  for (const document of documents) {
    if (document.id === 'index') continue;
    const kind = kindOfGroup(document.group);
    const frontmatter = document.frontmatter ?? {};
    const exports = documentedExports(frontmatter.components ?? [], props);
    results.push({
      id: `page:${document.id}`,
      kind,
      title: document.title,
      detail: kind === 'component' ? document.group : kind === 'guide' ? 'Guide' : document.group,
      aliases: (frontmatter.aliases ?? []).join('\n'),
      keywords: exports.join(' '),
      text: [document.summary, ...(frontmatter.useWhen ?? [])].join('\n'),
      page: document.id,
    });
    // Only a page on the template has a Props view with a place for each export and prop.
    const template = Boolean(document.sections);
    for (const name of exports) {
      const entry = props.exports[name];
      if (name !== document.title && entry.kind !== 'namespace')
        results.push({
          id: `export:${name}`,
          kind: 'export',
          title: name,
          detail: document.title,
          aliases: '',
          keywords: document.title,
          text: sentence(entry.description ?? ''),
          page: document.id,
          ...(template && { view: 'props', section: exportSection(name) }),
        });
      if (entry.kind !== 'component') continue;
      for (const prop of entry.props)
        results.push({
          id: `prop:${name}.${prop.name}`,
          kind: 'prop',
          title: prop.name,
          detail: `${name} prop`,
          aliases: '',
          keywords: `${name} ${name}.${prop.name}`,
          text: sentence(prop.description ?? ''),
          page: document.id,
          ...(template && { view: 'props', section: propSection(name, prop.name) }),
        });
    }
  }
  for (const token of tokens.tokens) {
    const aliasOf = token.values?.light?.aliasOf;
    results.push({
      id: `token:${token.id}`,
      kind: 'token',
      title: token.cssVariable,
      detail: token.legacy && aliasOf ? `0.7 name of ${aliasOf}` : `${token.type} token`,
      aliases: '',
      keywords: [token.id, token.type, aliasOf].filter(Boolean).join(' '),
      text: sentence(token.description ?? ''),
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
    text: '',
    page,
  }));
}

/** The catalogue's MiniSearch index, serialized, of the documentation and the catalogue's pages. */
export function buildSearchIndex({ documents, props, tokens = readTokens() }) {
  const index = new MiniSearch(indexOptions);
  index.addAll([...catalogueDocuments(), ...searchDocuments({ documents, props, tokens })]);
  return JSON.stringify(index);
}

export function readTokens() {
  return JSON.parse(readFileSync(tokensFile, 'utf8'));
}

/** Writes the catalogue's index when it changed. */
export function writeSearchIndex(sources) {
  const json = buildSearchIndex(sources);
  mkdirSync(dirname(searchIndexFile), { recursive: true });
  if (!existsSync(searchIndexFile) || readFileSync(searchIndexFile, 'utf8') !== json)
    writeFileSync(searchIndexFile, json);
  return json;
}
