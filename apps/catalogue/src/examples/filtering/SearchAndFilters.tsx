import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  EmptyState,
  List,
  PageHeader,
  SearchField,
  Select,
  Column,
  Row,
  Text,
} from '@envsemble/envui';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

export default function SearchAndFilters() {
  // An application keeps the query and the filters in the address, so a reload or a shared link
  // shows the same results.
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('any');
  const [owner, setOwner] = useState<string | null>('anyone');
  const search = useRef<HTMLInputElement>(null);

  const term = query.trim().toLowerCase();
  const shown = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(term) &&
      (status === 'any' || project.status === status) &&
      (owner === 'anyone' || project.owner === owner),
  );
  const filtered = term !== '' || status !== 'any' || owner !== 'anyone';

  const clear = () => {
    setQuery('');
    setStatus('any');
    setOwner('anyone');
    // The button goes once nothing is filtered, so focus returns to the search.
    search.current?.focus();
  };

  return (
    <Column gap={4}>
      <PageHeader
        headingLevel={3}
        title="Projects"
        controlSize="sm"
        toolbar={
          // Not a Toolbar: the field keeps its arrow keys and every control is a tab stop. Each
          // change filters the list at once.
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
            <Select
              aria-label="Owner"
              size="sm"
              variant="outline"
              items={owners}
              value={owner}
              onValueChange={setOwner}
            />
            {filtered && (
              <Button variant="text" size="sm" onClick={clear}>
                Clear filters
              </Button>
            )}
          </Row>
        }
      />
      {/* The count is announced as the results change. */}
      <Text role="status" variant="body-sm" emphasis="muted">
        {filtered
          ? `${projectCount(shown.length)} of ${projects.length}`
          : projectCount(projects.length)}
      </Text>
      {shown.length > 0 ? (
        <List.Root aria-label="Projects">
          {shown.map((project) => (
            <List.Item key={project.name} label={project.name} description={project.owner}>
              <Badge tone={tones[project.status]}>{labels[project.status]}</Badge>
            </List.Item>
          ))}
        </List.Root>
      ) : (
        // The toolbar stays above the empty state, so people can change what they asked for.
        <EmptyState
          icon={<SearchOff />}
          title="No matching projects"
          description={
            term
              ? `No project names contain “${query.trim()}” with these filters.`
              : 'No projects match these filters.'
          }
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      )}
    </Column>
  );
}

type Status = 'active' | 'paused' | 'done';

const statuses = [
  { value: 'any', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
];

const owners = [
  { value: 'anyone', label: 'Any owner' },
  { value: 'Alex Morgan', label: 'Alex Morgan' },
  { value: 'Priya Shah', label: 'Priya Shah' },
  { value: 'Sam Lee', label: 'Sam Lee' },
];

const labels: Record<Status, string> = { active: 'Active', paused: 'Paused', done: 'Done' };
const tones = { active: 'success', paused: 'warning', done: 'neutral' } as const;

const projects: { name: string; owner: string; status: Status }[] = [
  { name: 'Website refresh', owner: 'Priya Shah', status: 'active' },
  { name: 'Quarterly report', owner: 'Sam Lee', status: 'active' },
  { name: 'Onboarding guide', owner: 'Alex Morgan', status: 'paused' },
  { name: 'Mobile release', owner: 'Priya Shah', status: 'active' },
  { name: 'Data migration', owner: 'Sam Lee', status: 'done' },
  { name: 'Annual review', owner: 'Alex Morgan', status: 'done' },
];
