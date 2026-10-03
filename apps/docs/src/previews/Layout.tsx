import { useState } from 'react';
import {
  Text,
  Button,
  Card,
  Surface,
  FeatureCard,
  GroupedRows,
  Row,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
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
                Autumn release
              </Text>
              <Text>Shared plans for the next release.</Text>
              <Text variant="caption">Updated today</Text>
            </Stack>
          </Specimen>
          <Specimen title="Compact gap" caption="Step 2 · 0.5 rem between blocks">
            <Stack gap={2}>
              <Text as="h3" variant="section-heading">
                Autumn release
              </Text>
              <Text>Shared plans for the next release.</Text>
              <Text variant="caption">Updated today</Text>
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Action groups" size="collection">
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

export function RowsPreview() {
  const [actionResult, setActionResult] = useState('');
  return (
    <Preview>
      <Example title="Single and connected rows" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="Single row" caption="Large corners on all sides">
            <GroupedRows>
              <Row title="Notifications" detail="Delivery preferences" />
            </GroupedRows>
          </Specimen>
          <Specimen title="Connected rows" caption="Large outside corners; compact inner joins">
            <GroupedRows>
              <Row title="Notifications" detail="Delivery preferences" />
              <Row title="Workspace access" detail="People and permissions" />
              <Row title="Appearance" detail="Theme preference" />
            </GroupedRows>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Alternate fill">
        <GroupedRows contrast>
          <Row title="Notifications" detail="Delivery preferences" />
          <Row title="Workspace access" detail="People and permissions" />
        </GroupedRows>
      </Example>
      <Example title="Action slot">
        <GroupedRows>
          <Row
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
        </GroupedRows>
        <Text variant="caption" aria-live="polite">
          {actionResult}
        </Text>
      </Example>
    </Preview>
  );
}

export function CardsPreview() {
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);
  return (
    <Preview>
      <Example title="Content & actions" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="Content card">
            <Card>
              <Text as="h3" variant="section-heading">
                Project overview
              </Text>
              <Text tone="muted">Planning and progress for the autumn release.</Text>
              <Text variant="caption">Updated today</Text>
            </Card>
          </Specimen>
          <Specimen title="Action strip">
            <Card
              as="article"
              layout="action"
              heading="Autumn release"
              meta="Updated today"
              actions={
                <>
                  <Button variant="secondary">Share</Button>
                  <Button variant="outlined">Open project</Button>
                </>
              }
            >
              <Text tone="muted">Shared context for the next release.</Text>
            </Card>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Interactive cards" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="Destination">
            <Card href={location.href} onClick={() => setDestinationSelected(true)}>
              <Text as="h3" variant="section-heading">
                Autumn release
              </Text>
              <Text tone="muted">Open the project details.</Text>
            </Card>
            <Text variant="caption" aria-live="polite">
              {destinationSelected ? 'Project link selected.' : ''}
            </Text>
          </Specimen>
          <Specimen title="Action">
            <Card
              as="button"
              onClick={() => setGuidanceExpanded(!guidanceExpanded)}
              aria-expanded={guidanceExpanded}
            >
              <Text as="span" variant="section-heading">
                {guidanceExpanded ? 'Hide details' : 'Show details'}
              </Text>
              <Text as="span" tone="muted">
                {guidanceExpanded
                  ? 'Your team and tools share one workspace.'
                  : 'Project details are available.'}
              </Text>
            </Card>
          </Specimen>
          <Specimen title="Disabled">
            <Card as="button" disabled>
              <Text as="span">Workspace unavailable</Text>
            </Card>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Feature cards" size="collection">
        <SpecimenGrid size="wide">
          <Specimen title="Regular composition">
            <FeatureCard
              icon={<Apps />}
              title="Connected workspace"
              description="Bring your team and tools together."
              action={<Button>Explore</Button>}
            />
          </Specimen>
          <Specimen title="Compact composition">
            <div className="docs-compact-feature">
              <FeatureCard
                icon={<Apps />}
                title="Connected workspace"
                description="Bring your team and tools together."
                action={<Button>Explore</Button>}
              />
            </div>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
