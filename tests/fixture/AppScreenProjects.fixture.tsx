import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Checkbox,
  Column,
  Combobox,
  CommandPalette,
  DescriptionList,
  DialogClose,
  IconButton,
  Link,
  List,
  Menu,
  Page,
  PageHeader,
  Pagination,
  Panes,
  RelativeTime,
  Row,
  SearchField,
  SegmentedControl,
  Select,
  Sheet,
  Surface,
  Switch,
  Table,
  Tabs,
  Text,
  TextField,
  Toolbar,
  useContainerSize,
  useToast,
  windowClasses,
  type Destination,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconClose } from '@envsemble/envui/icons/Close';
import { IconDashboard } from '@envsemble/envui/icons/Dashboard';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconGridView } from '@envsemble/envui/icons/GridView';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconMonitoring } from '@envsemble/envui/icons/Monitoring';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconRocketLaunch } from '@envsemble/envui/icons/RocketLaunch';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconShare } from '@envsemble/envui/icons/Share';
import { IconTableRows } from '@envsemble/envui/icons/TableRows';
import { AppFrame, minutesAgo } from './AppScreenFrame.fixture.js';

type Status = 'healthy' | 'deploying' | 'failing' | 'paused';

interface Project {
  id: string;
  name: string;
  repository: string;
  status: Status;
  owner: string;
  members: string[];
  environment: string;
  issues: number;
  updated: string;
}

const statusLabel: Record<Status, string> = {
  healthy: 'Healthy',
  deploying: 'Deploying',
  failing: 'Failing',
  paused: 'Paused',
};
const statusTone = {
  healthy: 'neutral',
  deploying: 'primary',
  failing: 'danger',
  paused: 'neutral',
} as const;

/** A project's status, soft throughout: the routine one, healthy, neutral, so the states that need people stand out. */
function StatusBadge({ status }: { status: Status }) {
  return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
}

const people = [
  'Priya Shah',
  'Sam Lee',
  'Jordan Kim',
  'Maria Garcia',
  'Chen Wei',
  'Alex Morgan',
  'Noah Becker',
  'Lena Fischer',
];

/** Each project as id, name, repository, status, owner, environment, issues, minutes ago. */
type ProjectRow = [string, string, string, Status, number, string, number, number];

const projects: Project[] = (
  [
    ['billing-api', 'Billing API', 'northwind/billing-api', 'healthy', 0, 'Production', 4, 12],
    ['checkout-web', 'Checkout web', 'northwind/checkout', 'deploying', 1, 'Staging', 11, 3],
    ['search-indexer', 'Search indexer', 'northwind/indexer', 'failing', 2, 'Production', 23, 38],
    ['mobile-gateway', 'Mobile gateway', 'northwind/gateway', 'healthy', 3, 'Production', 2, 95],
    ['data-pipeline', 'Data pipeline', 'northwind/pipeline', 'healthy', 4, 'Production', 7, 180],
    ['docs-site', 'Docs site', 'northwind/docs', 'paused', 5, 'Preview', 0, 1440],
    ['auth-service', 'Auth service', 'northwind/auth', 'healthy', 6, 'Production', 5, 2600],
    ['email-worker', 'Email worker', 'northwind/email-worker', 'deploying', 7, 'Staging', 9, 4300],
    ['feature-flags', 'Feature flags', 'northwind/flags', 'healthy', 0, 'Production', 1, 7200],
    ['ml-scoring', 'ML scoring', 'northwind/scoring', 'failing', 1, 'Staging', 16, 10100],
  ] satisfies ProjectRow[]
).map(([id, name, repository, status, owner, environment, issues, minutes]) => ({
  id,
  name,
  repository,
  status,
  owner: people[owner],
  members: people.filter((_, index) => (index + owner) % 3 !== 0).slice(0, 5),
  environment,
  issues,
  updated: minutesAgo(minutes),
}));

const statuses = [
  { value: 'any', label: 'Any status' },
  ...Object.entries(statusLabel).map(([value, label]) => ({ value, label })),
];
const owners = people.map((name) => ({ value: name, label: name }));
const environments = [
  { value: 'Production', label: 'Production' },
  { value: 'Staging', label: 'Staging' },
  { value: 'Preview', label: 'Preview' },
];

