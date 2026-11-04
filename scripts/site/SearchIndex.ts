// The site's search: one document per page, export, prop and token, from the same sources as the
// site and the packaged docs (docs/, docs/generated/props.json and the token list), and the
// MiniSearch index the site loads, written to apps/site/src/generated/SearchIndex.json by
// GenerateDocumentation.ts. The site opens it with ⌘K or Ctrl+K, in the catalogue and the Docs.
//
// searchDocuments() is plain data, so other tools can index the same documents: each names the page
// it is found on by its document id (the file name in docs/, or a site page such as `tokens`), the
// area that shows it, the catalogue or the Docs, and, where it is part of a page, the page's view and the
// element id of its place there. A view picks the Docs' part of a subject the catalogue shows too:
// `props` a component's page in the Docs, `usage` a foundation's guide there.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import MiniSearch from 'minisearch';
import { plainText } from '../docs/MarkdownHeadings.ts';
import type { DocumentRecord } from '../docs/Reader.ts';
import type { PropsFile } from '../docs/Schema.ts';
import { indexOptions, nameKey } from '../../apps/site/src/shared/SearchTerms.ts';
import {
  exportSection,
  headingSlugger,
  propSection,
  tokenSection,
} from '../../apps/site/src/shared/SearchAnchors.ts';

/** The token list, packages/ui/src/generated/tokens.json. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generated JSON; the token build writes it
export type TokenList = Record<string, any>;

/** What the search index is built from. */
export interface SearchSources {
  documents: readonly DocumentRecord[];
  props: PropsFile;
  tokens?: TokenList;
}

export const searchIndexFile = fileURLToPath(
  new URL('../../apps/site/src/generated/SearchIndex.json', import.meta.url),
);
export const tokensFile = fileURLToPath(
  new URL('../../packages/ui/src/generated/tokens.json', import.meta.url),
);

/** What a search result is. */
export type SearchKind =
  | 'component'
  | 'export'
  | 'prop'
  | 'token'
  | 'foundation'
  | 'pattern'
  | 'guide'
  | 'page';

/** A document of the search index: one result, with what it is found by and where it leads. */
export interface SearchDocument {
  id: string;
  kind: SearchKind;
  title: string;
  detail: string;
  aliases: string;
  keywords: string;
  owner: string;
  text: string;
  page: string;
  area: 'catalogue' | 'docs';
  view?: 'props' | 'usage';
  section?: string;
}

/** Pages of the site that no file in docs/ writes, each in its area. */
export const standalonePages: {
  page: string;
  title: string;
  area: 'catalogue' | 'docs';
  aliases: string[];
}[] = [
  {
    page: 'overview',
    title: 'Overview',
    area: 'catalogue',
    aliases: ['home', 'introduction', 'catalogue'],
  },
  {
    page: 'foundations',
    title: 'Foundations',
    area: 'catalogue',
    aliases: ['all foundations', 'foundation list', 'design foundations', 'system at a glance'],
  },
  {
    page: 'components',
    title: 'Components',
    area: 'catalogue',
    aliases: ['all components', 'component list', 'component gallery'],
  },
  {
    page: 'patterns',
    title: 'Patterns',
    area: 'catalogue',
    aliases: ['all patterns', 'pattern list', 'pattern gallery'],
  },
  {
    page: 'docs',
    title: 'Docs',
    area: 'docs',
    aliases: ['documentation', 'developer reference', 'reference'],
  },
  {
    page: 'tokens',
    title: 'Design tokens',
    area: 'docs',
    aliases: ['token reference', 'CSS custom properties', 'CSS variables'],
  },
  {
    page: 'full-changelog',
    title: 'Changelog',
    area: 'docs',
    aliases: ['release notes', 'releases', 'versions', 'full changelog', 'all changes'],
  },
];

/** The agents' index of the pages, which neither the catalogue nor the Docs show. */
export const unlistedPages = new Set(['index']);

/** Components documented in the Docs alone: Field, as "Build your own field". */
const docsOnlyPages = new Set(['field']);

export {
  exportSection,
  propSection,
  tokenSection,
  headingSlug,
} from '../../apps/site/src/shared/SearchAnchors.ts';

const kindOfGroup = (group: string): SearchKind =>
  group === 'Foundations'
    ? 'foundation'
    : group === 'Patterns'
      ? 'pattern'
      : group === 'Setup and workflows'
        ? 'guide'
        : 'component';

/** Every export a page documents, with namespaces expanded to their parts. */
function documentedExports(names: readonly string[], props: PropsFile | undefined): string[] {
  return names.flatMap((name) => {
    const entry = props?.exports[name];
    if (!entry) return [];
    return entry.kind === 'namespace' ? [name, ...entry.parts] : [name];
  });
}

const sentence = (text: string, length = 240) =>
  text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text;

/**
 * The headed sections of a page's Markdown, in order, each with the id its rendered heading takes
 * and the Markdown under it up to the next heading, its code fences apart.
 */
