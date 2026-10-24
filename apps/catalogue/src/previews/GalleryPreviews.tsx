import { useEffect, type ComponentType } from 'react';
import {
  Alert,
  AnimatedNumber,
  Avatar,
  AvatarButton,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  Column,
  ConfirmDialog,
  Disclosure,
  Drawer,
  Grid,
  IconButton,
  Kbd,
  List,
  Menu,
  Page,
  PageHeader,
  Rail,
  Row,
  Spinner,
  Table,
  Text,
  TextField,
  Toast,
  TopBar,
  useToast,
  type Destination,
} from '@envsemble/envui';
import { CodeBlock, Markdown } from '@envsemble/envui/content';
import { Add } from '@envsemble/envui/icons/Add';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { SwapHoriz } from '@envsemble/envui/icons/SwapHoriz';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';
import type { StageFill } from '../DocumentationTypes';

/*
 * What the galleries of components and patterns show of a page whose lead example doesn't read at
 * a glance in a small tile: a composition drawn for the tile, or another of the page's examples.
 * Each is real envUI, laid out in the tile's small window and drawn inert at the gallery's one
 * scale (Gallery.tsx), so it is sized for that window: about as wide as a phone's column and three
 * quarters as tall. A page not listed here shows its lead example, as a Related tile does.
 */

/** A gallery tile's picture of a page, where its lead example isn't the best one. */
export interface GalleryPreview {
  /** A composition drawn for the tile. */
  render?: ComponentType;
  /** Another of the page's examples, by its file name. */
  example?: string;
  /** Whether its overlays are shown open, as a picture. */
  open?: boolean;
  /** The fill its stage takes, where the canvas would hide it, such as a whole window's. */
  stage?: StageFill;
  /**
   * The window it lays out in, in rem, where it needs a larger one than the gallery's, drawn
   * smaller: an overlay over a page, or panes side by side.
   */
  window?: { width: number; height: number };
}

const people = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
  { id: 4, name: 'Jordan Ellis' },
];

const places: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 4, current: true },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
  { label: 'Settings', icon: <Settings />, href: '/settings' },
];

function CheckboxPreview() {
  return (
    <Column gap={3} align="start">
      <Checkbox label="Pricing page" defaultChecked />
      <Checkbox label="Press kit" defaultChecked />
      <Checkbox label="Support rota" />
    </Column>
  );
}

function RailPreview() {
  return (
    <div style={{ blockSize: '15rem' }}>
      <Rail
        destinations={places.slice(0, 3)}
        header={<IconButton variant="primary" icon={<Edit />} aria-label="New message" />}
      />
    </div>
  );
}

function DrawerPreview() {
  return (
    <div style={{ blockSize: '13rem', inlineSize: '13rem' }}>
      <Drawer destinations={places} />
    </div>
  );
}

const projects = [
  { name: 'Website', status: 'Active', tone: 'accent' },
  { name: 'Onboarding', status: 'Blocked', tone: 'warning' },
  { name: 'Billing', status: 'Done', tone: 'done' },
] as const;

