import { marked, type Token, type Tokens } from 'marked';
import type { AnatomyLegendItem, DocumentationSection } from './DocumentationTypes.ts';

export interface CataloguePage {
  summary?: string;
  frontmatter?: PageFrontmatter;
  metadata?: PageFrontmatter;
  sections?: readonly DocumentationSection[];
}

interface PageFrontmatter {
  useWhen?: readonly string[];
  avoidWhen?: readonly { text: string }[];
}

export type CataloguePiece = { where: string } & (
  { markdown: string; text?: undefined } | { text: string; markdown?: undefined }
);

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

export function withoutCodeColumns(markdown: string): string {
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

function catalogueMarkdown(section: Pick<DocumentationSection, 'id'>, markdown: string): string {
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

export function catalogueText(document: CataloguePage): CataloguePiece[] {
  const pieces: CataloguePiece[] = [{ where: 'summary', markdown: document.summary ?? '' }];
  const frontmatter: PageFrontmatter = document.frontmatter ?? document.metadata ?? {};
  for (const text of frontmatter.useWhen ?? []) pieces.push({ where: 'useWhen', markdown: text });
  for (const { text } of frontmatter.avoidWhen ?? [])
    pieces.push({ where: 'avoidWhen', markdown: text });
  for (const section of document.sections ?? []) {
    if (docsOnlySections.has(section.id)) continue;
    for (const block of section.blocks) {
      if (block.kind === 'markdown')
        pieces.push({
          where: section.title,
          markdown: catalogueMarkdown(section, block.markdown),
        });
      if (block.kind === 'figure') {
        if (block.caption)
          pieces.push({ where: `${section.title}, ${block.name}`, text: block.caption });
        for (const item of block.legend ?? [])
          pieces.push({
            where: `${section.title}, ${block.name}`,
            markdown: `${item.name}: ${item.text}`,
          });
        continue;
      }
      if (block.kind !== 'example') continue;
      if (block.caption)
        pieces.push({ where: `${section.title}, ${block.name}`, text: block.caption });
      if (block.role === 'anatomy')
        for (const item of block.legend ?? [])
          pieces.push({
            where: `${section.title}, ${block.name}`,
            markdown: legendName(item) ?? item.text,
          });
    }
  }
  return pieces;
}

function inlineCodeOf(markdown: string): string[] {
  const found: string[] = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === 'codespan') found.push(token.text);
    if (token.type === 'html' && /<code[\s>]/i.test(token.raw)) found.push(token.raw.trim());
  });
  return found;
}

