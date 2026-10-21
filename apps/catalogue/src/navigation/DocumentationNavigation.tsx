import { Drawer, Link, SearchTrigger, type DrawerDestination } from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { RocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { Article } from '@envsemble/envui/icons/Article';
import { Token } from '@envsemble/envui/icons/Token';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Handyman } from '@envsemble/envui/icons/Handyman';
import { History } from '@envsemble/envui/icons/History';
import { references, foundations, componentGroups } from '../Reference';
import {
  changelogPage,
  guidePages,
  pageHref,
  pagesOf,
  referencePages,
  tokensPage,
  type ReferencePage,
} from './DocumentationRoutes';
import { homeRoute, routeHref } from './Address';
import { foundationIcons, getComponentIcon } from './TopicIcons';

/** The pattern pages in the order of the index, which lists the patterns by intent. */
const patternPages = guidePages.filter((page) => page.section === 'Patterns');

interface NavigationProps {
  routePath: string;
  page?: ReferencePage;
}

/**
 * The catalogue's destinations, one group per section of the site, in order: Get started,
 * Foundations, Components, Patterns, Contributing and Changelog. Drawer has one level of
 * groups, so the kinds of components and the intents of patterns fold into their sections, in the
 * order the index gives them; the overview lists them by kind. `onChoose` runs as a destination is
 * followed, such as to close the sheet the navigation sits in.
 */
export function documentationDestinations(
  { routePath, page }: NavigationProps,
  onChoose?: () => void,
): DrawerDestination[] {
  const reference = page?.reference;
  const destination = (
    group: string,
    label: string,
    href: string,
    icon: DrawerDestination['icon'],
    current: boolean,
  ): DrawerDestination => ({ group, label, href, icon, current, onSelect: onChoose });
  const pages = (
    group: string,
    list: readonly { path: string; title: string }[],
    icon: () => DrawerDestination['icon'],
  ) =>
    list.map(({ path, title }) =>
      destination(group, title, routeHref(path), icon(), routePath === path),
    );
  return [
    destination(
      'Get started',
      'Overview',
      routeHref(homeRoute),
      <Home />,
      routePath === 'overview/components',
    ),
    destination(
      'Get started',
      'Install and set up',
      routeHref('overview/get-started'),
      <RocketLaunch />,
      routePath === 'overview/get-started',
    ),
    ...pages('Get started', pagesOf('Get started'), () => <Article />),
    ...foundations.map((foundation) => {
      const Icon = foundationIcons[foundation.id] ?? Category;
      return destination(
        'Foundations',
        foundation.title,
        pageHref(referencePages.find((entry) => entry.reference === foundation)!),
        <Icon />,
        page?.section === 'Foundations' && reference?.id === foundation.id,
      );
    }),
    ...pages('Foundations', [tokensPage], () => <Token />),
    ...componentGroups.flatMap((kind) =>
      references
        .filter((component) => component.group === kind)
        .map((component) => {
          const Icon = getComponentIcon(component.group);
          return destination(
            'Components',
            component.title,
            pageHref(referencePages.find((entry) => entry.reference === component)!),
            <Icon />,
            reference?.id === component.id,
          );
        }),
    ),
    ...pages('Patterns', patternPages, () => <Pattern />),
    ...pages('Contributing', pagesOf('Contributing'), () => <Handyman />),
    ...pages('Changelog', [changelogPage], () => <History />),
  ];
}

/** The envUI wordmark, which leads to the overview. */
function Brand() {
  return (
    <Link
      href={routeHref(homeRoute)}
      underline={false}
      className="docs-brand-link"
      aria-label="envUI overview"
    >
      <EnvUILogo />
    </Link>
  );
}

/**
 * The catalogue's navigation: a Drawer with the wordmark and search above the destinations. The
 * frame shows it at the start of an expanded window, and in a sheet that the top bar opens in a
 * narrower one, where choosing a destination closes the sheet.
 */
export function DocumentationNavigation({
  routePath,
  page,
  onSearch,
  inSheet = false,
  onChoose,
}: NavigationProps & { onSearch: () => void; inSheet?: boolean; onChoose?: () => void }) {
  return (
    <Drawer
      aria-label="Documentation"
      className="docs-sidebar"
      data-in-sheet={inSheet || undefined}
      destinations={documentationDestinations({ routePath, page }, onChoose)}
      header={
        <>
          {!inSheet && <Brand />}
          <SearchTrigger fullWidth onClick={onSearch} className="docs-sidebar-search" />
        </>
      }
    />
  );
}
