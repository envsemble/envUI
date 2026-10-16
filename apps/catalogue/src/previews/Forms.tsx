import { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Checkbox,
  Select,
  Slider,
  Stack,
  Button,
  IconButton,
  Surface,
  List,
  Kbd,
  ActionGroup,
  DropZone,
  Text,
} from '@envsemble/envui';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';

import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

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

function LogoPicker() {
  const picker = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!logo) return setPreview(undefined);
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);
  return (
    <Stack gap={3}>
      <DropZone
        hidden={logo != null}
        inputRef={picker}
        label="Drop a logo here, or browse"
        description="PNG, JPG or WebP up to 2 MB"
        accept="image/png,image/jpeg,.webp"
        error={error}
        onFiles={([file]) => {
          if (file && file.size > 2 * 1024 * 1024) return setError('Choose an image up to 2 MB.');
          setError(undefined);
          setLogo(file ?? null);
        }}
        onReject={() => setError('Choose a PNG, JPG or WebP image.')}
      />
      {logo && (
        <ActionGroup className="docs-file-preview">
          <img src={preview} alt="" width={48} height={48} />
          <Text as="span">{logo.name}</Text>
          <Button variant="secondary" onClick={() => picker.current?.click()}>
            Replace
          </Button>
          <Button variant="text" onClick={() => setLogo(null)}>
            Remove
          </Button>
        </ActionGroup>
      )}
    </Stack>
  );
}

export function DropZonePreview() {
  const [documents, setDocuments] = useState<string[]>([]);
  return (
    <Preview>
      <Example
        title="Drop or browse"
        caption={
          <>
            Press the zone, or <Kbd>Enter</Kbd> or <Kbd>Space</Kbd> while it has focus, to open the
            file picker. The application shows the chosen image with actions to replace or remove
            it.
          </>
        }
      >
        <LogoPicker />
      </Example>
      <Example title="States" size="collection">
        <SpecimenGrid>
          <Specimen
            title="Compact, several files"
            caption={documents.length ? documents.join(', ') : 'No documents yet.'}
          >
            <DropZone
              compact
              multiple
              label="Attach documents"
              description="Any file, several at once"
              onFiles={(files) => setDocuments(files.map((file) => file.name))}
            />
          </Specimen>
          <Specimen title="Pending">
            <DropZone
              pending
              label="Uploading the logo"
              description="This takes a moment"
              onFiles={() => undefined}
            />
          </Specimen>
          <Specimen title="Error">
            <DropZone
              label="Drop a cover image"
              accept="image/*"
              error="Choose an image at least 1200 pixels wide."
              onFiles={() => undefined}
            />
          </Specimen>
          <Specimen title="Disabled">
            <DropZone disabled label="Uploads are paused" onFiles={() => undefined} />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
