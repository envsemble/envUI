// Reads the documentation in docs/: the index, which groups and orders the pages, and each page with
// its frontmatter. It validates them, generates the catalogue's data (every page's summary in
// apps/site/src/generated/Documentation.ts, each page's content in generated/pages/<id>.json) and
// compiles the Markdown that ships in the package, where example files and generated props tables
// are filled in.
//
// Component, pattern and foundation pages (docs/components, docs/patterns and docs/foundations)
// are in the one-file structure: YAML frontmatter (see pageSchemas) that lists each example once,
// with its role and caption, then the `##` sections of pageSections, in their order. An example is
// a file in apps/site/src/examples/<page>/<Name>.tsx, or on a foundation one of the
// catalogue's figures, placed by an empty fence ```tsx figure=Name```; the Overview, Props and
// Related are generated, Related from its avoidWhen. The build fails on a page of these kinds that
// is not in the structure. contributing/pages.md describes it for authors.
//
// The work is in scripts/docs/: Schema.ts (the page kinds, sections, roles and frontmatter),
// Validation.ts (a page read and checked), Reader.ts (every page, its index and links) and
// Compiler.ts (the props tables and the Markdown the package ships). This file writes the
// catalogue's data and runs as the command; it exports what the modules did as one file.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  DocumentationEntry,
  DocumentationSummary,
} from '../../apps/site/src/shared/DocumentationTypes.ts';
import { marked } from 'marked';
import { headingsOf, plainText } from './MarkdownHeadings.ts';
import { exportSection, headingSlugger } from '../../apps/site/src/shared/SearchAnchors.ts';
import { providesHeadings } from '../../apps/site/src/shared/CatalogueContent.ts';
import { writeSearchIndex } from '../site/SearchIndex.ts';
import { documentationDirectory, generatedFile, pageKindOf, readProps } from './Schema.ts';
import { readDocumentation } from './Reader.ts';
import { documentedExports } from './Compiler.ts';
import { readMessages, stringsOf } from './Messages.ts';

export {
  codeSubsections,
  componentGroups,
  documentationDirectory,
  exampleRoles,
  examplesDirectory,
  examplesOf,
  frontmatterSchema,
  guideExportStatus,
  importMarkdown,
  intents,
  libraryVersions,
  pageKindOf,
  pageSchemas,
  pageSections,
  readProps,
  specimensDirectory,
  splitFrontmatter,
  statuses,
} from './Schema.ts';
export { fenceFor, isPropsTable, readPartNames } from './Validation.ts';
export { readDocumentation } from './Reader.ts';
export {
  compileDocument,
  compileDocumentation,
  documentedExports,
  exampleSource,
  packageDocumentation,
  propDescription,
  renderProps,
} from './Compiler.ts';

/** Each page's content for the catalogue: generated/pages/<id>.json beside generatedFile. */
const pagesDirectory = resolve(dirname(generatedFile), 'pages');

const names = (text: string, name: string) =>
  new RegExp(`(?<![\\w.])${name.replace(/[.$]/g, '\\$&')}(?![\\w])`).test(text);

/**
 * The heading ids of Markdown with the text under each, the text before its first heading under
 * `start`: the `slug` numbers repeated headings across the parts of one page.
 */
function headedText(markdown: string, slug: (text: string) => string, start: string) {
  const parts = [{ id: start, heading: '', text: '' }];
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'heading')
      parts.push({ id: slug(plainText(token.tokens)), heading: token.text, text: '' });
    else parts.at(-1)!.text += `\n${token.raw}`;
  }
  return parts;
}

/**
 * The exports a page documents besides the one it is named after, each a component or a namespace,
 * such as IconButton on Button's, for the navigation's entries under the page: each with where the
 * Docs show it, its props on a component page and a guide's first heading whose text names it, and
 * on a component page where the catalogue does, the first heading of its plain sections whose text
 * names it, else the Overview; a page with none has none.
 */
function membersOf(
  document: {
    title: string;
    markdown: string;
    sections?: { id: string; blocks: { kind: string; markdown?: string }[] }[];
  },
  components: readonly string[],
  props: ReturnType<typeof readProps>,
) {
  const members = components.filter(
    (name) =>
      name !== document.title && ['component', 'namespace'].includes(props.exports[name]?.kind),
  );
  if (!members.length) return undefined;
  const slug = headingSlugger();
  const parts = document.sections
    ? document.sections.flatMap((section) =>
        headedText(
          section.blocks
            .flatMap((block) => (block.kind === 'markdown' ? [block.markdown!] : []))
            .join('\n\n'),
          slug,
          section.id,
        ).map((part) => ({
          ...part,
          // The catalogue leaves out Compose, the changelog and the lists of what is provided.
          plain:
            !['code', 'changelog'].includes(section.id) &&
            !Object.values(providesHeadings).includes(part.heading as never),
        })),
      )
    : headedText(document.markdown, slug, '').map((part) => ({ ...part, plain: false }));
  const firstNaming = (name: string, plain: boolean) =>
    parts.find((part) => part.id && part.plain === plain && names(part.text, name))?.id;
  // A guide's component that no heading's text names has no place to lead to, and no entry.
  const placed = members.flatMap((name) => {
    const entry = props.exports[name]!;
    if (!document.sections) {
      const docs = firstNaming(name, false);
      return docs ? [{ name, docs }] : [];
    }
    return [
      {
        name,
        catalogue: firstNaming(name, true) ?? 'overview',
        docs: exportSection(entry.kind === 'namespace' ? (entry.parts[0] ?? name) : name),
      },
    ];
  });
  return placed.length ? placed : undefined;
}

