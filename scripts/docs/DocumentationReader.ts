import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { marked } from 'marked';
import { headingsOf } from './MarkdownHeadings.ts';
import {
  documentationDirectory,
  examplesDirectory,
  specimensDirectory,
} from '../RepositoryPaths.ts';
import { libraryVersions, withLibraryVersion } from './LibraryVersions.ts';
import {
  contained,
  examplesOf,
  indexSectionKinds,
  kebab,
  kindFolders,
  maxWhenEntries,
  maxWhenEntryLength,
  pageKindOf,
  pageKinds,
  readProps,
  slugExceptions,
  splitFrontmatter,
  withImport,
  withRules,
  type Frontmatter,
  type RawFrontmatter,
  type PageSection,
  type PropsFile,
} from './PageStructure.ts';
import { readPage } from './PageReader.ts';
import { validateFrontmatter } from './validation/Frontmatter.ts';
import { readPartNames } from './validation/Legends.ts';
import type { PartNames } from './PageReaderTypes.ts';

export interface DocumentRecord {
  id: string;
  title: string;
  group: string;
  path: string;
  summary: string;
  related: string[];
  markdown: string;
  frontmatter?: Frontmatter;
  yaml?: string;
  sections?: PageSection[];
}

function decoded(fragment: string) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

function pageOfExport(
  documents: readonly DocumentRecord[],
  name: string,
): DocumentRecord | undefined {
  return documents.find(
    (entry) =>
      pageKindOf(entry.path) === 'component' &&
      entry.frontmatter?.components?.includes(name.split('.')[0]),
  );
}

function filesOf(directory: string, page: string): Set<string> {
  const folder = resolve(directory, page);
  if (!existsSync(folder)) return new Set();
  return new Set(
    readdirSync(folder)
      .filter((name) => name.endsWith('.tsx'))
      .map((name) => name.slice(0, -'.tsx'.length)),
  );
}

interface EntryContext {
  directory: string;
  read: (file: string) => string;
  props: PropsFile | undefined;
  examples: string;
  specimens: string;
  versions: Set<string> | undefined;
  partNames: PartNames;
}

function checkIndexSection(path: string, kind: string, group: string) {
  const sectionKind = indexSectionKinds[group as keyof typeof indexSectionKinds];
  const kindSection = Object.keys(indexSectionKinds).find(
    (section) => indexSectionKinds[section as keyof typeof indexSectionKinds] === kind,
  );
  if (sectionKind ? sectionKind !== kind : kindSection)
    throw new Error(
      `${path} is a ${kind} page, from ${kindFolders[kind as keyof typeof kindFolders]}, but the index lists it under "## ${group}"; ${
        kindSection
          ? `list it under "## ${kindSection}"`
          : `move it to ${kindFolders[sectionKind as keyof typeof kindFolders]}`
      }.`,
    );
}

function checkOneFileStructure(
  path: string,
  kind: string,
  frontmatter: RawFrontmatter | undefined,
): asserts frontmatter is RawFrontmatter {
  if (!frontmatter)
    throw new Error(
      `${kind[0].toUpperCase()}${kind.slice(1)} page ${path} needs frontmatter: it is in the one-file structure (contributing/pages.md).`,
    );
  if (!('examples' in frontmatter))
    throw new Error(
      `${path} is not in the one-file structure: its frontmatter lists no examples, each once with its role (contributing/pages.md).`,
    );
}

function checkStructuredEntry(
  { path, id, title, group, kind }: Record<'path' | 'id' | 'title' | 'group' | 'kind', string>,
  frontmatter: Frontmatter,
  indexSummary: string | undefined,
  exported: PropsFile['exports'] | undefined,
) {
  const component = kind === 'component';
  if (frontmatter.title !== title)
    throw new Error(`Frontmatter title of ${path} differs from its index entry.`);
  if (component && frontmatter.category !== group)
    throw new Error(
      `Category of ${path} is ${frontmatter.category}, but the index lists it under ${group}.`,
    );
  if (indexSummary)
    throw new Error(
      `The index entry of ${path} repeats a summary; it lives in the page's frontmatter.`,
    );
  if (component && kebab(title) !== id && !slugExceptions.has(id))
    throw new Error(`${path} must be named ${kebab(title)}.md after its title.`);
  if (component && !frontmatter.components?.includes(title.split('.')[0]) && exported?.[title])
    throw new Error(`${path} must list ${title}, its own component, in components.`);
  if (component) checkWhenLists(path, frontmatter);
}

