import { Fragment, useId, type ReactNode } from 'react';
import { version } from '@envsemble/envui/package.json';
import { Button, EnvUILogo, Kbd, Link, NavList, Stack, Text } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';
import { RocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { Article } from '@envsemble/envui/icons/Article';
import { Token } from '@envsemble/envui/icons/Token';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { ViewQuilt } from '@envsemble/envui/icons/ViewQuilt';
import { Handyman } from '@envsemble/envui/icons/Handyman';
import { History } from '@envsemble/envui/icons/History';
import { Search } from '@envsemble/envui/icons/Search';
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
import { commandKey } from '../search/DocumentationSearch';

/** The button that opens search, with its shortcut. */
export function SearchButton({ onSearch }: { onSearch: () => void }) {
  return (
    <Button
      variant="secondary"
      className="docs-search-button"
      startIcon={<Search />}
      aria-keyshortcuts="Control+K Meta+K"
      onClick={onSearch}
    >
      Search
      <Kbd keys={[commandKey, 'K']} className="docs-search-shortcut" aria-hidden="true" />
    </Button>
  );
}

/**
 * The catalogue's navigation, by section: Get started, Foundations, Components, Patterns,
 * Templates, Contributing and Changelog, with search above.
 */
export function Sidebar({
  routePath,
  page,
  panel = false,
  onNavigate,
  onSearch,
}: {
  routePath: string;
  page?: ReferencePage;
  panel?: boolean;
  onNavigate?: () => void;
  onSearch: () => void;
}) {
  const reference = page?.reference;
  const headingId = useId();
  const item = (path: string, title: string, icon: ReactNode) => (
    <NavList.Item key={path} href={routeHref(path)} selected={routePath === path} icon={icon}>
      {title}
    </NavList.Item>
  );
  /** A section of the navigation: its heading, and a list of its pages named by it. */
  const section = (title: SiteSection, children: ReactNode) => {
    const id = `${headingId}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <Fragment key={title}>
        <Text variant="section-heading" id={id} className="docs-nav-heading">
          {title}
        </Text>
        <NavList.Root aria-labelledby={id}>{children}</NavList.Root>
      </Fragment>
    );
  };
  return (
    <aside
      className={panel ? 'docs-navigation-panel' : 'docs-sidebar'}
      onClick={(event) => {
        if ((event.target as Element).closest('a[href]')) onNavigate?.();
      }}
    >
      <Link
        href={routeHref(homeRoute)}
        underline={false}
        className="docs-brand-link"
        aria-label="envUI overview"
      >
        <EnvUILogo />
      </Link>
      <SearchButton onSearch={onSearch} />
      <nav aria-label="Documentation" className="docs-sidebar-navigation">
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
                      href={pageHref(
                        referencePages.find((entry) => entry.reference === component)!,
                      )}
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
        {section('Templates', item(templatesPage.path, 'Page templates', <ViewQuilt />))}
        {section(
          'Contributing',
          pagesOf('Contributing').map(({ path, title }) => item(path, title, <Handyman />)),
        )}
        {section('Changelog', item(changelogPage.path, 'Release notes', <History />))}
      </nav>
      <Stack gap={3} align="start" className="docs-sidebar-footer">
        <Text variant="caption">
          envUI · {version}
          <br />
          Internal reference
        </Text>
      </Stack>
    </aside>
  );
}
