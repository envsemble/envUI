import { Example, SpecimenGrid } from '../Example';
import { Column } from '@envsemble/envui';

export function SpacingPreview() {
  return (
    <>
      <Example
        title="Spacing scale"
        size="field"
        caption="Parents own gaps; components own padding. Both use this scale."
      >
        <Column gap={3}>
          {[0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4].map((size, i) => (
            <div className="docs-measure" key={size}>
              <code>--env-space-{i + 1}</code>
              <span>{size} rem</span>
              <div className="docs-spacing-bar" style={{ width: `var(--env-space-${i + 1})` }} />
            </div>
          ))}
        </Column>
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
