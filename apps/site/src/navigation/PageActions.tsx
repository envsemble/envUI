import { Button } from '@envsemble/envui';
import { DisplayMenu } from '../display/DisplaySettings';
import type { Area, RoutePage } from '../routes/SiteRoutes';
import { otherPartRoute } from '../routes/Counterparts';
import { routeHref } from '../routes/Address';
import { keepSection, otherPart } from '../routes/OtherPart';

export function PageActions({ page, area }: { page?: RoutePage; area: Area }) {
  const { label, Icon } = otherPart(area);
  const href = routeHref(otherPartRoute(page, area));
  return (
    <div className="site-page-actions">
      <div className="site-page-actions-bar">
        <span className="site-wide-only">
          <Button variant="ghost" href={href} start={<Icon />} onClick={keepSection}>
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
