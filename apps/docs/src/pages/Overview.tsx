import type { ReactElement } from 'react';
import { Text, EnvUILogo, Surface, Stack, ActionGroup, Button, Link } from '@envsemble/envui';
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
          <Stack gap={4} align="center">
            <Text tone="muted">
              Shared React 19 components with light and dark themes, Inter and official Material
              Symbols. Applications own data, routing and validation.
            </Text>
            <Text>
              <Link href="#/foundations/composition/preview">Composition and extension</Link>
            </Text>
          </Stack>
          <Stack as="section" gap={5} aria-labelledby="overview-components">
            <Text as="h2" variant="page-heading" id="overview-components">
              Components
            </Text>
            <Catalogue />
          </Stack>
        </Stack>
      }
      usage={
        <div className="docs-article">
          <Stack as="section">
            <Text as="h2" variant="page-heading">
              First component
            </Text>
            <CodeBlock language="tsx">{setupCode}</CodeBlock>
            <Text>
              <Link href="#/getting-started/usage">
                Installation, local development and version updates
              </Link>
            </Text>
          </Stack>
        </div>
      }
    />
  );
}
