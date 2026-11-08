// Reads a page in the one-file structure into its sections, checking the structure as it goes. Its
// checks are in validation/: the frontmatter, the figures and their legends, and the editorial
// rules of headings, Accessibility and Changelog.
import { marked, type Token, type Tokens } from 'marked';
import type { DocumentationBlock } from './model/DocumentationTypes.ts';
import { optionTable, optionTableProblems } from './model/CatalogueContent.ts';
import { codeSubsections, pageSections, sourcePattern, type PageSection } from './PageStructure.ts';
import {
  accessibilityProblems,
  changelogProblems,
  headingProblems,
} from './validation/Editorial.ts';
import { figurePattern, fileWords, kindFencePattern, placeFigure } from './validation/Figures.ts';
import { readLegend } from './validation/Legends.ts';
import { isPropsTable, specimenPattern } from './MarkdownBlocks.ts';
import type {
  ExampleBlock,
  PageContext,
  PageInput,
  PageReading,
  ReadSection,
} from './PageReading.ts';

/** Adds Markdown to a section's blocks, to the Markdown block it ends with if it does. */
function appendMarkdown(blocks: DocumentationBlock[], raw: string) {
  const last = blocks.at(-1);
  if (last?.kind === 'markdown') last.markdown += raw;
  else blocks.push({ kind: 'markdown', markdown: raw });
}

/**
 * The sections of a page in the one-file structure, each with its blocks: Markdown, figures with
 * their legends, specimens and, in Compose, examples shown as code. It checks the structure: the
 * sections pageSections knows, once each, in its order, with Rules; every example the frontmatter
 * lists placed once, but the overview's, which the generated Overview shows; and on a component or
 * a pattern, an overview example and Accessibility's lists. A foundation's figures are the
 * catalogue's (figures/foundations); an example file there is the code of the figure of its name.
 */
export function readPage(document: PageInput, body: string, context: PageContext) {
  const tokens = marked.lexer(body);
  if (tokens.map((token) => token.raw).join('') !== body)
    throw new Error(`Could not split ${document.path} into sections.`);
  const foundation = context.kind === 'foundation';
  const structure = pageSections.map((item) => ({
    ...item,
    title: (foundation && item.foundationTitle) || item.title,
  }));
  const page: PageReading = {
    document,
    context,
    foundation,
    structure,
    codeTitle: structure.find((item) => item.id === 'code')!.title,
    placed: new Set(),
    sections: [],
    problems: [],
    current: undefined,
    subheading: undefined,
    legendOf: undefined,
    codeOrder: [],
  };
  for (const token of tokens) readToken(page, token);
  page.problems.push(...pageProblems(page));
  if (page.problems.length)
    throw new Error(
      `${document.path} does not follow the one-file structure (contributing/pages.md):\n  - ${page.problems.join('\n  - ')}`,
    );
  return withOverview(page);
}

/** Reads one token of a page into the section it belongs to. */
function readToken(page: PageReading, token: Token) {
  const { problems, codeTitle } = page;
  problems.push(...headingProblems(token));
  if (page.current?.id === 'code' && !(token.type === 'heading' && token.depth === 2)) {
    readComposeToken(page, page.current, token);
    return;
  }
  if (token.type === 'heading' && token.depth === 2 && !startSection(page, token as Tokens.Heading))
    return;
  const current = page.current;
  if (!current) {
    if (token.type !== 'space') problems.push('content must follow a "##" section heading');
    return;
  }
  current.tokens.push(token);
  if (token.type === 'space') {
    appendMarkdown(current.blocks, token.raw);
    return;
  }
  if (token.type === 'blockquote')
    problems.push(
      `${current.title} has a blockquote; write its text as a paragraph, or a rule as a do and don't pair`,
    );
  if (token.type === 'heading' && token.depth === 3) page.subheading = token.text;
  if (isPropsTable(token))
    problems.push(`${current.title} lists props in a table; the Props section is generated`);
  // An option table, whose last column is Use for, shows in the catalogue as a legend of tags.
  const options = optionTable(token);
  if (options)
    problems.push(...optionTableProblems(options).map((problem) => `${current.title}: ${problem}`));
  if (token.type === 'list' && token.ordered && readLegend(page, token as Tokens.List)) return;
  page.legendOf = undefined;
  const lang = token.type === 'code' ? (token.lang ?? '') : '';
  if (sourcePattern.test(lang))
    problems.push(
      `\`${lang}\` in "## ${current.title}": an example's source as code belongs in "## ${codeTitle}"`,
    );
  if (kindFencePattern.test(lang)) {
    problems.push(
      `\`${lang}\`: place a figure as \`tsx figure=Name\`, and list its role and caption under examples in the frontmatter`,
    );
    return;
  }
  const figure = lang.match(figurePattern);
  if (/^tsx\s+figure=/.test(lang) && !figure) {
    problems.push(
      `the fence \`${lang}\` is malformed: write \`tsx figure=Name\`, with attributes as name="value" (a value holds no ", so use ' or “ ”) and flags, such as open, as their name alone`,
    );
    return;
  }
  if (figure) {
    placeFigure(page, current, token as Tokens.Code, figure[1], figure[2]);
    return;
  }
  if (token.type === 'html' && specimenPattern.test(token.raw.trim())) {
    const name = token.raw.trim().match(specimenPattern)![1];
    if (!page.context.specimens.has(name))
      problems.push(
        `specimen ${name} has no file apps/site/src/specimens/${page.document.id}/${name}.tsx`,
      );
    current.blocks.push({ kind: 'specimen', name });
    return;
  }
  appendMarkdown(current.blocks, token.raw);
}

