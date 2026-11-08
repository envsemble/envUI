// The element ids that routes and search lead to, shared by the search index
// (scripts/site/BuildSearchIndex.ts) and the catalogue that renders the elements. It runs in Node
// and in the browser, so it imports nothing.

/** The element id of an export's props on its page's Props view. */
export const exportSection = (name: string) => `props-${name}`;

/** The element id of a prop's row in its export's table: props-Button-variant. */
export const propSection = (name: string, prop: string) => `props-${name}-${prop}`;

/** The element id of a token's row in the token reference: --env-color-fg-muted is token-env-color-fg-muted. */
export const tokenSection = (cssVariable: string) => `token-${cssVariable.replace(/^--/, '')}`;

/**
 * The id of a heading in rendered Markdown, from its text as the reader sees it, as common
 * Markdown renderers write them: lowercase, without punctuation but with letters, combining marks,
 * digits, underscores and hyphens, each space a hyphen. "Scale and density" is scale-and-density,
 * so a Markdown link to #scale-and-density reaches it.
 */
export function headingSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, '')
    .replace(/\s/g, '-');
}

/**
 * Gives the headings of one Markdown document their ids in order: a repeated heading takes -1, -2
 * and so on after its slug, as common Markdown renderers number them.
 */
export function headingSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const slug = headingSlug(text);
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    return count ? `${slug}-${count}` : slug;
  };
}
