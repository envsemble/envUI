import { useEffect, useRef, useState, type ComponentProps, type PointerEvent } from 'react';
import {
  Badge,
  Button,
  IconButton,
  NavigationDrawer,
  Link,
  NavigationRail,
  type Destination,
  type NavigationDrawerDestination,
} from '@envsemble/envui';
import { IconClose } from '@envsemble/envui/icons/Close';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconPattern } from '@envsemble/envui/icons/Pattern';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { version } from '../../../../packages/ui/package.json';
import { EnvUIDocsLogo } from '../brand/EnvUIDocsLogo';
import { EnvUILogo } from '../brand/EnvUILogo';
import { SearchButton } from '../search/SearchButton';
import { DisplayMenu } from '../theme/DisplaySettings';
import { drawerWidthKey } from '../theme/DisplayStorage';
import type { PageMember } from '../shared/DocumentationTypes';
import { pageBadge } from './PageBadges';
import {
  docsTree,
  otherPartRoute,
  pagesOf,
  sectionHome,
  catalogueSections,
  type Area,
  type DocsGroup,
  type RoutePage,
  type CatalogueSection,
} from './SiteRoutes';
import { docsRoute, homeRoute, routeHref } from './Address';
import { keepSection, otherPart } from './OtherPart';

/** The icon of each of the catalogue's destinations in its rail. */
const sectionIcons: Record<CatalogueSection, typeof IconHome> = {
  Overview: IconHome,
  Foundations: IconPalette,
  Components: IconWidgets,
  Patterns: IconPattern,
};

/** The catalogue's destinations, for its rail: each opens its first page. */
export function catalogueDestinations(current: string | undefined, onChoose?: () => void) {
  return catalogueSections.map((section): Destination => {
    const Icon = sectionIcons[section];
    return {
      label: section,
      href: routeHref(sectionHome(section).path),
      icon: <Icon />,
      current: section === current,
      onClick: onChoose,
    };
  });
}

/** The catalogue's destination a page is in, Overview for one outside the catalogue. */
export function catalogueSectionOf(page: RoutePage | undefined): CatalogueSection {
  return (page?.area === 'catalogue' ? page.section : 'Overview') as CatalogueSection;
}

/** The pages of one of the catalogue's destinations, in its drawer. */
const sectionPages = (section: CatalogueSection) =>
  pagesOf('catalogue').filter((entry) => entry.section === section);

/**
 * Whether the catalogue shows a page beside its rail alone, without the drawer: a wide window's
 * on a destination of one page, such as Overview, where the drawer would list that page alone.
 */
export const drawerless = (page: RoutePage | undefined) =>
  sectionPages(catalogueSectionOf(page)).length === 1;

/**
 * A page's link in a drawer, then a link to each component it documents besides its own, such as
 * IconButton after Button, at the heading of the page that shows it (`anchor`): entries of the
 * same list, set in from the page's by their address's fragment (Shell.css), which only they have.
 */
function withMembers(
  page: RoutePage,
  link: NavigationDrawerDestination,
  anchor: (member: PageMember) => string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
  return [
    link,
    ...(page.document?.members ?? []).map(
      (member): NavigationDrawerDestination => ({
        // Two can lead to one heading, such as NavigationRail and NavigationBar.
        id: `${page.path} ${member.name}`,
        group: link.group,
        label: member.name,
        href: routeHref(`${page.path}?section=${anchor(member)}`),
        onClick: onChoose,
      }),
    ),
  ];
}

/**
 * The pages of one of the catalogue's destinations, for its drawer: its pages of no group, such as
 * All components, then each group, such as a kind of component or a pattern's intent, as a section
 * of its pages that opens and closes, open while it holds the current page, as in the Docs.
 */
export function pageDestinations(
  pages: readonly RoutePage[],
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
  const link = (page: RoutePage) =>
    withMembers(
      page,
      {
        label: page.label ?? page.title,
        href: routeHref(page.path),
        current: page.path === currentPath,
        onClick: onChoose,
      },
      (member) => member.catalogue ?? 'overview',
      onChoose,
    );
  const groups = new Map<string, RoutePage[]>();
  for (const page of pages)
    if (page.group) groups.set(page.group, [...(groups.get(page.group) ?? []), page]);
  return [
    ...pages.filter((page) => !page.group).flatMap(link),
    ...[...groups].map(
      ([label, members]): NavigationDrawerDestination => ({
        label,
        children: members.flatMap(link),
      }),
    ),
  ];
}

