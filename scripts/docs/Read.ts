import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { marked } from 'marked';
import { headingsOf } from './MarkdownHeadings.ts';
import {
  contained,
  documentationDirectory,
  examplesDirectory,
  examplesOf,
  exportKinds,
  indexSectionKinds,
  kebab,
  kindFolders,
  libraryVersions,
  pageKindOf,
  pageKinds,
  readProps,
  slugExceptions,
  specimensDirectory,
  splitFrontmatter,
  withImport,
  type Frontmatter,
  type PropsFile,
} from './Schema.ts';
import {
  readPage,
  readPartNames,
  validateFrontmatter,
  type PartNames,
  type ReadSection,
} from './Validate.ts';

/** A page of docs/ as readDocumentation reads it. */
export interface DocumentRecord {
  id: string;
  title: string;
  group: string;
  path: string;
  summary: string;
  /** The ids of the pages it relates to. */
  related: string[];
  markdown: string;
  frontmatter?: Frontmatter;
  yaml?: string;
  /** A page in the one-file structure's sections. */
  sections?: ReadSection[];
}

/** A link's fragment with its percent escapes decoded, or as it is where they are malformed. */
export function decoded(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

/** The component or pattern page that documents an export; a part such as Menu.Item is on its
 * namespace's. */
export function pageOfExport(
  documents: readonly DocumentRecord[],
  name: string,
): DocumentRecord | undefined {
  return documents.find(
    (entry) =>
      exportKinds.has(pageKindOf(entry.path)) &&
      entry.frontmatter?.components?.includes(name.split('.')[0]),
  );
}

/** File names, without .tsx, in a page's example or specimen folder. */
function filesOf(directory: string, page: string): Set<string> {
  const folder = resolve(directory, page);
  if (!existsSync(folder)) return new Set();
  return new Set(
    readdirSync(folder)
      .filter((name) => name.endsWith('.tsx'))
      .map((name) => name.slice(0, -'.tsx'.length)),
  );
}

/**
 * The indexed documents. The index supplies discovery, catalogue groups and ordering; component
 * pages supply their title, summary and metadata in frontmatter.
 */
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
  // Pages saved with CRLF line endings read as LF, as Git checks them out.
  const read = (file: string) => readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
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
  const exported = props?.exports;
  let group;
  for (const token of marked.lexer(index)) {
    if (token.type === 'heading' && token.depth === 2) group = token.text;
    if (token.type !== 'list') continue;
    if (!group) throw new Error('Documentation entries need a level-two family heading.');
    for (const item of token.items) {
      const entry = item.text.match(/^\[([^\]]+)\]\(([^)]+\.md)\)(?: — ([\s\S]+))?$/);
      if (!entry) throw new Error(`Invalid documentation index entry: ${item.text}`);
      const [, title, path, indexSummary] = entry;
      const file = resolve(directory, path);
      if (!contained(directory, file))
        throw new Error(`Documentation entry escapes docs/: ${path}`);
      if (documents.some((document) => document.path === path))
        throw new Error(`Duplicate documentation entry: ${path}`);
      const id = basename(path, '.md');
      if (documents.some((document) => document.id === id))
        throw new Error(`Two documentation pages share the name ${id}: ${path}`);
      const source = read(file);
      const { frontmatter, yaml, body } = splitFrontmatter(source, path);
      if (!body.startsWith(`# ${title}\n`) && !body.startsWith(`# ${title}\r\n`))
        throw new Error(`Documentation title differs from its index entry: ${path}`);
      const markdown = body.replace(/^# [^\n]+\r?\n\s*/, '');
      const kind = pageKindOf(path);
      // A page's folder says its kind, and the index lists each kind of page under its section.
      const sectionKind = indexSectionKinds[group];
      const kindSection = Object.keys(indexSectionKinds).find(
        (section) => indexSectionKinds[section] === kind,
      );
      if (sectionKind ? sectionKind !== kind : kindSection)
        throw new Error(
          `${path} is a ${kind} page, from ${kindFolders[kind]}, but the index lists it under "## ${group}"; ${
            kindSection
              ? `list it under "## ${kindSection}"`
              : `move it to ${kindFolders[sectionKind]}`
          }.`,
        );
      const component = kind === 'component';
      // A component, pattern or foundation page is in the one-file structure: its frontmatter
      // lists its examples, and its sections follow the title in pageSections' order. A page that
      // isn't fails, so every page stays in it.
      const structured = pageKinds.has(kind);
      if (structured && !frontmatter)
        throw new Error(
          `${kind[0].toUpperCase()}${kind.slice(1)} page ${path} needs frontmatter: it is in the one-file structure (docs/component-pages.md).`,
        );
      if (structured && !('examples' in frontmatter!))
        throw new Error(
          `${path} is not in the one-file structure: its frontmatter lists no examples, each once with its role (docs/component-pages.md).`,
        );
      if (frontmatter) validateFrontmatter(frontmatter, path, { kind, versions });
      if (structured) {
        if (frontmatter!.title !== title)
          throw new Error(`Frontmatter title of ${path} differs from its index entry.`);
        if (component && frontmatter!.category !== group)
          throw new Error(
            `Category of ${path} is ${frontmatter!.category}, but the index lists it under ${group}.`,
          );
        if (indexSummary)
          throw new Error(
            `The index entry of ${path} repeats a summary; it lives in the page's frontmatter.`,
          );
        if (component && kebab(title) !== id && !slugExceptions.has(id))
          throw new Error(`${path} must be named ${kebab(title)}.md after its title.`);
        if (
          component &&
          !frontmatter!.components.includes(title.split('.')[0]) &&
          exported?.[title]
        )
          throw new Error(`${path} must list ${title}, its own component, in components.`);
      } else if (!indexSummary) throw new Error(`Invalid documentation index entry: ${item.text}`);
      for (const name of frontmatter?.components ?? [])
        if (exported && !exported[name])
          throw new Error(`${path} lists ${name} in components, but envUI exports no ${name}.`);
      for (const name of frontmatter?.composes ?? [])
        if (exported && !exported[name])
          throw new Error(`${path} lists ${name} in composes, but envUI exports no ${name}.`);
      for (const { use } of frontmatter?.avoidWhen ?? [])
        if (use && exported && !exported[use])
          throw new Error(`${path} suggests ${use} in avoidWhen, but envUI exports no ${use}.`);
      const document: DocumentRecord = {
        id,
        title,
        group,
        path,
        summary: (frontmatter?.summary ?? indexSummary).replace(/\s+/g, ' ').trim(),
        related: [],
        markdown,
        ...(frontmatter && { frontmatter, yaml }),
      };
      if (structured)
        document.sections = withImport(
          readPage(document, markdown, {
            kind,
            catalog: examplesOf(frontmatter),
            examples: filesOf(examples, id),
            specimens: filesOf(specimens, id),
            partNames,
          }),
          frontmatter!.components ?? frontmatter!.composes ?? [],
          props,
        );
      documents.push(document);
    }
  }
  for (const document of documents) {
    // A page's avoidWhen is its one list of related components and pages, its Related section:
    // each entry names an export to use or a page to read, and each relation is named once.
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

    let related = false;
    const listed: string[] = [];
    for (const token of marked.lexer(document.markdown)) {
      if (token.type === 'heading' && token.depth === 2) related = token.text === 'Related topics';
      if (related && token.type === 'list') {
        marked.walkTokens([token], (link) => {
          if (link.type === 'link') listed.push(basename(link.href, '.md'));
        });
      }
    }
    if (document.sections && listed.length)
      throw new Error(
        `${document.path} lists related topics in its body; they live in frontmatter.`,
      );
    // A page in the one-file structure relates to the pages its avoidWhen names; a guide to those
    // its Related topics list links.
    document.related = document.sections
      ? [...new Set(relations.flatMap(({ page }) => (page && page !== document.id ? [page] : [])))]
      : listed;
    if (document.related.includes(document.id))
      throw new Error(`${document.path} lists itself in related.`);
    for (const id of document.related)
      if (!documents.some((entry) => entry.id === id))
        throw new Error(`${document.path} relates to ${id}, which is not an indexed page.`);
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
      // A link to a heading names one the page has, by the id the catalogue gives it.
      if (fragment && !headingsOf(linked.markdown).some(({ id }) => id === decoded(fragment)))
        throw new Error(
          `Broken documentation link in ${document.path}: ${token.href} names no heading of ${linked.path}.`,
        );
    });
  }
  return documents;
}
