import type { ReactElement } from 'react';
import { Text, EnvUILogo, Surface, Stack, ActionGroup, Button } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Add } from '@envsemble/envui/icons/Add';

import { Catalogue } from './Catalogue';
import { PageViews } from '../PageViews';
import type { ReferenceView } from '../Documentation';
import { setupCode } from '../Reference';

function OverviewBanner({ tabs }: { tabs: ReactElement }) {
  return (
    <header className="docs-page-header">
      <Surface tone="pane" padding={6} render={<Stack gap={6} />} className="docs-overview-hero">
        <Stack gap={7} align="center" className="docs-overview-intro">
          <EnvUILogo className="docs-overview-logo" />
          <Text as="h1" variant="page-heading">
            React components for envsemble
          </Text>
          <ActionGroup align="center">
            <Button href="#/getting-started/usage" variant="outlined" startIcon={<Add />}>
              Get started
            </Button>
            <Button href="#/foundations/colors" variant="outlined" startIcon={<Palette />}>
              Design foundations
            </Button>
          </ActionGroup>
          {tabs}
        </Stack>
      </Surface>
    </header>
  );
}

export function Overview({ view }: { view: ReferenceView }) {
  return (
    <PageViews
      path="overview"
      title="envUI"
      view={view}
      renderBanner={(tabs) => <OverviewBanner tabs={tabs} />}
      preview={
        <Stack gap={9} className="docs-overview">
          <Stack as="section" gap={5} aria-labelledby="overview-components">
            <Text as="h2" variant="page-heading" id="overview-components">
              Components
            </Text>
            <Catalogue />
          </Stack>
        </Stack>
      }
      guidelines={
        <div className="docs-article">
          <Stack as="section">
            <Text as="h2" variant="page-heading">
              Library and application
            </Text>
            <Text tone="muted">
              envUI owns shared appearance, spacing, keyboard interaction and accessibility
              behavior. Applications own data, routing, validation and saving.
            </Text>
            <Text tone="muted">
              Build product components from the public primitives. Repeated visual behavior belongs
              in the library so products receive it through package updates.
            </Text>
          </Stack>
          <Stack as="section">
            <Text as="h2" variant="page-heading">
              Supported foundation
            </Text>
            <Text tone="muted">
              Use React 19 and the centrally maintained light and dark themes. Inter, envsemble
              assets and official Material Symbols Rounded are bundled with the library.
            </Text>
            <Text>
              <a href="#/foundations/composition/guidelines">Composition and extension</a>
            </Text>
          </Stack>
        </div>
      }
      usage={
        <div className="docs-article">
          <Stack as="section">
            <Text as="h2" variant="page-heading">
              First component
            </Text>
            <CodeBlock language="tsx">{setupCode}</CodeBlock>
            <Text>
              <a href="#/getting-started/usage">
                Installation, local development and version updates
              </a>
            </Text>
          </Stack>
        </div>
      }
    />
  );
}
