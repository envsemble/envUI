import { pagesOf, type RoutePage } from '../navigation/SiteRoutes';

/** What a catalogue page's banner is drawn for: its document's id, or its path, such as components. */
export const bannerSubject = (page: RoutePage) => page.document?.id ?? page.path;

/**
 * Each catalogue page's place in the catalogue's order, the order of its sidebar and galleries:
 * the foundations, then the components by group, then the patterns.
 */
const places = new Map(pagesOf('catalogue').map((page, index) => [bannerSubject(page), index]));

/**
 * The drawing of a catalogue page's banner, from its place in the catalogue's order, as an index
 * into drawings that take turns: pages next to each other never share one, none recurs before every
 * other has shown, and a page always shows the same. A page outside the order, such as a missing
 * page's, takes the first.
 */
export const bannerDrawingIndex = (subject: string | undefined, drawings: number) =>
  ((subject === undefined ? undefined : places.get(subject)) ?? 0) % drawings;
