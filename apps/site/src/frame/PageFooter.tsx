import { Link, Row, Text } from '@envsemble/envui';
import { version } from '@envsemble/envui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import envsembleOnDark from '../brand/envsemble-horizontal-on-dark.svg';
import envsembleOnLight from '../brand/envsemble-horizontal-on-light.svg';
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
        <Row gap={2} align="center" className="site-footer-maker">
          <Text variant="body-sm" emphasis="muted">
            © 2026
          </Text>
          <a href="https://envsemble.com" className="site-footer-maker-logo">
            <img
              src={envsembleOnLight}
              alt="envsemble"
              width={303}
              height={63}
              className="site-footer-maker-on-light"
            />
            <img
              src={envsembleOnDark}
              alt="envsemble"
              width={303}
              height={63}
              className="site-footer-maker-on-dark"
            />
          </a>
        </Row>
      </Row>
    </footer>
  );
}
