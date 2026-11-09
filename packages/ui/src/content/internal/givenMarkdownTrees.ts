/*
 * Markdown parsed ahead, such as by a page pre-rendered with its Markdown, which gives the browser
 * the same trees before it hydrates: Markdown whose tree was given renders from it, without parsing
 * it again, on the server and in the browser alike. A tree is the HTML tree Markdown renders, after
 * its rehype plugins, before react-markdown checks its URLs and drops raw HTML, which it does to a
 * given tree too; plain JSON, without the positions in the source.
 */

/** A tree of HTML nodes, as rehype gives it, made plain data. */
export interface MarkdownTree {
  type: 'root';
  children: unknown[];
}

const given = new Map<string, MarkdownTree>();
/** The trees rendered while they are collected, as JSON by their source; null for two that differ. */
let rendering: Map<string, string | null> | undefined;

/** Gives the tree of a source, which Markdown of it renders from then on. */
export function giveMarkdownTree(source: string, tree: MarkdownTree) {
  given.set(source, tree);
}

/** A copy of the tree given for a source, if any, which rendering it may change. */
export function givenMarkdownTree(source: string): MarkdownTree | undefined {
  const tree = given.get(source);
  return tree && structuredClone(tree);
}

/** Whether the trees Markdown renders are being collected (collectRenderedMarkdown). */
export const collectingMarkdown = () => rendering !== undefined;

/** Notes the tree a source rendered, while they are collected. */
export function noteMarkdownTree(source: string, tree: MarkdownTree) {
  if (!rendering) return;
  const json = JSON.stringify(tree, (key, value: unknown) =>
    key === 'position' ? undefined : value,
  );
  // One source that rendered two trees, such as with other plugins, is parsed where it renders.
  rendering.set(source, rendering.has(source) && rendering.get(source) !== json ? null : json);
}

/**
 * Collects the trees Markdown renders until the returned function is called, which returns each
 * source with its tree as JSON: a pre-render gives the browser them all.
 */
export function collectRenderedMarkdown(): () => [source: string, tree: string][] {
  const collected = new Map<string, string | null>();
  rendering = collected;
  return () => {
    if (rendering === collected) rendering = undefined;
    return [...collected].flatMap(([source, tree]) => (tree === null ? [] : [[source, tree]]));
  };
}
