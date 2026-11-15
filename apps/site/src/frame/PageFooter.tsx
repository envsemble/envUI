import { Link, Row, Text } from '@envsemble/envui';
import { version } from '@envsemble/envui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { docsRoute, homeRoute, routeHref } from '../routes/Address';

const repository = 'https://github.com/envsemble/envUI';

const links = [
  { label: 'Docs', href: routeHref(docsRoute) },
  { label: 'Changelog', href: routeHref('docs/changelog') },
  { label: 'Source', href: repository },
];

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
