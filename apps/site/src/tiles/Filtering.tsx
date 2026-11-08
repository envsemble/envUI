import { useState } from 'react';
import { Column, List, Row, SearchField, Select, Surface, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { outlined } from './Outline';
import type { TileWindow } from './Tiles';

const projects = [
  { name: 'Website refresh', active: true },
  { name: 'Annual report', active: true },
  { name: 'Web analytics', active: false },
];

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

const option = (index: number) => `.env-select-item:nth-child(${index})`;

const search = '.env-text-field-input';

/**
 * Types a search, the list narrowing as it goes and its count following, and clears it; then
 * narrows the list to the active projects, and widens it again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: search, x: 0.4 },
  { wait: 200 },
  { click: true },
  { wait: 200 },
  { type: 'web', into: search, every: 160 },
  { wait: 1300 },
  { erase: 3, into: search, every: 90 },
  { wait: 500 },
  { to: '.env-select-trigger', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  { to: option(2), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { to: '.env-select-trigger', duration: 400 },
  { click: true },
  { wait: 500 },
  { to: option(1), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 20, height: 15 };

/** A list with its filters above it, and how many items match. */
export default function FilteringTile() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('any');
  usePointer(script);
  const shown = projects.filter(
    (project) =>
      (status !== 'active' || project.active) &&
      project.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Column gap={2} style={{ inlineSize: '17rem' }}>
      <Row gap={2} align="center">
        <SearchField
          label="Search projects"
          size="sm"
          value={query}
          onValueChange={setQuery}
          style={{ inlineSize: '9rem' }}
        />
        <Select
          aria-label="Status"
          size="sm"
          items={statuses}
          value={status}
          onValueChange={setStatus}
        />
      </Row>
      <Text role="status" variant="body-sm" emphasis="muted">
        {shown.length === projects.length
          ? `${projects.length} projects`
          : `${shown.length} projects of ${projects.length}`}
      </Text>
      {/* On a muted surface its rows take the raised fill, so they read on any stage. */}
      <Surface background="muted" padding={1} radius="sm" style={outlined}>
        <List.Root aria-label="Projects">
          {shown.map((project) => (
            <List.Item key={project.name} label={project.name} />
          ))}
        </List.Root>
      </Surface>
    </Column>
  );
}