function checkWhenLists(path: string, frontmatter: Frontmatter) {
  const lists = {
    useWhen: frontmatter.useWhen ?? [],
    avoidWhen: (frontmatter.avoidWhen ?? []).map(({ text }) => text),
  };
  for (const [field, entries] of Object.entries(lists)) {
    if (entries.length > maxWhenEntries)
      throw new Error(
        `${path} lists ${entries.length} entries in ${field}; keep the ${maxWhenEntries} that matter most.`,
      );
    const long = entries.find((entry) => entry.length > maxWhenEntryLength);
    if (long)
      throw new Error(
        `${path} has an entry of ${field} longer than a line of ${maxWhenEntryLength} characters: "${long}"`,
      );
  }
}

function checkNamedExports(
  path: string,
  frontmatter: Frontmatter | undefined,
  exported: PropsFile['exports'] | undefined,
) {
  if (!exported) return;
  for (const name of frontmatter?.components ?? [])
    if (!exported[name])
      throw new Error(`${path} lists ${name} in components, but envUI exports no ${name}.`);
  for (const { use } of frontmatter?.avoidWhen ?? [])
    if (use && !exported[use])
      throw new Error(`${path} suggests ${use} in avoidWhen, but envUI exports no ${use}.`);
}

function readEntry(
  text: string,
  group: string,
  documents: readonly DocumentRecord[],
  context: EntryContext,
): DocumentRecord {
  const { directory, read, props } = context;
  const entry = text.match(/^\[([^\]]+)\]\(([^)]+\.md)\)(?: — ([\s\S]+))?$/);
  if (!entry) throw new Error(`Invalid documentation index entry: ${text}`);
  const [, title, path, indexSummary] = entry;
  const file = resolve(directory, path);
  if (!contained(directory, file)) throw new Error(`Documentation entry escapes docs/: ${path}`);
  if (documents.some((document) => document.path === path))
    throw new Error(`Duplicate documentation entry: ${path}`);
  const id = basename(path, '.md');
  if (documents.some((document) => document.id === id))
    throw new Error(`Two documentation pages share the name ${id}: ${path}`);
  const { frontmatter: raw, yaml, body } = splitFrontmatter(read(file), path);
  if (!body.startsWith(`# ${title}\n`) && !body.startsWith(`# ${title}\r\n`))
    throw new Error(`Documentation title differs from its index entry: ${path}`);
  const markdown = body.replace(/^# [^\n]+\r?\n\s*/, '');
  const kind = pageKindOf(path);
  checkIndexSection(path, kind, group);
  const structured = pageKinds.has(kind);
  if (structured) checkOneFileStructure(path, kind, raw);
  const frontmatter = raw && validateFrontmatter(raw, path, { kind, versions: context.versions });
  if (structured && frontmatter)
    checkStructuredEntry(
      { path, id, title, group, kind },
      frontmatter,
      indexSummary,
      props?.exports,
    );
  else if (!structured && !indexSummary)
    throw new Error(`Invalid documentation index entry: ${text}`);
  if (!structured && /^```tsx\s+figure=/m.test(markdown))
    throw new Error(
      `${path} places a figure; only component and foundation pages place figures, so show a guide's code in a plain \`tsx\` fence.`,
    );
  checkNamedExports(path, frontmatter, props?.exports);
  const document: DocumentRecord = {
    id,
    title,
    group,
    path,
    summary: (frontmatter?.summary ?? indexSummary ?? '').replace(/\s+/g, ' ').trim(),
    related: [],
    markdown,
    ...(frontmatter && { frontmatter, yaml }),
  };
  if (structured && frontmatter)
    document.sections = withImport(
      withRules(
        readPage(document, markdown, {
          kind,
          catalog: examplesOf(frontmatter),
          examples: filesOf(context.examples, id),
          specimens: filesOf(context.specimens, id),
          partNames: context.partNames,
        }),
        frontmatter.useWhen ?? [],
      ),
      frontmatter.components ?? [],
      props,
    );
  return document;
}

