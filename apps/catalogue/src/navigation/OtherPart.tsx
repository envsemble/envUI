import { Button } from '@envsemble/envui';
import { Code } from '@envsemble/envui/icons/Code';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { routeHref } from './Address';
import { counterpartOf, type Area, type RoutePage } from './DocumentationRoutes';

/**
 * The other part from a page of one, by its name and icon: the Docs, in code, from the Usage guide,
 * and the Usage guide from the Docs.
 */
export function otherPart(area: Area) {
  return area === 'docs' ? { label: 'Usage guide', Icon: MenuBook } : { label: 'Docs', Icon: Code };
}

/**
 * The button in a page's banner that leads to the page of the same subject in the other part: Docs
 * on a component's, pattern's or foundation's page in the Usage guide, and Usage guide on its page
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
      className="docs-other-part-link"
    >
      {label}
    </Button>
  );
}
