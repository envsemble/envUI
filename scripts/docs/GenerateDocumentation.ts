import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type {
  DocumentationEntry,
  DocumentationSummary,
} from '../../apps/site/src/documentation/DocumentationTypes.ts';
import { marked } from 'marked';
import { headingsOf, plainText } from './MarkdownHeadings.ts';
import { exportSection, headingSlugger } from '../../apps/site/src/documentation/SearchAnchors.ts';
import { providesHeadings } from '../../apps/site/src/documentation/CatalogueContent.ts';
import { writeSearchIndex } from '../site/BuildSearchIndex.ts';
import { documentationDirectory, generatedDocumentationFile } from '../RepositoryPaths.ts';
import { pageKindOf, readProps } from './PageStructure.ts';
import { readDocumentation } from './DocumentationReader.ts';
import { writeIfChanged } from '../build/GeneratedFiles.ts';
import { documentedExports } from './Compiler.ts';
import { readMessages, stringsOf } from './Messages.ts';

const pagesDirectory = resolve(dirname(generatedDocumentationFile), 'pages');

const names = (text: string, name: string) =>
  new RegExp(`(?<![\\w.])${name.replace(/[.$]/g, '\\$&')}(?![\\w])`).test(text);

function headedText(markdown: string, slug: (text: string) => string, start: string) {
  const parts = [{ id: start, heading: '', text: '' }];
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'heading')
      parts.push({ id: slug(plainText(token.tokens)), heading: token.text, text: '' });
    else parts.at(-1)!.text += `\n${token.raw}`;
  }
  return parts;
}

function membersOf(
  document: {
    title: string;
    markdown: string;
    sections?: { id: string; blocks: { kind: string; markdown?: string }[] }[];
  },
  components: readonly string[],
  props: NonNullable<ReturnType<typeof readProps>>,
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
          plain:
            !['code', 'changelog'].includes(section.id) &&
            !Object.values(providesHeadings).includes(part.heading as never),
        })),
      )
    : headedText(document.markdown, slug, '').map((part) => ({ ...part, plain: false }));
  const firstNaming = (name: string, plain: boolean) =>
    parts.find((part) => part.id && part.plain === plain && names(part.text, name))?.id;
  const placed = members.flatMap((name) => {
    const entry = props.exports[name];
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

export function generateDocumentation() {
  const props = readProps();
  const documents = readDocumentation(documentationDirectory, { props });
  const messages = readMessages();
  const entries = documents.map((document) => {
    const { yaml: _yaml, frontmatter, sections, ...entry } = document;
    const kind = pageKindOf(document.path);
    if (!frontmatter) return entry;
    if (!sections) {
      const members =
        frontmatter.components && props && membersOf(document, frontmatter.components, props);
      return {
        ...entry,
        ...(frontmatter.status && { status: frontmatter.status }),
        ...(frontmatter.components && { components: frontmatter.components }),
        ...(members && { members }),
      };
    }
    const members =
      kind === 'component' && props && membersOf(document, frontmatter.components ?? [], props);
    const metadata = {
      ...(frontmatter.status && { status: frontmatter.status }),
      ...(frontmatter.since && { since: frontmatter.since }),
      aliases: frontmatter.aliases ?? [],
      useWhen: frontmatter.useWhen ?? [],
      avoidWhen: frontmatter.avoidWhen ?? [],
      components: frontmatter.components ?? [],
      ...(frontmatter.statuses && { statuses: frontmatter.statuses }),
    };
    if (!sections) return { ...entry, metadata };
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
      ...(kind === 'component' && {
        props: Object.fromEntries(
          documentedExports(frontmatter.components ?? [], props).map((name: string) => [
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
  const source = `// Generated from docs/index.md, its pages and docs/generated/props.json; edit the sources.\nimport type { DocumentationSummary } from '../documentation/DocumentationTypes';\n\nexport const documents: DocumentationSummary[] = ${JSON.stringify(summaries, null, 2)};\n`;
  writeIfChanged(generatedDocumentationFile, source);
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
  writeSearchIndex({ documents, props: props! });
  return documents;
}

if (import.meta.main) {
  if (process.argv.includes('--validate'))
    console.log(
      `The ${readDocumentation().length} indexed Markdown documents and their links hold.`,
    );
  else
    console.log(
      `Prepared ${generateDocumentation().length} indexed Markdown documents for the catalogue.`,
    );
}
