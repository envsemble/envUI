import type { ReactNode } from 'react';
import { Text, EnvUILogo, Surface, Stack, ActionGroup, Button } from '@envsemble/envui';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Add } from '@envsemble/envui/icons/Add';

import { Catalogue } from './Catalogue';

export function Overview({ actions }: { actions?: ReactNode }) {
  return (
    <Stack gap={8} className="docs-overview">
      <Surface
        tone="pane"
        padding={6}
        render={<Stack as="header" />}
        className="docs-overview-hero"
      >
        {actions}
        <Stack gap={6} align="center" className="docs-overview-intro">
          <EnvUILogo className="docs-overview-logo" />
          <Text as="h1" variant="page-heading">
            React components for envsemble
          </Text>
          <ActionGroup align="center">
            <Button href="#/getting-started" variant="outlined" startIcon={<Add />}>
              Get started
            </Button>
            <Button href="#/foundations/colors" variant="outlined" startIcon={<Palette />}>
              Design foundations
            </Button>
          </ActionGroup>
        </Stack>
      </Surface>
      <Stack as="section" gap={5} aria-labelledby="overview-components">
        <Text as="h2" variant="page-heading" id="overview-components">
          Components
        </Text>
        <Catalogue nested />
      </Stack>
    </Stack>
  );
}
