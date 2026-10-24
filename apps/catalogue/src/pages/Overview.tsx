import { Button, Card, Column, Row, Surface, Text } from '@envsemble/envui';
import { MenuBook } from '@envsemble/envui/icons/MenuBook';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { Pattern } from '@envsemble/envui/icons/Pattern';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Leaderboard } from '@envsemble/envui/icons/Leaderboard';
import { version } from '../../../../packages/ui/package.json';
import { EnvUILogo } from '../brand/EnvUILogo';
import { sectionHome } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';

/** The Site's destinations the home page leads to, each with what it holds. */
const destinations = [
  {
    title: 'Foundations',
    icon: Palette,
    text: 'Colors and themes, type, space, scale, layout, icons, accessibility and content.',
  },
  {
    title: 'Components',
    icon: Widgets,
    text: 'Every component, what it looks like and when to use it, in live examples with their code.',
  },
  {
    title: 'Patterns',
    icon: Pattern,
    text: 'Components put together for what people do: forms, settings, navigation and more.',
  },
  {
    title: 'Benchmark',
    icon: Leaderboard,
    text: 'How coding agents do when they build interfaces with envUI.',
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
          className="docs-overview-hero"
        >
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
      <Column gap={5} className="docs-article docs-overview">
        <Text render={<h2 />} variant="headline">
          Explore
        </Text>
        <div className="docs-catalogue-grid docs-explore-grid">
          {destinations.map(({ title, icon: Icon, text }) => (
            <Card key={title} href={routeHref(sectionHome(title).path)}>
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
    </>
  );
}
