import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  IconButton,
  TextField,
  Menu,
  Menubar,
  NavList,
  Pagination,
  SearchField,
  SegmentedControl,
  Select,
  Surface,
  Switch,
  Table,
  Tabs,
  Text,
  Theme,
  Tree,
  type ThemeValue,
  type TreeItem,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Description } from '@envsemble/envui/icons/Description';
import { Edit } from '@envsemble/envui/icons/Edit';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Settings } from '@envsemble/envui/icons/Settings';

/*
 * Standard and compact forms of the same controls side by side, at today's defaults. The visual
 * baseline captures each section in both themes as the before-picture of the scale work; open one
 * with ?fixture=density&section=<name>&theme=<light|dark>.
 */

const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise' },
];

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="density-column">
      <h3 className="density-label">{title}</h3>
      {children}
    </section>
  );
}

function Row({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div>
      {label && <div className="density-label">{label}</div>}
      <div className="density-row">{children}</div>
    </div>
  );
}

function FormRow({ compact }: { compact: boolean }) {
  return (
    <Row
      label={
        compact
          ? 'TextField compact · Select density=compact · Button'
          : 'TextField · Select · Button (defaults)'
      }
    >
      <TextField label="Name" defaultValue="Quarterly report" compact={compact} />
      <Select
        label="Plan"
        options={plans}
        defaultValue="team"
        density={compact ? 'compact' : 'standard'}
      />
      <Button variant="primary">Save</Button>
      <Button variant="outlined">Cancel</Button>
    </Row>
  );
}

function FormSection() {
  return (
    <div className="density-stack">
      <div className="density-band">
        <FormRow compact={false} />
      </div>
      <div className="density-band">
        <FormRow compact />
      </div>
      <div className="density-band">
        <Surface density="compact" tone="canvas" padding={0}>
          <Row label="Same props, inside <Surface density=compact>">
            <TextField label="Name" defaultValue="Quarterly report" compact />
            <Select label="Plan" options={plans} defaultValue="team" density="compact" />
            <Button variant="primary">Save</Button>
            <Button variant="outlined">Cancel</Button>
          </Row>
        </Surface>
      </div>
      <div className="density-band">
        <Row label="No density prop: Checkbox · Switch · Badge · Button important · IconButton">
          <Checkbox label="Notify" defaultChecked />
          <Switch label="Sync" defaultChecked />
          <Badge tone="success">Ready</Badge>
          <Button variant="important">Important</Button>
          <IconButton icon={<Edit />} aria-label="Edit" variant="secondary" />
        </Row>
      </div>
    </div>
  );
}

function Toolbar({ compact }: { compact: boolean }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const content = (
    <div className="density-row">
      <IconButton icon={<Add />} aria-label="Add" variant="secondary" />
      <IconButton icon={<Refresh />} aria-label="Refresh" variant="quiet" />
      <SegmentedControl
        aria-label="Filter"
        size={compact ? 'compact' : 'standard'}
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open', count: 12 },
          { value: 'done', label: 'Done' },
        ]}
      />
      <SearchField label="Search" placeholder="Search" compact />
      <Select
        label="Sort"
        options={plans}
        defaultValue="team"
        density={compact ? 'compact' : 'standard'}
      />
      <Button variant="secondary" startIcon={<FilterList />}>
        Filter
      </Button>
      <Pagination
        page={page}
        pageSize={25}
        total={240}
        onPageChange={setPage}
        size={compact ? 'compact' : 'standard'}
      />
    </div>
  );
  return compact ? (
    <Surface density="compact" tone="canvas" padding={0}>
      {content}
    </Surface>
  ) : (
    content
  );
}

function ToolbarSection() {
  return (
    <div className="density-stack">
      <div className="density-band">
        <div className="density-label">
          Standard toolbar (defaults; SearchField is compact by default)
        </div>
        <Toolbar compact={false} />
      </div>
      <div className="density-band">
        <div className="density-label">
          Compact toolbar: Surface density=compact + size/density=compact
        </div>
        <Toolbar compact />
      </div>
    </div>
  );
}

