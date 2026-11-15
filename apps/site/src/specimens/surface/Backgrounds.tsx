import type { CSSProperties } from 'react';
import { Column, Surface, Text } from '@envsemble/envui';
import { SpecimenFrame, SpecimenGrid, SpecimenPart } from '../../figures/SpecimenFrame';

const backgrounds = [
  { background: 'default', title: 'Default' },
  { background: 'muted', title: 'Muted' },
  { background: 'page', title: 'Page' },
] as const;

const raisedLikeAPopup: CSSProperties = {
  '--env-surface-outline': 'var(--_popup-solid) var(--env-elevation-2-border)',
  boxShadow: 'var(--env-popup-shadow)',
  marginInline: 'var(--env-space-6) calc(-1 * var(--env-space-6))',
  marginBlockEnd: 'calc(-1 * var(--env-space-6))',
  whiteSpace: 'nowrap',
};

export default function Backgrounds() {
  return (
    <SpecimenFrame size="collection">
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
            <Surface background="raised" padding={3} radius="sm" style={raisedLikeAPopup}>
              <Text>Over a pane</Text>
            </Surface>
          </Surface>
        </SpecimenPart>
      </SpecimenGrid>
    </SpecimenFrame>
  );
}
