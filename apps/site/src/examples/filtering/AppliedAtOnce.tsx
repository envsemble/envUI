import { useState } from 'react';
import { Column, List, Row, SearchField, Select, Text } from '@envsemble/envui';

const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

export default function AppliedAtOnce() {
  const [query, setQuery] = useState('web');
  const [status, setStatus] = useState<string | null>('any');
  const term = query.trim().toLowerCase();
  const shown = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(term) && (status === 'any' || project.status === status),
  );
  return (
    // Each choice filters at once, and the count says what is left.
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Row wrap align="center" gap={3}>
        <SearchField label="Search projects" size="sm" value={query} onValueChange={setQuery} />
        <Select
          aria-label="Status"
          size="sm"
          items={statuses}
          value={status}
          onValueChange={setStatus}
        />
      </Row>
      <Text role="status" variant="body-sm" emphasis="muted">
        {`${projectCount(shown.length)} of ${projects.length}`}
      </Text>
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
