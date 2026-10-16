import { useState } from 'react';
import {
  ActionGroup,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  CounterBadge,
  DiffStat,
  HoverCard,
  IconButton,
  TextField,
  Kbd,
  Link,
  NavigationItem,
  Alert,
  Popover,
  SegmentedControl,
  Stack,
  Surface,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  type TableSortDirection,
} from '@envsemble/envui';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Description } from '@envsemble/envui/icons/Description';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Info } from '@envsemble/envui/icons/Info';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function SegmentedControlPreview() {
  const [view, setView] = useState('open');
  const [layout, setLayout] = useState('list');
  const [assigned, setAssigned] = useState('mine');
  return (
    <Preview>
      <Example
        title="One choice among a few"
        size="collection"
        caption={
          <>
            <Kbd>←</Kbd> and <Kbd>→</Kbd> move between options and choose them. Counts follow the
            label in a smaller, muted number.
          </>
        }
      >
        <SpecimenGrid>
          <Specimen title="With counts">
            <SegmentedControl
              aria-label="Work items"
              value={view}
              onValueChange={setView}
              options={[
                { value: 'open', label: 'Open', count: 12 },
                { value: 'blocked', label: 'Blocked', count: 3 },
                { value: 'done', label: 'Done', count: 40 },
              ]}
            />
          </Specimen>
          <Specimen title="Compact with icons">
            <SegmentedControl
              aria-label="Layout"
              size="compact"
              value={layout}
              onValueChange={setLayout}
              options={[
                { value: 'list', label: 'List', icon: <ViewList /> },
                { value: 'board', label: 'Board', icon: <ViewModule /> },
                { value: 'timeline', label: 'Timeline', disabled: true },
              ]}
            />
          </Specimen>
          <Specimen title="Full width in a narrow sidebar">
            <div className="docs-narrow-segments">
              <SegmentedControl
                fullWidth
                aria-label="Assignments"
                value={assigned}
                onValueChange={setAssigned}
                options={[
                  { value: 'mine', label: 'Assigned to me' },
                  { value: 'team', label: 'Everyone on the team' },
                ]}
              />
            </div>
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          Showing {view} items as a {layout}.
        </Text>
      </Example>
    </Preview>
  );
}

const badgeTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const badgeLabels: Record<(typeof badgeTones)[number], string> = {
  neutral: 'Archived',
  accent: 'In review',
  success: 'Ready',
  warning: 'Blocked',
  danger: 'Failed',
  done: 'Completed',
};

export function BadgesPreview() {
  const [selected, setSelected] = useState('inbox');
  return (
    <Preview>
      <Example title="Badges" size="collection">
        <SpecimenGrid size="wide">
          {(['subtle', 'solid', 'outline'] as const).map((variant) => (
            <Specimen key={variant} title={variant[0]!.toUpperCase() + variant.slice(1)}>
              <ActionGroup>
                {badgeTones.map((tone) => (
                  <Badge key={tone} tone={tone} variant={variant}>
                    {badgeLabels[tone]}
                  </Badge>
                ))}
              </ActionGroup>
            </Specimen>
          ))}
          <Specimen title="With an icon">
            <ActionGroup>
              <Badge tone="success" icon={<CheckCircle />}>
                Approved
              </Badge>
              <Badge tone="done" icon={<TaskAlt />}>
                Done
              </Badge>
              <Badge icon={<Folder />}>Shared drafts</Badge>
            </ActionGroup>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Counters" size="collection">
        <SpecimenGrid>
          <Specimen title="Neutral and accent">
            <ActionGroup>
              <CounterBadge value={3} />
              <CounterBadge value={128} />
              <CounterBadge value="99+" tone="accent" aria-label="More than 99 unread" />
            </ActionGroup>
          </Specimen>
          <Specimen title="Diff counts">
            <ActionGroup>
              <DiffStat additions={124} deletions={37} />
              <Button variant="secondary">
                Diffs <DiffStat additions={12} deletions={3} />
              </Button>
            </ActionGroup>
          </Specimen>
          <Specimen title="In navigation">
            <Stack gap={1}>
              <NavigationItem
                icon={<Inbox />}
                selected={selected === 'inbox'}
                onClick={() => setSelected('inbox')}
                trailing={<CounterBadge value={12} aria-label="12 unread" tone="accent" />}
              >
                Inbox
              </NavigationItem>
              <NavigationItem
                icon={<Description />}
                selected={selected === 'plans'}
                onClick={() => setSelected('plans')}
                trailing={<CounterBadge value={4} />}
              >
                Plans
              </NavigationItem>
              <NavigationItem
                icon={<Inbox />}
                iconOnly
                aria-label="Inbox, 12 unread"
                selected={selected === 'compact'}
                onClick={() => setSelected('compact')}
                trailing={<CounterBadge value={12} />}
              >
                Inbox
              </NavigationItem>
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Tone colors"
        size="collection"
        caption="Status icons and short text use the tone tokens directly; each keeps 4.5:1 on the canvas and panes in both themes."
      >
        <ActionGroup>
          {badgeTones.map((tone) => (
            <span
              key={tone}
              className="docs-tone-sample"
              style={{ color: `var(--color-tone-${tone})` }}
            >
              <CheckCircle /> {tone}
            </span>
          ))}
        </ActionGroup>
      </Example>
    </Preview>
  );
}

