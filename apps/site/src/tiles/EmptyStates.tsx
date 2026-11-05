import { useState } from 'react';
import { Button, Column, List, SearchField, Surface, Text } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';
import { usePointer, type PointerStep } from '../motion/Motion';

const projects = ['Northwind launch', 'Annual report', 'Pricing research'];

const input = '.env-text-field-input';

/*
 * No project matches the search: the search cleared, which brings the projects back, and the
 * same search typed again, which leaves none, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button' },
  { wait: 400 },
  { click: true },
  { wait: 1300 },
  { to: input, x: 0.3, duration: 450 },
  { click: true },
  { wait: 200 },
  { type: 'roadmap', into: input, every: 110 },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

/** A search with no results, its empty state offering the one way on. */
export default function EmptyStatesTile() {
  const [query, setQuery] = useState('roadmap');
  usePointer(script);
  const matches = projects.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <Column gap={4} style={{ inlineSize: '15rem', minBlockSize: '11.5rem' }}>
      <SearchField label="Search projects" value={query} onValueChange={setQuery} />
      {matches.length > 0 ? (
        <Surface background="muted" padding={1} radius="sm">
          <List.Root aria-label="Projects">
            {matches.map((name) => (
              <List.Item key={name} label={name} />
            ))}
          </List.Root>
        </Surface>
      ) : (
        <Column gap={3} align="center">
          <Text render={<span />} emphasis="muted">
            <IconSearchOff width="1.5rem" height="1.5rem" />
          </Text>
          <Text render={<span />} variant="title">
            No matching projects
          </Text>
          <Button variant="secondary" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </Column>
      )}
    </Column>
  );
}
