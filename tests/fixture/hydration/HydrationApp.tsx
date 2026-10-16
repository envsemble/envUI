import { useState } from 'react';
import {
  Theme,
  TextField,
  ColorPicker,
  Checkbox,
  Select,
  Dialog,
  Button,
  Toast,
  useToast,
  Badge,
  Breadcrumbs,
  DocumentTabs,
  Alert,
  SegmentedControl,
  Slider,
  DropZone,
  Tree,
  TitleBar,
  Menubar,
  Menu,
  Table,
  Composer,
  Message,
  MessageList,
  Stat,
  CalendarHeatmap,
  Combobox,
  PanelDock,
  PanelDockHeader,
  type PanelDockPanel,
  RelativeTime,
  AvatarGroup,
  CopyButton,
  Pagination,
  DatePicker,
  Calendar,
} from '@envsemble/envui';

const treeItems = Array.from({ length: 40 }, (_, index) => ({
  id: `doc-${index}`,
  depth: 0,
  label: `Hydrated document ${index}`,
}));

function NotificationTrigger() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ message: 'Hydrated notice' })}>Notify</Button>;
}

export function HydrationApp() {
  const [name, setName] = useState('Server value');
  const [checked, setChecked] = useState<boolean | 'mixed'>('mixed');
  const [view, setView] = useState('open');
  const [tab, setTab] = useState('one');
  const [selected, setSelected] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending');
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState('No files yet');
  const [dockPanels, setDockPanels] = useState<PanelDockPanel[]>([
    { id: 'notes', title: 'Hydrated notes', mode: 'open', active: true },
    { id: 'budget', title: 'Hydrated budget', mode: 'minimized', attention: 'Hydrated changes' },
  ]);
  const [person, setPerson] = useState('Nobody yet');
  const [page, setPage] = useState(1);
  return (
    <Theme theme="dark">
      <Toast.Provider>
        <TitleBar
          start={
            <Menubar.Root aria-label="Hydrated menubar" accessKeys>
              <Menubar.Menu label="File" accessKey="F">
                <Menu.Item shortcut="Ctrl+N">Hydrated new</Menu.Item>
                <Menu.Submenu label="Hydrated recent">
                  <Menu.Item>Hydrated report</Menu.Item>
                </Menu.Submenu>
              </Menubar.Menu>
            </Menubar.Root>
          }
        >
          Hydrated title
        </TitleBar>
        <TextField
          label="Hydrated input"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField label="Hydrated amount" prefix="€" suffix="per month" defaultValue="12" />
        <Checkbox label="Hydrated choice" checked={checked} onCheckedChange={setChecked} />
        <Slider
          label="Hydrated level"
          name="level"
          defaultValue={40}
          formatValue={(value) => `${value}%`}
        />
        <ColorPicker label="Hydrated color" defaultValue="#1a73e8" />
        <Select
          label="Hydrated select"
          defaultValue="one"
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
        />
        <Select
          label="Hydrated compact select"
          size="sm"
          defaultValue="one"
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
        />
        <Combobox
          multiple
          label="Hydrated people"
          name="people"
          items={[
            { value: 'one', label: 'One person', description: 'one@example.com' },
            { value: 'two', label: 'Two people', description: 'two@example.com' },
          ]}
          defaultValue={['one']}
        />
        <DatePicker
          label="Hydrated date"
          name="date"
          defaultValue="2026-03-09"
          locale="en-GB"
          weekStart={1}
        />
        <Calendar
          aria-label="Hydrated calendar"
          defaultValue="2026-03-09"
          locale="en-GB"
          weekStart={1}
        />
        {/* Without a locale, the server and the browser each have their own language, time zone
            and today, as they can in production. */}
        <DatePicker label="Hydrated local date" defaultValue="2026-03-17" />
        <Calendar aria-label="Hydrated local calendar" defaultValue="2026-03-17" />
        <Calendar aria-label="Hydrated today" />
        {/* The server renders in March 2026, at its first month; the browser in a later one. */}
        <Calendar aria-label="Hydrated bounded today" min="2026-03-01" max="2031-05-31" />
        <Dialog title="Hydrated dialog" trigger={<Button>Open hydrated dialog</Button>}>
          <p>Server-rendered content</p>
        </Dialog>
        <NotificationTrigger />
        <Breadcrumbs items={[{ label: 'Workspace', href: '/' }, { label: 'Hydrated page' }]} />
        <Alert title="Hydrated alert banner">Server-rendered alert</Alert>
        <Badge tone="done">Hydrated badge</Badge>
        <SegmentedControl
          aria-label="Hydrated view"
          value={view}
          onValueChange={setView}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'done', label: 'Done' },
          ]}
        />
        <DocumentTabs
          aria-label="Hydrated tabs"
          items={[
            { id: 'one', label: 'One.md' },
            { id: 'two', label: 'Two.md' },
          ]}
          value={tab}
          onValueChange={setTab}
          onClose={() => undefined}
          onCloseAll={() => undefined}
        />
        <div style={{ blockSize: '12rem' }}>
          <Tree
            aria-label="Hydrated tree"
            items={treeItems}
            selectedId={selected}
            onOpen={(item) => setSelected(item.id)}
            onExpandedChange={() => undefined}
          />
        </div>
        <Table.Root
          aria-label="Hydrated table"
          narrowLayout="stack"
          resizableColumns
          defaultColumnWidths={[60, 40]}
        >
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell
                sortDirection={sortDirection}
                onSort={() =>
                  setSortDirection((current) =>
                    current === 'ascending' ? 'descending' : 'ascending',
                  )
                }
              >
                Hydrated name
              </Table.HeaderCell>
              <Table.HeaderCell>Hydrated owner</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row selected>
              <Table.Cell>Quarterly report</Table.Cell>
              <Table.Cell label="Owner">Aurora</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        <MessageList aria-label="Hydrated conversation">
          <Message from="other" author="Aurora" meta="09:41">
            Hydrated answer
          </Message>
          {message && <Message from="self">{message}</Message>}
        </MessageList>
        <Composer
          aria-label="Hydrated composer"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(value) => {
            setMessage(value);
            setDraft('');
          }}
          footer="Hydrated composer footer"
        />
        <div style={{ position: 'relative', blockSize: '24rem' }}>
          <PanelDock
            panels={dockPanels}
            onModeChange={(id, mode) =>
              setDockPanels((current) =>
                current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
              )
            }
            onClose={(id) => setDockPanels((current) => current.filter((panel) => panel.id !== id))}
            minimizedLabel="Hydrated chips"
            restoreLabel={(label) => `Show ${label}`}
            closeLabel={(label) => `Discard ${label}`}
            resizeLabel={(title) => `Height of ${title}`}
          >
            {(panel) => (
              <>
                <PanelDockHeader title={panel.title} headingLevel={3} />
                <TextField label={`${panel.title} draft`} />
              </>
            )}
          </PanelDock>
        </div>
        <Stat.Group aria-label="Hydrated stats">
          <Stat.Root
            label="Hydrated stat"
            value="128"
            trend={{ direction: 'up', label: '+12%' }}
            detail="Last 30 days"
          />
        </Stat.Group>
        <DropZone
          size="sm"
          label="Hydrated files"
          description="Any file"
          onFiles={(chosen) => setFiles(chosen.map((file) => file.name).join(' '))}
        />
        <p>{files}</p>
        <CalendarHeatmap
          aria-label="Hydrated activity"
          data={[
            { date: '2026-03-02', value: 3 },
            { date: '2026-03-09', value: 1200 },
            { date: '2026-03-16', value: 7 },
          ]}
          startDate="2026-03-01"
          endDate="2026-03-31"
        />
        <RelativeTime
          data-testid="hydrated-relative-time"
          value="2026-10-16T12:00:00Z"
          now={Date.parse('2026-10-14T12:00:00Z')}
          // The server and the browser use different languages, as they can in production, so
          // the texts differ while hydrating.
          locale={typeof window === 'undefined' ? 'en' : 'de'}
        />
        <RelativeTime data-testid="hydrated-live-time" value="2020-01-01T00:00:00Z" />
        <AvatarGroup
          people={[{ name: 'Alex Morgan' }, { name: 'Sam Lee' }, { name: 'Priya Shah' }]}
          total={5}
          max={2}
          onPersonClick={(clicked) => setPerson(clicked.name)}
        />
        <p data-testid="hydrated-person">{person}</p>
        <CopyButton value="Hydrated text" aria-label="Hydrated copy" />
        <Pagination
          aria-label="Hydrated pages"
          page={page}
          pageSize={10}
          total={30}
          onPageChange={setPage}
        />
        <output>{name}</output>
      </Toast.Provider>
    </Theme>
  );
}
