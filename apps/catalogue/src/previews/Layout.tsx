import { useState } from 'react';
import {
  Text,
  Button,
  IconButton,
  Surface,
  List,
  Link,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';
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

export function ListPreview() {
  const [actionResult, setActionResult] = useState('');
  const [opened, setOpened] = useState('');
  return (
    <Preview>
      <Example title="Single and connected rows" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="Single row" caption="Large corners on all sides">
            <List.Root>
              <List.Item title="Notifications" detail="Delivery preferences" />
            </List.Root>
          </Specimen>
          <Specimen title="Connected rows" caption="Large outside corners; compact inner joins">
            <List.Root>
              <List.Item title="Notifications" detail="Delivery preferences" />
              <List.Item title="Workspace access" detail="People and permissions" />
              <List.Item title="Appearance" detail="Theme preference" />
            </List.Root>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Alternate fill" caption="Use alternate fill when rows sit on a muted pane.">
        <List.Root contrast>
          <List.Item title="Notifications" detail="Delivery preferences" />
          <List.Item title="Workspace access" detail="People and permissions" />
        </List.Root>
      </Example>
      <Example title="Action slot">
        <List.Root>
          <List.Item
            title="Workspace access"
            detail="People and permissions"
            action={
              <Button
                variant="outlined"
                onClick={() => setActionResult('Managing workspace access')}
              >
                Manage
              </Button>
            }
          />
        </List.Root>
        <Text variant="caption" aria-live="polite">
          {actionResult}
        </Text>
      </Example>
      <Example
        title="Rows that open something"
        caption="Interactive rows react to hover, presses and focus inside them. Each title link stretches over its row, and the action stays above it."
      >
        <List.Root aria-label="Recent plans">
          {['Roadmap', 'Decisions'].map((name) => (
            <List.Item
              key={name}
              interactive
              title={
                <Link
                  href={`#${name.toLowerCase()}`}
                  underline={false}
                  data-row-target
                  draggable={false}
                  onClick={(event) => {
                    event.preventDefault();
                    setOpened(`Opened ${name}`);
                  }}
                >
                  {name}
                </Link>
              }
              detail="Updated today"
              action={
                <IconButton
                  variant="text"
                  icon={<MoreHoriz />}
                  aria-label={`More actions for ${name}`}
                  className="docs-row-action"
                  onClick={() => setOpened(`More actions for ${name}`)}
                />
              }
            />
          ))}
        </List.Root>
        <Text variant="caption" aria-live="polite">
          {opened}
        </Text>
      </Example>
    </Preview>
  );
}