/**
 * Scrolls the drawer's list as the navigation mounts so the current page's link shows, as on a page
 * deep in it, rather than at its foot. The list starts where nothing is cut short under its faded
 * top edge (Shell.css): at the heading of the link's group, such as Components, clear of the fade,
 * where that leaves the link in the upper two thirds of the list; else at a whole row, with the
 * link a third of the way down. A link already in view leaves the list where it is.
 */
function useCurrentInView() {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const link = element.current?.querySelector<HTMLElement>(
      '.env-navigation-drawer [aria-current="page"]',
    );
    const list = link?.closest<HTMLElement>('.env-navigation-drawer-list');
    if (!link || !list) return;
    const frame = list.getBoundingClientRect();
    const top = link.getBoundingClientRect().top - frame.top;
    if (top >= 0 && top + link.offsetHeight <= list.clientHeight) return;
    // Where an element starts in the list's content, whatever it is scrolled to.
    const at = (item: Element) => item.getBoundingClientRect().top - frame.top + list.scrollTop;
    const linkAt = at(link);
    const fade = parseFloat(getComputedStyle(list).getPropertyValue('--site-drawer-fade-length'));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const clear = (fade || 0) * rem;
    const heading = link
      .closest('.env-navigation-drawer-section')
      ?.querySelector('.env-navigation-drawer-group-label');
    if (heading && linkAt - (at(heading) - clear) <= (list.clientHeight * 2) / 3) {
      list.scrollTop = at(heading) - clear;
      return;
    }
    const target = linkAt - list.clientHeight / 3;
    // The rows that show, those of a closed section laid out nowhere, and that the list can scroll
    // to the top of: near its end, the last whole rows show at its foot instead.
    const end = list.scrollHeight - list.clientHeight;
    const rows = [...list.querySelectorAll('.env-navigation-drawer-item')]
      .filter((row) => row.checkVisibility())
      .map(at)
      .filter((row) => row <= end);
    list.scrollTop = rows.reduce(
      (best, row) => (Math.abs(row - target) < Math.abs(best - target) ? row : best),
      Infinity,
    );
  }, []);
  return element;
}

/**
 * The badge after a page's name in the Docs' navigation, such as Alpha or New, from its
 * frontmatter, a guide's status included, and the package's version (PageBadges.ts); nothing for
 * most pages.
 */
function PageBadgeOf({ page }: { page: RoutePage }) {
  const document = page.document;
  const metadata = document?.metadata ?? (document?.status && { status: document.status });
  const badge = metadata && pageBadge(metadata, version);
  return badge ? <Badge tone={badge.tone}>{badge.label}</Badge> : null;
}

/**
 * The Docs' navigation: each section, such as Get started or Components, as a group under its
 * heading, its pages, then its groups, such as the kinds of component and the patterns' intents,
 * each a section of their pages that opens and closes, open while it holds the current page. A
 * section that is one page of its name, such as Changelog, is that page alone, under no heading.
 */
export function docsDestinations(
  currentPath: string,
  onChoose?: () => void,
): NavigationDrawerDestination[] {
  const link = (page: RoutePage, group?: string) =>
    withMembers(
      page,
      {
        group,
        label: page.label ?? page.title,
        badge: <PageBadgeOf page={page} />,
        href: routeHref(page.path),
        current: page.path === currentPath,
        onClick: onChoose,
      },
      (member) => member.docs,
      onChoose,
    );
  const lone = (section: DocsGroup) =>
    !section.groups.length &&
    section.pages.length === 1 &&
    section.pages[0]!.title === section.label;
  return docsTree.flatMap((section) => [
    ...section.pages.flatMap((page) => link(page, lone(section) ? undefined : section.label)),
    ...section.groups.map(
      (group): NavigationDrawerDestination => ({
        group: section.label,
        label: group.label,
        children: group.pages.flatMap((page) => link(page)),
      }),
    ),
  ]);
}

