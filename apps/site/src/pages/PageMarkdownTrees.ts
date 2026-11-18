import {
  collectRenderedMarkdown,
  giveMarkdownTree,
  type MarkdownTree,
} from '@envui-internal/content/internal/givenMarkdownTrees';

const pageMarkdownId = 'site-page-markdown';

export async function renderWithMarkdown<Rendered>(render: () => Promise<Rendered>) {
  const collect = collectRenderedMarkdown();
  const rendered = await render();
  const trees = collect();
  if (!trees.length) return { rendered, markdown: undefined };
  const json = `[${trees.map(([source, tree]) => `[${JSON.stringify(source)},${tree}]`).join(',')}]`;
  const script = `<script type="application/json" id="${pageMarkdownId}">${json.replace(/</g, '\\u003c')}</script>`;
  return { rendered, markdown: script };
}

export function givePageMarkdown() {
  const element = document.getElementById(pageMarkdownId);
  if (!element?.textContent) return;
  const trees = JSON.parse(element.textContent) as [string, MarkdownTree][];
  for (const [source, tree] of trees) giveMarkdownTree(source, tree);
}