/**
 * Reads a token of "## Compose", the developer part: `###` subsections of codeSubsections, in
 * order, holding Markdown and example files shown as code.
 */
function readComposeToken(page: PageReading, current: ReadSection, token: Token) {
  const { problems, codeTitle, codeOrder } = page;
  current.tokens.push(token);
  if (token.type === 'heading' && token.depth === 3) {
    const index = codeSubsections.findIndex((item) => item.title === token.text);
    if (token.text === 'Import')
      problems.push(`"### Import" of "## ${codeTitle}" is generated; remove it`);
    else if (index === -1)
      problems.push(
        `"### ${token.text}" is not a subsection of "## ${codeTitle}" (${codeSubsections.map((item) => item.title).join(', ')}); use a "####" heading inside one`,
      );
    else if (codeOrder.includes(index)) problems.push(`"### ${token.text}" appears twice`);
    else if (codeOrder.some((other) => other > index))
      problems.push(
        `"### ${token.text}" must come before "### ${codeSubsections[Math.max(...codeOrder)].title}" in "## ${codeTitle}"`,
      );
    codeOrder.push(index);
  } else if (token.type !== 'space' && !codeOrder.length)
    problems.push(`"## ${codeTitle}" starts with a "###" subsection, such as "### Usage"`);
  // Code of one language with nothing between is one block, rather than a line and then more.
  const before = current.tokens.slice(0, -1).findLast((item) => item.type !== 'space');
  if (
    token.type === 'code' &&
    before?.type === 'code' &&
    before.lang === token.lang &&
    !sourcePattern.test(token.lang ?? '')
  )
    problems.push(
      `"## ${codeTitle}" gives two ${token.lang || 'code'} blocks in a row; make them one block`,
    );
  if (token.type === 'code' && sourcePattern.test(token.lang ?? '')) {
    const name = token.lang.match(sourcePattern)[1];
    if (!page.context.examples.has(name))
      problems.push(
        `source ${name} has no file apps/site/src/examples/${page.document.id}/${name}.tsx`,
      );
    if (token.text.trim())
      problems.push(`the fence of source ${name} must be empty; the build fills in its file`);
    current.blocks.push({ kind: 'source', name });
    return;
  }
  if (
    token.type === 'code' &&
    (figurePattern.test(token.lang ?? '') || kindFencePattern.test(token.lang ?? ''))
  )
    problems.push(
      `"## ${codeTitle}" shows code, not figures: show an example's source with \`tsx source=Name\`, not \`${token.lang}\``,
    );
  if (token.type === 'html' && specimenPattern.test(token.raw.trim()))
    problems.push(`"## ${codeTitle}" shows code, not specimens`);
  appendMarkdown(current.blocks, token.raw);
}

/**
 * Starts the section a `##` heading opens, checking it is one the page's kind takes, once, in
 * order; false for a heading of no such section, which the page then leaves out.
 */
function startSection(page: PageReading, token: Tokens.Heading) {
  const { structure, sections, problems } = page;
  const section = structure.find((item) => item.title === token.text);
  if (!section) {
    problems.push(
      `"## ${token.text}" is not a section of a ${page.context.kind} page (${structure
        .filter((item) => !item.generated)
        .map((item) => item.title)
        .join(', ')})`,
    );
    return false;
  }
  if (section.generated) problems.push(`"## ${token.text}" is generated; remove it`);
  if (sections.some((item) => item.id === section.id))
    problems.push(`"## ${token.text}" appears twice`);
  const previous = sections.at(-1);
  if (
    previous &&
    structure.indexOf(section) < structure.findIndex((item) => item.id === previous.id)
  )
    problems.push(`"## ${token.text}" must come before "## ${previous.title}"`);
  page.current = { id: section.id, title: section.title, blocks: [], tokens: [] };
  sections.push(page.current);
  page.subheading = undefined;
  page.legendOf = undefined;
  return true;
}