/**
 * Each part's drawer at the start of a wide window: the width it starts at and its bounds, in rem.
 * The Docs' drawer holds the wordmark and search on its first row, so it starts wider.
 */
const drawerWidths: Record<Area, { defaultWidth: number; minWidth: number; maxWidth: number }> = {
  catalogue: { defaultWidth: 16, minWidth: 13, maxWidth: 24 },
  docs: { defaultWidth: 21, minWidth: 18, maxWidth: 30 },
};

/** The width the reader gave the area's drawer on an earlier visit, within its bounds. */
function storedDrawerWidth(area: Area) {
  const { defaultWidth, minWidth, maxWidth } = drawerWidths[area];
  let stored: number | undefined;
  try {
    stored = Number.parseFloat(localStorage.getItem(drawerWidthKey(area)) ?? '');
  } catch {
    // Storage the browser refuses, as in some private windows, keeps the default.
  }
  return stored !== undefined && Number.isFinite(stored)
    ? Math.min(maxWidth, Math.max(minWidth, stored))
    : defaultWidth;
}

/**
 * The resizable drawer of a wide window, whose width the reader drags and the catalogue keeps for
 * the next visit; read before the first render, so nothing moves as the page loads. The drawer in
 * the sheet of a narrower window takes the sheet's width and isn't resizable.
 */
function useDrawerWidth(
  area: Area,
  inSheet: boolean,
): Partial<ComponentProps<typeof NavigationDrawer>> {
  const [width, setWidth] = useState(() => storedDrawerWidth(area));
  if (inSheet) return {};
  return {
    resizable: true,
    ...drawerWidths[area],
    width,
    onWidthChange: (next, { committed }) => {
      setWidth(next);
      if (!committed) return;
      try {
        localStorage.setItem(drawerWidthKey(area), String(next));
      } catch {
        // The width holds for this visit only.
      }
    },
  };
}

/**
 * A part's NavigationDrawer, with the width the reader drags (useDrawerWidth) kept here, so a drag
 * renders the drawer alone on each move, not the navigation around it, whose destinations stay the
 * same array and leave the drawer's rows as they are.
 */
function SiteDrawer({
  area,
  inSheet,
  ...props
}: { area: Area; inSheet: boolean } & ComponentProps<typeof NavigationDrawer>) {
  const drawerWidth = useDrawerWidth(area, inSheet);
  // The sheet's drawer isn't resizable, so its labels would wrap, breaking a long name such as
  // ThemeMenuRadioGroup mid-word: they keep to one line there too (Shell.css), and one cut short
  // with an ellipsis gives its full name as its title as the pointer reaches it.
  return (
    <NavigationDrawer
      {...props}
      {...drawerWidth}
      onPointerOver={inSheet ? titleCutLabel : undefined}
    />
  );
}

/** Gives a drawer label cut short with an ellipsis its full name as its title. */
function titleCutLabel(event: PointerEvent<HTMLElement>) {
  const label = (event.target as Element).closest<HTMLElement>('.env-navigation-drawer-label');
  if (!label) return;
  if (label.scrollWidth > label.clientWidth) label.title = label.textContent ?? '';
  else label.removeAttribute('title');
}

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

/** The envUI wordmark, which leads to the area's home, and the envUI Docs lockup in the Docs. */
export function Brand({ area }: { area: Area }) {
  return (
    <Link
      href={routeHref(area === 'docs' ? docsRoute : homeRoute)}
      underline={false}
      className="site-brand"
      aria-label={area === 'docs' ? 'envUI Docs home' : 'envUI home'}
    >
      {area === 'docs' ? <EnvUIDocsLogo className="docs-brand-docs" /> : <EnvUILogo />}
    </Link>
  );
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
  return (
    <div ref={element} className="site-navigation" data-in-sheet={inSheet || undefined}>
      <NavigationRail
        aria-label="Catalogue"
        className="catalogue-rail"
        header={<Brand area="catalogue" />}
        destinations={catalogueDestinations(page?.area === 'catalogue' ? section : undefined)}
      />
      {(inSheet || pages.length > 1) && (
        <SiteDrawer
          area="catalogue"
          inSheet={inSheet}
          aria-label={section}
          className="site-sidebar"
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
          destinations={pageDestinations(pages, routePath, onChoose)}
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
