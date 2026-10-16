import type { LinkComponentProps } from '@envsemble/envui';
import { navigate, pathRoutes, routeOfLink } from './Address';
import { normalizeRoute } from './DocumentationRoutes';

/**
 * The anchor of every envUI destination in the catalogue, through LinkProvider. In the hosted
 * catalogue, a plain press on a link to one of its pages shows the page without loading the
 * catalogue again; a press with a modifier, a link to a file or another site, and every link of the
 * offline catalogue, whose routes are hashes, behave as anchors do. An example's links, which a
 * preview keeps from navigating, stay in place.
 */
export function RouterLink({ onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!pathRoutes || event.defaultPrevented || event.button !== 0) return;
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
