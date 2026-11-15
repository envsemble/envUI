import { docsRoute, homeRoute } from './Address';
import {
  componentDocsRoute,
  findPage,
  foundationDocsRoute,
  pagesOf,
  type Area,
  type PageKind,
  type RoutePage,
} from './SiteRoutes';

const docsRouteOf: Partial<Record<PageKind, (id: string) => string>> = {
  component: componentDocsRoute,
  foundation: foundationDocsRoute,
};

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

export const counterpartOf = (page: RoutePage) => counterparts.get(page.path);

export function otherPartRoute(page: RoutePage | undefined, area: Area) {
  return (page && counterpartOf(page)) ?? (area === 'docs' ? homeRoute : docsRoute);
}
