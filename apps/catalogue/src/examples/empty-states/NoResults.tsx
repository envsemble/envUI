import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  List,
  PageHeader,
  SearchField,
  Select,
  Column,
  Row,
  Text,
} from '@envsemble/envui';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

type Status = 'active' | 'archived';

export default function NoResults() {
  const [query, setQuery] = useState('roadmap');
  const [status, setStatus] = useState<string | null>('active');
  const search = useRef<HTMLInputElement>(null);
  const term = query.trim().toLowerCase();
  const matches = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(term) && (status === 'all' || project.status === status),
  );
  const filtered = term !== '' || status !== 'all';

  const clear = () => {
    setQuery('');
    setStatus('all');
    // The button goes with the empty state, so focus returns to the search.
    search.current?.focus();
  };

  return (
    <Column gap={4}>
      {/* The toolbar stays with the empty state, so people can change what they asked for. */}
      <PageHeader
        headingLevel={3}
        title="Projects"
        controlSize="sm"
        toolbar={
          <Row wrap align="center" gap={3}>
            <SearchField
              ref={search}
              label="Search projects"
              size="sm"
              value={query}
              onValueChange={setQuery}
            />
            <Select
              aria-label="Status"
              size="sm"
              variant="outline"
              items={statuses}
              value={status}
              onValueChange={setStatus}
            />
          </Row>
        }
      />
      <Text role="status" variant="body-sm" emphasis="muted">
        {matches.length === 1 ? '1 project' : `${matches.length} projects`}
      </Text>
      {matches.length > 0 ? (
        <List.Root aria-label="Projects">
          {matches.map((project) => (
            <List.Item key={project.name} label={project.name}>
              {project.status === 'archived' && <Badge>Archived</Badge>}
            </List.Item>
          ))}
        </List.Root>
      ) : (
        <Column gap={4} padding={5}>
          <Text render={<span />} emphasis="muted">
            <SearchOff width="1.5rem" height="1.5rem" />
          </Text>
          <Column gap={2}>
            <Text render={<h4 />} variant="title">
              No matching projects
            </Text>
            <Text variant="body-sm">
              {term
                ? `Nothing matches “${query.trim()}” with these filters. Check the spelling or clear the filters.`
                : 'No projects match these filters.'}
            </Text>
          </Column>
          {filtered && (
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          )}
        </Column>
      )}
    </Column>
  );
}

const statuses = [
  { value: 'all', label: 'All projects' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const projects: { name: string; status: Status }[] = [
  { name: 'Website refresh', status: 'active' },
  { name: 'Quarterly report', status: 'active' },
  { name: 'Onboarding guide', status: 'archived' },
  { name: 'Mobile release', status: 'active' },
  { name: 'Annual review', status: 'archived' },
];
