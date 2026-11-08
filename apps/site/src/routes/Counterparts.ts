import { docsRoute, homeRoute } from './Address';
import {
  componentDocsRoute,
  findPage,
  foundationDocsRoute,
  pagesOf,
  patternDocsRoute,
  type Area,
  type PageKind,
  type RoutePage,
} from './SiteRoutes';

/** The route of the Docs' page of a subject the catalogue shows, by the kind of its page there. */
const docsRouteOf: Partial<Record<PageKind, (id: string) => string>> = {
  component: componentDocsRoute,
  pattern: patternDocsRoute,
  foundation: foundationDocsRoute,
};

/**
 * The pages of one subject in the two parts, each the other's counterpart, by their paths: a
 * component's, pattern's or foundation's page in the catalogue and its page in the Docs.
 */
const pairs = pagesOf('catalogue')
  .flatMap(({ path, kind, document }): [string, string][] => {
    const docs = document && docsRouteOf[kind];
    return docs ? [[path, docs(document.id)]] : [];
  })
  .filter(([catalogue, docs]) => findPage(catalogue) && findPage(docs));
const counterparts = new Map(
  pairs.flatMap(([catalogue, docs]) => [
    [catalogue, docs],
    [docs, catalogue],
  ]),
);

/** The path of the page of the same subject in the other part, if the page has one. */
export const counterpartOf = (page: RoutePage) => counterparts.get(page.path);

/**
 * Where a way to the other part leads from a page, such as the switch at its top end: the page of
 * the same subject there, or, from a page without one, the other part's start: the Docs' home from
 * the catalogue, such as from its Overview or a gallery, and the catalogue's Overview from the
 * Docs, such as from a guide or the changelog.
 */
export function otherPartRoute(page: RoutePage | undefined, area: Area) {
  return (page && counterpartOf(page)) ?? (area === 'docs' ? homeRoute : docsRoute);
}
