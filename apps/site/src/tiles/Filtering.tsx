import { useState } from 'react';
import { Column, List, Row, SearchField, Select, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const projects = [
  { name: 'Website refresh', active: true },
  { name: 'Annual report', active: false },
  { name: 'Web analytics', active: true },
];

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

const option = (index: number) => `.env-select-item:nth-child(${index})`;

/** The list narrowed to the active projects, its count following, and widened again. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-select-trigger' },
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

/** A list with its filters over it, and how many items match. */
export default function FilteringTile() {
  const [status, setStatus] = useState<string | null>('any');
  usePointer(script);
  const shown = projects.filter((project) => status !== 'active' || project.active);
  return (
    <Column gap={3} style={{ inlineSize: '17rem' }}>
      <Row gap={2} align="center">
        <SearchField label="Search projects" size="sm" style={{ inlineSize: '9rem' }} />
        <Select
          aria-label="Status"
          size="sm"
          variant="outline"
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
      <List.Root aria-label="Projects">
        {shown.map((project) => (
          <List.Item key={project.name} label={project.name} />
        ))}
      </List.Root>
    </Column>
  );
}