function TablePreview() {
  return (
    <Table.Root aria-label="Projects" density="sm">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {projects.map((project) => (
          <Table.Row key={project.name}>
            <Table.Cell nowrap>{project.name}</Table.Cell>
            <Table.Cell>
              <Badge tone={project.tone}>{project.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function ListPreview() {
  return (
    <List.Root aria-label="Projects">
      <List.Item
        label="Northwind launch"
        description="4 members"
        action={<AvatarGroup people={people} max={3} gather="end" />}
      />
      <List.Item
        label="Pricing research"
        description="2 members"
        action={<AvatarGroup people={people.slice(1, 3)} max={2} gather="end" />}
      />
    </List.Root>
  );
}

function BadgePreview() {
  return (
    <Row gap={2} wrap justify="center" style={{ maxInlineSize: '14rem' }}>
      <Badge tone="accent">In review</Badge>
      <Badge tone="success">Ready</Badge>
      <Badge tone="warning">Blocked</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="done">Completed</Badge>
      <Badge>Archived</Badge>
    </Row>
  );
}

function AvatarPreview() {
  return (
    <Column gap={4} align="center">
      <Row gap={3} align="center">
        <Avatar name="Sam Lee" />
        <Avatar name="Priya Shah" size="lg" />
        <Avatar name="Alex Morgan" size="xl" />
      </Row>
      <AvatarGroup people={people} max={4} />
    </Column>
  );
}

function MarkdownPreview() {
  return (
    <Markdown headingOffset={2}>
      {[
        '#### Launch checklist',
        '',
        'Prepare **Northwind** for the spring launch.',
        '',
        '- Confirm the pricing',
        '- Review the [launch plan](/plan)',
      ].join('\n')}
    </Markdown>
  );
}

function CodePreview() {
  return (
    <CodeBlock language="tsx" label="Save.tsx">
      {['<Button variant="primary">', '  Save changes', '</Button>'].join('\n')}
    </CodeBlock>
  );
}

function KbdPreview() {
  return (
    <Column gap={3} align="center">
      <Kbd keys={['Ctrl', 'K']} />
      <Text variant="body-sm" emphasis="muted" render={<span />}>
        Search everything
      </Text>
    </Column>
  );
}

function DisclosurePreview() {
  return (
    <Disclosure title="How visibility works" defaultOpen>
      <Text variant="body-sm">Team projects are open to every member of the workspace.</Text>
    </Disclosure>
  );
}

function SpinnerPreview() {
  return (
    <Column gap={3} align="center">
      <Spinner size="lg" label="Loading projects" />
      <Text variant="body-sm" emphasis="muted" render={<span />}>
        Loading projects
      </Text>
    </Column>
  );
}

function AnimatedNumberPreview() {
  return (
    <Column gap={1} align="center">
      <Text variant="display" render={<span />}>
        <AnimatedNumber value={1280} />
      </Text>
      <Text variant="body-sm" emphasis="muted" render={<span />}>
        Tasks done this year
      </Text>
    </Column>
  );
}

/** A toast shown as the tile renders, as an application shows one after archiving. */
function ArchivedNotice() {
  const toast = useToast();
  useEffect(() => {
    const id = toast.show({
      tone: 'success',
      message: 'Project archived.',
      action: { label: 'Undo', onClick: () => {} },
    });
    return () => toast.dismiss(id);
  }, [toast]);
  return null;
}

function ToastPreview() {
  return (
    <Toast.Provider>
      <ArchivedNotice />
    </Toast.Provider>
  );
}

function PagePreview() {
  return (
    <Page
      style={{ inlineSize: '100%' }}
      header={
        <PageHeader
          headingLevel={4}
          title="Projects"
          actions={<Button startIcon={<Add />}>New</Button>}
        />
      }
    >
      <Column gap={2}>
        <Card title="Northwind launch" />
        <Card title="Annual report" />
      </Column>
    </Page>
  );
}

function TopBarPreview() {
  return (
    <div style={{ inlineSize: '100%' }}>
      <TopBar
        title="Northwind"
        actions={
          <Row gap={2} align="center">
            <IconButton icon={<Search />} aria-label="Search" />
            <Avatar name="Alex Morgan" size="sm" />
          </Row>
        }
      />
    </div>
  );
}

function GridPreview() {
  return (
    <Grid columns={2} gap={2}>
      {['Launch', 'Report', 'Guide', 'Archive'].map((name) => (
        <Card key={name} title={name} />
      ))}
    </Grid>
  );
}

function FormPreview() {
  return (
    <Column gap={4} style={{ inlineSize: '100%' }}>
      <TextField label="Project name" defaultValue="Northwind launch" />
      <TextField
        label="Owner's email"
        defaultValue="sam.lee@"
        error="Enter a whole email address"
      />
      <Row gap={2} justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button>Create project</Button>
      </Row>
    </Column>
  );
}

function DestructivePreview() {
  return (
    <>
      <List.Root aria-label="Projects">
        <List.Item label="Northwind launch" description="Edited by Alex Morgan" />
        <List.Item label="Annual report" description="Edited by Priya Shah" />
        <List.Item label="Pricing research" description="Edited by Sam Lee" />
      </List.Root>
      <ConfirmDialog
        defaultOpen
        tone="danger"
        title="Delete Northwind launch?"
        description="This deletes the project and its files. It can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => {}}
      />
    </>
  );
}

function FeedbackPreview() {
  return (
    <Column gap={3} style={{ inlineSize: '100%' }}>
      <Alert tone="success" title="Invitation sent">
        Jordan Kim can join the workspace.
      </Alert>
      <Alert tone="warning" title="Two seats left">
        Free a seat or change the plan.
      </Alert>
    </Column>
  );
}

function AccountPreview() {
  return (
    <div style={{ inlineSize: '100%', blockSize: '100%' }}>
      <TopBar
        title="Northwind"
        actions={
          <Menu.Root
            aria-label="Account"
            align="end"
            defaultOpen
            trigger={<AvatarButton name="Alex Morgan" description="alex.morgan@example.com" />}
          >
            <Menu.Header>
              <Column align="center" gap={1} padding={2}>
                <Avatar name="Alex Morgan" size="lg" />
                <Text>Alex Morgan</Text>
              </Column>
            </Menu.Header>
            <Menu.Item icon={<ManageAccounts />}>Account settings</Menu.Item>
            <Menu.Item icon={<SwapHoriz />}>Switch organization</Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
          </Menu.Root>
        }
      />
    </div>
  );
}

/** The window of an overlay over a page, larger than the gallery's, in its proportions. */
const overlay = { width: 24, height: 18 };

/** The galleries' pictures, by page id, where a page's lead example isn't the best one. */
export const galleryPreviews: Record<string, GalleryPreview> = {
  'command-palette': { example: 'CommandPaletteAnatomy', open: true, window: overlay },
  checkbox: { render: CheckboxPreview },
  'rich-text': { example: 'RichTextAnatomy' },
  rail: { render: RailPreview },
  drawer: { render: DrawerPreview },
  table: { render: TablePreview },
  list: { render: ListPreview },
  badge: { render: BadgePreview },
  avatar: { render: AvatarPreview },
  'animated-number': { render: AnimatedNumberPreview },
  markdown: { render: MarkdownPreview },
  code: { render: CodePreview },
  kbd: { render: KbdPreview },
  disclosure: { render: DisclosurePreview },
  toast: { render: ToastPreview, open: true, window: overlay },
  spinner: { render: SpinnerPreview },
  dialog: { example: 'DialogAnatomy', open: true, window: overlay },
  'confirm-dialog': { example: 'ConfirmDialogAnatomy', open: true, window: overlay },
  sheet: { example: 'SheetAnatomy', open: true, window: overlay },
  scaffold: { example: 'ScaffoldAnatomy', stage: 'shaded', window: overlay },
  page: { render: PagePreview },
  panes: { example: 'PanesAnatomy', window: { width: 38, height: 20 } },
  'top-bar': { render: TopBarPreview },
  'panel-dock': { example: 'PanelDockAnatomy', window: overlay },
  grid: { render: GridPreview },
  forms: { render: FormPreview },
  settings: { example: 'SettingsAnatomy' },
  'destructive-actions': { render: DestructivePreview, open: true, window: overlay },
  feedback: { render: FeedbackPreview },
  loading: { example: 'SkeletonAnatomy' },
  'empty-states': { example: 'EmptyStatesAnatomy' },
  'key-figures': { example: 'KeyFiguresAnatomy' },
  filtering: { example: 'FilteringAnatomy' },
  'data-tables': { example: 'DataTableAnatomy' },
  'app-frame': { example: 'AppFrameAnatomy', stage: 'shaded', window: overlay },
  navigation: { example: 'NavigationAnatomy' },
  'account-and-organizations': { render: AccountPreview, open: true },
};
