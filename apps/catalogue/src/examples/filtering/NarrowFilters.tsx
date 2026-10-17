import { useRef, useState } from 'react';
import {
  Button,
  CounterBadge,
  DialogClose,
  Drawer,
  EmptyState,
  List,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  Stack,
  Text,
  useBreakpoint,
} from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

export default function NarrowFilters() {
  // From the md breakpoint up the filters sit in the toolbar; below it they move into a drawer,
  // and the search stays in view.
  const wide = useBreakpoint('md');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('any');
  const [owner, setOwner] = useState<string | null>('anyone');
  const search = useRef<HTMLInputElement>(null);
  const applied = (status === 'any' ? 0 : 1) + (owner === 'anyone' ? 0 : 1);

  const term = query.trim().toLowerCase();
  const shown = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(term) &&
      (status === 'any' || project.status === status) &&
      (owner === 'anyone' || project.owner === owner),
  );
  const clear = () => {
    setStatus('any');
    setOwner('anyone');
  };
  const clearAll = () => {
    setQuery('');
    clear();
    // The empty state goes with the filters, so focus returns to the search.
    search.current?.focus();
  };

  return (
    <Stack gap={4}>
      <Stack direction="row" wrap align="center" gap={3}>
        <SearchField
          ref={search}
          label="Search projects"
          size="sm"
          value={query}
          onValueChange={setQuery}
        />
        {wide ? (
          <>
            <Select
              aria-label="Status"
              size="sm"
              variant="outline"
              items={statuses}
              value={status}
              onValueChange={(value) => setStatus(value ?? 'any')}
            />
            <Select
              aria-label="Owner"
              size="sm"
              variant="outline"
              items={owners}
              value={owner}
              onValueChange={setOwner}
            />
          </>
        ) : (
          <Drawer
            trigger={
              <Button variant="secondary" size="sm" startIcon={<FilterList />}>
                Filters
                {applied > 0 && <CounterBadge value={applied} aria-label={`${applied} in use`} />}
              </Button>
            }
            title="Filters"
            closeLabel="Close filters"
            actions={
              <>
                <Button variant="text" onClick={clear}>
                  Clear filters
                </Button>
                {/* The filters apply as people choose; the button says what they will see. */}
                <DialogClose variant="primary">Show {projectCount(shown.length)}</DialogClose>
              </>
            }
          >
            <Stack gap={5}>
              {/* The page behind the modal drawer is hidden from assistive technology, so the
                  drawer has its own status, there as it opens, that announces the new count. */}
              <Text role="status" variant="body-sm" emphasis="muted">
                {projectCount(shown.length)} {shown.length === 1 ? 'matches' : 'match'}
              </Text>
              <RadioGroup
                orientation="vertical"
                label="Status"
                value={status}
                onValueChange={setStatus}
              >
                {statuses.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>
              <Select
                variant="outline"
                label="Owner"
                items={owners}
                value={owner}
                onValueChange={setOwner}
              />
            </Stack>
          </Drawer>
        )}
      </Stack>
      <Text role="status" variant="body-sm" emphasis="muted">
        {projectCount(shown.length)}
      </Text>
      {shown.length > 0 ? (
        <List.Root aria-label="Projects">
          {shown.map((project) => (
            <List.Item key={project.name} label={project.name} description={project.owner} />
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
            <Button variant="secondary" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      )}
    </Stack>
  );
}

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

const projects = [
  { name: 'Website refresh', owner: 'Priya Shah', status: 'active' },
  { name: 'Quarterly report', owner: 'Sam Lee', status: 'active' },
  { name: 'Onboarding guide', owner: 'Alex Morgan', status: 'paused' },
  { name: 'Mobile release', owner: 'Priya Shah', status: 'active' },
  { name: 'Data migration', owner: 'Sam Lee', status: 'done' },
];
