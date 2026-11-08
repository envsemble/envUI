import type { CSSProperties } from 'react';
import { Column, Surface, Text } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

const backgrounds = [
  { background: 'default', title: 'Default' },
  { background: 'muted', title: 'Muted' },
  { background: 'page', title: 'Page' },
] as const;

/**
 * Raised as a popup has it: over a pane's content and past the pane's edge, lifted by a popup's
 * shadow, as its fill is a pane's; where popups are solid, by a popup's edge instead.
 */
const popup = {
  '--env-surface-outline': 'var(--env-popup-solid) var(--env-elevation-2-border)',
  boxShadow: 'var(--env-popup-shadow)',
  marginInline: 'var(--env-space-6) calc(-1 * var(--env-space-6))',
  marginBlockEnd: 'calc(-1 * var(--env-space-6))',
  whiteSpace: 'nowrap',
} as CSSProperties;

/**
 * Every background, on the page and on a pane, each on a piece of either, as the stage is neither;
 * Recessed in the page; Raised over a pane's content, as a popup sits.
 */
export default function Backgrounds() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {backgrounds.map(({ background, title }) => (
          <SpecimenPart key={background} title={title}>
            <Surface background="page" padding={2} radius="sm">
              <Surface background={background} padding={4}>
                <Text>On the page</Text>
              </Surface>
            </Surface>
            <Surface padding={2} radius="sm">
              <Surface background={background} padding={4} radius="sm">
                <Text>On a pane</Text>
              </Surface>
            </Surface>
          </SpecimenPart>
        ))}
        <SpecimenPart title="Recessed">
          <Surface background="page" padding={3} radius="sm">
            <Surface background="recessed" padding={4} radius="sm">
              <Text>In the page</Text>
            </Surface>
          </Surface>
        </SpecimenPart>
        <SpecimenPart title="Raised">
          <Surface background="page" padding={2} radius="sm">
            <Surface background="raised" padding={4}>
              <Text>On the page</Text>
            </Surface>
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
        </SpecimenPart>
      </SpecimenGrid>
    </Example>
  );
}