function MenuSection() {
  const items = (
    <>
      <Menu.Item icon={<Edit />} shortcut="F2">
        Rename
      </Menu.Item>
      <Menu.Item icon={<ContentCopy />} shortcut="Ctrl+D" description="Copy beside the original">
        Duplicate
      </Menu.Item>
      <Menu.Item icon={<Folder />}>Move to folder</Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Delete />}>Delete</Menu.Item>
    </>
  );
  return (
    <div className="density-menus">
      <div className="density-menu-anchor" style={{ insetInlineStart: '1.5rem' }}>
        <Menu.Root
          aria-label="Standard menu"
          open
          trigger={<Button variant="secondary">Menu (standard)</Button>}
          align="start"
        >
          {items}
        </Menu.Root>
      </div>
      <div className="density-menu-anchor" style={{ insetInlineStart: '26.25rem' }}>
        <Surface density="compact" tone="canvas" padding={0}>
          <Menu.Root
            aria-label="Compact menu"
            open
            density="compact"
            trigger={<Button variant="secondary">Menu (compact)</Button>}
            align="start"
          >
            {items}
          </Menu.Root>
        </Surface>
      </div>
    </div>
  );
}

function treeRows(): TreeItem[] {
  return [
    { id: 'src', depth: 0, label: 'src', icon: <Folder />, expandable: true, expanded: true },
    {
      id: 'components',
      depth: 1,
      label: 'components',
      icon: <Folder />,
      expandable: true,
      expanded: true,
    },
    ...['Button.tsx', 'Input.tsx', 'Select.tsx', 'Tree.tsx'].map((name) => ({
      id: `components/${name}`,
      depth: 2,
      label: name,
      icon: <Description />,
    })),
    {
      id: 'styles',
      depth: 1,
      label: 'styles',
      icon: <Folder />,
      expandable: true,
      expanded: false,
    },
    { id: 'readme', depth: 0, label: 'README.md', icon: <Description />, detail: 'Modified' },
  ];
}

function FileTree({
  label,
  density,
  rows = treeRows(),
  selectedId = 'components/Input.tsx',
}: {
  label: string;
  density?: 'standard' | 'compact';
  rows?: TreeItem[];
  selectedId?: string;
}) {
  return (
    <Tree
      aria-label={label}
      items={rows}
      selectedId={selectedId}
      density={density}
      onOpen={() => {}}
      onExpandedChange={() => {}}
    />
  );
}

function TreeSection() {
  return (
    <div className="density-columns">
      <Column title="Tree density=standard">
        <div className="density-tree-frame">
          <FileTree label="Standard tree" density="standard" />
        </div>
      </Column>
      <Column title="Tree (default = compact)">
        <div className="density-tree-frame">
          <FileTree label="Compact tree" />
        </div>
      </Column>
    </div>
  );
}

const reports = [
  { title: 'Quarterly report', owner: 'Alex Rivera', reviews: 12, status: 'Ready' },
  { title: 'design-system/tokens', owner: 'Mira Okafor', reviews: 4, status: 'Blocked' },
  { title: 'Accessibility audit', owner: 'Sam Lee', reviews: 27, status: 'Ready' },
] as const;
const tones = { Ready: 'success', Blocked: 'warning' } as const;

