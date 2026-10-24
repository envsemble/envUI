// What the Site shows of a component or pattern page, and what it leaves to the page's guide in
// the Docs. The Site speaks plain language to people looking at envUI; a page's developer-only
// part, its "## In code" section and Accessibility's lists of what envUI and the application
// provide, is for people who build with it, and so are the changelog and the props. The catalogue
// renders the Site from these rules, and `npm test` checks the Site's text against them: no inline
// code outside the Code disclosures under its figures.
import { marked } from 'marked';

/**
 * The sections of a page the Site leaves out, which its guide in the Docs shows: "## In code",
 * the developer-only part, and the changelog.
 */
export const docsOnlySections = new Set(['code', 'changelog']);

/** The subsections of Accessibility that say what envUI and the application provide. */
export const providesHeadings = { envui: 'envUI provides', app: 'You provide' };

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

/** What envUI provides and what the application provides, each a Markdown list, from a page. */
export function providesOf(sections) {
  const accessibility = sections.find((section) => section.id === 'accessibility');
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
 * The name an anatomy legend item gives its part, which is all the Site shows of it: the bold
 * words it starts with, such as Label for `**Label** (`env-text-field-label`, `label`)`. The class
 * names and props after it are for the page's guide in the Docs and for agents.
 */
export function legendName(item) {
  return item.name ?? item.text.match(/^\*\*([^*]+)\*\*/)?.[1];
}

/**
 * The text of a page as the Site shows it, each piece with where it is: the summary, what it is for
 * and what to use instead, from the frontmatter, then the Markdown of its sections without the
 * developer-only part, with each figure's caption and each anatomy legend's names. Figures, their
 * code and specimens are not text.
 */
export function siteText(document) {
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
          markdown:
            section.id === 'accessibility' ? withoutProvides(block.markdown) : block.markdown,
        });
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

/** Each piece of inline code on a page's Site, with where it is. */
export function siteInlineCode(document) {
  return siteText(document).flatMap(({ where, markdown, text }) =>
    (markdown !== undefined
      ? inlineCodeOf(markdown)
      : [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1])
    ).map((code) => ({ where, code })),
  );
}
