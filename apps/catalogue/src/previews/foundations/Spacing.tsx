import { Example, SpecimenGrid } from '../Example';
import { Avatar, Box, Button, Column, Combobox, Row, type ComboboxItem } from '@envsemble/envui';

const reviewers: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => ({
    value: name.toLowerCase().replace(' ', '.'),
    label: name,
    start: <Avatar name={name} />,
  }),
);

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
            ['var(--env-radius-surface)', 'Panes & outer rows', '--env-radius-surface'],
            ['var(--env-radius-sm)', 'Inner rows & important actions', '--env-radius-sm'],
            ['var(--env-radius-sm)', 'Toasts & chips', '--env-radius-sm'],
            ['var(--env-radius-full)', 'Actions & navigation, capped', '--env-radius-full'],
            ['50%', 'Circular icons', '50%'],
            ['var(--env-radius-xs)', 'Checkboxes', '--env-radius-xs'],
          ].map(([radius, label, name]) => (
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
                <code>{name}</code>
              </span>
            </div>
          ))}
        </SpecimenGrid>
      </Example>
      <Example
        title="The full corner"
        size="wide"
        caption="--env-radius-full is half the tallest single-line control, 1.5 rem at most. One line tall, the corners meet as round ends; taller, the same corners make a rounded rectangle, never a pill."
      >
        <Row wrap align="start" gap={6}>
          <Button>Save</Button>
          <Box style={{ inlineSize: '9rem' }}>
            <Button>Save the changes to every page</Button>
          </Box>
          <Box style={{ inlineSize: '16rem' }}>
            <Combobox
              multiple
              label="Reviewers"
              placeholder="Add people"
              items={reviewers}
              defaultValue={['alex.morgan', 'sam.lee', 'priya.shah', 'jordan.ellis']}
            />
          </Box>
        </Row>
      </Example>
    </>
  );
}
