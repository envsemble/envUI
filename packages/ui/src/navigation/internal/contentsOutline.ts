import type { ReactNode } from 'react';

/** One entry of a table of contents: a section of the page, and the sections nested in it. */
export interface TableOfContentsItem {
  /** The id of the element the entry leads to: a heading, or any section of the page with an id. */
  id: string;
  /** The entry's text, such as the heading's words or a shorter name for a section. */
  label: ReactNode;
  /** The sections nested under this one, such as a heading's subsections. */
  children?: readonly TableOfContentsItem[];
}

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

/** Where a section starts, measured from where a link to it scrolls it to: 0 is right there. */
export interface SectionPosition {
  id: string;
  top: number;
}

/** The area that scrolls: the height a section can be read in, and how far it has scrolled. */
export interface ScrollView {
  /** The height below the scroll padding, such as under a sticky top bar. */
  height: number;
  /** How far it has scrolled from its top. */
  scrolled: number;
  /** How far it can scroll in all. */
  range: number;
}

/** How far down the view the reading line sits: a quarter. */
const readingLine = 0.25;

/**
 * How far the area must have scrolled for each section to reach the reading line, a quarter of the
 * way down the view. Sections too near the end of the page to reach it, such as short last ones,
 * share the scrolling left after the last one that does, evenly, so each is reached in turn and the
 * last one at the very end.
 */
function reachedAt(sections: readonly SectionPosition[], view: ScrollView): number[] {
  const line = view.height * readingLine;
  const range = Math.max(0, view.range);
  const reached = sections.map((section) => view.scrolled + section.top - line);
  const late = reached.filter((at) => at > range).length;
  if (late > 0 && range > 0) {
    const early = reached.filter((at) => at <= range);
    const from = Math.max(0, ...early);
    let count = 0;
    reached.forEach((at, index) => {
      if (at <= range) return;
      count += 1;
      reached[index] = from + ((range - from) * count) / late;
    });
  }
  return reached;
}

/**
 * The section the reader is in: the last one whose start has passed the reading line; at the top
 * of the page, before any has, the first.
 */
export function currentSection(
  sections: readonly SectionPosition[],
  view: ScrollView,
): string | undefined {
  if (sections.length === 0) return undefined;
  const reached = reachedAt(sections, view);
  let current = sections[0].id;
  // A pixel of slack, for a section a link has just scrolled to a fraction short of its place.
  reached.forEach((at, index) => {
    if (at <= view.scrolled + 1) current = sections[index].id;
  });
  return current;
}

/**
 * Where the reader is, as a fractional section index: the current section's index plus how far
 * the area has scrolled from reaching it towards reaching the next, from 0 to 1. It moves on
 * continuously as the page scrolls, for marks that follow the reader smoothly.
 */
export function readingPosition(sections: readonly SectionPosition[], view: ScrollView): number {
  if (sections.length === 0) return 0;
  const reached = reachedAt(sections, view);
  let index = 0;
  reached.forEach((at, each) => {
    if (at <= view.scrolled + 1) index = each;
  });
  const from = reached[index];
  const to = reached[index + 1];
  if (to === undefined || to <= from) return index;
  return index + Math.min(1, Math.max(0, (view.scrolled - from) / (to - from)));
}
