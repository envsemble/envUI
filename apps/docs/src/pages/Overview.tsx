import type { ReactElement } from 'react';
import { Text, EnvUILogo, Surface, Stack, Button, Tabs } from '@envsemble/envui';

import { Catalogue } from './Catalogue';
import { GettingStarted } from './GettingStarted';
import { overviewViews, type OverviewView } from '../Documentation';

function OverviewBanner({ tabs }: { tabs: ReactElement }) {
  return (
    <header className="docs-page-header">
      <Surface
        tone="pane"
        padding={6}
        render={<Stack gap={7} align="center" />}
        className="docs-overview-hero"
      >
        <Text as="h1" aria-label="envUI" className="docs-overview-title">
          <EnvUILogo className="docs-overview-logo" />
        </Text>
        {tabs}
      </Surface>
    </header>
  );
}

export function Overview({ view }: { view: OverviewView }) {
  const content = {
    components: (
      <Stack as="section" gap={5} className="docs-overview" aria-labelledby="overview-components">
        <Text as="h2" variant="page-heading" id="overview-components">
          Components
        </Text>
        <Catalogue />
      </Stack>
    ),
    'get-started': <GettingStarted />,
  };
  return (
    <Tabs
      aria-label="Overview views"
      className="docs-reference-tabs"
      value={view}
      onValueChange={(next) => {
        if (next) location.hash = `/overview/${next}`;
      }}
      renderList={(tabs) => <OverviewBanner tabs={tabs} />}
      items={overviewViews.map(({ id, title }) => ({
        value: id,
        button: <Button>{title}</Button>,
        content: content[id],
      }))}
    />
  );
}