/** Writes a generated file only when it changes, so a dev server watching it doesn't reload. */
function writeIfChanged(file: string, source: string) {
  mkdirSync(dirname(file), { recursive: true });
  if (!existsSync(file) || readFileSync(file, 'utf8') !== source) writeFileSync(file, source);
}

export function generateDocumentation() {
  const props = readProps();
  const documents = readDocumentation(documentationDirectory, { props });
  const messages = readMessages();
  const entries = documents.map((document) => {
    const { yaml: _yaml, frontmatter, sections, ...entry } = document;
    const kind = pageKindOf(document.path);
    if (!frontmatter) return entry;
    // A guide names the exports it documents, such as LinkProvider, so a page that relates to one
    // links to it, and may carry a status, such as alpha.
    if (!sections) {
      const members = frontmatter.components && membersOf(document, frontmatter.components, props);
      return {
        ...entry,
        ...(frontmatter.status && { status: frontmatter.status }),
        ...(frontmatter.components && { components: frontmatter.components }),
        ...(members && { members }),
      };
    }
    const members =
      kind === 'component' && membersOf(document, frontmatter.components ?? [], props);
    const metadata = {
      ...(frontmatter.status && { status: frontmatter.status }),
      ...(frontmatter.since && { since: frontmatter.since }),
      aliases: frontmatter.aliases ?? [],
      useWhen: frontmatter.useWhen ?? [],
      avoidWhen: frontmatter.avoidWhen ?? [],
      components: frontmatter.components ?? [],
      ...(frontmatter.statuses && { statuses: frontmatter.statuses }),
      ...(frontmatter.intent && { intent: frontmatter.intent }),
      ...(frontmatter.composes && { composes: frontmatter.composes }),
    };
    if (!sections) return { ...entry, metadata };
    // The ids of the headings in each section, numbered across the page, so the catalogue opens a
    // link to a heading in the view that shows it.
    const slug = headingSlugger();
    return {
      ...entry,
      metadata,
      ...(members && { members }),
      sections: sections.map((section) => ({
        ...section,
        anchors: section.blocks.flatMap((block) =>
          block.kind === 'markdown' ? headingsOf(block.markdown, slug).map(({ id }) => id) : [],
        ),
      })),
      // Pattern and template pages document no exports of their own; they link to what they compose.
      ...(kind === 'component' && {
        props: Object.fromEntries(
          documentedExports(frontmatter.components, props).map((name) => [
            name,
            props!.exports[name],
          ]),
        ),
        strings: stringsOf(frontmatter.components ?? [], messages).flatMap(
          (entry) => entry.strings,
        ),
      }),
    };
  });
  // Every page's summary loads with the site, for its navigation, galleries and routes; a page's
  // content, in a file of its own, loads with the page. A page in sections is shown from them, so
  // only a guide's content keeps its whole Markdown.
  const summaries: DocumentationSummary[] = entries.map((entry) => {
    const {
      markdown: _markdown,
      sections,
      props: _props,
      strings: _strings,
      metadata,
      ...summary
    } = entry as DocumentationEntry;
    if (!sections) return summary;
    const { aliases: _aliases, useWhen: _useWhen, avoidWhen: _avoidWhen, ...shared } = metadata!;
    return {
      ...summary,
      metadata: shared,
      outline: sections.map((section) => ({
        id: section.id,
        anchors: section.anchors ?? [],
        examples: section.blocks.flatMap((block) =>
          block.kind === 'example'
            ? [
                {
                  name: block.name,
                  heading: block.heading,
                  ...(block.role && { role: block.role }),
                  ...(block.widths && { widths: block.widths }),
                  ...(block.open && { open: block.open }),
                  ...(block.stage && { stage: block.stage }),
                },
              ]
            : [],
        ),
      })),
    };
  });
  const source = `// Generated from docs/index.md, its pages and docs/generated/props.json; edit the sources.\nimport type { DocumentationSummary } from '../shared/DocumentationTypes';\n\nexport const documents: DocumentationSummary[] = ${JSON.stringify(summaries, null, 2)};\n`;
  writeIfChanged(generatedFile, source);
  const contents = new Map(
    entries.map((entry) => {
      const { sections, markdown, ...rest } = entry as DocumentationEntry;
      const content = sections ? { ...rest, sections } : { ...rest, markdown };
      return [`${entry.id}.json`, `${JSON.stringify(content)}\n`];
    }),
  );
  if (contents.size !== entries.length) throw new Error('Two documentation pages share an id.');
  mkdirSync(pagesDirectory, { recursive: true });
  for (const name of readdirSync(pagesDirectory))
    if (!contents.has(name)) rmSync(resolve(pagesDirectory, name));
  for (const [name, content] of contents) writeIfChanged(resolve(pagesDirectory, name), content);
  // The catalogue's search index, of the same pages, props and the token list.
  writeSearchIndex({ documents, props: props! });
  return documents;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // --check reads and validates the documentation, its links and headings, and writes nothing.
  if (process.argv.includes('--check'))
    console.log(
      `The ${readDocumentation().length} indexed Markdown documents and their links hold.`,
    );
  else
    console.log(
      `Prepared ${generateDocumentation().length} indexed Markdown documents for the catalogue.`,
    );
}
