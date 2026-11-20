import { marked } from 'marked';
import {
  catalogueMarkdown,
  docsOnlySections,
  legendName,
  optionUseHeading,
  type OptionTable,
} from '../../../apps/site/src/documentation/CatalogueContent.ts';
import type { DocumentationSection } from '../../../apps/site/src/documentation/DocumentationTypes.ts';

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

type CataloguePiece = { where: string } & (
  { markdown: string; text?: undefined } | { text: string; markdown?: undefined }
);

export function catalogueProse(document: Pick<CataloguePage, 'sections'>) {
  return (document.sections ?? [])
    .filter((section) => !docsOnlySections.has(section.id))
    .map((section) => ({
      title: section.title,
      blocks: section.blocks.map((block) =>
        block.kind === 'markdown'
          ? { ...block, markdown: catalogueMarkdown(section, block.markdown) }
          : block,
      ),
    }));
}

export function catalogueText(document: CataloguePage): CataloguePiece[] {
  const pieces: CataloguePiece[] = [{ where: 'summary', markdown: document.summary ?? '' }];
  const frontmatter: PageFrontmatter = document.frontmatter ?? document.metadata ?? {};
  for (const text of frontmatter.useWhen ?? []) pieces.push({ where: 'useWhen', markdown: text });
  for (const { text } of frontmatter.avoidWhen ?? [])
    pieces.push({ where: 'avoidWhen', markdown: text });
  for (const { title, blocks } of catalogueProse(document)) {
    for (const block of blocks) {
      if (block.kind === 'markdown') pieces.push({ where: title, markdown: block.markdown });
      if (block.kind === 'figure') {
        if (block.caption) pieces.push({ where: `${title}, ${block.name}`, text: block.caption });
        for (const item of block.legend ?? [])
          pieces.push({ where: `${title}, ${block.name}`, markdown: `${item.name}: ${item.text}` });
        continue;
      }
      if (block.kind !== 'example') continue;
      if (block.caption) pieces.push({ where: `${title}, ${block.name}`, text: block.caption });
      if (block.role === 'anatomy')
        for (const item of block.legend ?? [])
          pieces.push({
            where: `${title}, ${block.name}`,
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

const optionNameMaxWords = 5;

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
  for (const { title, blocks } of catalogueProse(document)) {
    let paragraphs = 0;
    let figure = false;
    let afterAnatomy = false;
    for (const block of blocks) {
      if (block.kind !== 'markdown') {
        figure = true;
        afterAnatomy = block.kind === 'example' && block.role === 'anatomy';
        continue;
      }
      for (const token of marked.lexer(block.markdown)) {
        if (token.type === 'space') continue;
        const anatomyNote = afterAnatomy;
        afterAnatomy = false;
        if (token.type === 'heading') {
          paragraphs = 0;
          figure = false;
        } else if (token.type === 'paragraph') {
          if (figure && !anatomyNote)
            found.push({ where: title, kind: 'after a figure', text: opening(token.text) });
          else if (paragraphs >= blockParagraphs)
            found.push({ where: title, kind: 'too many paragraphs', text: opening(token.text) });
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
  for (const { title, blocks } of catalogueProse(document))
    for (const block of blocks) {
      if (block.kind !== 'markdown') continue;
      for (const token of marked.lexer(block.markdown)) {
        if (token.type !== 'paragraph') continue;
        const text = readText(token.text);
        if (text.length > paragraphLength)
          found.push({ where: title, length: text.length, text: opening(text) });
      }
    }
  return found;
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
