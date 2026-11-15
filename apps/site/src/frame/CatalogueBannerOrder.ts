import { pagesOf, type RoutePage } from '../routes/SiteRoutes';

export const bannerSubject = (page: RoutePage) => page.document?.id ?? page.path;

const cataloguePlaces = new Map(
  pagesOf('catalogue').map((page, index) => [bannerSubject(page), index]),
);

export const bannerDrawingIndex = (subject: string | undefined, drawings: number) =>
  ((subject === undefined ? undefined : cataloguePlaces.get(subject)) ?? 0) % drawings;
