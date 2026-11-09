import type { CodeToken, CodeTokenStyle } from '@envui-internal/content/internal/codeHighlighting';
import {
  collectRenderedCode,
  giveCodeTokens,
  givenCodeTokens,
  type CodeSource,
} from '@envui-internal/content/internal/givenCodeTokens';

/*
 * A pre-rendered page's code, highlighted as it is pre-rendered (Server.tsx) rather than in the
 * browser once the page has hydrated: the highlighter's first block on a phone was a long pause,
 * its grammar's matchers built as it went. The page's HTML carries the tokens, which the browser
 * gives before it hydrates (main.tsx), so the page's code blocks hydrate highlighted, as the
 * server rendered them.
 */

/**
 * The tokens of a page's code blocks, as its HTML carries them: each style once, and each block's
 * language and lines, a line as its tokens' text and style. A block's source is its lines' text.
 */
interface PageCodeData {
  styles: [CodeTokenStyle, CodeTokenStyle][];
  blocks: [language: string, lines: [text: string, style: number][][]][];
}

/** The id of the element of a page's HTML that carries its code's tokens. */
export const pageCodeId = 'site-page-code';

/** A block's source, its lines joined as the highlighter splits them. */
const sourceOf = (lines: string[][]) => lines.map((line) => line.join('')).join('\n');

/**
 * Renders a page with its code highlighted: `render` renders it once, collecting the sources of
 * its code blocks; those not highlighted yet are highlighted and given, and the page renders
 * again, with them highlighted. Returns what the last render returned, and the data of the tokens
 * of every block, for the page's HTML (pageCodeScript).
 */
export async function renderWithCode<Rendered>(render: () => Promise<Rendered>) {
  const collect = collectRenderedCode();
  let rendered = await render();
  const code = collect();
  if (!code.length) return { rendered, code: undefined };
  const { highlightCode } = await import('@envui-internal/content/internal/codeHighlighting');
  // A source that its lines don't make again, such as one with \r\n, renders plain.
  const remade = (block: CodeSource, tokens: CodeToken[][]) =>
    sourceOf(tokens.map((line) => line.map((token) => token.content))) === block.source;
  // Blocks another page gave already render highlighted the first time.
  const blocks = code.flatMap((block) => {
    const tokens = givenCodeTokens(block);
    return tokens ? [{ ...block, tokens }] : [];
  });
  const missing = code.filter((block) => !givenCodeTokens(block));
  for (const block of missing) {
    const tokens = await highlightCode(block.source, block.language);
    if (!remade(block, tokens)) continue;
    giveCodeTokens(block, tokens);
    blocks.push({ ...block, tokens });
  }
  if (missing.length) rendered = await render();
  const styles = new Map<string, number>();
  const data: PageCodeData = { styles: [], blocks: [] };
  for (const { language, tokens } of blocks)
    data.blocks.push([
      language,
      tokens.map((line) =>
        line.map(({ content, light, dark }) => {
          const style = JSON.stringify([light, dark]);
          let index = styles.get(style);
          if (index === undefined) {
            index = data.styles.push([light, dark]) - 1;
            styles.set(style, index);
          }
          return [content, index];
        }),
      ),
    ]);
  return { rendered, code: data };
}

/** The script element of a page's HTML that carries its code's tokens, made safe for HTML. */
export const pageCodeScript = (data: PageCodeData) =>
  `<script type="application/json" id="${pageCodeId}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

/** Gives the tokens a pre-rendered page's HTML carries, before the page hydrates. */
export function givePageCode() {
  const element = document.getElementById(pageCodeId);
  if (!element?.textContent) return;
  const { styles, blocks } = JSON.parse(element.textContent) as PageCodeData;
  for (const [language, lines] of blocks) {
    const tokens: CodeToken[][] = lines.map((line) =>
      line.map(([content, style]) => ({
        content,
        light: styles[style]![0],
        dark: styles[style]![1],
      })),
    );
    const code: CodeSource = {
      language,
      source: sourceOf(lines.map((line) => line.map(([text]) => text))),
    };
    giveCodeTokens(code, tokens);
  }
}
