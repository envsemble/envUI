import { useEffect, useState } from 'react';
import { Combobox, type ComboboxItem } from '@envsemble/envui';

const directory: ComboboxItem[] = [
  'Alex Morgan',
  'Sam Lee',
  'Priya Shah',
  'Jordan Ellis',
  'Taylor Kim',
  'Riley Chen',
  'Casey Nguyen',
  'Avery Quinn',
].map((name) => {
  const handle = name.toLowerCase().replace(' ', '.');
  return { value: handle, label: name, description: `${handle}@example.com` };
});

export default function ServerSearch() {
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
    // Stands in for a request to a server.
    const timer = window.setTimeout(() => {
      setResults(directory.filter((person) => person.label.toLowerCase().includes(text)));
      setSearching(false);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
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
    </div>
  );
}
