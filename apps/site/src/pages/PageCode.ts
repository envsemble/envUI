import type { CodeToken, CodeTokenStyle } from '@envui-internal/content/internal/codeHighlighting';
import {
  collectRenderedCode,
  giveCodeTokens,
  givenCodeTokens,
  type CodeSource,
} from '@envui-internal/content/internal/givenCodeTokens';

interface PageCodeData {
  styles: [CodeTokenStyle, CodeTokenStyle][];
  blocks: [language: string, lines: [text: string, style: number][][]][];
}

const pageCodeId = 'site-page-code';

const sourceOf = (lines: string[][]) => lines.map((line) => line.join('')).join('\n');

export async function renderWithCode<Rendered>(render: () => Promise<Rendered>) {
  const collect = collectRenderedCode();
  let rendered = await render();
  const code = collect();
  if (!code.length) return { rendered, code: undefined };
  const { highlightCode } = await import('@envui-internal/content/internal/codeHighlighting');
  const remade = (block: CodeSource, tokens: CodeToken[][]) =>
    sourceOf(tokens.map((line) => line.map((token) => token.content))) === block.source;
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

export const pageCodeScript = (data: PageCodeData) =>
  `<script type="application/json" id="${pageCodeId}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

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
