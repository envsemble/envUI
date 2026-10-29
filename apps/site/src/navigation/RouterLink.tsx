import type { LinkComponentProps } from '@envsemble/envui';
import { navigate, routeOfLink } from './Address';
import { findPage, normalizeRoute } from './SiteRoutes';
import { preloadPage } from '../pages/PreloadPage';

/** Starts loading what the page a link leads to needs, as a press on it is coming. */
function preload(href: string | undefined) {
  const route = href === undefined ? undefined : routeOfLink(href);
  if (route !== undefined)
    void preloadPage(findPage(normalizeRoute(route || 'overview').split('?')[0]!));
}

/**
 * The anchor of every envUI destination on the site, through LinkProvider. A plain press on a link
 * to one of its pages, the catalogue's or the Docs', shows the page without loading the site again; a
 * press with a modifier and a link to a file or another site behave as anchors do. An example's
 * links, which a preview keeps from navigating, stay in place. A pointer over a link, or a press
 * starting on it, starts loading its page's content.
 */
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
        if ((props.target && props.target !== '_self') || props.download !== undefined) return;
        const route = routeOfLink(props.href);
        if (route === undefined) return;
        event.preventDefault();
        navigate(normalizeRoute(route || 'overview'));
      }}
    />
  );
}
