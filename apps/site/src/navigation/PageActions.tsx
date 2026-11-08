import { Button } from '@envsemble/envui';
import { DisplayMenu } from '../theme/DisplaySettings';
import type { Area, RoutePage } from './SiteRoutes';
import { otherPartRoute } from './Counterparts';
import { routeHref } from './Address';
import { keepSection, otherPart } from './OtherPart';

/**
 * The page's own controls at its top end, quiet ghost buttons that stay in the corner as the page
 * scrolls, on a small pill of the page's color: the other part, the Docs from the catalogue and
 * the catalogue from the Docs, and the Display menu, where the theme, contrast, scale and motion
 * are: the same two on every page of a part. The other part leads to the page of the same subject
 * there, where there is one, else to that part's start (otherPartRoute); a page with one also has
 * the Design | Code switch in its banner (PartSwitch), its own way across. Below an expanded
 * window the other part keeps its name, without its icon, and Display is an icon button with a
 * tooltip.
 */
export function PageActions({ page, area }: { page?: RoutePage; area: Area }) {
  const { label, Icon } = otherPart(area);
  const href = routeHref(otherPartRoute(page, area));
  return (
    <div className="site-page-actions">
      <div className="site-page-actions-bar">
        <span className="site-wide-only">
          <Button variant="ghost" href={href} startIcon={<Icon />} onClick={keepSection}>
            {label}
          </Button>
          <DisplayMenu />
        </span>
        <span className="site-narrow-only">
          <Button variant="ghost" href={href} onClick={keepSection}>
            {label}
          </Button>
          <DisplayMenu iconOnly />
        </span>
      </div>
    </div>
  );
}