/** Read by assistive technology but not shown. Finding: envUI has no visually hidden helper. */
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  inlineSize: 1,
  blockSize: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

/** The bulk bar's height: a small control in the bar's padding. */
const barHeight = 'calc(var(--env-control-height-sm) + 2 * var(--env-space-2))';

/** A width in rem, such as a window class's, in CSS pixels at the document's font size. */
const remToPixels = (width: string) =>
  Number.parseFloat(width) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

/**
 * Whether what an element holds fits its width: false from the width where it first overflowed
 * until its container is as wide as it needed then, so the arrangement doesn't flip back and forth.
 * Finding: a row of controls whose width depends on the scale has no way to say when it no longer
 * fits; a window class alone, in rem, can't tell compact controls from comfortable ones.
 */
function useFits(element: () => HTMLElement | null | undefined, available: number | undefined) {
  const [needed, setNeeded] = useState(0);
  const fits = available === undefined || available >= needed;
  useLayoutEffect(() => {
    const node = element();
    if (!fits || !node || available === undefined) return;
    const check = () => {
      const excess = node.scrollWidth - node.clientWidth;
      if (excess > 1) setNeeded(available + excess);
    };
    check();
    // What it holds can grow without a render, as when the fonts load.
    const observer = new ResizeObserver(check);
    for (const child of node.children) observer.observe(child);
    return () => observer.disconnect();
  });
  return fits;
}

const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

type SortColumn = 'name' | 'issues' | 'updated';

const sortOrders = [
  { value: 'updated descending', label: 'Updated, newest first' },
  { value: 'updated ascending', label: 'Updated, oldest first' },
  { value: 'name ascending', label: 'Name, A to Z' },
  { value: 'name descending', label: 'Name, Z to A' },
  { value: 'issues descending', label: 'Issues, most first' },
  { value: 'issues ascending', label: 'Issues, fewest first' },
];

