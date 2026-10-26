import { Pager } from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { pagesOf, type RoutePage } from './SiteRoutes';
import { routeHref } from './Address';

/** The previous and next pages of the page's part, the catalogue or the Docs, in reading order. */
export function PageNavigation({ page }: { page: RoutePage }) {
  const pages = pagesOf(page.area);
  const index = pages.indexOf(page);
  if (index === -1) return null;
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <Pager.Root
      className="site-page-navigation"
      previous={
        previous && {
          href: routeHref(previous.path),
          children: previous.title,
          icon: <ArrowBack />,
        }
      }
      next={
        next && {
          href: routeHref(next.path),
          children: next.title,
          icon: <ArrowForward />,
        }
      }
    />
  );
}
