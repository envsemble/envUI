import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Link,
  Menu,
  Page,
  PageHeader,
  Pagination,
  RelativeTime,
  SearchField,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
  useBreakpoint,
  useMediaQuery,
  useToast,
  type BadgeTone,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { SearchOff } from '@envsemble/envui/icons/SearchOff';

type Status = 'active' | 'paused' | 'done';
type Column = 'name' | 'updated';
type Direction = 'ascending' | 'descending';

interface Project {
  id: string;
  name: string;
  owner: string;
  status: Status;
  updated: string;
}

const pageSize = 10;
/** "1 project", "3 projects": the count belongs in every label of a bulk action. */
const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

/**
 * The list of a kind of object inside the app frame: search and filters in the page header's
 * toolbar, a sortable table with row selection and bulk actions, and pages of ten. Replace the
 * sample projects and the handlers with your data and your service's calls.
 */
export default function IndexPage() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('all');
  const [owner, setOwner] = useState<string | null>('anyone');
  const [sort, setSort] = useState<{ column: Column; direction: Direction }>({
    column: 'updated',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  // While the rows stack on a narrow screen, the header row and its sort buttons are hidden.
  const [stacked, setStacked] = useState(false);
  // The projects the delete dialog asks about; they stay while the dialog closes.
  const [deleting, setDeleting] = useState<Project[]>([]);
  const [confirming, setConfirming] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const table = useRef<HTMLTableElement>(null);
  const selectPage = useRef<HTMLInputElement>(null);
  const clearAction = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  // Archiving and deleting take away the control people used: the row's menu button, or the bulk
  // buttons and, when no row is left, "Select this page". Where focus goes instead is found once the
  // removal has rendered: the element `find` names, else "Select this page", else the empty
  // state's "Clear filters", else the search.
  const focusAfter = useRef<{ find: () => HTMLElement | null; dialog: boolean } | null>(null);
  const afterDelete = useRef<() => HTMLElement | null>(() => null);
  useEffect(() => {
    const pending = focusAfter.current;
    if (!pending) return;
    focusAfter.current = null;
    const target = pending.find() ?? selectPage.current ?? clearAction.current ?? search.current;
    // A closing dialog returns focus there itself.
    if (pending.dialog) returnFocus.current = target;
    // A closing menu returns focus to its trigger, which went with the row, as it unmounts; this
    // runs after it.
    else requestAnimationFrame(() => target?.focus());
  });
  // On a phone the search takes the toolbar's whole width.
  const wide = useBreakpoint('sm');
  // Under a touch screen's coarse pointer, a row's checkbox gets a touch-sized target across too.
  const coarse = useMediaQuery('(pointer: coarse)');

  const term = query.trim().toLowerCase();
  const filtered = term !== '' || status !== 'all' || owner !== 'anyone';
  const matches = useMemo(() => {
    const found = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) &&
        (status === 'all' || project.status === status) &&
        (owner === 'anyone' || project.owner === owner),
    );
    const order = sort.direction === 'ascending' ? 1 : -1;
    return found.sort(
      (first, second) => order * first[sort.column].localeCompare(second[sort.column]),
    );
  }, [projects, term, status, owner, sort]);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = matches.slice((current - 1) * pageSize, current * pageSize);
  const chosen = projects.filter((project) => selected.includes(project.id));
  const onPage = rows.filter((project) => selected.includes(project.id)).length;

  // A filter applies at once and starts again from the first page.
  const filter = (apply: () => void) => {
    apply();
    setPage(1);
  };
  const clearFilters = () => {
    filter(() => {
      setQuery('');
      setStatus('all');
      setOwner('anyone');
    });
    // The button goes with the empty state, so focus returns to the search.
    search.current?.focus();
  };
  const direction = (column: Column): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  const sortBy = (column: Column) => (next: Direction) => setSort({ column, direction: next });
  /** A row's menu button, found by its name. */
  const menuButton = (project: Project | undefined) =>
    project
      ? (table.current?.querySelector<HTMLElement>(
          `[aria-label="${CSS.escape(`More actions for ${project.name}`)}"]`,
        ) ?? null)
      : null;
  /** The row's neighbour, whose menu button takes focus when the row goes: the next, else the one before. */
  const neighbourOf = (project: Project) => {
    const index = rows.indexOf(project);
    const neighbour = rows[index + 1] ?? rows[index - 1];
    return () => menuButton(neighbour);
  };
  const select = (ids: string[], checked: boolean) =>
    setSelected((current) =>
      checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)),
    );

  const archive = (targets: Project[], next: () => HTMLElement | null = () => null) => {
    const ids = targets.map((project) => project.id);
    // Archiving can be undone, so it happens at once, with Undo in the toast.
    setProjects((current) => current.filter((project) => !ids.includes(project.id)));
    setSelected((current) => current.filter((id) => !ids.includes(id)));
    focusAfter.current = { find: next, dialog: false };
    const id = toast.show({
      message: `${targets.length === 1 ? targets[0].name : projectCount(targets.length)} archived.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setProjects((current) => [...current, ...targets]);
          toast.dismiss(id);
        },
      },
    });
  };
  const askToDelete = (
    targets: Project[],
    from: HTMLElement | null,
    next: () => HTMLElement | null = () => null,
  ) => {
    // Cancel returns focus to the control that asked; a delete moves it to `next`.
    returnFocus.current = from;
    afterDelete.current = next;
    setDeleting(targets);
    setConfirming(true);
  };
  const deleteLabel =
    deleting.length === 1 ? 'Delete project' : `Delete ${projectCount(deleting.length)}`;

  return (
    <Page
      width="lg"
      header={
        <PageHeader
          title="Projects"
          description="Every project in Northwind, with its owner and status."
          controlSize="sm"
          actions={
            <Button href="/projects/new" startIcon={<Add />}>
              Create project
            </Button>
          }
          toolbar={
            // Not a Toolbar: the search keeps its arrow keys, and every control is a tab stop.
            <Stack direction="row" wrap align="center" gap={3}>
              {/* The label shows, so people see what the field searches. */}
              <SearchField
                ref={search}
                label="Search projects"
                showLabel
                size="sm"
                // envUI has no full-width toolbar field yet: on a phone it takes the whole row.
                style={wide ? undefined : { inlineSize: '100%' }}
                value={query}
                onValueChange={(value) => filter(() => setQuery(value))}
              />
              <Select
                aria-label="Status"
                size="sm"
                variant="outline"
                items={statuses}
                value={status}
                onValueChange={(value) => filter(() => setStatus(value))}
              />
              <Select
                aria-label="Owner"
                size="sm"
                variant="outline"
                items={owners}
                value={owner}
                onValueChange={(value) => filter(() => setOwner(value))}
              />
              {/* With no results, the empty state offers it instead. */}
              {filtered && rows.length > 0 && (
                <Button variant="text" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Stack>
          }
        />
      }
    >
      <Stack gap={4}>
        {/* The selection's bar: select the page, the count, and what can be done with them. It sits
            above the table, not in its header row, because the header row hides while the rows
            stack on a narrow screen, and the bar stays at every width. */}
        <Stack direction="row" wrap align="center" justify="between" gap={3}>
          <Stack direction="row" wrap align="center" gap={4}>
            {rows.length > 0 && (
              <Checkbox
                ref={selectPage}
                label="Select this page"
                checked={onPage === 0 ? false : onPage === rows.length ? true : 'mixed'}
                onCheckedChange={(checked) =>
                  select(
                    rows.map((project) => project.id),
                    checked,
                  )
                }
              />
            )}
            <Text role="status" emphasis="muted">
              {selected.length
                ? `${selected.length} selected`
                : filtered
                  ? `${projectCount(matches.length)} found`
                  : projectCount(matches.length)}
            </Text>
          </Stack>
          <Stack direction="row" wrap align="center" gap={2}>
            {chosen.length > 0 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  startIcon={<Archive />}
                  onClick={() => archive(chosen)}
                >
                  {`Archive ${projectCount(chosen.length)}`}
                </Button>
                <Button
                  variant="outline"
                  tone="danger"
                  size="sm"
                  startIcon={<Delete />}
                  onClick={(event) => askToDelete(chosen, event.currentTarget)}
                >
                  {`Delete ${projectCount(chosen.length)}…`}
                </Button>
              </>
            )}
            {stacked && (
              <Select
                aria-label="Sort by"
                size="sm"
                variant="outline"
                items={orders}
                value={`${sort.column} ${sort.direction}`}
                onValueChange={(value) => {
                  const [column, order] = (value ?? '').split(' ');
                  if (column && order)
                    setSort({ column: column as Column, direction: order as Direction });
                }}
              />
            )}
          </Stack>
        </Stack>
        {rows.length === 0 ? (
          // No results: the toolbar stays, and the empty state names the query and offers to clear.
          <EmptyState
            icon={<SearchOff />}
            title="No matching projects"
            headingLevel={2}
            description={
              term
                ? `Nothing matches “${query.trim()}” with these filters. Check the spelling or clear the filters.`
                : 'No projects match these filters.'
            }
            action={
              filtered ? (
                <Button ref={clearAction} variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table.Root
            ref={table}
            aria-label="Projects"
            narrowLayout="stack"
            onStackedChange={setStacked}
          >
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
                  Name
                </Table.HeaderCell>
                <Table.HeaderCell>Owner</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell
                  sortDirection={direction('updated')}
                  onSortChange={sortBy('updated')}
                >
                  Updated
                </Table.HeaderCell>
                <Table.HeaderCell align="end">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {rows.map((project) => (
                <Table.Row key={project.id} interactive selected={selected.includes(project.id)}>
                  <Table.Cell>
                    {/* The checkbox is the selection people hear; the name is the row's link. */}
                    <Stack direction="row" align="center" gap={3}>
                      <Checkbox
                        aria-label={`Select ${project.name}`}
                        // envUI has no touch-sized target across a lone checkbox yet: under a
                        // coarse pointer it takes one here.
                        style={
                          coarse
                            ? {
                                minInlineSize: 'var(--env-control-height-touch)',
                                justifyContent: 'center',
                              }
                            : undefined
                        }
                        checked={selected.includes(project.id)}
                        onCheckedChange={(checked) => select([project.id], checked)}
                      />
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    </Stack>
                  </Table.Cell>
                  <Table.Cell label="Owner" nowrap>
                    <Stack direction="row" align="center" gap={2}>
                      <Avatar name={project.owner} size="sm" fallback="initials" />
                      {project.owner}
                    </Stack>
                  </Table.Cell>
                  <Table.Cell label="Status">
                    <Badge tone={statusTones[project.status]}>{statusLabels[project.status]}</Badge>
                  </Table.Cell>
                  <Table.Cell label="Updated" nowrap>
                    <RelativeTime value={project.updated} />
                  </Table.Cell>
                  <Table.Cell label="Actions" align="end">
                    <Menu.Root
                      aria-label={`Actions for ${project.name}`}
                      align="end"
                      trigger={
                        // The Tooltip shows the icon's name and passes the menu button's props on.
                        <Tooltip content="More actions">
                          <IconButton
                            variant="ghost"
                            icon={<MoreVert />}
                            aria-label={`More actions for ${project.name}`}
                          />
                        </Tooltip>
                      }
                    >
                      <Menu.Item
                        icon={<Archive />}
                        onClick={() => archive([project], neighbourOf(project))}
                      >
                        Archive
                      </Menu.Item>
                      <Menu.Separator />
                      {/* envUI has no danger menu item yet: the label names the consequence, and
                          the ellipsis says a confirmation follows. */}
                      <Menu.Item
                        icon={<Delete />}
                        onClick={() =>
                          // Cancel returns focus to the row's menu button; a delete moves it to the
                          // neighbour's.
                          askToDelete([project], menuButton(project), neighbourOf(project))
                        }
                      >
                        Delete project…
                      </Menu.Item>
                    </Menu.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
        <Pagination
          aria-label="Project pages"
          page={current}
          pageSize={pageSize}
          total={matches.length}
          hideWhenSinglePage
          onPageChange={setPage}
        />
      </Stack>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={
          deleting.length === 1
            ? `Delete ${deleting[0].name}?`
            : `Delete ${projectCount(deleting.length)}?`
        }
        description={`This deletes the ${deleting.length === 1 ? 'project’s' : 'projects’'} documents and tasks for everyone. You can’t undo this.`}
        confirmLabel={deleteLabel}
        finalFocus={returnFocus}
        onConfirm={() => {
          // The projects are deleted on a server; return its promise here, so the dialog waits.
          const ids = deleting.map((project) => project.id);
          // The button that opened the dialog goes with the projects.
          focusAfter.current = { find: afterDelete.current, dialog: true };
          setProjects((current) => current.filter((project) => !ids.includes(project.id)));
          setSelected((current) => current.filter((id) => !ids.includes(id)));
          toast.show({
            message: `${deleting.length === 1 ? deleting[0].name : projectCount(deleting.length)} deleted.`,
          });
        }}
      />
    </Page>
  );
}

const statusLabels: Record<Status, string> = {
  active: 'Active',
  paused: 'On hold',
  done: 'Completed',
};
const statusTones: Record<Status, BadgeTone> = {
  active: 'success',
  paused: 'warning',
  done: 'neutral',
};

const statuses = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'On hold' },
  { value: 'done', label: 'Completed' },
];

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Kim', 'Maria Garcia', 'Chen Wei'];
const owners = [
  { value: 'anyone', label: 'Any owner' },
  ...people.map((person) => ({ value: person, label: person })),
];

const orders = [
  { value: 'updated descending', label: 'Updated, newest first' },
  { value: 'updated ascending', label: 'Updated, oldest first' },
  { value: 'name ascending', label: 'Name, A to Z' },
  { value: 'name descending', label: 'Name, Z to A' },
];

const initialProjects: Project[] = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Alex Morgan',
    status: 'active',
    updated: '2026-03-04T08:15:00Z',
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Priya Shah',
    status: 'active',
    updated: '2026-03-03T16:40:00Z',
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding guide',
    owner: 'Sam Lee',
    status: 'paused',
    updated: '2026-02-27T11:05:00Z',
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Jordan Kim',
    status: 'active',
    updated: '2026-03-02T09:30:00Z',
  },
  {
    id: 'data-migration',
    name: 'Data migration',
    owner: 'Chen Wei',
    status: 'active',
    updated: '2026-03-01T14:20:00Z',
  },
  {
    id: 'annual-review',
    name: 'Annual review',
    owner: 'Maria Garcia',
    status: 'done',
    updated: '2026-02-12T10:00:00Z',
  },
  {
    id: 'brand-guidelines',
    name: 'Brand guidelines',
    owner: 'Alex Morgan',
    status: 'done',
    updated: '2026-02-09T15:45:00Z',
  },
  {
    id: 'customer-survey',
    name: 'Customer survey',
    owner: 'Maria Garcia',
    status: 'active',
    updated: '2026-02-26T13:10:00Z',
  },
  {
    id: 'hiring-plan',
    name: 'Hiring plan',
    owner: 'Priya Shah',
    status: 'paused',
    updated: '2026-02-18T09:00:00Z',
  },
  {
    id: 'office-move',
    name: 'Office move',
    owner: 'Sam Lee',
    status: 'active',
    updated: '2026-02-24T17:30:00Z',
  },
  {
    id: 'pricing-review',
    name: 'Pricing review',
    owner: 'Jordan Kim',
    status: 'done',
    updated: '2026-02-05T12:00:00Z',
  },
  {
    id: 'release-notes',
    name: 'Release notes',
    owner: 'Chen Wei',
    status: 'active',
    updated: '2026-03-03T10:25:00Z',
  },
  {
    id: 'security-audit',
    name: 'Security audit',
    owner: 'Jordan Kim',
    status: 'active',
    updated: '2026-02-20T08:50:00Z',
  },
  {
    id: 'support-handbook',
    name: 'Support handbook',
    owner: 'Maria Garcia',
    status: 'paused',
    updated: '2026-02-11T16:15:00Z',
  },
  {
    id: 'team-offsite',
    name: 'Team offsite',
    owner: 'Alex Morgan',
    status: 'done',
    updated: '2026-02-03T11:40:00Z',
  },
  {
    id: 'training-videos',
    name: 'Training videos',
    owner: 'Sam Lee',
    status: 'active',
    updated: '2026-02-25T14:55:00Z',
  },
  {
    id: 'vendor-review',
    name: 'Vendor review',
    owner: 'Priya Shah',
    status: 'done',
    updated: '2026-02-16T10:35:00Z',
  },
  {
    id: 'budget-2026',
    name: 'Budget 2026',
    owner: 'Chen Wei',
    status: 'active',
    updated: '2026-02-28T09:20:00Z',
  },
  {
    id: 'design-system',
    name: 'Design system',
    owner: 'Alex Morgan',
    status: 'active',
    updated: '2026-03-04T07:45:00Z',
  },
  {
    id: 'help-centre',
    name: 'Help centre',
    owner: 'Maria Garcia',
    status: 'active',
    updated: '2026-02-22T12:30:00Z',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    owner: 'Sam Lee',
    status: 'paused',
    updated: '2026-02-14T15:00:00Z',
  },
  {
    id: 'partner-portal',
    name: 'Partner portal',
    owner: 'Jordan Kim',
    status: 'active',
    updated: '2026-02-23T10:10:00Z',
  },
  {
    id: 'accessibility-review',
    name: 'Accessibility review',
    owner: 'Priya Shah',
    status: 'active',
    updated: '2026-03-02T15:35:00Z',
  },
  {
    id: 'content-calendar',
    name: 'Content calendar',
    owner: 'Chen Wei',
    status: 'done',
    updated: '2026-02-07T09:05:00Z',
  },
];
