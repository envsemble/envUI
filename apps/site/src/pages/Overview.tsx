import { Button, Card, Column, CopyButton, Link, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconPattern } from '@envsemble/envui/icons/Pattern';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { name } from '../../../../packages/ui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { docsRoute, routeHref } from '../navigation/Address';
import { pagesOf, sectionHome } from '../navigation/SiteRoutes';
import { OverviewFan } from './OverviewFan';

/**
 * Where the home page leads, each with what it is for rather than what it lists, so a page that
 * moves or merges never leaves it out of date.
 */
const destinations = [
  {
    title: 'Foundations',
    route: sectionHome('Foundations').path,
    icon: IconPalette,
    text: 'What every screen built with envUI shares, and the words to ask for it.',
  },
  {
    title: 'Components',
    route: 'components',
    icon: IconWidgets,
    text: 'The pieces a screen is made of: what each looks like and when to use it.',
  },
  {
    title: 'Patterns',
    route: 'patterns',
    icon: IconPattern,
    text: 'Components put together for what people do, such as filling in a form.',
  },
] as const;

/**
 * How much the catalogue shows, counted from its pages as the site builds, so the hero's line of
 * facts never goes out of date: its components, patterns and foundations.
 */
const counts = (['component', 'pattern', 'foundation'] as const).map((kind) => ({
  kind,
  count: pagesOf('catalogue').filter((page) => page.kind === kind).length,
}));

/**
 * The command that installs envUI, by the package's name in packages/ui/package.json: short, so it
 * keeps room to spare on a phone. docs/setup.md gives the registry it needs and the command that
 * pins the version exactly, which the line under it leads to.
 */
const install = `npm i ${name}`;

/**
 * The catalogue's home: what envUI is, the way to setting it up, a hand of cards built with it, and
 * the way to its foundations, components and patterns.
 */
export function Overview() {
  return (
    <>
      <header className="site-page-header catalogue-overview-header">
        <Column gap={5} align="center" className="catalogue-overview-hero">
          <Text render={<h1 />} aria-label="envUI" className="catalogue-overview-title">
            <EnvUILogo className="catalogue-overview-logo" />
          </Text>
          <Text variant="display" className="catalogue-overview-lede">
            A React design system for dense B2B SaaS and AI developer tools.
          </Text>
          {/* The one way in, to setting envUI up, beside the command that installs it; under them,
              one quiet line: how much the catalogue shows, and what installing needs first. */}
          <Column gap={4} align="center">
            <Row gap={4} align="center" justify="center" wrap className="catalogue-overview-start">
              <Button href={routeHref(docsRoute)} endIcon={<IconArrowForward />}>
                Get started
              </Button>
              <span className="catalogue-overview-install">
                {/* The command the button copies, on one line (Overview.css). */}
                <code>{install}</code>
                <CopyButton value={install} variant="ghost" aria-label="Copy install command" />
              </span>
            </Row>
            <Text variant="caption" emphasis="muted" className="catalogue-overview-facts">
              {counts.map(({ kind, count }) => (
                <span key={kind}>
                  {count} {kind}s
                </span>
              ))}
              <span>
                Installing needs{' '}
                <Link href={routeHref(`${docsRoute}?section=registry-access`)}>
                  registry access
                </Link>
              </span>
            </Text>
          </Column>
        </Column>
      </header>
      <OverviewFan />
      <Column gap={8} className="site-article catalogue-overview">
        <Column render={<section aria-labelledby="overview-explore" />} gap={5}>
          <Text render={<h2 id="overview-explore" />} variant="headline">
            Explore
          </Text>
          <div className="catalogue-catalogue-grid catalogue-explore-grid">
            {destinations.map(({ title, route, icon: Icon, text }) => (
              <Card key={title} href={routeHref(route)}>
                <Column gap={4} align="center" className="catalogue-catalogue-content">
                  <Icon width="1.5rem" height="1.5rem" aria-hidden="true" />
                  <Column gap={2} align="center">
                    <Text render={<h3 />} variant="headline">
                      {title}
                    </Text>
                    <Text variant="caption" className="catalogue-caption">
                      {text}
                    </Text>
                  </Column>
                </Column>
              </Card>
            ))}
          </div>
        </Column>
      </Column>
    </>
  );
}
