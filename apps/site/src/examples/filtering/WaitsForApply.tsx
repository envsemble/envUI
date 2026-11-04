import { useState } from 'react';
import { Button, Column, List, Row, SearchField, Select } from '@envsemble/envui';

export default function WaitsForApply() {
  // What is chosen, and what the list shows: nothing changes until Apply.
  const [query, setQuery] = useState('web');
  const [status, setStatus] = useState<string | null>('any');
  const [applied, setApplied] = useState({ query: 'web', status: 'any' });
  const term = applied.query.trim().toLowerCase();
  const shown = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(term) &&
      (applied.status === 'any' || project.status === applied.status),
  );
  return (
    // Nothing says how many will match.
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Row wrap align="center" gap={3}>
        <SearchField label="Search projects" size="sm" value={query} onValueChange={setQuery} />
        <Select
          aria-label="Status"
          size="sm"
          variant="outline"
          items={statuses}
          value={status}
          onValueChange={setStatus}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => setApplied({ query, status: status ?? 'any' })}
        >
          Apply
        </Button>
      </Row>
      <List.Root aria-label="Projects">
        {shown.map((project) => (
          <List.Item key={project.name} label={project.name} />
        ))}
      </List.Root>
    </Column>
  );
}

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
];

const projects = [
  { name: 'Website refresh', status: 'active' },
  { name: 'Quarterly report', status: 'active' },
  { name: 'Web analytics', status: 'paused' },
  { name: 'Mobile release', status: 'active' },
  { name: 'Data migration', status: 'done' },
  { name: 'Annual review', status: 'done' },
];
