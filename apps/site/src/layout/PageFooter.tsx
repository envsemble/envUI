import { Link, Row, Text } from '@envsemble/envui';
import { version } from '@envsemble/envui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { docsRoute, homeRoute, routeHref } from '../navigation/Address';

const repository = 'https://github.com/envsemble/envUI';

/**
 * Where the footer leads that the navigation beside the page doesn't show on every page: the Docs,
 * the changelog and the source. The catalogue's destinations and pages are in the rail and the
 * drawer, so the footer doesn't list them again.
 */
const links = [
  { label: 'Docs', href: routeHref(docsRoute) },
  { label: 'Changelog', href: routeHref('docs/changelog') },
  { label: 'Source', href: repository },
];

/**
 * The foot of every page of the catalogue and the Docs, on the default surface's fill: one compact
 * row that closes the page, the wordmark and the package's version at its start and a few quiet
 * links at its end, which wrap under them in a narrow page. The credit for the icons is on the
 * Icons page.
 */
export function PageFooter() {
  return (
    <footer className="site-footer">
      <Row gap={5} align="center" justify="between" wrap className="site-footer-inner">
        <Row gap={3} align="center">
          <Link
            href={routeHref(homeRoute)}
            underline={false}
            className="site-footer-brand"
            aria-label="envUI home"
          >
            <EnvUILogo />
          </Link>
          <Text variant="body-sm" emphasis="muted" className="site-footer-version">
            v{version}
          </Text>
        </Row>
        <nav aria-label="Footer">
          <Row render={<ul />} gap={5} align="center" wrap className="site-footer-links">
            {links.map((link) => (
              <li key={link.label}>
                <Text variant="body-sm">
                  <Link href={link.href} underline={false}>
                    {link.label}
                  </Link>
                </Text>
              </li>
            ))}
          </Row>
        </nav>
      </Row>
    </footer>
  );
}
