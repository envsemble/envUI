import { useState } from 'react';
import {
  Theme,
  Input,
  ColorPicker,
  Checkbox,
  Select,
  Dialog,
  Button,
  ToastProvider,
  useToast,
  Badge,
  Breadcrumbs,
  DocumentTabs,
  Notice,
  SegmentedControl,
  Slider,
  FileDropzone,
  Tree,
  TitleBar,
  Menubar,
  MenubarMenu,
  MenuItem,
  MenuSubmenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Composer,
  Message,
  MessageList,
  SplitView,
  Stat,
  StatGroup,
  Heatmap,
  Combobox,
  PanelDock,
  PanelDockHeader,
  type PanelDockPanel,
  RelativeTime,
  AvatarGroup,
  CopyButton,
  Pagination,
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
      <ToastProvider>
        <TitleBar
          start={
            <Menubar aria-label="Hydrated menubar" accessKeys>
              <MenubarMenu label="File" accessKey="F">
                <MenuItem shortcut="Ctrl+N">Hydrated new</MenuItem>
                <MenuSubmenu label="Hydrated recent">
                  <MenuItem>Hydrated report</MenuItem>
                </MenuSubmenu>
              </MenubarMenu>
            </Menubar>
          }
        >
          Hydrated title
        </TitleBar>
        <Input
          label="Hydrated input"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input label="Hydrated amount" prefix="€" suffix="per month" defaultValue="12" />
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
          density="compact"
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
        <Dialog title="Hydrated dialog" trigger={<Button>Open hydrated dialog</Button>}>
          <p>Server-rendered content</p>
        </Dialog>
        <NotificationTrigger />
        <Breadcrumbs items={[{ label: 'Workspace', href: '/' }, { label: 'Hydrated page' }]} />
        <Notice title="Hydrated notice banner">Server-rendered notice</Notice>
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
        <Table
          aria-label="Hydrated table"
          narrowLayout="stack"
          resizableColumns
          defaultColumnWidths={[60, 40]}
        >
          <TableHead>
            <TableRow>
              <TableHeaderCell
                sortDirection={sortDirection}
                onSort={() =>
                  setSortDirection((current) =>
                    current === 'ascending' ? 'descending' : 'ascending',
                  )
                }
              >
                Hydrated name
              </TableHeaderCell>
              <TableHeaderCell>Hydrated owner</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow selected>
              <TableCell>Quarterly report</TableCell>
              <TableCell label="Owner">Aurora</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
        <SplitView
          resizeLabel="Hydrated split"
          stackBelow="20rem"
          start={<p>Hydrated start pane</p>}
          end={<p>Hydrated end pane</p>}
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
                <Input label={`${panel.title} draft`} />
              </>
            )}
          </PanelDock>
        </div>
        <StatGroup aria-label="Hydrated stats">
          <Stat
            label="Hydrated stat"
            value="128"
            trend={{ direction: 'up', label: '+12%' }}
            detail="Last 30 days"
          />
        </StatGroup>
        <FileDropzone
          compact
          label="Hydrated files"
          description="Any file"
          onFiles={(chosen) => setFiles(chosen.map((file) => file.name).join(' '))}
        />
        <p>{files}</p>
        <Heatmap
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
      </ToastProvider>
    </Theme>
  );
}
