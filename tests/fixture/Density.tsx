import { useState, type ReactNode } from 'react';
import {
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  CopyButton,
  DatePicker,
  IconButton,
  TextField,
  Menu,
  Menubar,
  NavList,
  Pagination,
  PanelDock,
  SearchField,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  Theme,
  Tree,
  type ControlSize,
  type RowDensity,
  type ThemeScale,
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
import {
  controlSizes,
  densityScales,
  densitySectionNames,
  type DensitySection,
} from './DensitySections.js';

/*
 * The same content in the comfortable and the compact scale, one above the other. The visual
 * baseline captures each section in both themes, and the browser tests measure the sizes section;
 * open one with ?fixture=density&section=<name>&theme=<light|dark>.
 */

const plans = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise' },
];
const owners = ['Alex Morgan', 'Priya Shah', 'Sam Lee'].map((name) => ({
  value: name.toLowerCase().replace(' ', '-'),
  label: name,
}));

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="density-column">
      <h3 className="density-label">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  children,
  label,
  ...props
}: {
  children: ReactNode;
  label?: string;
  [attribute: `data-${string}`]: string;
}) {
  return (
    <div>
      {label && <div className="density-label">{label}</div>}
      <div className="density-row" {...props}>
        {children}
      </div>
    </div>
  );
}

/** Every control that takes a size, at one size: they must all be as tall. */
function SizeRow({ size }: { size: ControlSize }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  return (
    <Row label={`size="${size}"`} data-size-row={size}>
      <Button size={size} variant="primary" data-control="button">
        Save
      </Button>
      <IconButton
        size={size}
        icon={<Edit />}
        aria-label="Edit"
        variant="secondary"
        data-control="icon-button"
      />
      <TextField size={size} label="Name" defaultValue="Quarterly report" />
      <SearchField size={size} label="Search" placeholder="Search" />
      <Select size={size} aria-label="Plan" items={plans} defaultValue="team" />
      <Combobox size={size} label="Owner" items={owners} defaultValue="sam-lee" clearable />
      <DatePicker size={size} label="Due" />
      <SegmentedControl
        size={size}
        aria-label="Filter"
        value={filter}
        onValueChange={setFilter}
        items={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
        ]}
      />
      <CopyButton size={size} value="Quarterly report" aria-label="Copy title" />
      <Pagination size={size} page={page} pageSize={25} total={240} onPageChange={setPage} />
      <ButtonGroup aria-label="Alignment">
        <Button size={size} variant="secondary">
          Left
        </Button>
        <Button size={size} variant="secondary">
          Right
        </Button>
      </ButtonGroup>
      <Tabs
        aria-label="Views"
        size={size}
        items={['Overview', 'Activity'].map((name) => ({
          value: name.toLowerCase(),
          button: <Button variant="secondary">{name}</Button>,
          content: null,
        }))}
      />
    </Row>
  );
}

function SizesSection() {
  return (
    <div className="density-stack">
      {controlSizes.map((size) => (
        <div key={size} className="density-band">
          <SizeRow size={size} />
        </div>
      ))}
    </div>
  );
}

function FormSection() {
  return (
    <div className="density-stack">
      <div className="density-band">
        <Row label="TextField · Select · Button, at the control height (defaults)">
          <TextField label="Name" defaultValue="Quarterly report" />
          <Select aria-label="Plan" items={plans} defaultValue="team" />
          <Button variant="primary">Save</Button>
          <Button variant="outline">Cancel</Button>
        </Row>
      </div>
      <div className="density-band">
        <Row label='The floating variant: TextField · Combobox · DatePicker variant="floating"'>
          <TextField variant="floating" label="Name" defaultValue="Quarterly report" />
          <Combobox variant="floating" label="Owner" items={owners} />
          <DatePicker variant="floating" label="Due" />
        </Row>
      </div>
      <div className="density-band">
        <Row label="No size: Checkbox · Switch · Badge · Button important · IconButton">
          <Checkbox label="Notify" defaultChecked />
          <Switch label="Sync" defaultChecked />
          <Badge tone="success">Ready</Badge>
          <Button variant="primary" tone="accent">
            Important
          </Button>
          <IconButton icon={<Edit />} aria-label="Edit" variant="secondary" />
        </Row>
      </div>
    </div>
  );
}

