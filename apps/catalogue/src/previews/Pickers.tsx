import { useEffect, useState } from 'react';
import {
  ActionGroup,
  Avatar,
  Button,
  Combobox,
  Kbd,
  Surface,
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
