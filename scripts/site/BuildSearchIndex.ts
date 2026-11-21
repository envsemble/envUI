import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { marked } from 'marked';
import MiniSearch from 'minisearch';
import { plainText } from '../docs/MarkdownHeadings.ts';
import type { DocumentRecord } from '../docs/DocumentationReader.ts';
import type { PropsFile } from '../docs/PageStructure.ts';
import {
  indexOptions,
  nameKey,
  type SearchDocument,
  type SearchKind,
} from '../../apps/site/src/documentation/SearchTerms.ts';
import {
  exportSection,
  headingSlugger,
  propSection,
  tokenSection,
} from '../../apps/site/src/documentation/SearchAnchors.ts';
import { repositoryRoot, tokensDataFile } from '../RepositoryPaths.ts';
import {
  docsOnlyComponents,
  unlistedDocuments,
} from '../../apps/site/src/documentation/DocumentPlaces.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TokenList = Record<string, any>;

export interface SearchSources {
  documents: readonly DocumentRecord[];
  props: PropsFile;
  tokens?: TokenList;
}

const searchIndexFile = resolve(repositoryRoot, 'apps/site/src/generated/SearchIndex.json');

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
    page: 'docs',
    title: 'Docs',
    area: 'docs',
    aliases: ['documentation', 'developer reference', 'reference'],
  },
  {
    page: 'docs/tokens',
    title: 'Design tokens',
    area: 'docs',
    aliases: ['token reference', 'CSS custom properties', 'CSS variables'],
  },
  {
    page: 'docs/changelog',
    title: 'Changelog',
    area: 'docs',
    aliases: ['release notes', 'releases', 'versions', 'full changelog', 'all changes'],
  },
];

const kindOfGroup = (group: string): SearchKind =>
  group === 'Foundations' ? 'foundation' : group === 'Setup and workflows' ? 'guide' : 'component';

function documentedExports(names: readonly string[], props: PropsFile | undefined): string[] {
  return names.flatMap((name) => {
    const entry = props?.exports[name];
    if (!entry) return [];
    return entry.kind === 'namespace' ? [name, ...entry.parts] : [name];
  });
}

const sentence = (text: string, length = 240) =>
  text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, '')}…` : text;

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

function placeOf(
  name: string,
  home: DocumentRecord,
  documents: readonly DocumentRecord[],
): { document: DocumentRecord; section?: string } {
  const foundations = documents.filter(
    (document) => document.group === 'Foundations' && document !== home,
  );
  for (const where of ['code', 'prose'] as const)
    for (const document of [home, ...foundations]) {
      const section = sectionsOf(document.markdown).find((entry) => mentions(entry[where], name));
      if (section) return { document, section: section.slug };
    }
  return { document: home };
}

function placeRoute({ document, section }: { document: DocumentRecord; section?: string }) {
  return {
    page: document.id,
    area: 'docs' as const,
    ...(document.group === 'Foundations' && { view: 'usage' as const }),
    ...(section && { section }),
  };
}

export function searchDocuments({
  documents,
  props,
  tokens,
}: SearchSources & { tokens: TokenList }): SearchDocument[] {
  const results: SearchDocument[] = [];
  const homes = new Map<string, DocumentRecord>();
  for (const document of documents) {
    if (unlistedDocuments.has(document.id)) continue;
    const kind = kindOfGroup(document.group);
    const frontmatter = document.frontmatter ?? {};
    const exports = documentedExports(frontmatter.components ?? [], props);
    for (const name of exports) homes.set(name, document);
    results.push({
      id: `page:${document.id}`,
      kind,
      title: document.title,
      detail: kind === 'guide' ? 'Guide' : document.group,
      aliases: (frontmatter.aliases ?? []).join('\n'),
      keywords: exports.join(' '),
      owner: '',
      text: [document.summary, ...(frontmatter.useWhen ?? [])].join('\n'),
      page: document.id,
      area: kind === 'guide' || docsOnlyComponents.has(document.id) ? 'docs' : 'catalogue',
    });
  }
  const pages = new Set(
    results.filter(({ id }) => id.startsWith('page:')).map(({ title }) => title),
  );
  const setup = documents.find((document) => document.id === 'setup');
  for (const [name, entry] of Object.entries(props.exports)) {
    if (entry.kind === 'namespace' && pages.has(name)) continue;
    const home = (homes.get(name) ?? setup)!;
    const where = home.sections ? undefined : placeOf(name, home, documents);
    const place = where && placeRoute(where);
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
      page: 'docs/tokens',
      area: 'docs',
      section: tokenSection(token.cssVariable),
    });
  }
  return results;
}

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

export function buildSearchIndex({ documents, props, tokens = readTokens() }: SearchSources) {
  const index = new MiniSearch(indexOptions);
  index.addAll(
    [...standalonePageDocuments(), ...searchDocuments({ documents, props, tokens })].map(withNames),
  );
  return JSON.stringify(index);
}

function withNames(document: SearchDocument) {
  const parted = !['export', 'prop', 'token'].includes(document.kind);
  const names = [
    ...(document.owner ? [] : [document.title]),
    ...(parted ? document.title.split(/\s*(?:&|,|\band\b)\s*/) : []),
    ...(document.kind === 'export' ? [document.title.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')] : []),
    ...document.aliases.split('\n'),
    ...(document.owner ? [`${document.owner} ${document.title}`] : []),
    ...(document.kind === 'token'
      ? [document.id.replace(/^token:/, ''), document.id.replace(/^token:color\./, '')]
      : []),
  ];
  return { ...document, names: [...new Set(names.map(nameKey).filter(Boolean))] };
}

export function readTokens(): TokenList {
  return JSON.parse(readFileSync(tokensDataFile, 'utf8'));
}

export function writeSearchIndex(sources: SearchSources) {
  const json = buildSearchIndex(sources);
  mkdirSync(dirname(searchIndexFile), { recursive: true });
  if (!existsSync(searchIndexFile) || readFileSync(searchIndexFile, 'utf8') !== json)
    writeFileSync(searchIndexFile, json);
  return json;
}
