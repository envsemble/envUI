import { Button, Card, Column, Row, Surface, Text } from '@envsemble/envui';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Leaderboard } from '@envsemble/envui/icons/Leaderboard';
import { version } from '../../../../packages/ui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { BannerShapes } from '../layout/BannerShapes';
import { routeHref } from '../navigation/Address';
import { sectionHome } from '../navigation/DocumentationRoutes';

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
  {
    title: 'Benchmark',
    route: 'benchmark',
    icon: Leaderboard,
    text: 'How well coding agents build interfaces with envUI.',
  },
] as const;

/** The Site's home: what envUI is, and the way to its components, patterns and Docs. */
export function Overview() {
  return (
    <>
      <header className="docs-page-header">
        <Surface
          background="default"
          padding={6}
          render={<Column gap={6} align="center" />}
          className="docs-overview-hero docs-banner"
          data-banner="landing"
        >
          <BannerShapes />
          {/* The wordmark, with the package's version under it as a quiet subheading, read from
              packages/ui/package.json as the site builds. */}
          <Column gap={3} align="center" className="docs-overview-brand">
            <Text render={<h1 />} aria-label="envUI" className="docs-overview-title">
              <EnvUILogo className="docs-overview-logo" />
            </Text>
            <Text variant="title" emphasis="muted" className="docs-overview-version">
              v{version}
            </Text>
          </Column>
          <Text variant="title" className="docs-overview-lead">
            envUI is a design system for React apps.
          </Text>
          <Row gap={3} wrap justify="center">
            <Button href={routeHref('components')} startIcon={<Widgets />}>
              Browse components
            </Button>
            <Button variant="secondary" href={routeHref('docs')} startIcon={<MenuBook />}>
              Read the Docs
            </Button>
          </Row>
        </Surface>
      </header>
      <Column gap={8} className="docs-article docs-overview">
        <Column render={<section aria-labelledby="overview-explore" />} gap={5}>
          <Text render={<h2 id="overview-explore" />} variant="headline">
            Explore
          </Text>
          <div className="docs-catalogue-grid docs-explore-grid">
            {destinations.map(({ title, route, icon: Icon, text }) => (
              <Card key={title} href={routeHref(route)}>
                <Column gap={4} align="center" className="docs-catalogue-content">
                  <Icon width="1.5rem" height="1.5rem" aria-hidden="true" />
                  <Column gap={2} align="center">
                    <Text render={<h3 />} variant="headline">
                      {title}
                    </Text>
                    <Text variant="caption" className="docs-caption">
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
