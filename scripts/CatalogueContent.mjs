// What the catalogue shows of a component, pattern or foundation page, and what it leaves to the
// page in the Docs. The catalogue speaks plain language to people looking at envUI; a page's
// developer part, its "## Compose" section and Accessibility's lists of what envUI and the
// application provide, is for people who build with it, and so are the changelog and the props.
// The catalogue app renders the catalogue from these rules, and `npm test` checks its text against
// them: no inline code outside the Code disclosures under its figures.
import { marked } from 'marked';

/**
 * The sections of a page the catalogue leaves out, which its page in the Docs shows: "##
 * Compose", the developer part, and the changelog.
 */
export const docsOnlySections = new Set(['code', 'changelog']);

/** The subsections of Accessibility that say what envUI and the application provide. */
export const providesHeadings = { envui: 'envUI provides', app: 'You provide' };

/** The section that holds those lists, on either kind of page. */
export const providesSections = new Set(['accessibility']);

/** Markdown cut at its `###` and `##` headings, outside code fences. */
export function subsections(markdown) {
  const chunks = [''];
  let fence;
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
      fence = fence ? undefined : marker;
    if (!fence && /^#{2,3} /.test(line)) chunks.push('');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  return chunks;
}

const headingOf = (chunk) => /^#{2,3} (.*)/.exec(chunk)?.[1].trim();
const isProvides = (chunk) => Object.values(providesHeadings).includes(headingOf(chunk));

/** A section's Markdown without what envUI and the application provide. */
export function withoutProvides(markdown) {
  return subsections(markdown)
    .filter((chunk) => !isProvides(chunk))
    .join('')
    .replace(/\n+$/, '\n');
}

/** The heading of a table's column that only the Docs and agents read, such as a word's code. */
export const codeColumnHeading = 'In code';

/**
 * Markdown with the columns of its tables headed In code left out, as the catalogue shows it: a
 * table
 * may pair what people read with the code it means, such as the words to use and their props, and
 * the catalogue, which shows no code, reads only the rest.
 */
export function withoutCodeColumns(markdown) {
  if (!markdown.includes(codeColumnHeading)) return markdown;
  return marked
    .lexer(markdown)
    .map((token) => {
      if (token.type !== 'table') return token.raw;
      const keep = token.header.map((cell) => cell.text.trim() !== codeColumnHeading);
      if (keep.every(Boolean)) return token.raw;
      const row = (cells) =>
        `| ${cells
          .filter((_, index) => keep[index])
          .map((cell) => cell.text.trim())
          .join(' | ')} |`;
      const trailing = token.raw.match(/\n*$/)[0];
      return (
        [
          row(token.header),
          row(token.header.map(() => ({ text: '---' }))),
          ...token.rows.map(row),
        ].join('\n') + (trailing || '\n')
      );
    })
    .join('');
}

/**
 * What the catalogue leaves out of Markdown's tables, as the Docs show it: each table with an In
 * code column, cut to its first column and that one, such as the words people use and the props
 * each means; the rest of the Markdown, which the catalogue shows, is left out.
 */
export function codeColumns(markdown) {
  if (!markdown.includes(codeColumnHeading)) return '';
  return marked
    .lexer(markdown)
    .flatMap((token) => {
      if (token.type !== 'table') return [];
      const code = token.header.findIndex((cell) => cell.text.trim() === codeColumnHeading);
      if (code < 1) return [];
      const row = (cells) => `| ${cells[0].text.trim()} | ${cells[code].text.trim()} |`;
      return [
        [
          row(token.header),
          row(token.header.map(() => ({ text: '---' }))),
          ...token.rows.map(row),
        ].join('\n'),
      ];
    })
    .join('\n\n');
}

/** A section's Markdown as the catalogue shows it: without what envUI and the application provide. */
export function catalogueMarkdown(section, markdown) {
  return withoutCodeColumns(
    providesSections.has(section.id) ? withoutProvides(markdown) : markdown,
  );
}

/** What envUI provides and what the application provides, each a Markdown list, from a page. */
export function providesOf(sections) {
  const accessibility = sections.find((section) => providesSections.has(section.id));
  const markdown = (accessibility?.blocks ?? [])
    .map((block) => (block.kind === 'markdown' ? block.markdown : ''))
    .join('\n');
  const body = (heading) =>
    subsections(markdown)
      .find((chunk) => headingOf(chunk) === heading)
      ?.replace(/^.*\n/, '')
      .trim();
  return { envui: body(providesHeadings.envui), app: body(providesHeadings.app) };
}

/**
 * The name an anatomy legend item gives its part, which is all the catalogue shows of it: the
 * bold words it starts with, such as Label for `**Label** (`env-text-field-label`, `label`)`. The
 * class names and props after it are for the page in the Docs and for agents.
 */
export function legendName(item) {
  return item.name ?? item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
}

/**
 * The text of a page as the catalogue shows it, each piece with where it is: the summary, what it
 * is for and what to use instead, from the frontmatter, then the Markdown of its sections without
 * the developer part, with each figure's caption and each anatomy legend's names. Figures, their
 * code and specimens are not text.
 */
export function catalogueText(document) {
  const pieces = [{ where: 'summary', markdown: document.summary ?? '' }];
  const frontmatter = document.frontmatter ?? document.metadata ?? {};
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
        // A foundation's figure: its caption and its legend's names and meanings.
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
      // A caption is shown as it is written, so code in it shows its backticks.
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

/** The inline code of Markdown as it renders: code spans and `<code>` elements. */
export function inlineCodeOf(markdown) {
  const found = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === 'codespan') found.push(token.text);
    if (token.type === 'html' && /<code[\s>]/i.test(token.raw)) found.push(token.raw.trim());
  });
  return found;
}

