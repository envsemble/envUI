// Reads the documentation in docs/: the index, which groups and orders the pages, and each page with
// its frontmatter. It validates them, generates the catalogue's data
// (apps/site/src/generated/Documentation.ts) and compiles the Markdown that ships in the
// package, where example files and generated props tables are filled in.
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { headingsOf } from './MarkdownHeadings.ts';
import { headingSlugger } from '../../apps/site/src/shared/SearchAnchors.ts';
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
    if (!sections)
      return {
        ...entry,
        ...(frontmatter.status && { status: frontmatter.status }),
        ...(frontmatter.components && { components: frontmatter.components }),
      };
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
  const source = `// Generated from docs/index.md, its pages and docs/generated/props.json; edit the sources.\nimport type { DocumentationEntry } from '../shared/DocumentationTypes';\n\nexport const documents: DocumentationEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
  mkdirSync(dirname(generatedFile), { recursive: true });
  if (!existsSync(generatedFile) || readFileSync(generatedFile, 'utf8') !== source)
    writeFileSync(generatedFile, source);
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
