import type { CSSProperties } from 'react';
import { Column, Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const backgrounds = [
  { background: 'default', title: 'Default' },
  { background: 'muted', title: 'Muted' },
  { background: 'page', title: 'Page' },
] as const;

/**
 * Raised as a popup has it: over a pane's content and past the pane's edge, with a popup's edge
 * around it, which is what lifts it, as its fill is a pane's.
 */
const popup = {
  '--env-surface-outline': 'var(--env-elevation-2-border)',
  marginInline: 'var(--env-space-6) calc(-1 * var(--env-space-6))',
  marginBlockEnd: 'calc(-1 * var(--env-space-6))',
  whiteSpace: 'nowrap',
} as CSSProperties;

/**
 * Every background, on the page and on a pane; Recessed in the page, the only place it is deeper
 * than what is around it; Raised over a pane's content, as a popup sits.
 */
export default function Backgrounds() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {backgrounds.map(({ background, title }) => (
          <Specimen key={background} title={title}>
            <Surface background={background} padding={4}>
              <Text>On the page</Text>
            </Surface>
            <Surface padding={2} radius="sm">
              <Surface background={background} padding={4} radius="sm">
                <Text>On a pane</Text>
              </Surface>
            </Surface>
          </Specimen>
        ))}
        <Specimen title="Recessed">
          <Surface background="page" padding={3} radius="sm">
            <Surface background="recessed" padding={4} radius="sm">
              <Text>In the page</Text>
            </Surface>
          </Surface>
        </Specimen>
        <Specimen title="Raised">
          <Surface background="raised" padding={4}>
            <Text>On the page</Text>
          </Surface>
          <Surface
            padding={4}
            radius="sm"
            render={<Column gap={2} />}
            style={{ marginBlockEnd: 'var(--env-space-6)' }}
          >
            <Text>Pane content</Text>
            <Surface background="raised" padding={3} radius="sm" style={popup}>
              <Text>Over a pane</Text>
            </Surface>
          </Surface>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