export function catalogueInlineCode(document: CataloguePage): { where: string; code: string }[] {
  return catalogueText(document).flatMap(({ where, markdown, text }) =>
    (markdown !== undefined
      ? inlineCodeOf(markdown)
      : [...(text ?? '').matchAll(/`([^`]+)`/g)].map((match) => match[1])
    ).map((code) => ({ where, code })),
  );
}

const optionUseHeading = 'Use for' as const;
const optionNameMaxWords = 5;

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

export function optionTableProblems(table: OptionTable): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const [index, option] of table.options.entries()) {
    const at = `row ${index + 1} of the ${table.column} table`;
    const kinds = new Set<string>();
    marked.walkTokens(option.nameTokens, (token) => {
      kinds.add(token.type);
    });
    if (!option.name) problems.push(`${at} names no option`);
    else if (['link', 'image', 'html'].some((kind) => kinds.has(kind)))
      problems.push(`${at} names its option with a link, an image or HTML; write its name alone`);
    else if (option.name.split(' ').length > optionNameMaxWords || /[.:;!?]$/.test(option.name))
      problems.push(
        `${at} names its option "${option.name}": a name of a few words, such as Outline or From the bottom, which the catalogue shows as a tag`,
      );
    if (seen.has(option.name)) problems.push(`${at} names ${option.name} again`);
    seen.add(option.name);
    if (!option.use) problems.push(`${at} says nothing under ${optionUseHeading}`);
  }
  return problems;
}

const openingWordCount = 8;
const opening = (text: string) => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  return words.length > openingWordCount
    ? `${words.slice(0, openingWordCount).join(' ')}…`
    : words.join(' ');
};

const blockParagraphs = 3;

export function catalogueStructure(
  document: Pick<CataloguePage, 'sections'>,
): { where: string; kind: 'after a figure' | 'too many paragraphs'; text: string }[] {
  const found: { where: string; kind: 'after a figure' | 'too many paragraphs'; text: string }[] =
    [];
  for (const section of document.sections ?? []) {
    if (docsOnlySections.has(section.id)) continue;
    let paragraphs = 0;
    let figure = false;
    let afterAnatomy = false;
    for (const block of section.blocks) {
      if (block.kind !== 'markdown') {
        figure = true;
        afterAnatomy = block.kind === 'example' && block.role === 'anatomy';
        continue;
      }
      const markdown = catalogueMarkdown(section, block.markdown);
      for (const token of marked.lexer(markdown)) {
        if (token.type === 'space') continue;
        const anatomyNote = afterAnatomy;
        afterAnatomy = false;
        if (token.type === 'heading') {
          paragraphs = 0;
          figure = false;
        } else if (token.type === 'paragraph') {
          if (figure && !anatomyNote)
            found.push({ where: section.title, kind: 'after a figure', text: opening(token.text) });
          else if (paragraphs >= blockParagraphs)
            found.push({
              where: section.title,
              kind: 'too many paragraphs',
              text: opening(token.text),
            });
          paragraphs++;
          if (anatomyNote) figure = true;
        } else figure = true;
      }
    }
  }
  return found;
}

export const paragraphLength = 240;

const readText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export function longParagraphs(
  document: Pick<CataloguePage, 'sections'>,
): { where: string; length: number; text: string }[] {
  const found: { where: string; length: number; text: string }[] = [];
  for (const section of document.sections ?? []) {
    if (docsOnlySections.has(section.id)) continue;
    for (const block of section.blocks) {
      if (block.kind !== 'markdown') continue;
      const markdown = catalogueMarkdown(section, block.markdown);
      for (const token of marked.lexer(markdown)) {
        if (token.type !== 'paragraph') continue;
        const text = readText(token.text);
        if (text.length > paragraphLength)
          found.push({ where: section.title, length: text.length, text: opening(text) });
      }
    }
  }
  return found;
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

const technicalPatterns: [kind: string, pattern: RegExp][] = [
  ['token', /(?<![\w-])--[a-z][\w-]*/gi],
  ['class name', /(?<![\w-])(?:env|docs|data|aria)-[a-z][\w-]*/g],
  ['hex color', /(?<![\w&#])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w-])/gi],
  ['length', /(?<![\w.])\d*\.?\d+\s?(?:rem|px|em|ch|vh|vw|dvh|svh|lvh|ms|pt)(?![\w-])/g],
  ['percentage', /(?<![\w.])\d*\.?\d+\s?%/g],
  ['ratio', /(?<![\w.])\d+(?:\.\d+)?:1(?!\d)/g],
  ['code', /\b[a-z][\w-]*=["'{]|\b[a-z]\w*\([^)]*\)|=>|[{}]|<\/?[A-Za-z][\w.]*(?:\s[^>]*)?\/?>/g],
  ['identifier', /(?<![\w-])[a-z]+(?:[A-Z][a-z\d]+)+(?![\w-])/g],
];

const plainCamelCase = new Set(['macOS', 'iOS', 'iPadOS', 'iPhone', 'iPad', 'envUI']);

export function technicalText(text: string): { kind: string; text: string }[] {
  const found: { kind: string; text: string }[] = [];
  for (const [kind, pattern] of technicalPatterns)
    for (const match of text.matchAll(pattern)) {
      if (kind === 'identifier' && plainCamelCase.has(match[0])) continue;
      found.push({ kind, text: match[0].trim() });
    }
  return found;
}
