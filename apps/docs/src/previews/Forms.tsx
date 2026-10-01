import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Stack,
} from '@envsemble/envui';

import { Example, Specimen, SpecimenGrid } from './Example';
import { PairedThemes } from './PairedThemes';

export function InputPreview() {
  const [emptyProjectName, setEmptyProjectName] = useState('');
  const [projectName, setProjectName] = useState('Autumn release');
  return (
    <PairedThemes>
      {(theme) => (
        <>
          <Example title="Interactive field" size="field">
            <Input
              label="Project name"
              name={`project-${theme}`}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              hint="A name your team will recognize."
            />
          </Example>
          <Example title="Empty, filled & focus" size="collection">
            <SpecimenGrid>
              <Specimen title="Empty">
                <Input
                  label="Project name"
                  placeholder="Enter a name"
                  value={emptyProjectName}
                  onChange={(e) => setEmptyProjectName(e.target.value)}
                />
              </Specimen>
              <Specimen title="Filled">
                <Input
                  label="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </Specimen>
              <Specimen title="Keyboard focus">
                <Input
                  label="Project name"
                  className="docs-force-3"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </Specimen>
            </SpecimenGrid>
          </Example>
          <Example title="Validation & availability" size="collection">
            <SpecimenGrid>
              <Specimen title="Invalid">
                <Input
                  label="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  error="Choose a unique project name."
                />
              </Specimen>
              <Specimen title="Read only" caption="readOnly">
                <Input label="Project name" value="Workspace default" readOnly />
              </Specimen>
              <Specimen title="Disabled" caption="disabled">
                <Input label="Project name" value="Unavailable" disabled />
              </Specimen>
            </SpecimenGrid>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function TextareaPreview() {
  const [emptyDescription, setEmptyDescription] = useState('');
  const [projectDescription, setProjectDescription] = useState(
    'Shared plans for the next release.',
  );
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Interactive description" size="field">
            <Textarea
              label="Description"
              rows={4}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              hint="Explain what this project is for."
            />
          </Example>
          <Example title="States & validation" size="collection">
            <SpecimenGrid>
              <Specimen title="Empty">
                <Textarea
                  label="Description"
                  rows={2}
                  value={emptyDescription}
                  onChange={(e) => setEmptyDescription(e.target.value)}
                />
              </Specimen>
              <Specimen title="Keyboard focus">
                <Textarea
                  label="Description"
                  className="docs-force-3"
                  rows={2}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </Specimen>
              <Specimen title="Invalid">
                <Textarea
                  label="Description"
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  error="Add the intended outcome."
                />
              </Specimen>
              <Specimen title="Read only" caption="readOnly">
                <Textarea
                  label="Description"
                  rows={2}
                  readOnly
                  value="Provided by the workspace."
                />
              </Specimen>
              <Specimen title="Disabled" caption="disabled">
                <Textarea label="Description" rows={2} disabled value="Unavailable" />
              </Specimen>
            </SpecimenGrid>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function CheckboxPreview() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [projectSelection, setProjectSelection] = useState<boolean | 'mixed'>('mixed');
  return (
    <PairedThemes>
      {() => (
        <>
          <Example title="Independent selection" size="collection">
            <SpecimenGrid size="compact">
              <Specimen title="Interactive choices">
                <Stack>
                  <Checkbox
                    label="Include archived items"
                    checked={includeArchived}
                    onCheckedChange={setIncludeArchived}
                  />
                  <Checkbox
                    label="Selected choice"
                    checked={!includeArchived}
                    onCheckedChange={(next) => setIncludeArchived(!next)}
                  />
                </Stack>
              </Specimen>
              <Specimen title="Disabled choices">
                <Stack>
                  <Checkbox label="Include archived items" disabled />
                  <Checkbox label="Include completed items" checked disabled />
                </Stack>
              </Specimen>
            </SpecimenGrid>
          </Example>
          <Example title="Partial selection" size="compact">
            <Stack>
              <Checkbox
                label="All projects"
                checked={projectSelection}
                onCheckedChange={setProjectSelection}
              />
              <Button variant="secondary" onClick={() => setProjectSelection('mixed')}>
                Restore partial selection
              </Button>
            </Stack>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function SwitchPreview() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  return (
    <PairedThemes>
      {() => (
        <Example title="On, off & disabled" size="collection">
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
                  checked={!notificationsEnabled}
                  onCheckedChange={(next) => setNotificationsEnabled(!next)}
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
      )}
    </PairedThemes>
  );
}

export function RadioPreview() {
  const [projectAccess, setProjectAccess] = useState('team');
  return (
    <PairedThemes>
      {(theme) => (
        <>
          <Example title="Inline choices" size="field">
            <RadioGroup
              label="Access"
              name={`access-inline-${theme}`}
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
              name={`access-rows-${theme}`}
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
            <RadioGroup
              label="Inherited access"
              name={`access-disabled-${theme}`}
              value="team"
              disabled
            >
              <Radio value="team" label="Team" />
              <Radio value="private" label="Private" />
            </RadioGroup>
          </Example>
        </>
      )}
    </PairedThemes>
  );
}

export function SelectPreview() {
  const [selectedOwner, setSelectedOwner] = useState('');

  const [projectAccess, setProjectAccess] = useState('team');
  return (
    <PairedThemes>
      {(theme) => (
        <Example title="Selection, validation & availability" size="collection">
          <SpecimenGrid>
            <Specimen title="Interactive">
              <Select
                label="Visibility"
                hint="Choose who can open the project."
                name={`visibility-${theme}`}
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
                name={`owner-${theme}`}
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
            <Specimen title="Disabled" caption="disabled">
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
      )}
    </PairedThemes>
  );
}
