import { marked, type Token, type Tokens } from 'marked';
import type { AnatomyLegendItem, DocumentationSection } from './DocumentationTypes.ts';

export const docsOnlySections = new Set(['code', 'changelog']);

export const providesHeadings = { envui: 'envUI provides', app: 'You provide' } as const;

const providesSections = new Set(['accessibility']);

export function fencedLines(markdown: string): { line: string; fenced: boolean }[] {
  let fence: string | undefined;
  return markdown.split('\n').map((line) => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
      fence = fence ? undefined : marker;
    return { line, fenced: fence !== undefined };
  });
}

export function subsections(markdown: string): string[] {
  const chunks = [''];
  for (const { line, fenced } of fencedLines(markdown)) {
    if (!fenced && /^#{2,3} /.test(line)) chunks.push('');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  return chunks;
}

export function lastSubsection(markdown: string): [string, string] | undefined {
  const scanned = fencedLines(markdown);
  let start = -1;
  scanned.forEach(({ line, fenced }, index) => {
    if (!fenced && /^### /.test(line)) start = index;
  });
  if (start === -1) return undefined;
  const lines = scanned.map(({ line }) => line);
  const body = lines.slice(start + 1).filter((line) => line.trim());
  if (!body.length || body.some((line) => /^\s*(\||`{3,}|~{3,})/.test(line))) return undefined;
  if (/^([-*+]|\d+[.)]) /.test(body[0])) return undefined;
  return [lines.slice(0, start).join('\n'), lines.slice(start).join('\n')];
}

export function leadParagraph(markdown: string): [string, string] | undefined {
  const text = markdown.replace(/^(?:[ \t]*\n)+/, '');
  if (!text.trim() || /^\s{0,3}(#|\||[-*+] |\d+[.)] |`{3,}|~{3,}|<!--)/.test(text))
    return undefined;
  const end = text.search(/\n[ \t]*\n/);
  return end === -1 ? [text, ''] : [text.slice(0, end), text.slice(end)];
}

const headingOf = (chunk: string) => /^#{2,3} (.*)/.exec(chunk)?.[1].trim();
const isProvides = (chunk: string) =>
  (Object.values(providesHeadings) as string[]).includes(headingOf(chunk) ?? '');

function withoutProvides(markdown: string): string {
  return subsections(markdown)
    .filter((chunk) => !isProvides(chunk))
    .map((chunk) => chunk.replace(/^### Keyboard\n+/, ''))
    .join('')
    .replace(/\n+$/, '\n');
}

const codeColumnHeading = 'In code' as const;

function withoutCodeColumns(markdown: string): string {
  if (!markdown.includes(codeColumnHeading)) return markdown;
  return marked
    .lexer(markdown)
    .map((token) => {
      if (token.type !== 'table') return token.raw;
      const table = token as Tokens.Table;
      const keep = table.header.map((cell) => cell.text.trim() !== codeColumnHeading);
      if (keep.every(Boolean)) return table.raw;
      const row = (cells: readonly { text: string }[]) =>
        `| ${cells
          .filter((_, index) => keep[index])
          .map((cell) => cell.text.trim())
          .join(' | ')} |`;
      const trailing = table.raw.match(/\n*$/)?.[0];
      return (
        [
          row(table.header),
          row(table.header.map(() => ({ text: '---' }))),
          ...table.rows.map(row),
        ].join('\n') + (trailing || '\n')
      );
    })
    .join('');
}

export function codeColumns(markdown: string): string {
  if (!markdown.includes(codeColumnHeading)) return '';
  return marked
    .lexer(markdown)
    .flatMap((token) => {
      if (token.type !== 'table') return [];
      const table = token as Tokens.Table;
      const code = table.header.findIndex((cell) => cell.text.trim() === codeColumnHeading);
      if (code < 1) return [];
      const row = (cells: readonly { text: string }[]) =>
        `| ${cells[0].text.trim()} | ${cells[code].text.trim()} |`;
      return [
        [
          row(table.header),
          row(table.header.map(() => ({ text: '---' }))),
          ...table.rows.map(row),
        ].join('\n'),
      ];
    })
    .join('\n\n');
}

export function catalogueMarkdown(
  section: Pick<DocumentationSection, 'id'>,
  markdown: string,
): string {
  return withoutCodeColumns(
    providesSections.has(section.id) ? withoutProvides(markdown) : markdown,
  );
}

export function catalogueSection(section: DocumentationSection): DocumentationSection | undefined {
  const blocks = section.blocks.map((block) =>
    block.kind === 'markdown'
      ? { ...block, markdown: catalogueMarkdown(section, block.markdown) }
      : block,
  );
  const empty =
    section.id !== 'rules' &&
    blocks.every(
      (block) => block.kind === 'markdown' && !block.markdown.replace(/^## .*$/m, '').trim(),
    );
  return empty ? undefined : { ...section, blocks };
}

export function providesOf(sections: readonly DocumentationSection[]): {
  envui: string | undefined;
  app: string | undefined;
} {
  const accessibility = sections.find((section) => providesSections.has(section.id));
  const markdown = (accessibility?.blocks ?? [])
    .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
    .join('\n');
  const body = (heading: string) =>
    subsections(markdown)
      .find((chunk) => headingOf(chunk) === heading)
      ?.replace(/^.*\n/, '')
      .trim();
  return { envui: body(providesHeadings.envui), app: body(providesHeadings.app) };
}

export function legendName(item: Pick<AnatomyLegendItem, 'name' | 'text'>): string | undefined {
  return item.name ?? item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
}

export const optionUseHeading = 'Use for' as const;

function plainText(tokens: readonly Token[]): string {
  return tokens
    .map((token) =>
      'tokens' in token && token.tokens
        ? plainText(token.tokens)
        : 'text' in token
          ? token.text
          : '',
    )
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

interface OptionTableOption {
  name: string;
  nameTokens: Token[];
  details: { title: string; markdown: string }[];
  use: string;
}

export interface OptionTable {
  column: string;
  options: OptionTableOption[];
}

export function optionTable(token: Token | undefined): OptionTable | undefined {
  if (token?.type !== 'table') return undefined;
  const table = token as Tokens.Table;
  if (table.header.length < 2) return undefined;
  if (table.header.at(-1)!.text.trim() !== optionUseHeading) return undefined;
  const titles = table.header.map((cell) => plainText(cell.tokens));
  return {
    column: titles[0],
    options: table.rows.map((row) => ({
      name: plainText(row[0].tokens),
      nameTokens: row[0].tokens,
      details: row.slice(1, -1).map((cell, index) => ({
        title: titles[index + 1],
        markdown: cell.text.trim(),
      })),
      use: row.at(-1)!.text.trim(),
    })),
  };
}

export function optionPieces(
  markdown: string,
): ({ markdown: string } | { options: OptionTable; raw: string })[] {
  const pieces: ({ markdown: string } | { options: OptionTable; raw: string })[] = [];
  for (const token of marked.lexer(markdown)) {
    const options = optionTable(token);
    const last = pieces.at(-1);
    if (options) pieces.push({ options, raw: token.raw });
    else if (last && 'markdown' in last) last.markdown += token.raw;
    else pieces.push({ markdown: token.raw });
  }
  return pieces;
}
