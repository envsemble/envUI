import { Link, Row, Text } from '@envsemble/envui';
import { EnvUILogo } from '../brand/EnvUILogo';
import envsembleOnDark from '../brand/envsemble-horizontal-on-dark.svg';
import envsembleOnLight from '../brand/envsemble-horizontal-on-light.svg';
import { docsRoute, homeRoute, routeHref } from '../routes/Address';

const repository = 'https://github.com/envsemble/envUI';

const links = [
  { label: 'Docs', href: routeHref(docsRoute) },
  { label: 'Changelog', href: routeHref('docs/changelog') },
  { label: 'Source', href: repository },
  { label: 'Privacy', href: routeHref('privacy') },
  { label: 'Terms', href: routeHref('terms') },
];

export function PageFooter() {
  return (
    <footer className="site-footer">
      <Row gap={5} align="center" justify="between" wrap className="site-footer-inner">
        <Row gap={4} align="center" wrap className="site-footer-credit">
          <Link
            href={routeHref(homeRoute)}
            underline={false}
            className="site-footer-brand"
            aria-label="envUI home"
          >
            <EnvUILogo />
          </Link>
          <a href="https://envsemble.com" className="site-footer-maker">
            <Text variant="body-sm" emphasis="muted" render={<span />}>
              by
            </Text>
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