function ProjectsTable({ onOpen, openId }: { onOpen: (id: string) => void; openId: string }) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>('any');
  const [owner, setOwner] = useState<string[]>(['Priya Shah']);
  const [view, setView] = useState('table');
  const [selected, setSelected] = useState<string[]>(['checkout-web', 'search-indexer']);
  const [sort, setSort] = useState<{ column: SortColumn; direction: Table.SortDirection }>({
    column: 'updated',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);
  // Finding: a window class is a rem string, so comparing a measured width with it takes a helper
  // of the application's own.
  const root = useRef<HTMLDivElement>(null);
  // Finding: a stacked row is titled by its first cell, which here is the checkbox; while rows
  // stack, the checkbox moves into the name cell and its own column goes.
  const [stacked, setStacked] = useState(false);
  const size = useContainerSize(root);
  const wide = size === undefined || size.inlineSize >= remToPixels(windowClasses.medium);
  // The filters stay on one row while they fit it, else they move into a sheet, as on a phone; the
  // members column goes while the table would otherwise scroll its last columns out of view.
  const filterRow = useRef<HTMLDivElement>(null);
  const inlineFilters = useFits(() => filterRow.current, size?.inlineSize) && wide;
  const showMembers = useFits(
    () => root.current?.querySelector<HTMLElement>('.env-table-region'),
    size?.inlineSize,
  );

  const sorted = [...projects].sort((first, second) => {
    const order =
      sort.column === 'name'
        ? first.name.localeCompare(second.name)
        : sort.column === 'issues'
          ? first.issues - second.issues
          : first.updated.localeCompare(second.updated);
    return sort.direction === 'ascending' ? order : -order;
  });
  const direction = (column: SortColumn): Table.SortDirection =>
    sort.column === column ? sort.direction : 'none';
  const sortBy = (column: SortColumn) => (next: 'ascending' | 'descending') => {
    setSort({ column, direction: next });
    setPage(1);
  };
  // While rows stack, the header and its sort buttons are hidden, so one Select above the rows
  // shows and changes the order.
  const sortOrder = `${sort.column} ${sort.direction}`;
  const sortControl = (
    <Select
      label="Sort by"
      visibleLabel
      items={sortOrders}
      value={sortOrder}
      onValueChange={(value) => {
        const [column, next] = (value ?? sortOrder).split(' ') as [
          SortColumn,
          'ascending' | 'descending',
        ];
        sortBy(column)(next);
      }}
      style={{ alignSelf: 'start' }}
    />
  );
  const all = selected.length === projects.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));

  const select = (project: Project) => (
    <Checkbox
      aria-label={`Select ${project.name}`}
      checked={selected.includes(project.id)}
      onCheckedChange={(checked) => toggle(project.id, checked)}
    />
  );
  const filters = (
    <>
      <Select
        label="Status"
        visibleLabel={!inlineFilters}
        size={inlineFilters ? 'sm' : undefined}
        items={statuses}
        value={status}
        onValueChange={setStatus}
      />
      <Combobox
        multiple
        label="Owner"
        visibleLabel={!inlineFilters}
        placeholder="Any owner"
        size={inlineFilters ? 'sm' : undefined}
        items={owners}
        value={owner}
        onValueChange={(value: string[]) => setOwner(value)}
        style={inlineFilters ? { inlineSize: '12rem' } : undefined}
      />
    </>
  );
  const viewControl = (
    <SegmentedControl
      aria-label="View"
      size="sm"
      fullWidth={!inlineFilters}
      value={view}
      onValueChange={setView}
      items={[
        { value: 'table', label: 'Table', icon: <IconTableRows /> },
        { value: 'board', label: 'Board', icon: <IconGridView /> },
      ]}
    />
  );

  return (
    <Column ref={root} gap={4}>
      {/* The filters: the search, a Select, a multiple Combobox and the view, on one row, the
          search taking the room left. Narrower than a medium window, measured on the table's own
          width, they move into a sheet and the search stays in view, as the filtering pattern
          does. */}
      <Row ref={filterRow} align="center" gap={3}>
        {/* Layout glue: SearchField has no width of its own in a row; it keeps room for its
            placeholder. */}
        <SearchField
          label="Search projects"
          placeholder="Search projects"
          size="sm"
          style={{ flex: '1 1 12rem', minInlineSize: '10rem', maxInlineSize: '18rem' }}
          value={query}
          onValueChange={setQuery}
        />
        {inlineFilters ? (
          // Layout glue: the filters keep their widths rather than squeezing their values, so the
          // row overflows, and moves them into the sheet, once the search is at its narrowest.
          <Row align="center" gap={3} style={{ flex: '1 0 auto' }}>
            {filters}
            <Button variant="secondary" size="sm" startIcon={<IconAdd />}>
              Add filter
            </Button>
            {/* Layout glue: Row has no way to push one child to the end. */}
            <Row align="center" gap={2} style={{ marginInlineStart: 'auto' }}>
              {viewControl}
            </Row>
          </Row>
        ) : (
          <Sheet
            title="Filters"
            side="bottom"
            closeLabel="Close filters"
            trigger={
              <Button variant="secondary" size="sm" startIcon={<IconFilterList />}>
                Filters
                <Badge count={3} aria-label="3 in use" />
              </Button>
            }
            actions={<DialogClose variant="primary">Show 12 projects</DialogClose>}
          >
            <Column gap={4}>
              {filters}
              {viewControl}
            </Column>
          </Sheet>
        )}
      </Row>
      <div role="status" style={visuallyHidden}>
        {selected.length > 0 ? `${projectCount(selected.length)} selected` : 'No projects selected'}
      </div>
      {/* One row above the table: the filters in use that no control above shows, as tokens that
          remove themselves, and while rows are selected the bulk bar in their place, so a phone
          doesn't stack both above the first row. The owner shows in its Combobox, so it takes no
          token. Finding: no chip component; a token is a small secondary Button with a close
          icon, as the filtering pattern says. Layout glue: both keep the bar's height, so the
          table stays put as the selection comes and goes. */}
      {selected.length === 0 ? (
        <Row
          wrap
          align="center"
          gap={2}
          role="group"
          aria-label="Filters in use"
          style={{ minBlockSize: barHeight }}
        >
          <Button
            variant="secondary"
            size="sm"
            endIcon={<IconClose />}
            aria-label="Remove filter Environment: Production, Staging"
          >
            Environment: Production, Staging
          </Button>
          <Button variant="text" size="sm">
            Clear filters
          </Button>
        </Row>
      ) : (
        <Surface background="muted" padding={2} radius="full">
          <Row
            wrap={wide}
            align="center"
            gap={3}
            style={{ minBlockSize: 'var(--env-control-height-sm)' }}
          >
            {/* Narrow, clearing is a cross beside the count, so the bar stays one row. */}
            <Row align="center" gap={1}>
              <Text variant="body-sm" style={{ paddingInlineStart: 'var(--env-space-2)' }}>
                {selected.length} selected
              </Text>
              {!wide && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<IconClose />}
                  aria-label="Clear selection"
                  onClick={() => setSelected([])}
                />
              )}
            </Row>
            {/* On a desktop the actions are labelled buttons; on a phone, where the bar keeps one
                row, a toolbar of icons named by tooltips. */}
            {wide ? (
              <Row role="group" aria-label="Selected projects" align="center" gap={1}>
                <Button variant="ghost" size="sm" startIcon={<IconRocketLaunch />}>
                  Deploy
                </Button>
                <Button variant="ghost" size="sm" startIcon={<IconDownload />}>
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  startIcon={<IconArchive />}
                  onClick={() => {
                    toast.show({ message: `${projectCount(selected.length)} archived.` });
                    setSelected([]);
                  }}
                >
                  Archive
                </Button>
                <Button variant="ghost" tone="danger" size="sm" startIcon={<IconDelete />}>
                  Delete…
                </Button>
              </Row>
            ) : (
              <Toolbar.Root aria-label="Selected projects" size="sm">
                <Toolbar.Button
                  icon={<IconRocketLaunch />}
                  label={`Deploy ${projectCount(selected.length)}`}
                />
                <Toolbar.Button
                  icon={<IconDownload />}
                  label={`Export ${projectCount(selected.length)}`}
                />
                <Toolbar.Button
                  icon={<IconArchive />}
                  label={`Archive ${projectCount(selected.length)}`}
                  onClick={() => {
                    toast.show({ message: `${projectCount(selected.length)} archived.` });
                    setSelected([]);
                  }}
                />
                <Toolbar.Separator />
                <Toolbar.Button
                  icon={<IconDelete />}
                  tone="danger"
                  label={`Delete ${projectCount(selected.length)}…`}
                />
              </Toolbar.Root>
            )}
            {wide && (
              <Button variant="text" size="sm" onClick={() => setSelected([])}>
                Clear selection
              </Button>
            )}
          </Row>
        </Surface>
      )}
      {stacked && sortControl}
      <Table.Root
        aria-label="Projects"
        density="sm"
        narrowLayout="stack"
        onStackedChange={setStacked}
      >
        <Table.Head>
          <Table.Row>
            {!stacked && (
              <Table.HeaderCell>
                <Checkbox
                  aria-label="Select all projects"
                  checked={all ? true : selected.length > 0 ? 'mixed' : false}
                  onCheckedChange={(checked) =>
                    setSelected(checked && !all ? projects.map((project) => project.id) : [])
                  }
                />
              </Table.HeaderCell>
            )}
            <Table.HeaderCell sortDirection={direction('name')} onSortChange={sortBy('name')}>
              Name
            </Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            {showMembers && <Table.HeaderCell>Members</Table.HeaderCell>}
            <Table.HeaderCell
              numeric
              sortDirection={direction('issues')}
              onSortChange={sortBy('issues')}
            >
              Issues
            </Table.HeaderCell>
            <Table.HeaderCell sortDirection={direction('updated')} onSortChange={sortBy('updated')}>
              Updated
            </Table.HeaderCell>
            <Table.HeaderCell>
              {/* Finding: an actions column has no header, and Table.HeaderCell asks for text. */}
              <span style={visuallyHidden}>Actions</span>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {sorted.map((project) => (
            <Table.Row
              key={project.id}
              interactive
              selected={selected.includes(project.id) || openId === project.id}
            >
              {!stacked && <Table.Cell>{select(project)}</Table.Cell>}
              <Table.Cell>
                <Row align="start" gap={3}>
                  {stacked && select(project)}
                  <Column gap={0}>
                    <Link
                      href={`#${project.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onOpen(project.id);
                      }}
                    >
                      {project.name}
                    </Link>
                    <Text variant="caption" emphasis="muted" title={project.repository}>
                      {project.repository}
                    </Text>
                  </Column>
                </Row>
              </Table.Cell>
              <Table.Cell label="Status" nowrap>
                <StatusBadge status={project.status} />
              </Table.Cell>
              <Table.Cell label="Owner" nowrap>
                <Row align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" fallback="initials" />
                  {project.owner}
                </Row>
              </Table.Cell>
              {showMembers && (
                <Table.Cell label="Members">
                  <AvatarGroup
                    size="sm"
                    max={2}
                    people={project.members.map((name) => ({ name, fallback: 'initials' }))}
                  />
                </Table.Cell>
              )}
              <Table.Cell label="Issues" numeric>
                {project.issues}
              </Table.Cell>
              <Table.Cell label="Updated" nowrap>
                <RelativeTime value={project.updated} format="short" />
              </Table.Cell>
              <Table.Cell>
                <Menu.Root
                  aria-label={`Actions for ${project.name}`}
                  align="end"
                  trigger={
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={<IconMoreVert />}
                      aria-label={`More actions for ${project.name}`}
                    />
                  }
                >
                  <Menu.Item icon={<IconRocketLaunch />}>Deploy</Menu.Item>
                  <Menu.Item icon={<IconShare />}>Share</Menu.Item>
                  <Menu.Item icon={<IconArchive />}>Archive</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item icon={<IconDelete />}>Delete project…</Menu.Item>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Row wrap align="center" justify="between" gap={3}>
        <Text role="status" variant="body-sm" emphasis="muted">
          Sorted by {sort.column === 'issues' ? 'open issues' : sort.column}, {sort.direction}
        </Text>
        <Pagination
          aria-label="Project pages"
          page={page}
          pageSize={10}
          total={48}
          onPageChange={setPage}
        />
      </Row>
    </Column>
  );
}

/** The chosen project's details, settings and recent activity. */
function ProjectDetails({ project }: { project: Project }) {
  const toast = useToast();
  return (
    <Column gap={5} padding={4}>
      <Row align="center" justify="between" gap={3}>
        <Column gap={1}>
          <Text render={<h2 />} variant="title">
            {project.name}
          </Text>
          <Text variant="body-sm" emphasis="muted">
            {project.repository}
          </Text>
        </Column>
        <StatusBadge status={project.status} />
      </Row>
      <DescriptionList.Root aria-label={`About ${project.name}`}>
        <DescriptionList.Item label="Owner">
          <Row align="center" gap={2}>
            <Avatar name={project.owner} size="sm" fallback="initials" />
            {project.owner}
          </Row>
        </DescriptionList.Item>
        <DescriptionList.Item label="Environment">{project.environment}</DescriptionList.Item>
        <DescriptionList.Item label="Region">eu-central-1</DescriptionList.Item>
        <DescriptionList.Item label="Last deploy">
          <RelativeTime value={project.updated} />
        </DescriptionList.Item>
        <DescriptionList.Item label="Open issues">{project.issues}</DescriptionList.Item>
      </DescriptionList.Root>
      <Column
        render={
          <form
            onSubmit={(event) => {
              event.preventDefault();
              toast.show({ message: 'Settings saved.', tone: 'success' });
            }}
          />
        }
        gap={3}
      >
        <Text render={<h3 />} variant="title">
          Settings
        </Text>
        <TextField label="Display name" defaultValue={project.name} />
        <Select
          label="Default environment"
          items={environments}
          defaultValue={project.environment}
        />
        <Switch label="Deploy on every push to main" defaultChecked />
        <Row gap={2} justify="end">
          <Button variant="secondary" size="sm" type="reset">
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Save
          </Button>
        </Row>
      </Column>
      <Column gap={3}>
        <Text render={<h3 />} variant="title">
          Activity
        </Text>
        {/* One surface with the entries as rows on it, rather than a card each. Layout glue: the
            rows take no fill of their own (List.Item's container color property). */}
        <Surface background="raised" padding={1}>
          <List.Root aria-label="Recent activity" density="sm">
            {activity.map((entry) => (
              <List.Item
                key={entry.text}
                style={{ '--env-list-item-container': 'transparent' }}
                start={<Avatar name={entry.who} size="sm" fallback="initials" />}
                label={entry.text}
                description={
                  <>
                    {entry.who} · <RelativeTime value={minutesAgo(entry.minutes)} />
                  </>
                }
              />
            ))}
          </List.Root>
        </Surface>
      </Column>
    </Column>
  );
}

const activity = [
  { who: 'Sam Lee', text: 'Started a deploy to Staging', minutes: 3 },
  { who: 'Priya Shah', text: 'Merged “Retry failed webhooks”', minutes: 42 },
  { who: 'Jordan Kim', text: 'Raised the memory limit to 2 GB', minutes: 260 },
  { who: 'Alex Morgan', text: 'Added Lena Fischer as a member', minutes: 1500 },
];

export function ProjectsScreen() {
  const [current, setCurrent] = useState('/projects');
  const [openId, setOpenId] = useState('checkout-web');
  const [details, setDetails] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<string | null>('all');
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: place.href === current,
    onClick: () => setCurrent(place.href),
  }));
  const project = projects.find(({ id }) => id === openId) ?? projects[0];
  const table = (
    <ProjectsTable
      openId={openId}
      onOpen={(id) => {
        setOpenId(id);
        setDetails(true);
      }}
    />
  );
  return (
    <AppFrame destinations={destinations} onSearch={() => setSearching(true)}>
      <Panes.Root behavior="supporting" open={details} onOpenChange={setDetails}>
        <Panes.Main label="Projects">
          <Page
            width="full"
            header={
              <PageHeader
                title="Projects"
                description="Services and sites your organization deploys."
                meta={<Badge count={48} aria-label="48 projects" />}
                actions={
                  <>
                    <Button variant="secondary" startIcon={<IconDownload />}>
                      Import
                    </Button>
                    <Button startIcon={<IconAdd />}>New project</Button>
                  </>
                }
              />
            }
          >
            {/* Finding: PageHeader has no tabs slot, so the tabs follow it in the page. */}
            <Tabs
              aria-label="Project views"
              size="md"
              value={tab}
              onValueChange={setTab}
              items={[
                { value: 'all', label: 'All projects', content: table },
                { value: 'mine', label: 'Mine', content: table },
                { value: 'starred', label: 'Starred', content: table },
                { value: 'archived', label: 'Archived', content: table },
              ]}
            />
          </Page>
        </Panes.Main>
        <Panes.Supporting label="Project details">
          <ProjectDetails project={project} />
        </Panes.Supporting>
      </Panes.Root>
      <CommandPalette
        open={searching}
        onOpenChange={setSearching}
        aria-label="Search"
        placeholder="Search projects and pages"
        inputValue={query}
        onInputValueChange={setQuery}
        items={projects
          .filter((each) => each.name.toLowerCase().includes(query.toLowerCase()))
          .map((each) => ({ id: each.id, label: each.name, group: 'Projects' }))}
        onAction={(item) => setOpenId(item.id)}
      />
    </AppFrame>
  );
}

const places = [
  { label: 'Overview', href: '/', icon: <IconDashboard /> },
  { label: 'Projects', href: '/projects', icon: <IconFolder />, count: 3 },
  { label: 'Deployments', href: '/deployments', icon: <IconRocketLaunch /> },
  { label: 'Monitoring', href: '/monitoring', icon: <IconMonitoring /> },
  { label: 'Members', href: '/members', icon: <IconGroup />, group: 'Organization' },
  { label: 'Settings', href: '/settings', icon: <IconSettings />, group: 'Organization' },
];