function sectionsOf(markdown: string) {
  const slug = headingSlugger();
  const sections: { slug: string; prose: string; code: string }[] = [];
  let current: { slug: string; prose: string; code: string } | undefined;
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

const mentions = (text: string, name: string) =>
  new RegExp(`(?<![\\w.])${name.replace(/[.$]/g, '\\$&')}(?![\\w])`).test(text);

/**
 * Where a page that has no Props view says the most about an export: the first section whose code
 * uses it, on its own page and then on the foundations, else the first that names it. Returns the
 * page's document and the section's id, or the page alone when no section names the export.
 */
function placeOf(
  name: string,
  home: DocumentRecord,
  documents: readonly DocumentRecord[],
): { document: DocumentRecord; section?: string } {
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

/**
 * The route parts of a document's place, in the Docs: a foundation's guide, or a guide, at its
 * section.
 */
function placeRoute({ document, section }: { document: DocumentRecord; section?: string }) {
  return {
    page: document.id,
    area: 'docs' as const,
    ...(document.group === 'Foundations' && { view: 'usage' as const }),
    ...(section && { section }),
  };
}

/**
 * The search documents of the documentation: `documents` as readDocumentation() returns them,
 * `props` as docs/generated/props.json and `tokens` as the token list holds them. Every export in
 * props.json is found, as the page that documents it when it shares its name, and else as an export
 * of its own, at its props on a page with a Props view, or else at the section of the page that
 * shows it; an export that no page lists is placed where the documentation shows it.
 */
export function searchDocuments({
  documents,
  props,
  tokens,
}: SearchSources & { tokens: TokenList }): SearchDocument[] {
  const results: SearchDocument[] = [];
  /** The page that lists each export, by its name. */
  const homes = new Map<string, DocumentRecord>();
  for (const document of documents) {
    if (unlistedPages.has(document.id)) continue;
    const kind = kindOfGroup(document.group);
    const frontmatter = document.frontmatter ?? {};
    const exports = documentedExports(frontmatter.components ?? [], props);
    for (const name of exports) homes.set(name, document);
    // A pattern is found by what it composes and by what people are doing.
    const composition = [...(frontmatter.composes ?? []), frontmatter.intent ?? ''];
    results.push({
      id: `page:${document.id}`,
      kind,
      title: document.title,
      detail:
        kind === 'pattern'
          ? `Pattern · ${frontmatter.intent}`
          : kind === 'guide'
            ? 'Guide'
            : document.group,
      aliases: (frontmatter.aliases ?? []).join('\n'),
      keywords: [...exports, ...composition].join(' ').trim(),
      owner: '',
      text: [document.summary, ...(frontmatter.useWhen ?? [])].join('\n'),
      page: document.id,
      area: kind === 'guide' || docsOnlyPages.has(document.id) ? 'docs' : 'catalogue',
    });
    // A page the catalogue and the Docs both show, such as a foundation's, is one result: its page in
    // the catalogue, whose Docs button opens the other.
  }
  const pages = new Set(
    results.filter(({ id }) => id.startsWith('page:')).map(({ title }) => title),
  );
  const setup = documents.find((document) => document.id === 'setup');
  for (const [name, entry] of Object.entries(props.exports)) {
    // A namespace is found as the page of its name, such as Menu; one documented on another page,
    // as an export that leads to its first part's props.
    if (entry.kind === 'namespace' && pages.has(name)) continue;
    const home = (homes.get(name) ?? setup)!;
    // Only a component or pattern page has a Props view with a place for each export and prop; on
    // another page, both lead to the section that shows the export.
    const where = home.sections ? undefined : placeOf(name, home, documents);
    const place = where && placeRoute(where);
    // The page a result opens, which its detail names.
    const destination = where?.document ?? home;
    const own = (section: string) =>
      place ?? { page: home.id, area: 'docs' as const, view: 'props' as const, section };
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
      text: sentence(token.description ?? ''),
      page: 'tokens',
      area: 'docs',
      section: tokenSection(token.cssVariable),
    });
  }
  return results;
}

/** The site's own pages, as search documents. */
function standalonePageDocuments(): SearchDocument[] {
  return standalonePages.map(({ page, title, area, aliases }) => ({
    id: `page:${page}`,
    kind: 'page' as const,
    title,
    detail: 'Page',
    aliases: aliases.join('\n'),
    keywords: '',
    owner: '',
    text: '',
    page,
    area,
  }));
}

/** The site's MiniSearch index, serialized, of the documentation and the site's own pages. */
export function buildSearchIndex({ documents, props, tokens = readTokens() }: SearchSources) {
  const index = new MiniSearch(indexOptions);
  index.addAll(
    [...standalonePageDocuments(), ...searchDocuments({ documents, props, tokens })].map(withNames),
  );
  return JSON.stringify(index);
}

/**
 * A search document with the names a query may give it whole, folded as queries are: its title,
 * each topic of a page's title, an export's name written out in words, its aliases, a prop as its export and name (Button variant), never its name alone, and a token as
 * its name too (color.fg.muted), a color by its role words too (fg muted). A query that is one of them ranks the document first.
 */
function withNames(document: SearchDocument) {
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
    // A token by its id, and a color by its role words alone, fg muted for color.fg.muted.
    ...(document.kind === 'token'
      ? [document.id.replace(/^token:/, ''), document.id.replace(/^token:color\./, '')]
      : []),
  ];
  return { ...document, names: [...new Set(names.map(nameKey).filter(Boolean))] };
}

/** The token list. */
export function readTokens(): TokenList {
  return JSON.parse(readFileSync(tokensFile, 'utf8'));
}

/** Writes the site's index when it changed. */
export function writeSearchIndex(sources: SearchSources) {
  const json = buildSearchIndex(sources);
  mkdirSync(dirname(searchIndexFile), { recursive: true });
  if (!existsSync(searchIndexFile) || readFileSync(searchIndexFile, 'utf8') !== json)
    writeFileSync(searchIndexFile, json);
  return json;
}
