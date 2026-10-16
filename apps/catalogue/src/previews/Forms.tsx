import { useState } from 'react';
import {
  TextField,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Slider,
  Stack,
  IconButton,
  Surface,
  List,
  Kbd,
  ActionGroup,
} from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';

import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function SwitchPreview() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [summariesEnabled, setSummariesEnabled] = useState(false);
  return (
    <Preview>
      <Example
        title="On, off & disabled"
        size="collection"
        caption="Use switches for settings that apply immediately; use checkboxes for choices saved with a form."
      >
        <SpecimenGrid size="compact">
          <Specimen title="Interactive settings">
            <Stack>
              <Switch
                label="Enable notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <Switch
                label="Enable summaries"
                checked={summariesEnabled}
                onCheckedChange={setSummariesEnabled}
              />
            </Stack>
          </Specimen>
          <Specimen title="Disabled settings">
            <Stack>
              <Switch label="Enable notifications" disabled />
              <Switch label="Enable summaries" checked disabled />
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function RadioPreview() {
  const [projectAccess, setProjectAccess] = useState('team');
  return (
    <Preview>
      <Example title="Inline choices" size="field">
        <RadioGroup
          label="Access"
          name="access-inline"
          value={projectAccess}
          onValueChange={setProjectAccess}
        >
          <Radio value="team" label="Team" />
          <Radio value="private" label="Private" />
          <Radio value="unavailable" label="Unavailable" disabled />
        </RadioGroup>
      </Example>
      <Example title="Selectable rows">
        <RadioGroup
          label="Project visibility"
          name="access-rows"
          value={projectAccess}
          onValueChange={setProjectAccess}
          variant="rows"
        >
          <Radio value="team" label="Team" detail="Everyone in your workspace" />
          <Radio value="private" label="Private" detail="Only invited people" />
          <Radio
            value="unavailable"
            label="Public"
            detail="Unavailable for this workspace"
            disabled
          />
        </RadioGroup>
      </Example>
      <Example title="Disabled group" size="field">
        <RadioGroup label="Inherited access" name="access-disabled" value="team" disabled>
          <Radio value="team" label="Team" />
          <Radio value="private" label="Private" />
        </RadioGroup>
      </Example>
    </Preview>
  );
}

export function SelectPreview() {
  const [selectedOwner, setSelectedOwner] = useState('');

  const [projectAccess, setProjectAccess] = useState('team');
  return (
    <Preview>
      <Example
        title="Variants"
        size="collection"
        caption="Choose the trigger for its surroundings. The open list is a raised popup with a border, so it stands apart from any background."
      >
        <SpecimenGrid>
          <Specimen title="Secondary, on the page">
            <Select label="Sort by" options={sortOptions} defaultValue="recent" />
          </Specimen>
          <Specimen title="Outlined, on a pane">
            <Surface padding={4}>
              <Select
                variant="outlined"
                label="Sort by"
                options={sortOptions}
                defaultValue="recent"
              />
            </Surface>
          </Specimen>
          <Specimen title="Outlined, in a row">
            <List.Root aria-label="Notification settings">
              <List.Item
                title="E-mail digest"
                action={
                  <Select
                    variant="outlined"
                    aria-label="E-mail digest"
                    options={digestOptions}
                    defaultValue="weekly"
                  />
                }
              />
            </List.Root>
          </Specimen>
          <Specimen title="Outlined, in a form on a pane">
            <Surface padding={4}>
              <Stack gap={4}>
                <TextField label="E-mail address" type="email" />
                <Select
                  variant="outlined"
                  label="Role"
                  hint="Admins also manage members and billing."
                  options={roleOptions}
                  defaultValue="member"
                />
              </Stack>
            </Surface>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Compact"
        size="collection"
        caption="For dense desktop interfaces such as toolbars and title bars: the compact control height, and the compact menu's popup, where a check mark shows the selected option."
      >
        <SpecimenGrid>
          <Specimen title="Secondary, on the page">
            <Select
              density="compact"
              aria-label="Sort documents"
              options={sortOptions}
              defaultValue="recent"
            />
          </Specimen>
          <Specimen title="Outlined, in a compact toolbar">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              density="compact"
              role="group"
              aria-label="Canvas toolbar"
              render={<ActionGroup />}
            >
              <Select
                density="compact"
                variant="outlined"
                aria-label="Zoom"
                options={zoomOptions}
                defaultValue="100"
              />
              <IconButton variant="text" icon={<ZoomIn />} aria-label="Zoom in" />
            </Surface>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Selection, validation & availability" size="collection">
        <SpecimenGrid>
          <Specimen title="Interactive">
            <Select
              label="Visibility"
              hint="Choose who can open the project."
              name="visibility"
              value={projectAccess}
              onValueChange={(v) => setProjectAccess(v ?? 'team')}
              options={[
                { value: 'team', label: 'Team' },
                { value: 'private', label: 'Private' },
                { value: 'public', label: 'Public (unavailable)', disabled: true },
              ]}
            />
          </Specimen>
          <Specimen title="Required choice">
            <Select
              label="Project owner"
              required
              name="owner"
              placeholder="Choose an owner"
              value={selectedOwner || null}
              onValueChange={(value) => setSelectedOwner(value ?? '')}
              error={!selectedOwner ? 'Choose an owner to continue.' : undefined}
              options={[
                { value: 'you', label: 'You' },
                { value: 'team', label: 'Team' },
              ]}
            />
          </Specimen>
          <Specimen title="Disabled">
            <Select
              label="Inherited visibility"
              value="team"
              disabled
              options={[
                { value: 'team', label: 'Team' },
                { value: 'private', label: 'Private' },
              ]}
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

const sortOptions = [
  { value: 'recent', label: 'Most recent' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
];
const digestOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
];
const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];
const zoomOptions = ['50', '75', '100', '150', '200'].map((value) => ({
  value,
  label: `${value}%`,
}));

export function SliderPreview() {
  const [opacity, setOpacity] = useState(40);
  const [saved, setSaved] = useState(40);
  return (
    <Preview>
      <Example
        title="Choose a value in a range"
        size="collection"
        caption={
          <>
            Drag the thumb or press the track. <Kbd>←</Kbd> and <Kbd>→</Kbd> move by one step,{' '}
            <Kbd>Page Up</Kbd> and <Kbd>Page Down</Kbd> by a tenth of the range, <Kbd>Home</Kbd> and{' '}
            <Kbd>End</Kbd> to its ends.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen
            title="Formatted value"
            caption={`Saved at ${saved}% when the thumb is released.`}
          >
            <Slider
              label="Opacity"
              value={opacity}
              onValueChange={setOpacity}
              onValueCommit={setSaved}
              formatValue={(value) => `${value}%`}
              hint="Applies to the selected layer."
            />
          </Specimen>
          <Specimen title="Steps">
            <Slider label="Volume" name="volume" defaultValue={30} step={5} />
          </Specimen>
          <Specimen title="Disabled">
            <Slider label="Balance" defaultValue={50} disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
