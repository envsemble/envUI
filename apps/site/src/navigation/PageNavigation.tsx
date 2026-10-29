import { Pager } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
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
    <Pager.Root className="site-page-navigation">
      {previous && (
        <Pager.Previous href={routeHref(previous.path)} icon={<IconArrowBack />}>
          {previous.title}
        </Pager.Previous>
      )}
      {next && (
        <Pager.Next href={routeHref(next.path)} icon={<IconArrowForward />}>
          {next.title}
        </Pager.Next>
      )}
    </Pager.Root>
  );
}
