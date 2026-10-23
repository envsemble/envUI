import { Column, Grid, Link, Row, Text } from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import { componentGroupId, componentGroups } from '../Reference';
import { docsRoute, homeRoute, routeHref } from '../navigation/Address';
import { routeOfDocument } from '../navigation/DocumentationRoutes';

const repository = 'https://github.com/envsemble/envUI';

interface FooterLink {
  label: string;
  href: string;
}

/** Links to pages of docs/ by id, with the shorter label a footer column fits; missing pages drop. */
function pagesById(entries: [id: string, label: string][]): FooterLink[] {
  return entries.flatMap(([id, label]) => {
    const route = routeOfDocument(id);
    return route ? [{ label, href: routeHref(route) }] : [];
  });
}

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Overview',
    links: [
      { label: 'Introduction', href: routeHref(homeRoute) },
      { label: 'Get started', href: routeHref('get-started') },
      { label: 'Benchmark', href: routeHref('benchmark') },
      { label: 'Changelog', href: routeHref('changelog') },
    ],
  },
  {
    title: 'Foundations',
    links: pagesById([
      ['colors', 'Colors & themes'],
      ['typography', 'Typography'],
      ['spacing', 'Spacing & shape'],
      ['responsive', 'Responsive layout'],
      ['accessibility', 'Accessibility'],
    ]),
  },
  {
    title: 'Components',
    links: componentGroups.map((group) => ({
      label: group,
      href: routeHref(`components?${new URLSearchParams({ section: componentGroupId(group) })}`),
    })),
  },
  {
    title: 'Patterns',
    links: pagesById([
      ['forms', 'Form layout'],
      ['settings', 'Settings'],
      ['navigation', 'Navigation'],
      ['loading', 'Loading'],
      ['empty-states', 'Empty states'],
      ['data-tables', 'Data tables'],
    ]),
  },
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', href: routeHref(docsRoute) },
      ...pagesById([
        ['setup', 'Install and set up'],
        ['migration', 'Migrate to envUI'],
        ['codemods', 'Codemods'],
        ['tokens', 'Design tokens'],
        ['agent-tooling', 'For agents'],
        ['dev-mode', 'Dev mode'],
      ]),
      { label: 'Source', href: repository },
    ],
  },
];

/**
 * The foot of every page of the Site and the Docs, on the navigation's pane color: the wordmark in
 * a column of its own, then the main destinations of both in columns that wrap onto more rows in a narrow page.
 * Its links are quiet text until hovered.
 */
export function PageFooter() {
  return (
    <footer className="docs-footer">
      <Row gap={7} align="start" className="docs-footer-inner">
        <Link
          href={routeHref(homeRoute)}
          underline={false}
          className="docs-footer-brand"
          aria-label="envUI home"
        >
          <EnvUILogo />
        </Link>
        <Grid
          render={<nav aria-label="Footer" />}
          columns={{ min: '9rem' }}
          gap={6}
          className="docs-footer-columns"
        >
          {columns.map(({ title, links }) => (
            <Column key={title} gap={3} align="start">
              <Text
                render={<h2 />}
                variant="body-sm"
                emphasis="default"
                className="docs-footer-title"
              >
                {title}
              </Text>
              <Column render={<ul />} gap={2} align="start" className="docs-footer-links">
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
    </footer>
  );
}
