import { useState } from 'react';
import {
  Text,
  Button,
  IconButton,
  InfoChip,
  DisclosureNote,
  Card,
  Surface,
  FeatureCard,
  GroupedRows,
  Row,
  Input,
  Switch,
  Select,
  Stack,
  ActionGroup,
} from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Example, Specimen, SpecimenGrid } from './Example';
import { PairedThemes } from './PairedThemes';

export function SurfacePreview() {
  return (
    <PairedThemes>
      {() => (
        <>
          <Example
            title="Surface with explicit layout"
            caption="Surface owns fill, padding and corners; Stack owns the gap."
          >
            <Surface tone="pane" padding={5} render={<Stack gap={5} />}>
              <Text as="h3" variant="section-heading">
                Workspace pane
              </Text>
              <Text tone="muted">Compose content with the spacing it needs.</Text>
              <ActionGroup>
                <Button>Continue</Button>
                <Button variant="secondary">Cancel</Button>
              </ActionGroup>
            </Surface>
          </Example>
          <Example
            title="Surface and Card"
            caption="Surface sets appearance; Card also spaces its contents."
            size="collection"
          >
            <SpecimenGrid size="card">
              <Surface tone="row">
                <Text as="h3" variant="section-heading">
                  Plain surface
                </Text>
                <Text tone="muted">No automatic gap between these blocks.</Text>
              </Surface>
              <Card>
                <Text as="h3" variant="section-heading">
                  Content card
                </Text>
                <Text tone="muted">The card spaces its direct children.</Text>
              </Card>
            </SpecimenGrid>
          </Example>
          <Example title="Tones and corners" size="collection">
            <SpecimenGrid size="compact">
              <Surface tone="pane" padding={4}>
                <Text>Pane · outer corners</Text>
              </Surface>
              <Surface tone="alternate" padding={4} corners="standard">
                <Text>Alternate · standard corners</Text>
              </Surface>
              <Surface tone="row" padding={4} corners="pill">
                <Text>Row · pill corners</Text>
              </Surface>
            </SpecimenGrid>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function LayoutPreview() {
  const [projectName, setProjectName] = useState('Autumn release');
  const [projectDescription, setProjectDescription] = useState(
    'Shared plans for the next release.',
  );
  return (
    <PairedThemes>
      {() => (
        <>
          <Example
            title="Content spacing"
            caption="Stack uses 1 rem between related blocks."
            size="field"
          >
            <Stack>
              <Input
                label="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Input
                label="Supporting detail"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
              <DisclosureNote title="Optional guidance">
                <Text>Keep external spacing in the parent layout.</Text>
              </DisclosureNote>
            </Stack>
          </Example>
          <Example title="Action rows" caption="1 rem gap; actions wrap when needed.">
            <ActionGroup>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </ActionGroup>
          </Example>
          <Example title="Stacked actions" caption="0.5 rem gap; label buttons fill the group.">
            <ActionGroup stacked className="docs-narrow-actions">
              <Button>Save changes</Button>
              <Button variant="secondary">Cancel</Button>
            </ActionGroup>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function RowsPreview() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [rowCount, setRowCount] = useState('3');
  const [actionResult, setActionResult] = useState('');
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="One to five rows">
            <Select
              label="Row count"
              value={rowCount}
              onValueChange={(v) => setRowCount(v ?? '3')}
              options={['1', '2', '3', '4', '5'].map((value) => ({
                value,
                label: `${value} ${value === '1' ? 'row' : 'rows'}`,
              }))}
            />
            <GroupedRows>
              {Array.from({ length: Number(rowCount) }, (_, i) => (
                <Row
                  key={i}
                  title={`Setting ${i + 1}`}
                  detail="Supporting detail"
                  action={
                    <Button
                      variant="outlined"
                      onClick={() => setActionResult(`Managing setting ${i + 1}`)}
                    >
                      Manage
                    </Button>
                  }
                />
              ))}
            </GroupedRows>
            <Text variant="caption" className="docs-caption" aria-live="polite">
              {actionResult}
            </Text>
          </Example>
          <Example title="Alternate background">
            <GroupedRows contrast>
              <Row
                title="Notifications"
                detail="Delivery preferences"
                action={
                  <Switch
                    label="Enable notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                }
              />
              <Row
                title="Workspace access"
                detail="People and permissions"
                action={<IconButton icon={<ChevronRight />} aria-label="Manage workspace access" />}
              />
            </GroupedRows>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function CardsPreview() {
  const [guidanceExpanded, setGuidanceExpanded] = useState(false);
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Content & actions" size="collection">
            <SpecimenGrid size="card">
              <Specimen title="Content card">
                <Card>
                  <Text as="h3" variant="section-heading">
                    Project overview
                  </Text>
                  <Text tone="muted">Planning and progress for the autumn release.</Text>
                  <InfoChip>Updated today</InfoChip>
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
                <Card href="#/overview">
                  <Text as="h3" variant="section-heading">
                    Component overview
                  </Text>
                  <Text tone="muted">Browse the component catalogue.</Text>
                </Card>
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
          <Example title="Feature composition" size="wide">
            <FeatureCard
              icon={<Apps />}
              title="Connected workspace"
              description="Bring your team and tools together."
              action={<Button>Explore</Button>}
            />
          </Example>
          <Example title="Compact feature" size="field">
            <FeatureCard
              icon={<Apps />}
              title="Connected workspace"
              description="Bring your team and tools together."
              action={<Button>Explore</Button>}
            />
          </Example>
        </>
      )}
    </PairedThemes>
  );
}
