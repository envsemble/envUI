import { Text, Button, Card, NavigationItem, Stack, ActionGroup } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Devices } from '@envsemble/envui/icons/Devices';
import { Example, SpecimenGrid } from '../Example';

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
                ...(label === 'Circular icons' ? { width: '6rem', justifySelf: 'center' } : {}),
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
      <Example title="Regular composition">
        <Stack>
          <NavigationItem icon={<Home />} selected>
            Workspace
          </NavigationItem>
          <Card>
            <Text as="h3" variant="section-heading">
              Autumn release
            </Text>
            <Text>Content wraps naturally as the available space changes.</Text>
            <ActionGroup>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </ActionGroup>
          </Card>
        </Stack>
      </Example>
      <Example title="Compact composition" size="compact">
        <Stack className="docs-narrow-actions">
          <NavigationItem icon={<Devices />} selected>
            Workspace
          </NavigationItem>
          <Card>
            <Text as="h3" variant="section-heading">
              Autumn release
            </Text>
            <Text>Use stacked actions when the content needs more space.</Text>
            <ActionGroup stacked>
              <Button>Save changes</Button>
              <Button variant="secondary">Cancel</Button>
            </ActionGroup>
          </Card>
        </Stack>
      </Example>
    </>
  );
}
