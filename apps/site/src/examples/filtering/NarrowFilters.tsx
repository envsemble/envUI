import { useRef, useState } from 'react';
import {
  Button,
  DialogClose,
  List,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  Sheet,
  Column,
  Row,
  Text,
  useContainerSize,
  windowClasses,
  Badge,
} from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

/** A width in rem, such as a window class's, in CSS pixels at the document's font size. */
const remToPixels = (width: string) =>
  Number.parseFloat(width) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

export default function NarrowFilters() {
  // From the medium window class up, measured on the filters' own width, they sit in the toolbar;
  // in a compact one they move into a sheet, and the search stays in view.
  const filters = useRef<HTMLDivElement>(null);
  const size = useContainerSize(filters);
  const wide = size === undefined || size.inlineSize >= remToPixels(windowClasses.medium);
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
    <Column ref={filters} gap={4}>
      {/* From medium the filters keep their size on one line beside the search. */}
      <Row wrap={!wide} align="center" gap={3}>
        <SearchField
          ref={search}
          label="Search projects"
          placeholder="Search projects"
          size="sm"
          value={query}
          onValueChange={setQuery}
        />
        {wide ? (
          <>
            <Select
              aria-label="Status"
              style={{ flexShrink: 0 }}
              size="sm"
              variant="outline"
              items={statuses}
              value={status}
              onValueChange={(value) => setStatus(value ?? 'any')}
            />
            <Select
              aria-label="Owner"
              style={{ flexShrink: 0 }}
              size="sm"
              variant="outline"
              items={owners}
              value={owner}
              onValueChange={setOwner}
            />
          </>
        ) : (
          <Sheet
            trigger={
              <Button variant="secondary" size="sm" startIcon={<FilterList />}>
                Filters
                {applied > 0 && <Badge count={applied} aria-label={`${applied} in use`} />}
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
            <Column gap={5}>
              {/* The page behind the modal sheet is hidden from assistive technology, so the
                  sheet has its own status, there as it opens, that announces the new count. */}
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
            </Column>
          </Sheet>
        )}
      </Row>
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
                ? `No project names contain “${query.trim()}” with these filters.`
                : 'No projects match these filters.'}
            </Text>
          </Column>
          <Button variant="secondary" onClick={clearAll}>
            Clear filters
          </Button>
        </Column>
      )}
    </Column>
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
