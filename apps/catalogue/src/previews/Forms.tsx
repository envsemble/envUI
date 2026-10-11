import { useState } from 'react';
import {
  Input,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Stack,
  SearchField,
  Button,
  IconButton,
} from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';

import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

function InputExamples() {
  const [emptyProjectName, setEmptyProjectName] = useState('');
  const [projectName, setProjectName] = useState('Sample project');
  const [projectHandle, setProjectHandle] = useState('my project');
  const handleError = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectHandle)
    ? undefined
    : 'Use lowercase letters, numbers and hyphens.';
  return (
    <>
      <Example
        title="Input appearance"
        size="collection"
        caption="Focus the plain field to reveal its underline."
      >
        <SpecimenGrid>
          <Specimen title="Outlined">
            <Input
              label="Project name"
              name="project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              hint="A name your team will recognize."
            />
          </Specimen>
          <Specimen title="Plain">
            <Input
              variant="plain"
              label="Project name"
              name="plainProject"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              hint="A name your team will recognize."
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Empty & filled"
        size="collection"
        caption="Focus either field to move its label onto the outline."
      >
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
        </SpecimenGrid>
      </Example>
      <Example title="Validation & availability" size="collection">
        <SpecimenGrid>
          <Specimen title="Invalid">
            <Input
              label="Project handle"
              value={projectHandle}
              onChange={(e) => setProjectHandle(e.target.value)}
              error={handleError}
            />
          </Specimen>
          <Specimen title="Read only" caption="Can still be focused and copied.">
            <Input label="Project name" value="Workspace default" readOnly />
          </Specimen>
          <Specimen title="Disabled" caption="Unavailable and excluded from form submission.">
            <Input label="Project name" value="Unavailable" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </>
  );
}

function TextareaExamples() {
  const [emptyDescription, setEmptyDescription] = useState('');
  const [projectDescription, setProjectDescription] = useState(
    'Project notes\n\nDescribe the goal.\nList the planned work.\nRecord key decisions.\nAdd links to useful documents.\nNote what is still open.\nKeep the summary up to date.',
  );
  const [summary, setSummary] = useState('');
  return (
    <>
      <Example
        title="Textarea appearance & sizing"
        size="collection"
        caption="Drag the fixed field’s bottom edge to resize it, or focus that edge and use Up/Down arrows. The growing fields follow their content."
      >
        <SpecimenGrid>
          <Specimen title="Scroll & resize">
            <Textarea
              label="Description"
              rows={4}
              sizing="fixed"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </Specimen>
          <Specimen title="Grow with content">
            <Textarea
              label="Description"
              rows={4}
              sizing="content"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </Specimen>
          <Specimen title="Plain, grow with content">
            <Textarea
              variant="plain"
              label="Notes"
              rows={3}
              sizing="content"
              defaultValue="Capture notes and ideas."
            />
          </Specimen>
        </SpecimenGrid>
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
          <Specimen title="Invalid">
            <Textarea
              label="Summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              error={summary.trim().length < 20 ? 'Add at least 20 characters.' : undefined}
            />
          </Specimen>
          <Specimen title="Read only">
            <Textarea label="Description" rows={2} readOnly value="Provided by the workspace." />
          </Specimen>
          <Specimen title="Disabled">
            <Textarea label="Description" rows={2} disabled value="Unavailable" />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </>
  );
}

function CompactFieldExamples() {
  const [query, setQuery] = useState('');
  return (
    <Example
      title="Compact fields & search"
      size="collection"
      caption="Compact fields share the button height. Type to reveal the clear action; Escape also clears."
    >
      <SpecimenGrid>
        <Specimen title="Search beside an action">
          <div className="docs-field-toolbar">
            <SearchField
              label="Search members"
              placeholder="Search by name or e-mail"
              value={query}
              onValueChange={setQuery}
            />
            <Button>Assign seat</Button>
          </div>
        </Specimen>
        <Specimen title="Icon and end action">
          <Input
            label="Invite address"
            name="invite"
            defaultValue="team@example.com"
            startIcon={<Mail />}
            endAction={
              <IconButton variant="text" icon={<ContentCopy />} aria-label="Copy address" />
            }
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}

export function TextFieldsPreview() {
  return (
    <Preview>
      <InputExamples />
      <CompactFieldExamples />
      <TextareaExamples />
    </Preview>
  );
}

export function CheckboxPreview() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState([true, false]);
  const projectSelection = selectedProjects.every(Boolean)
    ? true
    : selectedProjects.some(Boolean)
      ? 'mixed'
      : false;
  return (
    <Preview>
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
                checked={selectedChoice}
                onCheckedChange={setSelectedChoice}
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
      <Example
        title="Select all"
        size="compact"
        caption="Derive the parent's partial selection from the child choices."
      >
        <Stack>
          <Checkbox
            label="All projects"
            checked={projectSelection}
            onCheckedChange={(checked) =>
              setSelectedProjects((current) => current.map(() => checked))
            }
          />
          <Stack gap={3} className="docs-selection-children">
            {['Project one', 'Project two'].map((label, index) => (
              <Checkbox
                key={label}
                label={label}
                checked={selectedProjects[index]}
                onCheckedChange={(checked) =>
                  setSelectedProjects((current) =>
                    current.map((selected, i) => (i === index ? checked : selected)),
                  )
                }
              />
            ))}
          </Stack>
        </Stack>
      </Example>
    </Preview>
  );
}

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
