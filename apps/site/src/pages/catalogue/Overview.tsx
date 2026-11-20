import { Button, Card, Column, CopyButton, Row, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { IconWidgets } from '@envsemble/envui/icons/Widgets';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { license, name, version } from '@envsemble/envui/package.json';
import { EnvUILogo } from '../../brand/EnvUILogo';
import { docsRoute, routeHref } from '../../routes/Address';
import { pagesOf, sectionHome } from '../../routes/SiteRoutes';
import { OverviewFan } from './OverviewFan';

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
] as const;

const counts = (['component', 'foundation'] as const).map((kind) => ({
  kind,
  count: pagesOf('catalogue').filter((page) => page.kind === kind).length,
}));

const install = `npm i ${name}`;

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
          <Column gap={4} align="center">
            <Row gap={4} align="center" justify="center" wrap className="catalogue-overview-start">
              <Button href={routeHref(docsRoute)} end={<IconArrowForward />}>
                Get started
              </Button>
              <span className="catalogue-overview-install">
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
              <span>Version {version}</span>
              <span>{license} license</span>
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
