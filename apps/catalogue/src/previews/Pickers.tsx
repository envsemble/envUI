import { useEffect, useState } from 'react';
import {
  ActionGroup,
  Avatar,
  Button,
  Calendar,
  Combobox,
  DateTimeField,
  Kbd,
  Stack,
  Surface,
  Text,
  type ComboboxGroup,
  type ComboboxItem,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const peopleNames = [
  'Alex Morgan',
  'Sam Lee',
  'Jordan Park',
  'Riley Chen',
  'Taylor Brooks',
  'Casey Nguyen',
  'Morgan Diaz',
  'Avery Quinn',
  'Drew Patel',
  'Robin Ellis',
];

const people: ComboboxItem[] = peopleNames.map((name) => {
  const handle = name.toLowerCase().replace(' ', '.');
  return {
    value: handle,
    label: name,
    description: `${handle}@example.com`,
    leading: <Avatar name={name} />,
  };
});

const documents: ComboboxGroup[] = [
  {
    label: 'Recent',
    items: [
      { value: 'quarterly-report', label: 'Quarterly report', leading: <Description /> },
      { value: 'release-notes', label: 'Release notes', leading: <Description /> },
      { value: 'design-review', label: 'Design review', leading: <Description /> },
    ],
  },
  {
    label: 'Folders',
    items: [
      { value: 'design-system/tokens', label: 'design-system/tokens', leading: <Folder /> },
      { value: 'design-system/icons', label: 'design-system/icons', leading: <Folder /> },
    ],
  },
];

const topics: ComboboxItem[] = [
  'Accessibility',
  'Documentation',
  'Localization',
  'Performance',
  'Security',
  'Testing',
].map((label) => ({ value: label.toLowerCase(), label }));

/** Looks people up after a short pause, as a search on a server would. */
function ServerSearchExample() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ComboboxItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [contact, setContact] = useState<string | null>(null);
  useEffect(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      setResults(people.filter((person) => person.label.toLowerCase().includes(text)));
      setSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <Combobox
      label="Contact"
      items={results}
      filter={null}
      loading={searching}
      loadingLabel="Searching…"
      onInputValueChange={setQuery}
      emptyLabel={query.trim() ? 'No contacts found' : 'Type a name to search'}
      value={contact}
      onValueChange={setContact}
      clearable
    />
  );
}

export function ComboboxPreview() {
  const [owner, setOwner] = useState<string | null>('alex.morgan');
  const [reviewers, setReviewers] = useState<string[]>(['sam.lee', 'riley.chen']);
  return (
    <Preview>
      <Example
        title="One option or several"
        size="collection"
        caption={
          <>
            Type to filter by name or e-mail address. <Kbd>↑</Kbd> and <Kbd>↓</Kbd> move the
            highlight and <Kbd>Enter</Kbd> chooses. In the field with chips, <Kbd>Backspace</Kbd>{' '}
            removes the last one.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen title="One person">
            <Combobox
              label="Owner"
              items={people}
              value={owner}
              onValueChange={setOwner}
              hint="The person who answers questions."
              clearable
            />
          </Specimen>
          <Specimen title="Several people">
            <Combobox
              multiple
              label="Reviewers"
              items={people}
              value={reviewers}
              onValueChange={setReviewers}
              placeholder="Add people"
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Compact & grouped"
        size="collection"
        caption="Compact fields take the compact control height, like a compact Select, and open the compact menu's popup."
      >
        <SpecimenGrid>
          <Specimen title="In a compact toolbar">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              density="compact"
              role="group"
              aria-label="Document toolbar"
              render={<ActionGroup />}
            >
              <Combobox
                density="compact"
                aria-label="Document"
                placeholder="Document"
                items={documents}
              />
              <Button variant="outlined">Open</Button>
            </Surface>
          </Specimen>
          <Specimen title="Several topics">
            <Combobox
              multiple
              density="compact"
              aria-label="Topics"
              placeholder="Topics"
              items={topics}
              defaultValue={['accessibility', 'testing']}
              clearable
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Search on a server"
        size="field"
        caption="With filter set to null, the list shows the options the application finds for the typed text, with a loading state while it searches."
      >
        <ServerSearchExample />
      </Example>
      <Example title="Validation & availability" size="collection">
        <SpecimenGrid>
          <Specimen title="Required">
            <Combobox
              label="Approver"
              items={people}
              required
              error="Choose someone to approve the release."
            />
          </Specimen>
          <Specimen title="Read only" caption="Can still be focused and browsed.">
            <Combobox
              multiple
              label="Reviewers"
              items={people}
              defaultValue={['sam.lee']}
              readOnly
            />
          </Specimen>
          <Specimen title="Disabled" caption="Unavailable and excluded from form submission.">
            <Combobox label="Owner" items={people} defaultValue="jordan.park" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function DateTimeFieldPreview() {
  const [publishOn, setPublishOn] = useState<string | null>('2026-10-20');
  const [meeting, setMeeting] = useState<string | null>('2026-10-21T09:30');
  const [day, setDay] = useState<string | null>(null);
  return (
    <Preview>
      <Example
        title="A date, or a date and time"
        size="collection"
        caption={
          <>
            Press a field or <Kbd>↓</Kbd> to open its calendar. <Kbd>←</Kbd> <Kbd>→</Kbd>{' '}
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move by day and week, <Kbd>Page Up</Kbd> and{' '}
            <Kbd>Page Down</Kbd> by month, and <Kbd>Enter</Kbd> chooses.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen title="Date">
            <DateTimeField
              label="Publish on"
              value={publishOn}
              onValueChange={setPublishOn}
              hint="The day the report goes out."
              clearable
            />
          </Specimen>
          <Specimen title="Date and time">
            <DateTimeField
              label="Meeting"
              withTime
              defaultTime="09:00"
              value={meeting}
              onValueChange={setMeeting}
              clearable
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Compact & limits"
        size="collection"
        caption="min and max make the days outside them unavailable."
      >
        <SpecimenGrid>
          <Specimen title="In a compact toolbar">
            <Surface
              tone="pane"
              padding={1}
              corners="pill"
              density="compact"
              role="group"
              aria-label="Schedule toolbar"
              render={<ActionGroup />}
            >
              <DateTimeField
                density="compact"
                aria-label="Due"
                placeholder="Due"
                withTime
                clearable
              />
              <Button variant="outlined">Schedule</Button>
            </Surface>
          </Specimen>
          <Specimen title="Within a range">
            <DateTimeField
              label="Review by"
              min="2026-10-01"
              max="2026-12-31"
              placeholder="Choose a day"
            />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Validation & availability" size="collection">
        <SpecimenGrid>
          <Specimen title="Invalid">
            <DateTimeField label="Ends" required error="Choose a day after the start." />
          </Specimen>
          <Specimen title="Read only">
            <DateTimeField label="Created" defaultValue="2026-09-30T16:45" withTime readOnly />
          </Specimen>
          <Specimen title="Disabled">
            <DateTimeField label="Archived on" defaultValue="2026-08-14" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Calendar on its own" size="field">
        <Stack gap={3}>
          <Calendar aria-label="Planning" value={day} onValueChange={setDay} />
          <Text variant="caption" aria-live="polite">
            {day ? `Chosen: ${day}` : 'No day chosen yet.'}
          </Text>
        </Stack>
      </Example>
    </Preview>
  );
}
