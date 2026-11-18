import { useSyncExternalStore } from 'react';
import type { LinkComponentProps } from '@envsemble/envui';
import { navigate, routeOfLink } from '../routes/Address';
import { findPage } from '../routes/SiteRoutes';
import { normalizeRoute } from '../routes/OldAddresses';
import { pageLoaded, preloadPage } from '../pages/PageLoading';

const pageOfRoute = (route: string) => findPage(route.split('?')[0]);

function preload(href: string | undefined) {
  const route = href === undefined ? undefined : routeOfLink(href);
  if (route !== undefined) void preloadPage(pageOfRoute(normalizeRoute(route || 'overview')));
}

let latestPress = 0;

let pendingRoute: string | undefined;
const pendingListeners = new Set<() => void>();
function setPendingRoute(route: string | undefined) {
  if (pendingRoute === route) return;
  pendingRoute = route;
  for (const listener of pendingListeners) listener();
}
const subscribePending = (listener: () => void) => {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
};

export const usePendingRoute = () =>
  useSyncExternalStore(
    subscribePending,
    () => pendingRoute,
    () => undefined,
  );

export function RouterLink({
  onClick,
  onPointerEnter,
  onPointerDown,
  ...props
}: LinkComponentProps) {
  return (
    <a
      {...props}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === 'mouse') preload(props.href);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        preload(props.href);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const opensElsewhere =
          (props.target && props.target !== '_self') || props.download !== undefined;
        if (opensElsewhere) return;
        const route = routeOfLink(props.href);
        if (route === undefined) return;
        event.preventDefault();
        const target = normalizeRoute(route || 'overview');
        const page = pageOfRoute(target);
        const press = ++latestPress;
        if (pageLoaded(page)) {
          setPendingRoute(undefined);
          navigate(target);
        } else {
          setPendingRoute(target);
          void preloadPage(page).then(() => {
            if (press !== latestPress) return;
            navigate(target);
            setPendingRoute(undefined);
          });
        }
      }}
    />
  );
}
