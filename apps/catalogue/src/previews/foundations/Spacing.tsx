import { Example, SpecimenGrid } from '../Example';
import { Stack, Text } from '@envsemble/envui';

export function SpacingPreview() {
  return (
    <>
      <Example
        title="Spacing scale"
        size="compact"
        caption="Parents own gaps; components own padding. Both use this scale."
      >
        <Stack gap={3}>
          {[0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4].map((size, i) => (
            <div className="docs-measure" key={size}>
              <code>--env-space-{i + 1}</code>
              <span>{size} rem</span>
              <div className="docs-spacing-bar" style={{ width: `var(--env-space-${i + 1})` }} />
            </div>
          ))}
        </Stack>
      </Example>
      <Example title="Responsive sizing">
        <Text emphasis="muted">
          Use relative units and let content wrap. The library increases touch targets to at least
          2.75 rem for coarse pointers.
        </Text>
      </Example>
      <Example title="Corner scale" size="wide">
        <SpecimenGrid size="compact">
          {[
            ['1.75rem', 'Panes & outer rows'],
            ['0.5rem', 'Inner rows & important actions'],
            ['0.5rem', 'Toasts & chips'],
            ['100vmax', 'Actions & navigation'],
            ['100vmax', 'Circular icons'],
            ['0.25rem', 'Checkboxes'],
          ].map(([radius, label]) => (
            <div
              key={label}
              className="docs-shape"
              style={{
                borderRadius: radius,
                ...(label === 'Circular icons' ? { width: '6rem' } : {}),
              }}
            >
              <span>
                {label}
                <br />
                <code>{radius}</code>
              </span>
            </div>
          ))}
        </SpecimenGrid>
      </Example>
    </>
  );
}
