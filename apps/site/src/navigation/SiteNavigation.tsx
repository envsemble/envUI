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
  /** The page shown, whose destination and page the navigation marks as current. */
  page?: RoutePage;
  /** The route's path, such as components/button. */
  routePath: string;
  /** Whether the navigation is in the sheet of a narrower window. */
  inSheet?: boolean;
  /** Runs as a page is chosen, such as to close the sheet the navigation sits in. */
  onChoose?: () => void;
  /** Opens search. */
  onSearch: () => void;
  /** Closes the sheet the navigation sits in, from its button on the wordmark's row. */
  onClose?: () => void;
}

/** The sheet's close button, at the end of the navigation's first row, the wordmark's. */
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

/**
 * The catalogue's navigation, one pane: a NavigationRail of its destinations, Overview, Foundations,
 * Components and Patterns, under the envUI wordmark, beside a NavigationDrawer of the chosen
 * destination's pages under search, both on the navigation's background with no seam or line
 * between them. A destination of one page, such as Overview, has no drawer in a wide window: the
 * rail stands alone, the page takes the width, and search is at the page's top start (App.tsx).
 * A rail item opens its destination's first page; in the sheet of a narrower window it leaves the
 * sheet open, so a page can be chosen.
 */
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
          // On its way out it is a picture of what was there, which nothing reaches.
          inert={drawer.motion === 'leaving' || undefined}
          aria-hidden={drawer.motion === 'leaving' || undefined}
          header={
            onClose ? (
              <div className="site-drawer-top">
                <SearchButton onClick={onSearch} className="site-drawer-search" />
                <CloseSheet onClose={onClose} />
              </div>
            ) : (
              <SearchButton onClick={onSearch} className="site-drawer-search" />
            )
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

/**
 * The Docs' navigation: a NavigationDrawer of every page of the Docs, as a tree of their sections and groups
 * (docsDestinations), with the wordmark and search side by side at its top, or in the sheet, which
 * is narrower, the wordmark and the sheet's close button, and search under them.
 */
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
            {onClose ? (
              <div className="site-drawer-top">
                <Brand area="docs" />
                <CloseSheet onClose={onClose} />
              </div>
            ) : (
              <Brand area="docs" />
            )}
            <SearchButton onClick={onSearch} className="site-drawer-search" />
          </div>
        }
        destinations={docsDestinations(routePath, onChoose)}
      />
    </div>
  );
}
