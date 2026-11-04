import { createContext, useContext } from 'react';

/**
 * Whether a section of a page renders as its outline alone while it waits its turn to show
 * (useRevealed): its headings, with the ids and words they keep, without what they head, hidden in
 * its place. So the page's contents list every heading from the first render, and a link to one
 * has its target, while the page renders its first section first.
 */
export const SectionOutline = createContext(false);

/**
 * Whether the section around renders as its outline alone; its root then takes
 * `data-site-pending`, which keeps it hidden (Template.css).
 */
export const useSectionOutline = () => useContext(SectionOutline);

/** The attribute of a section's root while it renders as its outline. */
export const pendingAttribute = (outline: boolean) => ({
  'data-site-pending': outline ? '' : undefined,
});

/**
 * The headings of Markdown alone, outside code fences, in order: rendered as the whole Markdown
 * is, they take the same ids, which number repeated words in order.
 */
export function headingsOnly(markdown: string) {
  let fence: string | undefined;
  const headings: string[] = [];
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
      fence = fence ? undefined : marker;
    else if (!fence && /^\s{0,3}#{1,6}\s/.test(line)) headings.push(line.trim());
  }
  return headings.join('\n\n');
}
