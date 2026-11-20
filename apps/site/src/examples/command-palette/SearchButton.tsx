import { useMemo, useState } from 'react';
import {
  Button,
  CommandPalette,
  Kbd,
  Column,
  Text,
  type CommandPaletteItem,
  useModifierKey,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconSearch } from '@envsemble/envui/icons/Search';

const documents = ['Roadmap', 'Launch checklist', 'Pricing research', 'Interview notes'];

export default function SearchButton() {
  const modifier = useModifierKey();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState('');
  const items = useMemo<CommandPaletteItem[]>(
    () =>
      documents
        .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
        .map((name) => ({ id: name, label: name, start: <IconDescription /> })),
    [query],
  );
  return (
    <Column gap={3} align="start">
      <Button
        variant="secondary"
        start={<IconSearch />}
        end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
        aria-keyshortcuts={`${modifier.key}+K`}
        onClick={() => setOpen(true)}
      >
        Search
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
        aria-label="Search"
        placeholder="Search documents"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => setOpened(`Opened ${item.label}`)}
        emptyLabel="No matching documents"
      />
      <Text variant="caption" emphasis="muted" role="status">
        {opened}
      </Text>
    </Column>
  );
}