export function AlertsPreview() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <Preview>
      <Example title="Tones" size="wide">
        <Stack gap={3}>
          <Alert title="Sync paused">Changes are saved on this device until you reconnect.</Alert>
          <Alert tone="success">The plan was published to the team.</Alert>
          <Alert
            tone="warning"
            title="Two decisions are blocked"
            action={
              <Button variant="secondary" onClick={() => undefined}>
                Review blockers
              </Button>
            }
          >
            The release cannot start until both are resolved.
          </Alert>
          {dismissed ? (
            <Button variant="secondary" onClick={() => setDismissed(false)}>
              Show the error again
            </Button>
          ) : (
            <Alert tone="error" title="Search is unavailable" onDismiss={() => setDismissed(true)}>
              The search service did not respond. Your open documents are still here.
            </Alert>
          )}
        </Stack>
      </Example>
    </Preview>
  );
}

export function PopoverPreview() {
  const [name, setName] = useState('Roadmap.md');
  return (
    <Preview>
      <Example
        title="Popovers"
        size="collection"
        caption={
          <>
            <Kbd>Esc</Kbd> or a press outside closes the popover and focus returns to its trigger.
          </>
        }
      >
        <ActionGroup>
          <Popover
            title="Roadmap.md"
            trigger={
              <Button variant="secondary" startIcon={<Info />}>
                Details
              </Button>
            }
          >
            <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
          </Popover>
          <Popover
            aria-label="Rename document"
            width="wide"
            trigger={
              <Button variant="secondary" startIcon={<Edit />}>
                Rename
              </Button>
            }
          >
            {(close) => (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setName(String(new FormData(event.currentTarget).get('name')));
                  close();
                }}
              >
                <Stack gap={3}>
                  <TextField label="Name" name="name" defaultValue={name} />
                  <ActionGroup align="end">
                    <Button variant="secondary" onClick={close}>
                      Cancel
                    </Button>
                    <Button type="submit">Rename</Button>
                  </ActionGroup>
                </Stack>
              </form>
            )}
          </Popover>
        </ActionGroup>
        <Text variant="caption" className="docs-caption">
          Current name: {name}
        </Text>
      </Example>
    </Preview>
  );
}