function ReportTable({ density }: { density: 'standard' | 'compact' }) {
  return (
    <Table.Root aria-label={`${density} table`} density={density}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Report</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell>Reviews</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>
            <span className="density-visually-hidden">Actions</span>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {reports.map((report) => (
          <Table.Row key={report.title}>
            <Table.Cell>{report.title}</Table.Cell>
            <Table.Cell nowrap>{report.owner}</Table.Cell>
            <Table.Cell numeric>{report.reviews}</Table.Cell>
            <Table.Cell>
              <Badge tone={tones[report.status]}>{report.status}</Badge>
            </Table.Cell>
            <Table.Cell>
              <IconButton icon={<MoreVert />} aria-label="More" variant="quiet" />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function TableSection() {
  return (
    <div className="density-columns">
      <Column title="Table (default = standard)">
        <ReportTable density="standard" />
      </Column>
      <Column title="Table density=compact">
        <ReportTable density="compact" />
      </Column>
    </div>
  );
}

function tabItems(kind: 'button' | 'navigation') {
  return ['Overview', 'Activity', 'Settings'].map((name) => ({
    value: name.toLowerCase(),
    button:
      kind === 'button' ? (
        <Button variant="secondary">{name}</Button>
      ) : (
        <NavList.Item>{name}</NavList.Item>
      ),
    content: <Text>{name} panel</Text>,
  }));
}

function TabsSection() {
  return (
    <div className="density-columns">
      <Column title="Tabs size=standard">
        <Tabs aria-label="Standard tabs (Button)" items={tabItems('button')} />
        <Tabs aria-label="Standard tabs (NavList.Item)" items={tabItems('navigation')} />
      </Column>
      <Column title="Tabs size=compact">
        <Tabs aria-label="Compact tabs (Button)" size="compact" items={tabItems('button')} />
        <Tabs
          aria-label="Compact tabs (NavList.Item)"
          size="compact"
          items={tabItems('navigation')}
        />
      </Column>
    </div>
  );
}

function Sidebar({ size }: { size: 'standard' | 'compact' }) {
  return (
    <nav className="density-sidebar" aria-label={`${size} navigation`}>
      <NavList.Item size={size} icon={<Home />} selected>
        Home
      </NavList.Item>
      <NavList.Item size={size} icon={<Inbox />}>
        Inbox
      </NavList.Item>
      <NavList.Item size={size} icon={<Settings />}>
        Settings
      </NavList.Item>
    </nav>
  );
}

function NavigationSection() {
  return (
    <div className="density-columns" data-columns="3">
      <Column title="NavList.Item size=standard">
        <Sidebar size="standard" />
      </Column>
      <Column title="NavList.Item size=compact">
        <Sidebar size="compact" />
      </Column>
      <Column title="Tree default (compact) for comparison">
        <div className="density-tree-frame">
          <FileTree label="Tree" rows={treeRows().slice(0, 4)} selectedId="components" />
        </div>
      </Column>
    </div>
  );
}

/** A desktop view with every component at its default density. */
function DesktopSection() {
  const [filter, setFilter] = useState('all');
  return (
    <div className="density-app">
      <div className="density-app-menubar">
        <Menubar.Root aria-label="Application">
          <Menubar.Menu label="File">
            <Menu.Item>New</Menu.Item>
          </Menubar.Menu>
          <Menubar.Menu label="Edit">
            <Menu.Item>Undo</Menu.Item>
          </Menubar.Menu>
          <Menubar.Menu label="View">
            <Menu.Item>Zoom</Menu.Item>
          </Menubar.Menu>
        </Menubar.Root>
      </div>
      <div className="density-app-body">
        <aside className="density-app-side">
          <Sidebar size="standard" />
          <FileTree label="Files" />
        </aside>
        <div className="density-app-main">
          <div className="density-row">
            <Button variant="primary" startIcon={<Add />}>
              New report
            </Button>
            <SearchField label="Search reports" placeholder="Search reports" />
            <Select label="Owner" options={plans} defaultValue="team" />
            <SegmentedControl
              aria-label="Filter"
              value={filter}
              onValueChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
              ]}
            />
            <Button variant="important">Publish</Button>
          </div>
          <Tabs aria-label="Views" items={tabItems('button')} />
          <ReportTable density="standard" />
          <div className="density-row">
            <TextField label="Title" defaultValue="Quarterly report" />
            <Button variant="secondary">Rename</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const densitySections: Record<string, () => ReactNode> = {
  form: FormSection,
  toolbar: ToolbarSection,
  menu: MenuSection,
  tree: TreeSection,
  table: TableSection,
  tabs: TabsSection,
  navigation: NavigationSection,
  desktop: DesktopSection,
};

export function DensityFixture() {
  const query = new URLSearchParams(location.search);
  const section = query.get('section');
  const theme = query.get('theme');
  // Open menus lock page scrolling, so they render only on their own.
  const sections = section
    ? [section]
    : Object.keys(densitySections).filter((name) => name !== 'menu');
  const themes: ThemeValue[] = theme ? [theme as ThemeValue] : ['light', 'dark'];
  return (
    <div className="density-fixture">
      {themes.map((name) =>
        sections.map((key) => {
          const Section = densitySections[key];
          return (
            <Theme
              key={`${name}-${key}`}
              theme={name}
              className="density-page"
              data-density-section={key}
              data-density-theme={name}
            >
              {Section ? <Section /> : <p>Unknown density section: {key}</p>}
            </Theme>
          );
        }),
      )}
    </div>
  );
}
