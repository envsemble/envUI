import { Card, Column, Text } from '@envsemble/envui';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { version } from '../../../../packages/ui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { routeHref } from '../navigation/Address';
import { pagesOf, sectionHome } from '../navigation/SiteRoutes';
import { OverviewShowcase } from './OverviewShowcase';

/**
 * Where the home page leads, each with what it is for rather than what it lists, so a page that
 * moves or merges never leaves it out of date.
 */
const destinations = [
  {
    title: 'Foundations',
    route: sectionHome('Foundations').path,
    icon: Palette,
    text: 'What every screen built with envUI shares, and the words to ask for it.',
  },
  {
    title: 'Components',
    route: 'components',
    icon: Widgets,
    text: 'The pieces a screen is made of: what each looks like and when to use it.',
  },
  {
    title: 'Patterns',
    route: 'patterns',
    icon: Pattern,
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
 * The catalogue's home: what envUI is, a hand of cards built with it, and the way to its
 * foundations, components and patterns. The hero leads nowhere itself: the navigation beside and
 * above it, and the Explore cards, do.
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
            A React design system for clear, accessible interfaces.
          </Text>
          {/* Quiet facts under it: the package's version, read from packages/ui/package.json, and
              how much the catalogue shows. */}
          <Text variant="caption" emphasis="muted" className="catalogue-overview-facts">
            <span className="catalogue-overview-version">v{version}</span>
            <span className="catalogue-overview-counts">
              {counts.map(({ kind, count }) => (
                <span key={kind}>
                  {count} {kind}s
                </span>
              ))}
            </span>
          </Text>
        </Column>
      </header>
      <OverviewShowcase />
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