function ToolbarSection() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  return (
    <div className="density-stack">
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} className="density-band">
          <div className="density-label">Toolbar, size="{size}"</div>
          <div className="density-row">
            <IconButton size={size} icon={<Add />} aria-label="Add" variant="secondary" />
            <IconButton size={size} icon={<Refresh />} aria-label="Refresh" variant="ghost" />
            <SegmentedControl
              aria-label="Filter"
              size={size}
              value={filter}
              onValueChange={setFilter}
              items={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open', count: 12 },
                { value: 'done', label: 'Done' },
              ]}
            />
            <SearchField size={size} label="Search" placeholder="Search" />
            <Select size={size} aria-label="Sort" items={plans} defaultValue="team" />
            <Button size={size} variant="secondary" startIcon={<FilterList />}>
              Filter
            </Button>
            <Pagination page={page} pageSize={25} total={240} onPageChange={setPage} size={size} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuSection() {
  return (
    <div className="density-menus">
      <div className="density-menu-anchor">
        <Menu.Root
          aria-label="Report actions"
          open
          trigger={<Button variant="secondary">Menu</Button>}
          align="start"
        >
          <Menu.Item icon={<Edit />} shortcut="F2">
            Rename
          </Menu.Item>
          <Menu.Item
            icon={<ContentCopy />}
            shortcut="Ctrl+D"
            description="Copy beside the original"
          >
            Duplicate
          </Menu.Item>
          <Menu.Item icon={<Folder />}>Move to folder</Menu.Item>
          <Menu.Separator />
          <Menu.Item icon={<Delete />}>Delete</Menu.Item>
        </Menu.Root>
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
    { id: 'readme', depth: 0, label: 'README.md', icon: <Description />, description: 'Modified' },
  ];
}

function FileTree({
  label,
  density,
  rows = treeRows(),
  selectedId = 'components/Input.tsx',
}: {
  label: string;
  density?: RowDensity;
  rows?: TreeItem[];
  selectedId?: string;
}) {
  return (
    <Tree
      aria-label={label}
      items={rows}
      value={selectedId}
      density={density}
      onAction={() => {}}
      onExpandedChange={() => {}}
    />
  );
}

function TreeSection() {
  return (
    <div className="density-columns" data-columns="4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((density) => (
        <Column
          key={density}
          title={`Tree density="${density}"${density === 'sm' ? ' (default)' : ''}`}
        >
          <div className="density-tree-frame">
            <FileTree label={`Tree, ${density}`} density={density} />
          </div>
        </Column>
      ))}
    </div>
  );
}

const reports = [
  { title: 'Quarterly report', owner: 'Alex Rivera', reviews: 12, status: 'Ready' },
  { title: 'design-system/tokens', owner: 'Mira Okafor', reviews: 4, status: 'Blocked' },
  { title: 'Accessibility audit', owner: 'Sam Lee', reviews: 27, status: 'Ready' },
] as const;
const tones = { Ready: 'success', Blocked: 'warning' } as const;

function ReportTable({ density }: { density?: RowDensity }) {
  return (
    <Table.Root aria-label={`Reports, ${density ?? 'md'}`} density={density}>
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
              <IconButton icon={<MoreVert />} aria-label="More" variant="ghost" />
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
      <Column title='Table (default density="md")'>
        <ReportTable />
      </Column>
      <Column title='Table density="sm"'>
        <ReportTable density="sm" />
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
      <Column title='Tabs (default size="lg")'>
        <Tabs aria-label="Tabs, Button" items={tabItems('button')} />
        <Tabs aria-label="Tabs, NavList.Item" items={tabItems('navigation')} />
      </Column>
      <Column title='Tabs size="sm"'>
        <Tabs aria-label="Small tabs, Button" size="sm" items={tabItems('button')} />
        <Tabs aria-label="Small tabs, NavList.Item" size="sm" items={tabItems('navigation')} />
      </Column>
    </div>
  );
}

function Sidebar({ label }: { label: string }) {
  return (
    <nav className="density-sidebar" aria-label={label}>
      <NavList.Item icon={<Home />} selected>
        Home
      </NavList.Item>
      <NavList.Item icon={<Inbox />}>Inbox</NavList.Item>
      <NavList.Item icon={<Settings />}>Settings</NavList.Item>
    </nav>
  );
}

function NavigationSection() {
  return (
    <div className="density-columns">
      <Column title="NavList.Item and Breadcrumbs">
        <Sidebar label="Navigation" />
        <Breadcrumbs
          aria-label="Location"
          items={[
            { label: 'Plans', href: '#plans' },
            { label: 'Design', href: '#design' },
            { label: 'Quarterly review' },
          ]}
        />
      </Column>
      <Column title="Tree (default) for comparison">
        <div className="density-tree-frame">
          <FileTree label="Tree" rows={treeRows().slice(0, 4)} selectedId="components" />
        </div>
      </Column>
    </div>
  );
}

