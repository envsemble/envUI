import { Button, IconButton, Tooltip } from '@envsemble/envui';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { Brand } from '../brand/Brand';
import { DisplayMenu } from '../display/DisplaySettings';
import { SearchButton } from '../search/SearchButton';
import type { Area, RoutePage } from '../routes/SiteRoutes';
import { otherPartRoute } from '../routes/Counterparts';
import { routeHref } from '../routes/Address';
import { keepSection, otherPart } from '../routes/OtherPart';

export function TopBar({
  page,
  area,
  onOpenNavigation,
  onSearch,
}: {
  page?: RoutePage;
  area: Area;
  onOpenNavigation: () => void;
  onSearch: () => void;
}) {
  const { label } = otherPart(area);
  const href = routeHref(otherPartRoute(page, area));
  return (
    <div className="site-top-bar">
      <span className="site-narrow-only">
        <Brand area={area} />
      </span>
      <div className="site-top-bar-end">
        <span className="site-narrow-only">
          <SearchButton iconOnly onClick={onSearch} />
          <Button variant="ghost" href={href} onClick={keepSection}>
            {label}
          </Button>
          <DisplayMenu iconOnly />
          <Tooltip content="Open navigation">
            <IconButton
              icon={<IconMenu />}
              aria-label="Open navigation"
              variant="ghost"
              onClick={onOpenNavigation}
            />
          </Tooltip>
        </span>
        <span className="site-wide-only">
          <SearchButton onClick={onSearch} />
          <Button variant="ghost" href={href} onClick={keepSection}>
            {label}
          </Button>
          <DisplayMenu />
        </span>
      </div>
    </div>
  );
}
