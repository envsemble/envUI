import { Button, Text } from '@envsemble/envui';
import { IconArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { license, version } from '@envsemble/envui/package.json';
import { docsRoute, routeHref } from '../../routes/Address';
import { pagesOf } from '../../routes/SiteRoutes';
import { OverviewAgentPrompt } from './overview/OverviewAgentPrompt';
import { OverviewWidget } from './overview/OverviewWidget';
import { OverviewRibbon } from './overview/ribbon/OverviewRibbon';

const counts = (['component', 'foundation'] as const).map((kind) => ({
  kind,
  count: pagesOf('catalogue').filter((page) => page.kind === kind).length,
}));

export function Overview() {
  return (
    <div className="catalogue-overview-hero">
      <OverviewRibbon className="catalogue-overview-ribbon" />
      <header className="catalogue-overview-intro">
        <Text render={<h1 />} variant="display" className="catalogue-overview-lede">
          A React design system for clear, accessible interfaces.
        </Text>
        <div className="catalogue-overview-start">
          <div className="catalogue-overview-actions">
            <Button href={routeHref(docsRoute)} end={<IconArrowForward />}>
              Get started
            </Button>
            <OverviewAgentPrompt />
          </div>
          <Text variant="caption" emphasis="muted" className="catalogue-overview-facts">
            {counts.map(({ kind, count }) => (
              <span key={kind}>
                {count} {kind}s
              </span>
            ))}
            <span>Version {version}</span>
            <span>{license} license</span>
          </Text>
        </div>
      </header>
      <OverviewWidget />
    </div>
  );
}
