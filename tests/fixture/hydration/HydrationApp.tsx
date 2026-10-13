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
  Tree,
  TitleBar,
  Menubar,
  MenubarMenu,
  MenuItem,
  MenuSubmenu,
  Composer,
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
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
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
        <Checkbox label="Hydrated choice" checked={checked} onCheckedChange={setChecked} />
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
        <p data-testid="hydrated-message">{message}</p>
        <output>{name}</output>
      </ToastProvider>
    </Theme>
  );
}
