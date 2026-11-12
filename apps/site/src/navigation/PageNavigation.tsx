import { useEffect } from 'react';
import { Pager } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { pagesOf, type RoutePage } from '../routes/SiteRoutes';
import { routeHref } from '../routes/Address';
import { preloadPageContent } from '../pages/PageLoading';

/**
 * Starts loading what the previous and next pages need once the page has loaded and the browser is
 * idle, so following either shows it at once: two small files, in the order people read.
 */
function usePreloadNeighbours(previous: RoutePage | undefined, next: RoutePage | undefined) {
  useEffect(() => {
    let idle = 0;
    const load = () => {
      void preloadPageContent(previous);
      void preloadPageContent(next);
    };
    // Safari has no requestIdleCallback; there, a moment after the load.
    const idleSupported = typeof window.requestIdleCallback === 'function';
    const preload = () => {
      idle = idleSupported ? requestIdleCallback(load) : window.setTimeout(load, 500);
    };
    if (document.readyState === 'complete') preload();
    else addEventListener('load', preload, { once: true });
    return () => {
      removeEventListener('load', preload);
      if (idleSupported) cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [previous, next]);
}

/**
 * The previous and next pages of the page's part, the catalogue or the Docs, in reading order,
 * which load once the page is idle. The catalogue's home shows none: its Explore cards lead on.
 */
export function PageNavigation({ page }: { page: RoutePage }) {
  const pages = pagesOf(page.area);
  const index = pages.indexOf(page);
  const previous = index === -1 ? undefined : pages[index - 1];
  const next = index === -1 ? undefined : pages[index + 1];
  usePreloadNeighbours(previous, next);
  if (index === -1 || page.kind === 'home') return null;
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
