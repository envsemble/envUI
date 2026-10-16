import { useState } from 'react';
import { Button, List, SearchField, Stack, Text } from '@envsemble/envui';

const members = [
  { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
  { name: 'Sam Lee', email: 'sam.lee@example.com' },
  { name: 'Priya Shah', email: 'priya.shah@example.com' },
  { name: 'Jordan Ellis', email: 'jordan.ellis@example.com' },
];

/** A toolbar row: the field takes the room the button leaves. */
const toolbar = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '0.75rem',
} as const;

export default function FilterList() {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const matches = members.filter(({ name, email }) =>
    `${name} ${email}`.toLowerCase().includes(term),
  );
  return (
    <Stack gap={3} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <div style={toolbar}>
        <SearchField
          label="Search members"
          placeholder="Search by name or e-mail"
          value={query}
          onValueChange={setQuery}
        />
        <Button>Invite member</Button>
      </div>
      <Text variant="caption" tone="muted" role="status">
        {matches.length === members.length
          ? `${members.length} members`
          : `${matches.length} of ${members.length} members`}
      </Text>
      {matches.length > 0 && (
        <List.Root aria-label="Members">
          {matches.map(({ name, email }) => (
            <List.Item key={email} title={name} detail={email} />
          ))}
        </List.Root>
      )}
    </Stack>
  );
}