/** A desktop view with every component at its default size and density. */
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
          <Sidebar label="Sections" />
          <FileTree label="Files" />
        </aside>
        <div className="density-app-main">
          <div className="density-row">
            <Button variant="primary" startIcon={<Add />}>
              New report
            </Button>
            <SearchField label="Search reports" placeholder="Search reports" />
            <Select aria-label="Owner" items={plans} defaultValue="team" />
            <SegmentedControl
              aria-label="Filter"
              value={filter}
              onValueChange={setFilter}
              items={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
              ]}
            />
            <Button variant="primary" tone="accent">
              Publish
            </Button>
          </div>
          <Tabs aria-label="Views" items={tabItems('button')} />
          <ReportTable />
          <div className="density-row">
            <TextField label="Title" defaultValue="Quarterly report" />
            <Button variant="secondary">Rename</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small buttons 4 px apart in a layout of the application's own: a press must reach the button it
 * lands on under a coarse pointer, whatever the layout. */
function TightButtons({ label }: { label: string }) {
  return ['Cut', 'Copy', 'Paste', 'Undo'].map((name) => (
    <Button key={name} size="sm" variant="secondary" aria-label={`${name}, ${label}`}>
      {name}
    </Button>
  ));
}

const tightLayouts = [
  { name: 'column', title: 'A plain flex column' },
  { name: 'wrap', title: 'A wrapping row' },
  { name: 'grid', title: 'A two-column grid' },
  { name: 'reverse', title: 'A reversed row' },
] as const;

/** A panel with its header's actions beside the window controls, as a docked panel shows them. */
function DockedPanel() {
  return (
    <div className="density-dock-frame">
      <PanelDock.Root
        panels={[{ id: 'report', title: 'Quarterly report', mode: 'open', active: true }]}
        onModeChange={() => {}}
        onClose={() => {}}
      >
        {(panel) => (
          <PanelDock.Header
            title={panel.title}
            actions={
              <>
                <IconButton icon={<Edit />} aria-label="Edit the report" />
                <IconButton icon={<MoreVert />} aria-label="More actions" />
              </>
            }
          />
        )}
      </PanelDock.Root>
    </div>
  );
}

/** Tight layouts of small buttons, and a docked panel's header, for the touch hit areas. */
function LayoutsSection() {
  return (
    <div className="density-columns" data-columns="4">
      {tightLayouts.map(({ name, title }) => (
        <Column key={name} title={title}>
          <div className="density-tight" data-layout={name}>
            <TightButtons label={name} />
          </div>
        </Column>
      ))}
      {(['ltr', 'rtl'] as const).map((direction) => (
        <Column key={direction} title={`Each button in a span, ${direction}`}>
          <div className="density-tight" data-layout="spans" dir={direction}>
            {['Bold', 'Italic', 'Link'].map((name) => (
              <span key={name}>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<Edit />}
                  aria-label={`${name}, ${direction}`}
                />
              </span>
            ))}
          </div>
        </Column>
      ))}
      <Column title="A docked panel's header">
        <DockedPanel />
      </Column>
    </div>
  );
}

const densitySections: Record<DensitySection, () => ReactNode> = {
  sizes: SizesSection,
  form: FormSection,
  toolbar: ToolbarSection,
  menu: MenuSection,
  tree: TreeSection,
  table: TableSection,
  tabs: TabsSection,
  navigation: NavigationSection,
  desktop: DesktopSection,
  layouts: LayoutsSection,
};

/** One section in each scale, one above the other. */
function ScaledSection({ name, theme }: { name: string; theme: ThemeValue }) {
  const Section = (densitySectionNames as readonly string[]).includes(name)
    ? densitySections[name as DensitySection]
    : undefined;
  return (
    <div className="density-section" data-density-section={name} data-density-theme={theme}>
      {densityScales.map((scale: ThemeScale) => (
        <Theme
          key={scale}
          theme={theme}
          scale={scale}
          className="density-page"
          data-density-scale={scale}
        >
          <h2 className="density-scale-label">{scale === 'compact' ? 'Compact' : 'Comfortable'}</h2>
          {Section ? <Section /> : <p>Unknown density section: {name}</p>}
        </Theme>
      ))}
    </div>
  );
}

export function DensityFixture() {
  const query = new URLSearchParams(location.search);
  const section = query.get('section');
  const theme = query.get('theme');
  // Open menus lock page scrolling, so they render only on their own.
  const sections: string[] = section
    ? [section]
    : densitySectionNames.filter((name) => name !== 'menu');
  const themes: ThemeValue[] = theme ? [theme as ThemeValue] : ['light', 'dark'];
  return (
    <div className="density-fixture">
      {themes.map((name) =>
        sections.map((key) => <ScaledSection key={`${name}-${key}`} name={key} theme={name} />),
      )}
    </div>
  );
}