/**
 * What the page as a whole gets wrong once it is read: legends, required sections and
 * subsections, the examples its frontmatter lists, and Accessibility's and Changelog's contents.
 */
function pageProblems(page: PageReading) {
  const { document, sections, structure, codeTitle, codeOrder, foundation, placed } = page;
  const { catalog, examples, specimens, partNames } = page.context;
  const problems: string[] = [];
  // An anatomy figure without a legend numbers the parts parts.json lists for its component; a
  // variants figure needs one, the names of its variants.
  for (const section of sections)
    for (const block of section.blocks)
      if (block.kind !== 'example' && block.kind !== 'figure') continue;
      else if (block.role === 'variants' && !block.legend)
        problems.push(
          `variants ${block.name} has no legend: follow it with a numbered list of its variants' names in bold, such as 1. **Outline**`,
        );
      else if (block.role === 'anatomy' && block.kind === 'example' && !block.legend) {
        const component = block.of ?? document.title;
        if (!partNames.components[component]?.length)
          problems.push(
            `anatomy ${block.name} has no legend, and docs/generated/parts.json lists no parts of ${component}${block.of ? '' : '; write a legend or name the component with of="Name"'}`,
          );
      }
  for (const section of structure)
    if (section.required && !sections.some((item) => item.id === section.id))
      problems.push(`"## ${section.title}" is required`);
  if (sections.some((item) => item.id === 'code'))
    for (const [index, item] of codeSubsections.entries())
      if (item.required && !codeOrder.includes(index))
        problems.push(`"## ${codeTitle}" needs a "### ${item.title}" subsection: ${item.holds}`);
  // Every example the frontmatter lists is placed once, but the overview's, which the Overview
  // shows; a component or pattern shows what it is with at least one, and says what envUI and the
  // application provide under Accessibility.
  const entries = Object.entries(catalog);
  for (const [name, { role, open, stage, motion, wide, device }] of entries) {
    if (foundation && (open || stage || motion || wide || device))
      problems.push(
        `figure ${name} takes no open, stage, motion, wide or device on a foundation page`,
      );
    if (role !== 'overview' && !placed.has(name))
      problems.push(`example ${name} is listed in the frontmatter but placed nowhere`);
    if (!foundation && !examples.has(name))
      problems.push(
        `example ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`,
      );
    if (role === 'overview' && motion && !specimens.has(name))
      problems.push(
        `example ${name} has motion but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to play it`,
      );
  }
  // A foundation's example file is the code of its figure of the same name.
  if (foundation)
    for (const name of examples)
      if (!catalog[name])
        problems.push(
          `apps/site/src/examples/${document.id}/${name}.tsx is no figure's code: name it after the figure it shows`,
        );
  if (!foundation) {
    if (!entries.some(([, { role }]) => role === 'overview'))
      problems.push('the frontmatter lists no overview example, which shows what it is');
    const accessibility = sections.find((item) => item.id === 'accessibility');
    if (!accessibility)
      problems.push('"## Accessibility" is required, with what envUI and you provide');
    else problems.push(...accessibilityProblems(accessibility.tokens));
  }
  const changelog = sections.find((item) => item.id === 'changelog');
  if (changelog) problems.push(...changelogProblems(changelog.tokens));
  return problems;
}

/**
 * The page's sections, after the Overview: the frontmatter's overview examples, side by side, the
 * first named after the page.
 */
function withOverview({ document, sections, foundation, context }: PageReading): PageSection[] {
  const result = sections.map(({ id, title, blocks }) => ({ id, title, blocks }));
  const overviews = Object.entries(context.catalog).filter(([, { role }]) => role === 'overview');
  if (!overviews.length) return result;
  const overview = {
    id: 'overview',
    title: 'Overview',
    blocks: [
      { kind: 'markdown' as const, markdown: '## Overview\n\n' },
      ...(overviews.map(([name, { caption, open, stage, motion, wide, device }], index) => ({
        kind: foundation ? 'figure' : 'example',
        name,
        heading: index === 0 ? document.title : fileWords(name),
        ...(caption && { caption }),
        ...(open && { open: true }),
        ...(stage && { stage }),
        ...(motion && { motion: true }),
        ...(wide && { wide: true }),
        ...(device && { device: device as ExampleBlock['device'] }),
      })) as DocumentationBlock[]),
    ],
  };
  return [overview, ...result];
}
