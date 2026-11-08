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
  type ColorScheme,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconFolder } from '@envsemble/envui/icons/Folder';

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
  start: <Avatar name={name} size="sm" />,
  disabled: name === 'Jamie Fox',
}));

const documents: ComboboxGroup[] = [
  {
    label: 'Recent',
    items: [
      { value: 'quarterly-report', label: 'Quarterly report', start: <IconDescription /> },
      { value: 'release-notes', label: 'Release notes', start: <IconDescription /> },
    ],
  },
  {
    label: 'Folders',
    items: [
      { value: 'design-system/tokens', label: 'design-system/tokens', start: <IconFolder /> },
      { value: 'design-system/icons', label: 'design-system/icons', start: <IconFolder /> },
      { value: 'research/interviews', label: 'research/interviews', start: <IconFolder /> },
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

// The server's contacts take values with a NUL in them, which a selection keeps as it is.
const contacts = people.map((person) => ({
  ...person,
  value: person.value.replace('-', '\u0000'),
}));

function ServerSearch({ theme }: { theme: ColorScheme }) {
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
      setResults(contacts.filter((person) => person.label.toLowerCase().startsWith(needle)));
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

export function ComboboxFixture({ theme }: { theme: ColorScheme }) {
  const [submitted, setSubmitted] = useState('');
  const [authorChanges, setAuthorChanges] = useState<(string | null)[]>([]);
  const [owner, setOwner] = useState<string | null>('riley-chen');
  const [reviewers, setReviewers] = useState<string[]>(['sam-lee']);
  const [reviewerChanges, setReviewerChanges] = useState(0);
  const [opened, setOpened] = useState(0);
  // One mentioned person is no longer among the options.
  const [mentioned, setMentioned] = useState(['sam-lee', 'former-member', 'riley-chen']);
  const [mentionedItems, setMentionedItems] = useState('');
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
          description="The person who answers questions."
          clearable
          onValueChange={(value) => setAuthorChanges((current) => [...current, value])}
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
      <output data-testid={`combobox-author-changes-${theme}`}>
        {JSON.stringify(authorChanges)}
      </output>
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
        onValueChange={(next) => {
          setReviewers(next);
          setReviewerChanges((count) => count + 1);
        }}
        clearable
      />
      <output data-testid={`combobox-reviewers-${theme}`}>{reviewers.join(',')}</output>
      <output data-testid={`combobox-reviewer-changes-${theme}`}>{reviewerChanges}</output>
      <Combobox
        multiple
        label={`Mentioned ${theme}`}
        items={people}
        value={mentioned}
        onValueChange={(values, items) => {
          setMentioned(values);
          setMentionedItems(JSON.stringify(items.map(({ value, label }) => [value, label])));
        }}
      />
      <output data-testid={`combobox-mentioned-${theme}`}>{mentionedItems}</output>
      <ServerSearch theme={theme} />
      <Surface padding={2} data-testid={`combobox-compact-${theme}`} className="fixture-actions">
        <Combobox
          size="sm"
          visibleLabel={false}
          aria-label={`Compact owner ${theme}`}
          placeholder="Owner"
          items={people}
          defaultValue="taylor-brooks"
        />
        <Combobox
          size="sm"
          visibleLabel={false}
          multiple
          aria-label={`Compact labels ${theme}`}
          placeholder="Labels"
          items={tags}
          defaultValue={['accessibility']}
        />
        <Button variant="secondary" size="sm">
          Compact neighbour {theme}
        </Button>
      </Surface>
      <div className="fixture-narrow-field" data-testid={`combobox-narrow-${theme}`}>
        <Combobox
          multiple
          label={`Topics ${theme}`}
          visibleLabel
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
        <Combobox multiple label={`Share with ${theme}`} visibleLabel items={people} clearable />
      </Dialog>
    </Theme>
  );
}
