import type { TableOfContentsItem } from '../../TableOfContents.js';

/** A heading read from the page: its id, its text and its level. */
export interface HeadingEntry {
  id: string;
  label: string;
  level: number;
}

/** An entry in reading order, with how deep it is nested. */
export interface FlatEntry {
  id: string;
  depth: number;
}

/**
 * Nests headings by level: each heading goes under the last one above it of a lower level, so an
 * h3 sits under the h2 before it, and one with no such heading above it stays at the top.
 */
export function outline(headings: readonly HeadingEntry[]): TableOfContentsItem[] {
  const root: TableOfContentsItem[] = [];
  const open: { level: number; children: TableOfContentsItem[] }[] = [];
  for (const heading of headings) {
    while (open.length > 0 && open[open.length - 1].level >= heading.level) open.pop();
    const children: TableOfContentsItem[] = [];
    const item = { id: heading.id, label: heading.label, children };
    (open.length > 0 ? open[open.length - 1].children : root).push(item);
    open.push({ level: heading.level, children });
  }
  return root.map(withoutEmptyChildren);
}

function withoutEmptyChildren(item: TableOfContentsItem): TableOfContentsItem {
  return item.children && item.children.length > 0
    ? { ...item, children: item.children.map(withoutEmptyChildren) }
    : { id: item.id, label: item.label };
}

/** The entries in reading order, each with its depth. */
export function flatten(items: readonly TableOfContentsItem[], depth = 0): FlatEntry[] {
  return items.flatMap((item) => [
    { id: item.id, depth },
    ...flatten(item.children ?? [], depth + 1),
  ]);
}

/**
 * An id for a heading that has none, from its words: lower case, letters and digits joined by
 * hyphens, accents dropped; `section` where no letter is left.
 */
export function slug(text: string): string {
  const words = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return words || 'section';
}

/** The first of `base`, `base-2`, `base-3`… that `taken` doesn't hold. */
export function uniqueId(base: string, taken: (id: string) => boolean): string {
  if (!taken(base)) return base;
  let count = 2;
  while (taken(`${base}-${count}`)) count += 1;
  return `${base}-${count}`;
}
