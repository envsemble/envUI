import { Text, Button, IconButton, Surface, Stack, ActionGroup } from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function SurfacePreview() {
  return (
    <Preview>
      <Example title="Content layout" size="collection">
        <SpecimenGrid size="card">
          <Specimen
            title="Plain surface"
            caption="Fill, padding and corners; no automatic content gaps."
          >
            <Surface tone="pane" padding={5}>
              <Text>Shared workspace context.</Text>
            </Surface>
          </Specimen>
          <Specimen title="With Stack" caption="Stack supplies the gap on the same root.">
            <Surface tone="pane" padding={5} render={<Stack gap={5} />}>
              <Text as="h3" variant="section-heading">
                Workspace pane
              </Text>
              <Text tone="muted">Compose content with the spacing it needs.</Text>
            </Surface>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Tones and corners" size="collection">
        <SpecimenGrid size="compact">
          <Specimen title="Pane" caption="Outer corners">
            <Surface tone="pane" padding={4}>
              <Text>Grouped content</Text>
            </Surface>
          </Specimen>
          <Specimen title="Alternate" caption="Standard corners">
            <Surface tone="alternate" padding={4} corners="standard">
              <Text>Alternate fill</Text>
            </Surface>
          </Specimen>
          <Specimen title="Row" caption="Pill corners">
            <Surface tone="row" padding={4} corners="pill">
              <Text>Muted fill</Text>
            </Surface>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Density" size="collection">
        <SpecimenGrid size="compact">
          <Specimen title="Standard" caption="Standard control height">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              role="group"
              aria-label="Standard toolbar"
              render={<ActionGroup />}
            >
              <Button variant="secondary">Fit</Button>
              <IconButton variant="text" icon={<Apps />} aria-label="Views" />
            </Surface>
          </Specimen>
          <Specimen title="Compact" caption="For toolbars over dense content">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              density="compact"
              role="group"
              aria-label="Compact toolbar"
              render={<ActionGroup />}
            >
              <Button variant="secondary">Fit</Button>
              <IconButton variant="text" icon={<Apps />} aria-label="Views" />
            </Surface>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function LayoutPreview() {
  return (
    <Preview>
      <Example title="Content spacing" size="collection">
        <SpecimenGrid>
          <Specimen title="Default gap" caption="Step 4 · 1 rem between blocks">
            <Stack>
              <Text as="h3" variant="section-heading">
                Sample project
              </Text>
              <Text>Shared plans and notes for the project.</Text>
              <Text variant="caption">Updated today</Text>
            </Stack>
          </Specimen>
          <Specimen title="Compact gap" caption="Step 2 · 0.5 rem between blocks">
            <Stack gap={2}>
              <Text as="h3" variant="section-heading">
                Sample project
              </Text>
              <Text>Shared plans and notes for the project.</Text>
              <Text variant="caption">Updated today</Text>
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Action groups"
        size="collection"
        caption="Switch to stacked actions when the labels need more room; the application chooses when."
      >
        <SpecimenGrid>
          <Specimen title="Wrapped row" caption="1 rem gap; actions wrap when needed.">
            <ActionGroup>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </ActionGroup>
          </Specimen>
          <Specimen title="Stacked" caption="0.5 rem gap; label buttons fill the group.">
            <ActionGroup stacked className="docs-narrow-actions">
              <Button>Save changes</Button>
              <Button variant="secondary">Cancel</Button>
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
