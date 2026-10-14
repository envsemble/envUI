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
        <output>{name}</output>
      </ToastProvider>
    </Theme>
  );
}
