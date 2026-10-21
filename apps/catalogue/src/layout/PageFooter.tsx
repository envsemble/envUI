import { Column, Grid, Link, Text } from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import { documentedVersion as version } from '../generated/Documentation';
import { componentGroupId, componentGroups } from '../Reference';
import { homeRoute, routeHref } from '../navigation/Address';
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
    title: 'Get started',
    links: [
      { label: 'Overview', href: routeHref(homeRoute) },
      { label: 'Install and set up', href: routeHref('overview/get-started') },
      ...pagesById([
        ['migration', 'Migrate to envUI'],
        ['agent-tooling', 'For agents'],
        ['dev-mode', 'Dev mode'],
      ]),
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
      ['tokens', 'Design tokens'],
    ]),
  },
  {
    title: 'Components',
    links: componentGroups.map((group) => ({
      label: group,
      href: routeHref(`${homeRoute}?${new URLSearchParams({ section: componentGroupId(group) })}`),
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
    title: 'Resources',
    links: [
      { label: 'Changelog', href: routeHref('changelog') },
      ...pagesById([['library-development', 'Contributing']]),
      { label: 'Source', href: repository },
      { label: 'Report an issue', href: `${repository}/issues` },
    ],
  },
];

/**
 * The foot of every page: the wordmark, the catalogue's main destinations in columns that wrap
 * onto more rows in a narrow page, and the version this catalogue documents. It is set apart by
 * space alone, and its links are quiet text until hovered.
 */
export function PageFooter() {
  return (
    <Column render={<footer />} container="docs-footer" gap={7} className="docs-footer">
      <Column gap={3} align="start">
        <Link
          href={routeHref(homeRoute)}
          underline={false}
          className="docs-footer-brand"
          aria-label="envUI overview"
        >
          <EnvUILogo />
        </Link>
        <Text variant="body-sm">
          React components, layout and tokens, documented for people and agents.
        </Text>
      </Column>
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
      <Text variant="caption">envUI {version} · @envsemble/envui</Text>
    </Column>
  );
}
