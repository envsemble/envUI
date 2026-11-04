import { Column, Grid, Link, Row, Text } from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import { componentGroupId, componentGroups } from '../pages/PageModel';
import { docsRoute, homeRoute, routeHref } from '../navigation/Address';
import { catalogueSections, pagesOf, sectionHome } from '../navigation/SiteRoutes';

const repository = 'https://github.com/envsemble/envUI';

interface FooterLink {
  label: string;
  href: string;
}

/**
 * The footer's columns, each link once: the catalogue's destinations, the foundations by their
 * names, the components by their groups, and the Docs' guides with the source.
 */
const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Catalogue',
    links: catalogueSections.map((section) => ({
      label: section,
      href: routeHref(sectionHome(section).path),
    })),
  },
  {
    title: 'Foundations',
    links: pagesOf('catalogue')
      .filter((page) => page.kind === 'foundation')
      .map((page) => ({ label: page.label ?? page.title, href: routeHref(page.path) })),
  },
  {
    title: 'Components',
    links: componentGroups.map((group) => ({
      label: group,
      href: routeHref(`components?${new URLSearchParams({ section: componentGroupId(group) })}`),
    })),
  },
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: routeHref(docsRoute) },
      { label: 'Install and set up', href: routeHref('docs/setup') },
      { label: 'Move an app to envUI', href: routeHref('docs/migration') },
      { label: 'Customize', href: routeHref('docs/customizing') },
      { label: 'Design tokens', href: routeHref('docs/tokens') },
      { label: 'Changelog', href: routeHref('docs/changelog') },
      { label: 'Source', href: repository },
    ],
  },
];

/**
 * The foot of every page of the catalogue and the Docs, on the navigation's pane color: the wordmark in
 * a column of its own, then the main destinations of both in four columns, two to a row in a narrow
 * page. Its links are quiet text until hovered. The credit for the icons is on the Icons page.
 */
export function PageFooter() {
  return (
    <footer className="site-footer">
      <Column gap={7} className="site-footer-inner">
        <Row gap={7} align="start" className="site-footer-main">
          <Link
            href={routeHref(homeRoute)}
            underline={false}
            className="site-footer-brand"
            aria-label="envUI home"
          >
            <EnvUILogo />
          </Link>
          <Grid
            render={<nav aria-label="Footer" />}
            columns={{ min: '9rem' }}
            gap={6}
            className="site-footer-columns"
          >
            {columns.map(({ title, links }) => (
              <Column key={title} gap={3} align="start">
                <Text
                  render={<h2 />}
                  variant="body-sm"
                  emphasis="default"
                  className="site-footer-title"
                >
                  {title}
                </Text>
                <Column render={<ul />} gap={2} align="start" className="site-footer-links">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Text variant="body-sm">
                        <Link href={link.href} underline={false}>
                          {link.label}
                        </Link>
                      </Text>
                    </li>
                  ))}
                </Column>
              </Column>
            ))}
          </Grid>
        </Row>
      </Column>
    </footer>
  );
}
