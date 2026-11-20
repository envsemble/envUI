import { useEffect } from 'react';
import { Pager } from '@envsemble/envui';
import { IconArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { pagesOf, type RoutePage } from '../routes/SiteRoutes';
import { routeHref } from '../routes/Address';
import { preloadPageContent } from '../pages/PageLoading';

const idleFallbackDelayMs = 500;

function usePreloadNeighbours(previous: RoutePage | undefined, next: RoutePage | undefined) {
  useEffect(() => {
    let idle = 0;
    const load = () => {
      void preloadPageContent(previous);
      void preloadPageContent(next);
    };
    const idleSupported = typeof window.requestIdleCallback === 'function';
    const preload = () => {
      idle = idleSupported
        ? requestIdleCallback(load)
        : window.setTimeout(load, idleFallbackDelayMs);
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
        <Pager.Previous href={routeHref(previous.path)} start={<IconArrowBack />}>
          {previous.title}
        </Pager.Previous>
      )}
      {next && (
        <Pager.Next href={routeHref(next.path)} end={<IconArrowForward />}>
          {next.title}
        </Pager.Next>
      )}
    </Pager.Root>
  );
}
