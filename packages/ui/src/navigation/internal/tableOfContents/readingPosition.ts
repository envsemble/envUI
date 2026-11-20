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

const readingLineShareDownView = 0.25;

function scrollAtWhichEachSectionReachesLine(
  sections: readonly SectionPosition[],
  view: ScrollView,
): number[] {
  const line = view.height * readingLineShareDownView;
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

const slackForLinkScrollShortByFraction = 1;

/**
 * The section the reader is in: the last one whose start has passed the reading line; at the top
 * of the page, before any has, the first.
 */
export function currentSection(
  sections: readonly SectionPosition[],
  view: ScrollView,
): string | undefined {
  if (sections.length === 0) return undefined;
  const reached = scrollAtWhichEachSectionReachesLine(sections, view);
  let current = sections[0].id;
  reached.forEach((at, index) => {
    if (at <= view.scrolled + slackForLinkScrollShortByFraction) current = sections[index].id;
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
  const reached = scrollAtWhichEachSectionReachesLine(sections, view);
  let index = 0;
  reached.forEach((at, each) => {
    if (at <= view.scrolled + 1) index = each;
  });
  const from = reached[index];
  const to = reached[index + 1];
  if (to === undefined || to <= from) return index;
  return index + Math.min(1, Math.max(0, (view.scrolled - from) / (to - from)));
}