export function HoverCardPreview() {
  return (
    <Preview>
      <Example
        title="Hover cards"
        size="collection"
        caption={
          <>
            Rest the pointer on a link or focus it with the keyboard. <Kbd>Esc</Kbd> closes the
            card; focus stays on the link.
          </>
        }
      >
        <Text>
          The release depends on{' '}
          <HoverCard trigger={<Link href="#roadmap">Roadmap.md</Link>}>
            <Stack gap={2}>
              <Text>
                <strong>Roadmap.md</strong>
              </Text>
              <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
            </Stack>
          </HoverCard>{' '}
          and on{' '}
          <HoverCard width="wide" side="top" trigger={<Link href="#sync">Sync conflicts</Link>}>
            <Stack gap={2}>
              <Text>
                <strong>Sync conflicts</strong>
              </Text>
              <Text tone="muted">
                Owned by Sam Lee in Plans/Sync. Two edits made offline on the same paragraph wait
                for a decision about which one to keep.
              </Text>
            </Stack>
          </HoverCard>
          .
        </Text>
      </Example>
    </Preview>
  );
}

const samplePlans = [
  {
    title: 'Search relevance',
    folder: 'Plans/Search',
    owner: 'Alex Morgan',
    decisions: 12,
    status: 'In progress',
  },
  {
    title: 'Sync conflicts',
    folder: 'Plans/Sync',
    owner: 'Sam Lee',
    decisions: 4,
    status: 'Blocked',
  },
  {
    title: 'Sharing links',
    folder: 'Plans/Sharing',
    owner: 'Priya Shah',
    decisions: 27,
    status: 'Completed',
  },
  {
    title: 'Billing cleanup',
    folder: 'Plans/Billing',
    owner: 'Alex Morgan',
    decisions: 3,
    status: 'In progress',
  },
] as const;
const statusTones = { 'In progress': 'accent', Blocked: 'warning', Completed: 'done' } as const;

type PlanColumn = 'title' | 'owner' | 'decisions';
type Plan = (typeof samplePlans)[number];

function comparePlans(column: PlanColumn) {
  return (first: Plan, second: Plan) =>
    column === 'decisions'
      ? first.decisions - second.decisions
      : first[column].localeCompare(second[column]);
}

