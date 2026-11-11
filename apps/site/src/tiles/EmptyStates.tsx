import { useState } from 'react';
import { Button, Column, List, SearchField, Surface, Text } from '@envsemble/envui';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

const projects = ['Northwind launch', 'Pricing research'];

const input = '.env-text-field-input';

/*
 * No project matches the search. Clears the search, which brings the projects back, then types the
 * same search again, which leaves none, as it began.
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

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 18, height: 13.5 };

/** A search with no results, whose empty state offers the one way forward. */
export default function EmptyStatesTile() {
  const [query, setQuery] = useState('roadmap');
  usePointer(script);
  const matches = projects.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <Column gap={3} style={{ inlineSize: '17rem', minBlockSize: '11.5rem' }}>
      <SearchField label="Search projects" value={query} onValueChange={setQuery} />
      {matches.length > 0 ? (
        <Surface background="muted" padding={1} radius="sm" style={outlined}>
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
