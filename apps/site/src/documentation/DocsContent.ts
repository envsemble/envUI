import { codeColumns, fencedLines, subsections } from './CatalogueContent.ts';
import type { DocumentationSection } from './DocumentationTypes.ts';

export function raisedHeadings(markdown: string): string {
  return fencedLines(markdown)
    .map(({ line, fenced }) => (!fenced && /^#{4,6} /.test(line) ? line.slice(1) : line))
    .join('\n');
}

type GuidePart = { kind: 'markdown'; markdown: string } | { kind: 'source'; name: string };

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

export function wordsInCode(sections: readonly DocumentationSection[] = []): string {
  const section = sections.find((item) => item.id === 'words');
  return codeColumns(
    (section?.blocks ?? [])
      .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
      .join('\n'),
  );
}

const agentNote = /^## Coding agents\n([\s\S]*?)(?=^## |(?![\s\S]))/m;

export function withoutAgentNote(markdown: string): { markdown: string; note?: string } {
  const note = markdown.match(agentNote)?.[1]?.trim();
  return note ? { markdown: markdown.replace(agentNote, ''), note } : { markdown };
}
