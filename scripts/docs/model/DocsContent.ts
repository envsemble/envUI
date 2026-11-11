// What the Docs show of a page beside what the catalogue does (CatalogueContent.ts): its developer
// part, "## Compose", cut into sections of their own, the In code column of its words, and the
// setup guide's note on coding agents, which the Docs' home shows under its prompt.
import { codeColumns, fencedLines, subsections } from './CatalogueContent.ts';
import type { DocumentationSection } from './DocumentationTypes.ts';

/** Markdown with its `####` and deeper headings raised a level, outside code fences. */
export function raisedHeadings(markdown: string): string {
  return fencedLines(markdown)
    .map(({ line, fenced }) => (!fenced && /^#{4,6} /.test(line) ? line.slice(1) : line))
    .join('\n');
}

/** A piece of a Compose subsection: Markdown, or an example file of the page shown as code. */
type GuidePart = { kind: 'markdown'; markdown: string } | { kind: 'source'; name: string };

/**
 * A page's developer part, its "## Compose" section, cut into its `###` subsections: the
 * generated Import, then Usage, Composition and Customize as the page writes them.
 */
export function guideSubsections(sections: readonly DocumentationSection[] = []) {
  const section = sections.find((item) => item.id === 'code');
  const parts: { title: string; content: GuidePart[] }[] = [];
  for (const block of section?.blocks ?? []) {
    if (block.kind === 'source') parts.at(-1)?.content.push(block);
    if (block.kind !== 'markdown') continue;
    for (const chunk of subsections(block.markdown)) {
      const title = /^### (.*)/.exec(chunk)?.[1]?.trim();
      if (title) parts.push({ title, content: [] });
      const body = chunk.replace(/^#{2,3} .*\n/, '');
      if (body.trim()) parts.at(-1)?.content.push({ kind: 'markdown', markdown: body });
    }
  }
  return parts;
}

/**
 * The tables of a page's "## Words to use" cut to their words and In code columns (codeColumns):
 * empty where the page has no such column.
 */
export function wordsInCode(sections: readonly DocumentationSection[] = []): string {
  const section = sections.find((item) => item.id === 'words');
  return codeColumns(
    (section?.blocks ?? [])
      .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
      .join('\n'),
  );
}

/** The setup guide's closing section on coding agents. */
const agentNote = /^## Coding agents\n([\s\S]*?)(?=^## |(?![\s\S]))/m;

/**
 * The setup guide's note on coding agents, which the Docs' home moves up under its prompt, and the
 * guide's Markdown without it; the Markdown as it is where it has none.
 */
export function withoutAgentNote(markdown: string): { markdown: string; note?: string } {
  const note = markdown.match(agentNote)?.[1]?.trim();
  return note ? { markdown: markdown.replace(agentNote, ''), note } : { markdown };
}
