import { Badge, Button, Card, Column, Row, Surface, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/icons/Code';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { version } from '../../../../packages/ui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { docsRoute, routeHref } from '../navigation/Address';
import { pagesOf, sectionHome } from '../navigation/DocumentationRoutes';
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

/** The catalogue's home: what envUI is, and the way to its components, patterns and Docs. */
export function Overview() {
  return (
    <>
      <header className="docs-page-header">
        <Surface
          background="default"
          padding={6}
          render={<Column gap={6} align="center" />}
          className="docs-overview-hero"
        >
          {/* The wordmark, and what envUI is in one line under it. */}
          <Column gap={4} align="center" className="docs-overview-brand">
            <Text render={<h1 />} aria-label="envUI" className="docs-overview-title">
              <EnvUILogo className="docs-overview-logo" />
            </Text>
            <Text variant="title" emphasis="muted" className="docs-overview-lede">
              A React design system: components, patterns and the foundations they share, ready for
              light, dark and high contrast.
            </Text>
          </Column>
          {/* The two ways on: into the components to see them, or into the Docs to build. */}
          <Row gap={3} wrap justify="center">
            <Button href={routeHref('components')} startIcon={<Widgets />}>
              Browse components
            </Button>
            <Button variant="secondary" href={routeHref(docsRoute)} startIcon={<Code />}>
              Read the Docs
            </Button>
          </Row>
          {/* Quiet facts under them: the package's version, read from packages/ui/package.json,
              and how much the catalogue shows. */}
          <Row gap={3} wrap justify="center" align="center" className="docs-overview-facts">
            <Badge className="docs-overview-version">v{version}</Badge>
            <Text variant="caption" emphasis="muted" render={<span />}>
              {counts.map(({ kind, count }) => (
                <span key={kind}>
                  {count} {kind}s
                </span>
              ))}
            </Text>
          </Row>
        </Surface>
      </header>
      <OverviewShowcase />
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