function relatedOf(document: DocumentRecord, documents: readonly DocumentRecord[]) {
  const relations: { key: string; page: string | undefined }[] = [];
  for (const { use, see } of document.frontmatter?.avoidWhen ?? []) {
    if (see && (see === document.id || !documents.some((entry) => entry.id === see)))
      throw new Error(
        `${document.path} sends readers to ${see} in avoidWhen, which is ${see === document.id ? 'the page itself' : 'not an indexed page'}.`,
      );
    const key = use ?? `page:${see}`;
    if (relations.some((relation) => relation.key === key))
      throw new Error(
        `${document.path} names ${use ?? see} twice in avoidWhen; say each relation once, in one entry.`,
      );
    relations.push({ key, page: use ? pageOfExport(documents, use)?.id : see });
  }
  for (const { key, page } of relations)
    if (
      key.startsWith('page:') &&
      relations.some((other) => !other.key.startsWith('page:') && other.page === page)
    )
      throw new Error(
        `${document.path} sends readers to ${page} in avoidWhen and also names an export it documents; name the relation once.`,
      );

  let inRelated = false;
  const listed: string[] = [];
  for (const token of marked.lexer(document.markdown)) {
    if (token.type === 'heading' && token.depth === 2) inRelated = token.text === 'Related topics';
    if (inRelated && token.type === 'list') {
      marked.walkTokens([token], (link) => {
        if (link.type === 'link') listed.push(basename(link.href, '.md'));
      });
    }
  }
  if (document.sections && listed.length)
    throw new Error(`${document.path} lists related topics in its body; they live in frontmatter.`);
  const related = document.sections
    ? [...new Set(relations.flatMap(({ page }) => (page && page !== document.id ? [page] : [])))]
    : listed;
  if (related.includes(document.id)) throw new Error(`${document.path} lists itself in related.`);
  for (const id of related)
    if (!documents.some((entry) => entry.id === id))
      throw new Error(`${document.path} relates to ${id}, which is not an indexed page.`);
  return related;
}

function checkLinks(
  document: DocumentRecord,
  documents: readonly DocumentRecord[],
  directory: string,
) {
  marked.walkTokens(marked.lexer(document.markdown), (token) => {
    if (token.type !== 'link' || /^[a-z][a-z\d+.-]*:/i.test(token.href)) return;
    const [path, fragment] = token.href.split('#');
    let linked: DocumentRecord | undefined = document;
    if (path) {
      const target = resolve(directory, dirname(document.path), path);
      if (!contained(directory, target) || !existsSync(target))
        throw new Error(`Broken documentation link in ${document.path}: ${token.href}`);
      linked = documents.find(
        (entry) => entry.path === relative(directory, target).replaceAll('\\', '/'),
      );
      if (!linked) throw new Error(`Documentation link is missing from the index: ${token.href}`);
    }
    if (fragment && !headingsOf(linked.markdown).some(({ id }) => id === decoded(fragment)))
      throw new Error(
        `Broken documentation link in ${document.path}: ${token.href} names no heading of ${linked.path}.`,
      );
  });
}

export function readDocumentation(
  directory = documentationDirectory,
  {
    props = readProps(directory),
    examples = examplesDirectory,
    specimens = specimensDirectory,
    versions = directory === documentationDirectory ? libraryVersions() : undefined,
    partNames = readPartNames(directory),
  }: {
    props?: PropsFile;
    examples?: string;
    specimens?: string;
    versions?: Set<string>;
    partNames?: PartNames;
  } = {},
): DocumentRecord[] {
  const read = (file: string) =>
    withLibraryVersion(readFileSync(file, 'utf8').replace(/\r\n?/g, '\n'));
  const context = { directory, read, props, examples, specimens, versions, partNames };
  const index = read(resolve(directory, 'index.md'));
  const documents: DocumentRecord[] = [
    {
      id: 'index',
      title: 'envUI documentation',
      group: 'Setup and workflows',
      path: 'index.md',
      summary: '',
      related: [],
      markdown: index.replace(/^# [^\n]+\r?\n\s*/, ''),
    },
  ];
  let group;
  for (const token of marked.lexer(index)) {
    if (token.type === 'heading' && token.depth === 2) group = token.text;
    if (token.type !== 'list') continue;
    if (!group) throw new Error('Documentation entries need a level-two family heading.');
    for (const item of token.items) documents.push(readEntry(item.text, group, documents, context));
  }
  for (const document of documents) {
    document.related = relatedOf(document, documents);
    checkLinks(document, documents, directory);
  }
  return documents;
}
