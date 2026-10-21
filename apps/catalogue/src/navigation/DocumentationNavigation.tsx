import type { ReactNode } from 'react';
import { Column, Link, NavList, SearchTrigger, Text } from '@envsemble/envui';
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
  guidePages,
  pageHref,
  pagesOf,
  referencePages,
  tokensPage,
  type ReferencePage,
  type SiteSection,
} from './DocumentationRoutes';
import { homeRoute, routeHref } from './Address';
import { foundationIcons, getComponentIcon } from './TopicIcons';

/**
 * The pattern pages under one heading per intent, what people are doing, in the order of the index,
 * which lists the patterns by intent.
 */
const patternGroups = guidePages
  .filter((page) => page.section === 'Patterns')
  .reduce<{ intent: string; pages: { path: string; title: string }[] }[]>((groups, page) => {
    const intent = page.document?.metadata?.intent ?? 'Other patterns';
    const group = groups.find((entry) => entry.intent === intent);
    if (group) group.pages.push(page);
    else groups.push({ intent, pages: [page] });
    return groups;
  }, []);

interface SectionsProps {
  routePath: string;
  page?: ReferencePage;
}

/**
 * The navigation's sections, in order: Get started, Foundations, Components, Patterns, Templates,
 * Contributing and Changelog. Each is a section named by its heading around a NavList.Root of its
 * pages. Components are grouped by kind and patterns by intent; Templates lists the overview, then
 * each template page.
 */
function Sections({ routePath, page }: SectionsProps) {
  const reference = page?.reference;
  const item = (path: string, title: string, icon: ReactNode) => (
    <NavList.Item key={path} href={routeHref(path)} selected={routePath === path} icon={icon}>
      {title}
    </NavList.Item>
  );
  const section = (title: SiteSection, children: ReactNode) => (
    <Column
      key={title}
      gap={1}
      render={<section aria-label={title} />}
      className="docs-nav-section"
    >
      <Text variant="caption" emphasis="muted" render={<h2 className="docs-nav-heading" />}>
        {title}
      </Text>
      <NavList.Root>{children}</NavList.Root>
    </Column>
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
        patternGroups.map(({ intent, pages }) => (
          <NavList.Group key={intent} label={intent}>
            {pages.map(({ path, title }) => item(path, title, <Pattern />))}
          </NavList.Group>
        )),
      )}
      {section(
        'Templates',
        // The overview first, then the template pages it introduces.
        pagesOf('Templates').map(({ path, title }) => item(path, title, <ViewQuilt />)),
      )}
      {section(
        'Contributing',
        pagesOf('Contributing').map(({ path, title }) => item(path, title, <Handyman />)),
      )}
      {section('Changelog', item(changelogPage.path, changelogPage.title, <History />))}
    </>
  );
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
 * The catalogue's navigation: the wordmark and search above, then the sections. The frame shows it
 * at the start of a wide window, and in a sheet that the top bar opens in a narrower one.
 */
export function DocumentationNavigation({
  routePath,
  page,
  onSearch,
  inSheet = false,
}: SectionsProps & { onSearch: () => void; inSheet?: boolean }) {
  return (
    <Column
      gap={4}
      render={<nav aria-label="Documentation" />}
      className="docs-sidebar"
      data-in-sheet={inSheet || undefined}
    >
      {!inSheet && <Brand />}
      <SearchTrigger fullWidth onClick={onSearch} className="docs-sidebar-search" />
      <Column gap={5} className="docs-sidebar-navigation">
        <Sections routePath={routePath} page={page} />
      </Column>
    </Column>
  );
}
