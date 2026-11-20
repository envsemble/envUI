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
  NavigationDrawer,
  NavigationRail,
  type Destination,
  Pagination,
  SearchField,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Theme,
  Tree,
  type ControlSize,
  type RowDensity,
  type ThemeScale,
  type ColorScheme,
  type TreeItem,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import {
  controlSizes,
  densityScales,
  densitySectionNames,
  type DensitySection,
} from './ScaleSections.js';

export const mount = 'standalone';

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
        icon={<IconEdit />}
        aria-label="Edit"
        variant="secondary"
        data-control="icon-button"
      />
      <TextField size={size} label="Name" visibleLabel={false} defaultValue="Quarterly report" />
      <SearchField size={size} label="Search" placeholder="Search" />
      <Select size={size} aria-label="Plan" items={plans} defaultValue="team" />
      <Combobox
        size={size}
        label="Owner"
        visibleLabel={false}
        items={owners}
        defaultValue="sam-lee"
        clearable
      />
      <DatePicker size={size} label="Due" visibleLabel={false} />
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
    </Row>
  );
}

function LabelledRow({ size }: { size: ControlSize }) {
  return (
    <Row label={`size="${size}", labels shown`} data-labelled-row={size}>
      <Button size={size} variant="secondary" data-control="button">
        Apply
      </Button>
      <TextField size={size} label="Name" defaultValue="Quarterly report" data-field="outline" />
      <TextField size={size} label="Empty" data-field="outline-empty" />
      <Select size={size} label="Plan" items={plans} defaultValue="team" data-field="select" />
      <TextField
        size={size}
        variant="ghost"
        label="Owner"
        defaultValue="Sam Lee"
        data-field="ghost"
      />
      <TextField size={size} variant="ghost" label="Empty" data-field="ghost-empty" />
    </Row>
  );
}

function SizesSection() {
  return (
    <div className="density-stack">
      {controlSizes.map((size) => (
        <div key={size} className="density-band">
          <SizeRow size={size} />
          <LabelledRow size={size} />
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
          <TextField label="Name" visibleLabel={false} defaultValue="Quarterly report" />
          <Select aria-label="Plan" items={plans} defaultValue="team" />
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Cancel</Button>
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
          <IconButton icon={<IconEdit />} aria-label="Edit" variant="secondary" />
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
            <IconButton size={size} icon={<IconAdd />} aria-label="Add" variant="secondary" />
            <IconButton size={size} icon={<IconRefresh />} aria-label="Refresh" variant="ghost" />
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
            <Button size={size} variant="secondary" start={<IconFilterList />}>
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
          <Menu.Item start={<IconEdit />} shortcut="F2">
            Rename
          </Menu.Item>
          <Menu.Item
            start={<IconContentCopy />}
            shortcut="Ctrl+D"
            description="Copy beside the original"
          >
            Duplicate
          </Menu.Item>
          <Menu.Item start={<IconFolder />}>Move to folder</Menu.Item>
          <Menu.Separator />
          <Menu.Item start={<IconDelete />}>Delete</Menu.Item>
        </Menu.Root>
      </div>
    </div>
  );
}

function treeRows(): TreeItem[] {
  return [
    {
      value: 'src',
      depth: 0,
      label: 'src',
      icon: <IconFolder />,
      expandable: true,
      expanded: true,
    },
    {
      value: 'components',
      depth: 1,
      label: 'components',
      icon: <IconFolder />,
      expandable: true,
      expanded: true,
    },
    ...['Button.tsx', 'Input.tsx', 'Select.tsx', 'Tree.tsx'].map((name) => ({
      value: `components/${name}`,
      depth: 2,
      label: name,
      icon: <IconDescription />,
    })),
    {
      value: 'styles',
      depth: 1,
      label: 'styles',
      icon: <IconFolder />,
      expandable: true,
      expanded: false,
    },
    {
      value: 'readme',
      depth: 0,
      label: 'README.md',
      icon: <IconDescription />,
      description: 'Modified',
    },
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
              <IconButton icon={<IconMoreVert />} aria-label="More" variant="ghost" />
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

const destinations: Destination[] = [
  { label: 'Home', icon: <IconHome />, href: '#home', current: true },
  { label: 'Inbox', icon: <IconInbox />, href: '#inbox', count: 3 },
  { label: 'Settings', icon: <IconSettings />, href: '#settings' },
];

function DensityDrawer({ label }: { label: string }) {
  return (
    <NavigationDrawer className="density-drawer" aria-label={label} destinations={destinations} />
  );
}

function NavigationSection() {
  return (
    <div className="density-columns">
      <Column title="Drawer, Rail and Breadcrumbs">
        <DensityDrawer label="Navigation" />
        <NavigationRail aria-label="Rail navigation" destinations={destinations} />
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
          <DensityDrawer label="Sections" />
          <FileTree label="Files" />
        </aside>
        <div className="density-app-main">
          <div className="density-row">
            <Button variant="primary" start={<IconAdd />}>
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
                  icon={<IconEdit />}
                  aria-label={`${name}, ${direction}`}
                />
              </span>
            ))}
          </div>
        </Column>
      ))}
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
  navigation: NavigationSection,
  desktop: DesktopSection,
  layouts: LayoutsSection,
};

function ScaledSection({ name, theme }: { name: string; theme: ColorScheme }) {
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

export default function ScaleFixture() {
  const query = new URLSearchParams(location.search);
  const section = query.get('section');
  const theme = query.get('theme');
  const scrollLockingSection = 'menu';
  const sections: string[] = section
    ? [section]
    : densitySectionNames.filter((name) => name !== scrollLockingSection);
  const themes: ColorScheme[] = theme ? [theme as ColorScheme] : ['light', 'dark'];
  return (
    <div className="density-fixture">
      {themes.map((name) =>
        sections.map((key) => <ScaledSection key={`${name}-${key}`} name={key} theme={name} />),
      )}
    </div>
  );
}
