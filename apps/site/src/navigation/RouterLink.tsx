import type { LinkComponentProps } from '@envsemble/envui';
import { navigate, routeOfLink } from './Address';
import { normalizeRoute } from './SiteRoutes';

/**
 * The anchor of every envUI destination on the site, through LinkProvider. A plain press on a link
 * to one of its pages, the catalogue's or the Docs', shows the page without loading the site again; a
 * press with a modifier and a link to a file or another site behave as anchors do. An example's
 * links, which a preview keeps from navigating, stay in place.
 */
export function RouterLink({ onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
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
