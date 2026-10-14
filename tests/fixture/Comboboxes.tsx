import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Combobox,
  Dialog,
  Surface,
  Theme,
  type ComboboxGroup,
  type ComboboxItem,
  type ThemeValue,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

const names = [
  'Alex Morgan',
  'Sam Lee',
  'Jordan Park',
  'Riley Chen',
  'Taylor Brooks',
  'Casey Nguyen',
  'Morgan Diaz',
  'Jamie Fox',
  'Avery Quinn',
  'Drew Patel',
  'Robin Ellis',
  'Quinn Harper',
  'Émile Durand',
];

const slug = (name: string) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');

export const people: ComboboxItem[] = names.map((name) => ({
  value: slug(name),
  label: name,
  description: `${slug(name).replace('-', '.')}@example.com`,
  leading: <Avatar name={name} size="small" />,
  disabled: name === 'Jamie Fox',
}));

const documents: ComboboxGroup[] = [
  {
    label: 'Recent',
    items: [
      { value: 'quarterly-report', label: 'Quarterly report', leading: <Description /> },
      { value: 'release-notes', label: 'Release notes', leading: <Description /> },
    ],
  },
  {
    label: 'Folders',
    items: [
      { value: 'design-system/tokens', label: 'design-system/tokens', leading: <Folder /> },
      { value: 'design-system/icons', label: 'design-system/icons', leading: <Folder /> },
      { value: 'research/interviews', label: 'research/interviews', leading: <Folder /> },
    ],
  },
];

const tags: ComboboxItem[] = [
  'Accessibility',
  'Performance',
  'Documentation',
  'Localization',
  'Security',
  'Testing',
].map((label) => ({ value: label.toLowerCase(), label }));

function ServerSearch({ theme }: { theme: ThemeValue }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ComboboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [chosenLabel, setChosenLabel] = useState<string | null>(null);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase();
      setResults(people.filter((person) => person.label.toLowerCase().startsWith(needle)));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <>
      <Combobox
        label={`Contact ${theme}`}
        items={results}
        filter={null}
        loading={loading}
        loadingLabel="Searching…"
        emptyLabel={query.trim() ? 'No contacts found' : 'Type a name to search'}
        value={chosen}
        onValueChange={(value, item) => {
          setChosen(value);
          setChosenLabel(item?.label ?? null);
        }}
        onInputValueChange={(next) => {
          setQuery(next);
          setQueries((current) => [...current, next]);
        }}
      />
      <output data-testid={`combobox-search-${theme}`}>
        {JSON.stringify({ chosen, chosenLabel, queries })}
      </output>
    </>
  );
}

export function ComboboxFixture({ theme }: { theme: ThemeValue }) {
  const [submitted, setSubmitted] = useState('');
  const [owner, setOwner] = useState<string | null>('riley-chen');
  const [reviewers, setReviewers] = useState<string[]>(['sam-lee']);
  const [opened, setOpened] = useState(0);
  return (
    <Theme theme={theme} data-testid={`combobox-${theme}`} className="fixture-section">
      <form
        data-testid={`combobox-form-${theme}`}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(
            JSON.stringify({
              author: data.get('author'),
              watchers: data.getAll('watchers'),
              document: data.get('document'),
            }),
          );
        }}
      >
        <Combobox
          label={`Author ${theme}`}
          name="author"
          items={people}
          defaultValue="alex-morgan"
          hint="The person who answers questions."
          clearable
        />
        <Combobox
          multiple
          label={`Watchers ${theme}`}
          name="watchers"
          items={people}
          defaultValue={['sam-lee', 'jordan-park']}
          placeholder="Add people"
        />
        <Combobox
          label={`Document ${theme}`}
          name="document"
          items={documents}
          placeholder="Choose a document"
          required
        />
        <div className="fixture-actions">
          <Button type="submit">Submit people {theme}</Button>
          <Button type="reset" variant="secondary">
            Reset people {theme}
          </Button>
        </div>
      </form>
      <output data-testid={`combobox-submitted-${theme}`}>{submitted}</output>
      <Combobox
        label={`Owner ${theme}`}
        items={people}
        value={owner}
        onValueChange={setOwner}
        onOpenChange={(open) => {
          if (open) setOpened((count) => count + 1);
        }}
      />
      <output data-testid={`combobox-owner-${theme}`}>{JSON.stringify({ owner, opened })}</output>
      <Combobox
        multiple
        label={`Reviewers ${theme}`}
        items={people}
        value={reviewers}
        onValueChange={setReviewers}
        clearable
      />
      <output data-testid={`combobox-reviewers-${theme}`}>{reviewers.join(',')}</output>
      <ServerSearch theme={theme} />
      <Surface
        padding={2}
        density="compact"
        data-testid={`combobox-compact-${theme}`}
        className="fixture-actions"
      >
        <Combobox
          density="compact"
          aria-label={`Compact owner ${theme}`}
          placeholder="Owner"
          items={people}
          defaultValue="taylor-brooks"
        />
        <Combobox
          density="compact"
          multiple
          aria-label={`Compact labels ${theme}`}
          placeholder="Labels"
          items={tags}
          defaultValue={['accessibility']}
        />
        <Button variant="secondary">Compact neighbour {theme}</Button>
      </Surface>
      <div className="fixture-narrow-field" data-testid={`combobox-narrow-${theme}`}>
        <Combobox
          multiple
          density="compact"
          label={`Topics ${theme}`}
          showLabel
          items={tags}
          defaultValue={['accessibility', 'performance', 'documentation', 'localization']}
        />
      </div>
      <div className="fixture-actions">
        <Combobox label={`Disabled ${theme}`} items={people} defaultValue="sam-lee" disabled />
        <Combobox
          multiple
          label={`Read only ${theme}`}
          items={people}
          defaultValue={['sam-lee']}
          readOnly
        />
        <Combobox label={`Invalid ${theme}`} items={people} error="Choose someone on the team." />
      </div>
      <div dir="rtl" data-testid={`combobox-rtl-${theme}`}>
        <Combobox
          multiple
          label={`Right to left ${theme}`}
          items={tags}
          defaultValue={['security', 'testing']}
        />
      </div>
      <Dialog title={`Share ${theme}`} trigger={<Button variant="secondary">Share {theme}</Button>}>
        <Combobox
          multiple
          density="compact"
          label={`Share with ${theme}`}
          showLabel
          items={people}
          clearable
        />
      </Dialog>
    </Theme>
  );
}
