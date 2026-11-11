// The headings of Markdown as the catalogue renders them, with the ids they take there: for the
// search index, the generated documentation and the check that every #heading link has a heading.
import { marked, type Token, type Tokens } from 'marked';
import { headingSlugger } from './model/SearchAnchors.ts';

const entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
  nbsp: ' ',
};

/** The text of inline Markdown as the reader sees it, without its syntax. */
export function plainText(tokens: readonly Token[] | undefined): string {
  return (tokens ?? [])
    .map((item) => {
      const token = item as Tokens.Generic;
      if (token.tokens) return plainText(token.tokens);
      if (token.type === 'html') return '';
      const text = token.text ?? '';
      // Code keeps its characters; text has its entities decoded, as the rendered page shows them.
      return token.type === 'codespan'
        ? text
        : text.replace(
            /&(amp|lt|gt|quot|#39|apos|nbsp);/g,
            (_: string, name: string) => entities[name],
          );
    })
    .join('');
}

/**
 * The headings of a Markdown document, in order, each with the id it takes in the catalogue and
 * its level. Pass the same `slug` to number repeated headings across parts of one document.
 */
export function headingsOf(
  markdown: string,
  slug = headingSlugger(),
): { id: string; depth: number; text: string }[] {
  const headings: { id: string; depth: number; text: string }[] = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === 'heading')
      headings.push({ id: slug(plainText(token.tokens)), depth: token.depth, text: token.text });
  });
  return headings;
}
