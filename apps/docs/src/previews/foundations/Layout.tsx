import { Text, Stack } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../Example';

export function SpacingPreview() {
  return (
    <>
      <Example title="Spacing scale" size="compact">
        <div className="docs-spacing-list">
          {[0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4].map((size, i) => (
            <div className="docs-measure" key={size}>
              <code>--space-{i + 1}</code>
              <span>{size} rem</span>
              <div className="docs-spacing-bar" style={{ width: `var(--space-${i + 1})` }} />
            </div>
          ))}
        </div>
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

export function ResponsivePreview() {
  return (
    <>
      <Example title="Reflowing content" size="collection">
        <Text tone="muted">
          These columns stack when space is limited. Text wraps within each column; no separate
          mobile component is needed.
        </Text>
        <SpecimenGrid>
          <Specimen title="Project overview">
            <Text>Shared plans for the autumn release, with milestones and responsibilities.</Text>
          </Specimen>
          <Specimen title="Release notes">
            <Text>Recent changes and upcoming work remain readable as the column narrows.</Text>
          </Specimen>
          <Specimen title="Team updates">
            <Text>Keep related information together and use consistent gaps between blocks.</Text>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Content in a narrow column" size="field">
        <Stack>
          <Text as="h3" variant="section-heading">
            Autumn release
          </Text>
          <Text>
            Longer content wraps naturally. Let its height grow instead of fixing a height or
            clipping text.
          </Text>
        </Stack>
      </Example>
    </>
  );
}