/** Each piece of inline code a page shows in the catalogue, with where it is. */
export function catalogueInlineCode(document) {
  return catalogueText(document).flatMap(({ where, markdown, text }) =>
    (markdown !== undefined
      ? inlineCodeOf(markdown)
      : [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1])
    ).map((code) => ({ where, code })),
  );
}

/** The heading of the last column of an option table, which names what each option is for. */
export const optionUseHeading = 'Use for';

/** The plain text of inline Markdown tokens, as a reader sees it: code spans without backticks. */
function plainText(tokens) {
  return tokens
    .map((token) => (token.tokens ? plainText(token.tokens) : (token.text ?? '')))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * An option table, such as a component's variants, tones or sizes, from a lexed Markdown table: the
 * first column names each option, the last, headed Use for, says what it is for, and any columns
 * between them add a detail, such as the tones a variant takes. The catalogue shows it as a
 * legend, each option's name in a tag followed by what it is for, as an anatomy figure's legend
 * shows its parts; the packaged page and the Docs keep the table. Anything else is undefined.
 */
export function optionTable(token) {
  if (token?.type !== 'table' || token.header.length < 2) return undefined;
  if (token.header.at(-1).text.trim() !== optionUseHeading) return undefined;
  const titles = token.header.map((cell) => plainText(cell.tokens));
  return {
    column: titles[0],
    options: token.rows.map((row) => ({
      name: plainText(row[0].tokens),
      nameTokens: row[0].tokens,
      details: row.slice(1, -1).map((cell, index) => ({
        title: titles[index + 1],
        markdown: cell.text.trim(),
      })),
      use: row.at(-1).text.trim(),
    })),
  };
}

/**
 * What keeps an option table from showing as a legend: an option's name is a tag, a few words of
 * plain text with no link, image or HTML, named once, and each option says what it is for.
 */
export function optionTableProblems(table) {
  const problems = [];
  const seen = new Set();
  for (const [index, option] of table.options.entries()) {
    const at = `row ${index + 1} of the ${table.column} table`;
    const kinds = new Set();
    marked.walkTokens(option.nameTokens, (token) => kinds.add(token.type));
    if (!option.name) problems.push(`${at} names no option`);
    else if (['link', 'image', 'html'].some((kind) => kinds.has(kind)))
      problems.push(`${at} names its option with a link, an image or HTML; write its name alone`);
    else if (option.name.split(' ').length > 5 || /[.:;!?]$/.test(option.name))
      problems.push(
        `${at} names its option "${option.name}": a name of a few words, such as Outline or From the bottom, which the catalogue shows as a tag`,
      );
    if (seen.has(option.name)) problems.push(`${at} names ${option.name} again`);
    seen.add(option.name);
    if (!option.use) problems.push(`${at} says nothing under ${optionUseHeading}`);
  }
  return problems;
}

/** The first words of a piece of text, to say where it is. */
const opening = (text) => {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  return words.length > 8 ? `${words.slice(0, 8).join(' ')}…` : words.join(' ');
};

/** The most paragraphs a titled block holds. */
export const blockParagraphs = 3;

/**
 * Where a page's catalogue text has no structure. Every piece of text belongs to a titled block:
 * a heading and a short paragraph or a few, with its figure where it has one, as a section's
 * opening or a `###` subsection is written. Two kinds of loose text break that:
 *
 * - **after a figure**: a paragraph after a figure, a table or a list with no heading between them,
 *   such as a lone sentence after the do and don't pairs, or between two figures. The one
 *   paragraph right after an anatomy figure's legend, which names the parts it can't show, belongs
 *   to the figure.
 * - **too many paragraphs**: a block holds at most three short paragraphs; more are two blocks
 *   with headings of their own.
 */
export function catalogueStructure(document) {
  const found = [];
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

/** The longest paragraph of the catalogue's text, in characters as people read them: about 3 lines. */
export const paragraphLength = 240;

/** A paragraph's text as people read it: links as their words, without tags or emphasis marks. */
const readText = (markdown) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The paragraphs of a page's catalogue text longer than `paragraphLength`. The catalogue sets
 * running text in a readable measure, so a long paragraph is a tall block of gray: split it into
 * short paragraphs, each one point, or move a point to a block of its own.
 */
export function longParagraphs(document) {
  const found = [];
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

/**
 * Markdown cut at its option tables, in order: runs of Markdown, and each option table parsed,
 * which the catalogue shows as a legend.
 */
export function optionPieces(markdown) {
  const pieces = [];
  for (const token of marked.lexer(markdown)) {
    const options = optionTable(token);
    const last = pieces.at(-1);
    if (options) pieces.push({ options, raw: token.raw });
    else if (last && 'markdown' in last) last.markdown += token.raw;
    else pieces.push({ markdown: token.raw });
  }
  return pieces;
}

/**
 * The kinds of technical text the catalogue never shows, outside the Code disclosures under its
 * figures: it is for people looking at envUI, and these belong to the guides in the Docs. Each
 * pattern finds one kind in plain text, as a reader sees it.
 */
const technicalPatterns = [
  // A custom property or token, such as --env-color-bg-page.
  ['token', /(?<![\w-])--[a-z][\w-]*/gi],
  // A part's class or a data attribute, such as env-card-heading or data-env-theme.
  ['class name', /(?<![\w-])(?:env|docs|data|aria)-[a-z][\w-]*/g],
  // A hex color, such as #1e1f21.
  ['hex color', /(?<![\w&#])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?![\w-])/gi],
  // A CSS length or duration, such as 0.25 rem, 32 px or 150ms.
  ['length', /(?<![\w.])\d*\.?\d+\s?(?:rem|px|em|ch|vh|vw|dvh|svh|lvh|ms|pt)(?![\w-])/g],
  // A percentage used as a value, such as 50%.
  ['percentage', /(?<![\w.])\d*\.?\d+\s?%/g],
  // A contrast ratio, such as 4.5:1.
  ['ratio', /(?<![\w.])\d+(?:\.\d+)?:1(?!\d)/g],
  // A prop with its value, or a call, such as variant="ghost", gap={4} or var(--x).
  ['code', /\b[a-z][\w-]*=["'{]|\b[a-z]\w*\([^)]*\)|=>|[{}]|<\/?[A-Za-z][\w.]*(?:\s[^>]*)?\/?>/g],
  // A camelCase name, such as onValueChange or useTheme.
  ['identifier', /(?<![\w-])[a-z]+(?:[A-Z][a-z\d]+)+(?![\w-])/g],
];

/** Words in camelCase that are plain names, not code. */
const plainCamelCase = new Set(['macOS', 'iOS', 'iPadOS', 'iPhone', 'iPad', 'envUI']);

/**
 * The technical text in a piece of plain text, such as a page's rendered words: tokens, class
 * names, hex colors, lengths, percentages, contrast ratios, props and code, and camelCase names.
 */
export function technicalText(text) {
  const found = [];
  for (const [kind, pattern] of technicalPatterns)
    for (const match of text.matchAll(pattern)) {
      if (kind === 'identifier' && plainCamelCase.has(match[0])) continue;
      found.push({ kind, text: match[0].trim() });
    }
  return found;
}
