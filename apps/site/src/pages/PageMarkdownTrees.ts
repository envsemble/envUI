import {
  collectRenderedMarkdown,
  giveMarkdownTree,
  type MarkdownTree,
} from '@envui-internal/content/internal/givenMarkdownTrees';

/*
 * A pre-rendered page's Markdown, parsed as it is pre-rendered (Server.tsx) rather than in the
 * browser as the page hydrates: parsing a page's Markdown again there was the longest part of
 * hydrating on a phone. The page's HTML carries each source's tree, which the browser gives before
 * it hydrates (main.tsx), so the page's Markdown hydrates from the trees, as the server rendered it.
 */

/** The id of the element of a page's HTML that carries its Markdown's trees. */
const pageMarkdownId = 'site-page-markdown';

/**
 * Renders a page collecting the trees of its Markdown: returns what `render` returned, and the
 * element of the page's HTML that carries the trees, if it rendered any.
 */
export async function renderWithMarkdown<Rendered>(render: () => Promise<Rendered>) {
  const collect = collectRenderedMarkdown();
  const rendered = await render();
  const trees = collect();
  if (!trees.length) return { rendered, markdown: undefined };
  // Each tree is JSON already: the element holds them as an array of [source, tree] pairs.
  const json = `[${trees.map(([source, tree]) => `[${JSON.stringify(source)},${tree}]`).join(',')}]`;
  const script = `<script type="application/json" id="${pageMarkdownId}">${json.replace(/</g, '\\u003c')}</script>`;
  return { rendered, markdown: script };
}

/** Gives the trees a pre-rendered page's HTML carries, before the page hydrates. */
export function givePageMarkdown() {
  const element = document.getElementById(pageMarkdownId);
  if (!element?.textContent) return;
  const trees = JSON.parse(element.textContent) as [string, MarkdownTree][];
  for (const [source, tree] of trees) giveMarkdownTree(source, tree);
}
