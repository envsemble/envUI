import { Button } from '@envsemble/envui';
import { IconCode } from '@envsemble/envui/icons/Code';
import { IconMenuBook } from '@envsemble/envui/icons/MenuBook';
import { routeHref } from './Address';
import { counterpartOf, type Area, type RoutePage } from './SiteRoutes';

/**
 * The other part from a page of one, by its name and icon: the Docs, in code, from the catalogue,
 * and the catalogue from the Docs.
 */
export function otherPart(area: Area) {
  return area === 'docs'
    ? { label: 'Catalogue', Icon: IconMenuBook }
    : { label: 'Docs', Icon: IconCode };
}

/**
 * The button in a page's banner that leads to the page of the same subject in the other part: Docs
 * on a component's, pattern's or foundation's page in the catalogue, and Catalogue on its page
 * in the Docs. A page without one shows none.
 */
export function OtherPartButton({ page }: { page: RoutePage }) {
  const route = counterpartOf(page);
  if (!route) return null;
  const { label, Icon } = otherPart(page.area);
  return (
    <Button
      variant="secondary"
      size="sm"
      href={routeHref(route)}
      startIcon={<Icon />}
      className="site-other-part-link"
    >
      {label}
    </Button>
  );
}
