import { IconButton, NavigationRail } from '@envsemble/envui';
import { IconClose } from '@envsemble/envui/icons/Close';
import { Brand } from '../brand/Brand';
import { SearchButton } from '../search/SearchButton';
import type { RoutePage } from '../routes/SiteRoutes';
import {
  catalogueDestinations,
  catalogueSectionOf,
  pageDestinations,
  sectionPages,
} from './CatalogueDestinations';
import { docsDestinations } from './DocsDestinations';
import { SiteDrawer } from './SiteDrawer';
import { useCurrentInView } from './useCurrentInView';
import { useDrawerMotion } from './useDrawerMotion';

interface NavigationProps {
  page?: RoutePage;
  routePath: string;
  inSheet?: boolean;
  onChoose?: () => void;
  onSearch: () => void;
  onClose?: () => void;
}

function CloseSheet({ onClose }: { onClose?: () => void }) {
  if (!onClose) return null;
  return (
    <IconButton
      variant="ghost"
      icon={<IconClose />}
      aria-label="Close navigation"
      onClick={onClose}
      className="site-sheet-close"
    />
  );
}

export function CatalogueNavigation({
  page,
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
  onClose,
}: NavigationProps) {
  const element = useCurrentInView();
  const section = catalogueSectionOf(page);
  const pages = sectionPages(section);
  const drawer = useDrawerMotion(element, inSheet || pages.length > 1, section, routePath);
  const drawerLeaving = drawer.motion === 'leaving' || undefined;
  return (
    <div ref={element} className="site-navigation" data-in-sheet={inSheet || undefined}>
      <NavigationRail
        aria-label="Catalogue"
        className="catalogue-rail"
        header={<Brand area="catalogue" />}
        destinations={catalogueDestinations(page?.area === 'catalogue' ? section : undefined)}
      />
      {drawer.drawn && (
        <SiteDrawer
          area="catalogue"
          inSheet={inSheet}
          aria-label={drawer.drawn.section}
          className="site-sidebar"
          data-site-drawer={drawer.motion}
          inert={drawerLeaving}
          aria-hidden={drawerLeaving}
          header={
            inSheet ? (
              <div className="site-drawer-top">
                <SearchButton onClick={onSearch} className="site-drawer-search" />
                <CloseSheet onClose={onClose} />
              </div>
            ) : undefined
          }
          destinations={pageDestinations(
            sectionPages(drawer.drawn.section),
            drawer.drawn.routePath,
            onChoose,
          )}
        />
      )}
    </div>
  );
}

export function DocsNavigation({
  routePath,
  inSheet = false,
  onChoose,
  onSearch,
  onClose,
}: NavigationProps) {
  const element = useCurrentInView();
  return (
    <div ref={element} className="site-navigation" data-in-sheet={inSheet || undefined}>
      <SiteDrawer
        area="docs"
        inSheet={inSheet}
        aria-label="Docs"
        className="site-sidebar"
        header={
          <div className="docs-drawer-top">
            {inSheet ? (
              <>
                <div className="site-drawer-top">
                  <Brand area="docs" />
                  <CloseSheet onClose={onClose} />
                </div>
                <SearchButton onClick={onSearch} className="site-drawer-search" />
              </>
            ) : (
              <Brand area="docs" />
            )}
          </div>
        }
        destinations={docsDestinations(routePath, onChoose)}
      />
    </div>
  );
}
