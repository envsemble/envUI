import type { ReactElement } from 'react';
import { Text, Surface, Column, Button, Tabs, Link } from '@envsemble/envui';
import { documentedVersion as version } from '../generated/Documentation';
import { EnvUILogo } from '../brand/EnvUILogo';

import { Catalogue } from './Catalogue';
import { GettingStarted } from './GettingStarted';
import { overviewViews, type OverviewView } from '../navigation/DocumentationRoutes';
import { useViewTabs } from '../navigation/useDocumentationRoute';
import { routeHref } from '../navigation/Address';

function OverviewBanner({ tabs }: { tabs: ReactElement }) {
  return (
    <header className="docs-page-header">
      <Surface
        background="default"
        padding={6}
        render={<Column gap={7} align="center" />}
        className="docs-overview-hero"
      >
        <Text render={<h1 />} aria-label="envUI" className="docs-overview-title">
          <EnvUILogo className="docs-overview-logo" />
        </Text>
        {/* The version this catalogue documents, which leads to what changed in it. */}
        <Text variant="body-sm" className="docs-overview-version">
          <Link href={routeHref('changelog')}>Version {version}</Link>
        </Text>
        {tabs}
      </Surface>
    </header>
  );
}

export function Overview({ view }: { view: OverviewView }) {
  const viewTabs = useViewTabs((next) => `overview/${next}`);
  const content = {
    components: (
      <Column
        render={<section />}
        gap={5}
        className="docs-overview"
        aria-labelledby="overview-components"
      >
        <Text render={<h2 />} variant="headline" id="overview-components">
          Components
        </Text>
        <Catalogue />
      </Column>
    ),
    'get-started': <GettingStarted />,
  };
  return (
    <Tabs
      aria-label="Overview views"
      className="docs-reference-tabs"
      value={view}
      {...viewTabs}
      renderList={(tabs) => <OverviewBanner tabs={tabs} />}
      items={overviewViews.map(({ id, title }) => ({
        value: id,
        button: <Button>{title}</Button>,
        content: content[id],
      }))}
    />
  );
}
