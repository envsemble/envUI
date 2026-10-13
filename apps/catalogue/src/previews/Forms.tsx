import { useState } from 'react';
import {
  Input,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Select,
  Slider,
  Stack,
  SearchField,
  Button,
  IconButton,
  Surface,
  GroupedRows,
  Row,
  Kbd,
  ActionGroup,
} from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Sell } from '@envsemble/envui/icons/Sell';

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
      <Example
        title="Prefix & suffix"
        size="collection"
        caption="Short text before or after the value appears once the field has focus or a value; forms submit only the value."
      >
        <SpecimenGrid>
          <Specimen title="Prefix">
            <Input
              label="Address"
              name="address"
              prefix="https://example.com/"
              defaultValue="quarterly-report"
            />
          </Specimen>
          <Specimen title="Suffix">
            <Input label="Storage" name="storage" type="number" suffix="GB" defaultValue="20" />
          </Specimen>
          <Specimen title="Compact with an icon">
            <Input
              compact
              label="Price"
              name="price"
              placeholder="0.00"
              prefix="€"
              suffix="per month"
              startIcon={<Sell />}
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
      caption={
        <>
          Compact fields share the button height and can show a floating label. Type to reveal the
          clear action; <Kbd>Esc</Kbd> also clears.
        </>
      }
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
        <Specimen title="Floating label">
          <div className="docs-field-toolbar">
            <SearchField label="Filter projects" showLabel />
            <Button variant="secondary">New project</Button>
          </div>
        </Specimen>
        <Specimen title="Floating label, icon and end action">
          <Input
            compact
            showLabel
            label="Invite address"
            name="compact-invite"
            defaultValue="team@example.com"
            startIcon={<Mail />}
            endAction={
              <IconButton variant="text" icon={<ContentCopy />} aria-label="Copy address" />
            }
          />
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
            <GroupedRows aria-label="Notification settings">
              <Row
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
            </GroupedRows>
          </Specimen>
          <Specimen title="Outlined, in a form on a pane">
            <Surface padding={4}>
              <Stack gap={4}>
                <Input label="E-mail address" type="email" />
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
