import type { ReactNode } from 'react';
import { version } from '@envsemble/envui/package.json';
import {
  Link,
  NavList,
  SearchTrigger,
  Sidebar,
  SidebarTrigger,
  Text,
  ThemeToggle,
  useSidebar,
} from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { RocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { Article } from '@envsemble/envui/icons/Article';
import { Token } from '@envsemble/envui/icons/Token';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { ViewQuilt } from '@envsemble/envui/icons/ViewQuilt';
import { Handyman } from '@envsemble/envui/icons/Handyman';
import { History } from '@envsemble/envui/icons/History';
import { references, foundations, componentGroups } from '../Reference';
import {
  changelogPage,
  pageHref,
  pagesOf,
  referencePages,
  templatesPage,
  tokensPage,
  type ReferencePage,
  type SiteSection,
} from './DocumentationRoutes';
import { homeRoute, routeHref } from './Address';
import { foundationIcons, getComponentIcon } from './TopicIcons';
import { DisplayMenu } from '../theme/DisplaySettings';

interface SectionsProps {
  routePath: string;
  page?: ReferencePage;
}

/**
 * The navigation's sections, in order: Get started, Foundations, Components, Patterns, Templates,
 * Contributing and Changelog. Each is a Sidebar.Group named by its title around a NavList.Root of
 * its pages, so a rail and the drawer name them too.
 */
function Sections({ routePath, page }: SectionsProps) {
  const reference = page?.reference;
  const item = (path: string, title: string, icon: ReactNode) => (
    <NavList.Item key={path} href={routeHref(path)} selected={routePath === path} icon={icon}>
      {title}
    </NavList.Item>
  );
  const section = (title: SiteSection, children: ReactNode) => (
    <Sidebar.Group key={title} label={title} className="docs-nav-section">
      <NavList.Root>{children}</NavList.Root>
    </Sidebar.Group>
  );
  return (
    <>
      {section(
        'Get started',
        <>
          <NavList.Item
            href={routeHref(homeRoute)}
            selected={routePath === 'overview/components'}
            icon={<Home />}
          >
            Overview
          </NavList.Item>
          <NavList.Item
            href={routeHref('overview/get-started')}
            selected={routePath === 'overview/get-started'}
            icon={<RocketLaunch />}
          >
            Install and set up
          </NavList.Item>
          {pagesOf('Get started').map(({ path, title }) => item(path, title, <Article />))}
        </>,
      )}
      {section(
        'Foundations',
        <>
          {foundations.map((foundation) => {
            const Icon = foundationIcons[foundation.id] ?? Category;
            return (
              <NavList.Item
                key={foundation.id}
                href={pageHref(referencePages.find((entry) => entry.reference === foundation)!)}
                selected={page?.section === 'Foundations' && reference?.id === foundation.id}
                icon={<Icon />}
              >
                {foundation.title}
              </NavList.Item>
            );
          })}
          {item(tokensPage.path, tokensPage.title, <Token />)}
        </>,
      )}
      {section(
        'Components',
        componentGroups.map((group) => (
          <NavList.Group key={group} label={group}>
            {references
              .filter((component) => component.group === group)
              .map((component) => {
                const Icon = getComponentIcon(component.group);
                return (
                  <NavList.Item
                    key={component.id}
                    href={pageHref(referencePages.find((entry) => entry.reference === component)!)}
                    selected={reference?.id === component.id}
                    icon={<Icon />}
                  >
                    {component.title}
                  </NavList.Item>
                );
              })}
          </NavList.Group>
        )),
      )}
      {section(
        'Patterns',
        pagesOf('Patterns').map(({ path, title }) => item(path, title, <Pattern />)),
      )}
      {section('Templates', item(templatesPage.path, templatesPage.title, <ViewQuilt />))}
      {section(
        'Contributing',
        pagesOf('Contributing').map(({ path, title }) => item(path, title, <Handyman />)),
      )}
      {section('Changelog', item(changelogPage.path, changelogPage.title, <History />))}
    </>
  );
}

/**
 * The navigation's top row: the envUI wordmark, which leads to the overview, and the trigger that
 * collapses the navigation to a rail. In the drawer the drawer's own close button stands in for
 * the trigger.
 */
function Header() {
  const { isMobile } = useSidebar();
  return (
    <Sidebar.Header className="docs-sidebar-header">
      <Link
        href={routeHref(homeRoute)}
        underline={false}
        className="docs-brand-link"
        aria-label="envUI overview"
      >
        <EnvUILogo />
      </Link>
      {!isMobile && <SidebarTrigger className="docs-sidebar-trigger" />}
    </Sidebar.Header>
  );
}

/** Search, at the top of the navigation: it closes the drawer before search opens over the page. */
function Search({ onSearch }: { onSearch: () => void }) {
  const { dismiss } = useSidebar();
  return (
    <SearchTrigger
      fullWidth
      onClick={() => {
        dismiss();
        onSearch();
      }}
    />
  );
}

/** The display settings, the theme and the version; a rail shows only their icons. */
function Footer() {
  const { isRail } = useSidebar();
  return (
    <Sidebar.Footer className="docs-sidebar-footer">
      <DisplayMenu iconOnly={isRail} />
      <ThemeToggle variant="ghost" />
      {!isRail && (
        <Text variant="caption" className="docs-sidebar-version">
          envUI · {version}
          <br />
          Internal reference
        </Text>
      )}
    </Sidebar.Footer>
  );
}

/**
 * The catalogue's navigation: the wordmark and search above, the sections, and the display
 * settings below. On a wide window it docks beside the page, at a width readers can change, or
 * collapses to a rail of icons that opens over the page; below 48 rem it is a drawer that the top
 * bar's trigger opens.
 */
export function DocumentationSidebar({
  routePath,
  page,
  onSearch,
}: SectionsProps & { onSearch: () => void }) {
  return (
    // 14.4 rem is the column the catalogue had at 1280 px, the width of its screenshots; readers can
    // widen it, and the frame remembers their width.
    <Sidebar.Root
      label="Documentation"
      width={14.4}
      resizable
      maxWidth={24}
      resizeLabel="Resize navigation"
      className="docs-sidebar"
    >
      <Header />
      <Sidebar.Content align="stretch" className="docs-sidebar-search">
        <Search onSearch={onSearch} />
      </Sidebar.Content>
      <Sidebar.Content className="docs-sidebar-navigation">
        <Sections routePath={routePath} page={page} />
      </Sidebar.Content>
      <Footer />
    </Sidebar.Root>
  );
}
