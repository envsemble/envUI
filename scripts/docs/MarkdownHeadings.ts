import { marked, type Token, type Tokens } from 'marked';
import { headingSlugger } from '../../apps/site/src/documentation/SearchAnchors.ts';

const entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
  nbsp: ' ',
};

export function plainText(tokens: readonly Token[] | undefined): string {
  return (tokens ?? [])
    .map((item) => {
      const token = item as Tokens.Generic;
      if (token.tokens) return plainText(token.tokens);
      if (token.type === 'html') return '';
      const text = token.text ?? '';
      return token.type === 'codespan'
        ? text
        : text.replace(
            /&(amp|lt|gt|quot|#39|apos|nbsp);/g,
            (_: string, name: string) => entities[name],
          );
    })
    .join('');
}

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