export function TablesPreview() {
  const [density, setDensity] = useState('standard');
  const [sort, setSort] = useState<{ column: PlanColumn; direction: 'ascending' | 'descending' }>();
  const [selected, setSelected] = useState<string[]>(['Sync conflicts']);
  const [width, setWidth] = useState('narrow');
  const plans = sort
    ? [...samplePlans].sort((first, second) =>
        sort.direction === 'ascending'
          ? comparePlans(sort.column)(first, second)
          : comparePlans(sort.column)(second, first),
      )
    : samplePlans;
  const direction = (column: PlanColumn): TableSortDirection =>
    sort?.column === column ? sort.direction : 'none';
  const sortBy = (column: PlanColumn) => () =>
    setSort((current) => ({
      column,
      direction:
        current?.column === column && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  return (
    <Preview>
      <Example
        title="Plans"
        size="wide"
        actions={
          <SegmentedControl
            aria-label="Density"
            size="compact"
            value={density}
            onValueChange={setDensity}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        }
        caption={
          <>
            Select a header to sort the plans. Drag the boundary between two headers to resize the
            columns, or focus it and press <Kbd>←</Kbd> or <Kbd>→</Kbd>; double-click it to restore
            the widths. Numeric cells align to the end with tabular figures.
          </>
        }
      >
        <Table
          aria-label="Plans"
          density={density === 'compact' ? 'compact' : 'standard'}
          resizableColumns
          defaultColumnWidths={[40, 22, 16, 22]}
          minColumnWidths={12}
        >
          <TableHead>
            <TableRow>
              <TableHeaderCell sortDirection={direction('title')} onSort={sortBy('title')}>
                Plan
              </TableHeaderCell>
              <TableHeaderCell sortDirection={direction('owner')} onSort={sortBy('owner')}>
                Owner
              </TableHeaderCell>
              <TableHeaderCell
                numeric
                sortDirection={direction('decisions')}
                onSort={sortBy('decisions')}
              >
                Decisions
              </TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.title} interactive>
                <TableCell>
                  <Link href={`#/${plan.folder}`} underline={false}>
                    {plan.title}
                  </Link>
                  <Text variant="caption">{plan.folder}</Text>
                </TableCell>
                <TableCell nowrap>{plan.owner}</TableCell>
                <TableCell numeric>{plan.decisions}</TableCell>
                <TableCell>
                  <Badge tone={statusTones[plan.status]}>{plan.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Example>
      <Example
        title="Selected rows"
        size="wide"
        caption={`${selected.length} of ${samplePlans.length} plans selected. Selected rows take the navigation selection color.`}
      >
        <Table aria-label="Plans to archive">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {samplePlans.map((plan) => (
              <TableRow key={plan.title} selected={selected.includes(plan.title)}>
                <TableCell>
                  <Checkbox
                    label={plan.title}
                    checked={selected.includes(plan.title)}
                    onCheckedChange={(checked) =>
                      setSelected((current) =>
                        checked
                          ? [...current, plan.title]
                          : current.filter((title) => title !== plan.title),
                      )
                    }
                  />
                </TableCell>
                <TableCell nowrap>{plan.owner}</TableCell>
                <TableCell>
                  <Badge tone={statusTones[plan.status]}>{plan.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Example>
      <Example
        title="Stacked rows"
        size={width === 'narrow' ? 'field' : 'content'}
        actions={
          <SegmentedControl
            aria-label="Available width"
            size="compact"
            value={width}
            onValueChange={setWidth}
            options={[
              { value: 'narrow', label: '24 rem' },
              { value: 'wide', label: '42 rem' },
            ]}
          />
        }
        caption="Below 36 rem of available width, each row becomes a block: the first cell is its title, the other cells show their labels. Assistive technology still reads a table."
      >
        <Table aria-label="Plans by owner" narrowLayout="stack">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell numeric>Decisions</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {samplePlans.map((plan) => (
              <TableRow key={plan.title}>
                <TableCell>
                  {plan.title}
                  <Text variant="caption">{plan.folder}</Text>
                </TableCell>
                <TableCell label="Owner" nowrap>
                  {plan.owner}
                </TableCell>
                <TableCell label="Decisions" numeric>
                  {plan.decisions}
                </TableCell>
                <TableCell label="Status">
                  <Badge tone={statusTones[plan.status]}>{plan.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Example>
    </Preview>
  );
}

export function BreadcrumbsPreview() {
  const [level, setLevel] = useState('Roadmap.md');
  return (
    <Preview>
      <Example
        title="Where you are"
        size="collection"
        caption="Earlier levels are links or buttons; the current page is last and not a link."
      >
        <Breadcrumbs
          items={[
            { label: 'Workspace', href: '#/workspace' },
            { label: 'Plans', onClick: () => setLevel('Plans') },
            { label: 'Search', onClick: () => setLevel('Search') },
            { label: 'Roadmap.md' },
          ]}
        />
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {level === 'Roadmap.md' ? '' : `Went to ${level}`}
        </Text>
      </Example>
      <Example
        title="On one line"
        size="field"
        caption="With wrap set to false, the trail stays on one line in a bar or header: the current page is cut short first, and earlier levels keep their width."
      >
        <Surface
          tone="row"
          padding={2}
          corners="standard"
          density="compact"
          className="docs-breadcrumb-bar"
        >
          <Breadcrumbs
            aria-label="Document location"
            wrap={false}
            items={[
              { label: 'Plans', href: '#/plans' },
              { label: 'Quarterly review of the shared design tokens' },
            ]}
          />
          <Badge tone="success">Published</Badge>
          <IconButton variant="text" icon={<MoreVert />} aria-label="More actions" />
        </Surface>
      </Example>
    </Preview>
  );
}

export function KbdPreview() {
  return (
    <Preview>
      <Example title="Keys and shortcuts" size="collection">
        <Stack gap={3}>
          <Text>
            Press <Kbd keys={['Ctrl', 'P']} /> to open a document, or <Kbd>F2</Kbd> to rename it.
          </Text>
          <Text>
            Close the current tab with <Kbd keys={['Ctrl', 'W']} />, or every tab with{' '}
            <Kbd keys={['Ctrl', 'K', 'W']} />.
          </Text>
        </Stack>
      </Example>
    </Preview>
  );
}
