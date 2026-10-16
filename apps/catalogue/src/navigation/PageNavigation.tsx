import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import {
  documentationPages,
  findReferencePage,
  viewFor,
  type ReferenceView,
} from './DocumentationRoutes';
import { routeHref } from './Address';

export function PageNavigation({ path, view }: { path: string; view: ReferenceView }) {
  const index = documentationPages.findIndex((page) => page.path === path);
  if (index === -1) return null;
  const previous = documentationPages[index - 1];
  const next = documentationPages[index + 1];
  // A page with views opens in the one closest to this page's; a page with one view as it is.
  const destination = (path: string) => {
    if (path === 'overview')
      return `overview/${view === 'usage' || view === 'guidelines' ? 'get-started' : 'components'}`;
    const reference = findReferencePage(path)?.reference;
    return reference ? `${path}/${viewFor(reference, view)}` : path;
  };
  return (
    <Pager.Root
      className="docs-page-navigation"
      previous={
        previous && {
          href: routeHref(destination(previous.path)),
          children: previous.title,
          icon: <ArrowBack />,
        }
      }
      next={
        next && {
          href: routeHref(destination(next.path)),
          children: next.title,
          icon: <ArrowForward />,
        }
      }
    />
  );
}
