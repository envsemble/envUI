import { useRef, useState } from 'react';
import {
  Avatar,
  AvatarButton,
  AvatarGroup,
  Button,
  ContextMenu,
  IconButton,
  Kbd,
  Meter,
  Menu,
  Menubar,
  OrganizationSwitcher,
  Progress,
  Stack,
  Surface,
  Text,
  Textarea,
  Tooltip,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { OpenInNew } from '@envsemble/envui/icons/OpenInNew';
import { History } from '@envsemble/envui/icons/History';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Save } from '@envsemble/envui/icons/Save';
import { DriveFileMove } from '@envsemble/envui/icons/DriveFileMove';
import { ContentCut } from '@envsemble/envui/icons/ContentCut';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { ContentPaste } from '@envsemble/envui/icons/ContentPaste';
import { Undo } from '@envsemble/envui/icons/Undo';
import { Redo } from '@envsemble/envui/icons/Redo';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const sampleOrganizations = [
  { id: 'northwind', name: 'Northwind Labs', detail: 'Admin' },
  { id: 'contoso', name: 'Contoso', detail: 'Member' },
  { id: 'fabrikam', name: 'Fabrikam Research and Development', detail: 'Member' },
];

export function MenuPreview() {
  const [lastAction, setLastAction] = useState('');
  const [organizationId, setOrganizationId] = useState('northwind');
  return (
    <Preview>
      <Example
        title="Organization switcher"
        size="collection"
        caption="Sits in the shell's context area. Choosing an organization calls onSelect; the application switches and reports progress."
      >
        <SpecimenGrid>
          <Specimen title="Active organization">
            <div className="docs-organization-slot">
              <OrganizationSwitcher
                organizations={sampleOrganizations}
                currentOrganizationId={organizationId}
                onSelect={(id) => {
                  setOrganizationId(id);
                  setLastAction(
                    `Switched to ${sampleOrganizations.find((item) => item.id === id)?.name}`,
                  );
                }}
                onCreate={() => setLastAction('Create organization opened')}
              />
            </div>
          </Specimen>
          <Specimen title="No organization yet">
            <div className="docs-organization-slot">
              <OrganizationSwitcher
                organizations={[]}
                currentOrganizationId={null}
                onSelect={() => undefined}
                onCreate={() => setLastAction('Create organization opened')}
              />
            </div>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example
        title="Account menu"
        size="collection"
        caption="Opens from the avatar at the end of the topbar: who is signed in, account destinations and signing out. Compact density suits dense desktop applications."
      >
        <SpecimenGrid>
          <Specimen title="Standard">
            <AccountMenu label="Account" onAction={setLastAction} />
          </Specimen>
          <Specimen title="Compact">
            <AccountMenu label="Compact account" density="compact" onAction={setLastAction} />
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastAction}
        </Text>
      </Example>
      <MenuPartsExample />
      <CompactMenusExample />
    </Preview>
  );
}

function AccountMenu({
  label,
  density,
  onAction,
}: {
  label: string;
  density?: 'compact';
  onAction: (action: string) => void;
}) {
  return (
    <Menu.Root
      aria-label={label}
      density={density}
      trigger={
        <AvatarButton
          name="Alex Morgan"
          detail="alex@example.com"
          aria-label={`Open ${label.toLowerCase()} menu`}
        />
      }
      align="start"
    >
      <Menu.Header>
        <Stack gap={1} align="center">
          <Avatar name="Alex Morgan" size={density ? 'standard' : 'large'} />
          <Text>Alex Morgan</Text>
          <Text variant="supporting">alex@example.com</Text>
        </Stack>
      </Menu.Header>
      <Menu.Item href="#/account" icon={<ManageAccounts />}>
        Account settings
      </Menu.Item>
      <Menu.Item icon={<Settings />} onClick={() => onAction('Preferences opened')}>
        Preferences
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Logout />} onClick={() => onAction('Signed out')}>
        Sign out
      </Menu.Item>
    </Menu.Root>
  );
}

const sampleItems = ['Quarterly report', 'Meeting notes', 'Budget'];

/** Other menus are the application's: the parts, from a button or at the pointer. */
function MenuPartsExample() {
  const [lastAction, setLastAction] = useState('');
  const [sort, setSort] = useState('name');
  const [hidden, setHidden] = useState(false);
  return (
    <Example
      title="Building blocks"
      size="collection"
      caption={
        <>
          Every other menu is the application&rsquo;s own, built from these parts in either density.
          Radio items check one choice; checkbox items toggle and keep the menu open. Shortcuts show
          as keys the application already handles. Right-click an item, or focus it and press{' '}
          <Kbd keys={['Shift', 'F10']} />, to open a menu at the pointer.
        </>
      }
    >
      <SpecimenGrid>
        <Specimen title="Groups and choices, from a button">
          <Menu.Root
            aria-label="Sample options"
            trigger={<Button variant="secondary">Options</Button>}
            align="start"
          >
            <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
              <Menu.RadioItem value="name">Name</Menu.RadioItem>
              <Menu.RadioItem value="date" description="Most recently changed first">
                Date changed
              </Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.Group label="Display">
              <Menu.CheckboxItem checked={hidden} onCheckedChange={setHidden}>
                Show hidden items
              </Menu.CheckboxItem>
              <Menu.Item
                icon={<Refresh />}
                shortcut="F5"
                onClick={() => setLastAction('Refreshed')}
              >
                Refresh
              </Menu.Item>
            </Menu.Group>
          </Menu.Root>
        </Specimen>
        <Specimen title="Compact, at the pointer">
          <ContextMenu
            aria-label="Sample item actions"
            density="compact"
            content={(target) => {
              const name = target?.closest<HTMLElement>('[data-item]')?.dataset.item;
              return name ? (
                <>
                  <Menu.Item icon={<OpenInNew />} onClick={() => setLastAction(`Opened ${name}`)}>
                    Open
                  </Menu.Item>
                  <Menu.Item
                    icon={<Edit />}
                    shortcut="F2"
                    onClick={() => setLastAction(`Rename ${name}`)}
                  >
                    Rename
                  </Menu.Item>
                  <Menu.Submenu label="Move to" icon={<DriveFileMove />}>
                    {['Archive', 'Drafts', 'Shared'].map((folder) => (
                      <Menu.Item
                        key={folder}
                        onClick={() => setLastAction(`Moved ${name} to ${folder}`)}
                      >
                        {folder}
                      </Menu.Item>
                    ))}
                  </Menu.Submenu>
                  <Menu.Separator />
                  <Menu.Item icon={<Delete />} onClick={() => setLastAction(`Deleted ${name}`)}>
                    Delete
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item icon={<Add />} onClick={() => setLastAction('New item started')}>
                  New item
                </Menu.Item>
              );
            }}
          >
            <Surface tone="row" padding={4} className="docs-context-area">
              {sampleItems.map((name) => (
                <Button key={name} variant="text" data-item={name}>
                  {name}
                </Button>
              ))}
            </Surface>
          </ContextMenu>
        </Specimen>
      </SpecimenGrid>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {lastAction}
      </Text>
    </Example>
  );
}

const recentDocuments = ['Quarterly report', 'Meeting notes', 'Budget'];

/** Compact menus for dense desktop surfaces, with shortcuts, choices and submenus. */
function CompactMenusExample() {
  const [lastAction, setLastAction] = useState('');
  const [wordWrap, setWordWrap] = useState(true);
  const [theme, setTheme] = useState('system');
  const [recentLoads, setRecentLoads] = useState(0);
  return (
    <Example
      title="Compact menus and submenus"
      size="collection"
      caption={
        <>
          The desktop dropdown for dense surfaces: labels line up, shortcuts show as small keys, and
          a submenu opens beside its row on hover or with <Kbd>→</Kbd>. Here Open recent counts how
          often it loads its items as it opens: {recentLoads}.
        </>
      }
    >
      <SpecimenGrid>
        <Specimen title="From a button">
          <Menu.Root
            aria-label="Document"
            density="compact"
            align="start"
            trigger={<Button variant="secondary">Document</Button>}
          >
            <Menu.Item
              icon={<NoteAdd />}
              shortcut="Ctrl+N"
              onClick={() => setLastAction('New document')}
            >
              New document
            </Menu.Item>
            <Menu.Submenu
              label="Open recent"
              icon={<History />}
              onOpenChange={(open) => {
                if (open) setRecentLoads((count) => count + 1);
              }}
            >
              {recentDocuments.map((name) => (
                <Menu.Item key={name} onClick={() => setLastAction(`Opened ${name}`)}>
                  {name}
                </Menu.Item>
              ))}
              <Menu.Separator />
              <Menu.Item onClick={() => setLastAction('Cleared recent documents')}>
                Clear recent
              </Menu.Item>
            </Menu.Submenu>
            <Menu.Item icon={<Save />} shortcut="Ctrl+S" onClick={() => setLastAction('Saved')}>
              Save
            </Menu.Item>
            <Menu.Separator />
            <Menu.Group label="View">
              <Menu.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap} shortcut="Alt+Z">
                Word wrap
              </Menu.CheckboxItem>
              <Menu.Submenu label="Theme">
                <Menu.RadioGroup value={theme} onValueChange={setTheme}>
                  <Menu.RadioItem value="light">Light</Menu.RadioItem>
                  <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
                  <Menu.RadioItem value="system">System</Menu.RadioItem>
                </Menu.RadioGroup>
              </Menu.Submenu>
            </Menu.Group>
          </Menu.Root>
        </Specimen>
      </SpecimenGrid>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {lastAction}
      </Text>
    </Example>
  );
}

const sampleNote =
  'Quarterly report\n\nRevenue grew in every region. Select some text, then use Edit to cut, copy or select all of it.';

/** The menubar of a notes window: its Edit commands act on the note that had focus. */
export function MenubarPreview() {
  const note = useRef<HTMLTextAreaElement>(null);
  const editTarget = useRef<Element | null>(null);
  const [lastCommand, setLastCommand] = useState('');
  const [wordWrap, setWordWrap] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState('system');
  // Edit commands act on the field that had focus before the menubar took it, here the note.
  const field = () =>
    editTarget.current instanceof HTMLTextAreaElement ? editTarget.current : note.current!;
  const selection = (target: HTMLTextAreaElement) =>
    target.value.slice(target.selectionStart, target.selectionEnd);
  async function copy(cut: boolean) {
    const target = field();
    const text = selection(target);
    if (!text) {
      setLastCommand(`Nothing selected to ${cut ? 'cut' : 'copy'}`);
      return;
    }
    await navigator.clipboard?.writeText(text).catch(() => undefined);
    if (cut) target.setRangeText('', target.selectionStart, target.selectionEnd, 'start');
    setLastCommand(`${cut ? 'Cut' : 'Copied'} ${text.length} characters`);
  }
  return (
    <Preview>
      <Example
        title="Application menubar"
        size="wide"
        caption={
          <>
            Open a menu, then move the pointer across the others or press <Kbd>←</Kbd> and{' '}
            <Kbd>→</Kbd>. Hold <Kbd>Alt</Kbd> to see the access keys and press{' '}
            <Kbd keys={['Alt', 'E']} /> to open Edit, or press <Kbd>Alt</Kbd> alone to move to the
            menubar and back. Edit commands act on the note and return focus to it.
          </>
        }
      >
        <Surface tone="canvas" padding={3} className="docs-window">
          <Menubar.Root aria-label="Notes menu" accessKeys>
            <Menubar.Menu label="File" accessKey="F">
              <Menu.Item
                icon={<NoteAdd />}
                shortcut="Ctrl+N"
                onClick={() => setLastCommand('New note')}
              >
                New note
              </Menu.Item>
              <Menu.Submenu label="Open recent" icon={<History />}>
                {recentDocuments.map((name) => (
                  <Menu.Item key={name} onClick={() => setLastCommand(`Opened ${name}`)}>
                    {name}
                  </Menu.Item>
                ))}
                <Menu.Separator />
                <Menu.Item onClick={() => setLastCommand('Cleared recent notes')}>
                  Clear recent
                </Menu.Item>
              </Menu.Submenu>
              <Menu.Separator />
              <Menu.Item icon={<Save />} shortcut="Ctrl+S" onClick={() => setLastCommand('Saved')}>
                Save
              </Menu.Item>
              <Menu.Item shortcut="Ctrl+Shift+S" onClick={() => setLastCommand('Save as')}>
                Save as…
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item shortcut="Ctrl+W" onClick={() => setLastCommand('Close window')}>
                Close window
              </Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu
              label="Edit"
              accessKey="E"
              onOpenChange={(open, { previousFocus }) => {
                if (open) editTarget.current = previousFocus;
              }}
            >
              <Menu.Item icon={<Undo />} shortcut="Ctrl+Z" onClick={() => setLastCommand('Undo')}>
                Undo
              </Menu.Item>
              <Menu.Item icon={<Redo />} shortcut="Ctrl+Y" onClick={() => setLastCommand('Redo')}>
                Redo
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item icon={<ContentCut />} shortcut="Ctrl+X" onClick={() => copy(true)}>
                Cut
              </Menu.Item>
              <Menu.Item icon={<ContentCopy />} shortcut="Ctrl+C" onClick={() => copy(false)}>
                Copy
              </Menu.Item>
              <Menu.Item
                icon={<ContentPaste />}
                shortcut="Ctrl+V"
                disabled
                description="Use the keyboard to paste here"
              >
                Paste
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                shortcut="Ctrl+A"
                onClick={() => {
                  field().select();
                  setLastCommand('Selected all');
                }}
              >
                Select all
              </Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu label="View" accessKey="V">
              <Menu.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap} shortcut="Alt+Z">
                Word wrap
              </Menu.CheckboxItem>
              <Menu.Separator />
              <Menu.Item
                icon={<ZoomIn />}
                shortcut="Ctrl++"
                onClick={() => setZoom((value) => Math.min(value + 10, 200))}
              >
                Zoom in
              </Menu.Item>
              <Menu.Item
                icon={<ZoomOut />}
                shortcut="Ctrl+-"
                onClick={() => setZoom((value) => Math.max(value - 10, 50))}
              >
                Zoom out
              </Menu.Item>
              <Menu.Separator />
              <Menu.Submenu label="Theme">
                <Menu.RadioGroup value={theme} onValueChange={setTheme}>
                  <Menu.RadioItem value="light">Light</Menu.RadioItem>
                  <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
                  <Menu.RadioItem value="system">System</Menu.RadioItem>
                </Menu.RadioGroup>
              </Menu.Submenu>
            </Menubar.Menu>
            <Menubar.Menu label="Help" accessKey="H">
              <Menu.Item
                shortcut="Ctrl+K Ctrl+S"
                onClick={() => setLastCommand('Keyboard shortcuts')}
              >
                Keyboard shortcuts
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={() => setLastCommand('About Notes')}>About Notes</Menu.Item>
            </Menubar.Menu>
          </Menubar.Root>
          <Textarea
            ref={note}
            label="Note"
            defaultValue={sampleNote}
            rows={5}
            className="docs-window-note"
            wrap={wordWrap ? 'soft' : 'off'}
            style={{ fontSize: `${(zoom / 100) * 0.9375}rem` }}
          />
        </Surface>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastCommand}
        </Text>
      </Example>
    </Preview>
  );
}

export function TooltipPreview() {
  return (
    <Preview>
      <Example title="Tooltips" size="collection" caption="Hover or focus each control.">
        <SpecimenGrid>
          <Specimen title="Icon-only action">
            <Tooltip content="Refresh seats and members">
              <IconButton icon={<Refresh />} aria-label="Refresh seats and members" />
            </Tooltip>
          </Specimen>
          <Specimen title="Why a control is disabled">
            <Tooltip content="All seats are assigned">
              <Button disabled>Assign seat</Button>
            </Tooltip>
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

const groupPeople = [
  { id: 'alex', name: 'Alex Morgan' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'priya', name: 'Priya Shah' },
  { id: 'jordan', name: 'Jordan Rivera' },
  { id: 'taylor', name: 'Taylor Kim' },
];

function AvatarGroupExample() {
  const [pressed, setPressed] = useState('');
  return (
    <Example
      title="Avatar groups"
      size="collection"
      caption="Hover or focus the count to see who it stands for. A ring in the color of the surface below keeps the avatars apart."
    >
      <SpecimenGrid>
        <Specimen title="The rest counted">
          <AvatarGroup people={groupPeople} max={3} />
        </Specimen>
        <Specimen title="A preview of many" caption="Three names of twelve, in the small size.">
          <AvatarGroup people={groupPeople.slice(0, 3)} total={12} max={3} size="small" />
        </Specimen>
        <Specimen title="Pressable" caption="Each avatar is a button with the name in a tooltip.">
          <AvatarGroup
            people={groupPeople}
            max={4}
            onPersonClick={(person) => setPressed(`Opened ${person.name}`)}
          />
        </Specimen>
        <Specimen title="In a compact toolbar">
          <Surface tone="row" padding={2} corners="standard" density="compact">
            <div className="docs-compact-toolbar">
              <Text className="docs-compact-toolbar-title">Quarterly report</Text>
              <AvatarGroup people={groupPeople} max={2} />
              <IconButton icon={<Settings />} aria-label="Report settings" />
            </div>
          </Surface>
        </Specimen>
      </SpecimenGrid>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {pressed}
      </Text>
    </Example>
  );
}

export function AvatarPreview() {
  return (
    <Preview>
      <Example title="Sizes and fallbacks" size="collection">
        <SpecimenGrid>
          <Specimen title="Default picture">
            <Stack gap={3} className="docs-inline-row">
              <Avatar name="Alex Morgan" size="small" />
              <Avatar name="Alex Morgan" />
              <Avatar name="Alex Morgan" size="large" />
              <Avatar name="Alex Morgan" size="display" label />
            </Stack>
          </Specimen>
          <Specimen title="Failed picture" caption="A missing or broken picture shows the default.">
            <Avatar name="Sam" src="data:image/png;base64,invalid" size="large" label />
          </Specimen>
          <Specimen title="Initials" caption="For organizations and other non-person entities.">
            <Stack gap={3} className="docs-inline-row">
              <Avatar name="Northwind Labs" fallback="initials" />
              <Avatar name="Northwind Labs" fallback="initials" size="large" label />
            </Stack>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <AvatarGroupExample />
    </Preview>
  );
}

export function MeterPreview() {
  return (
    <Preview>
      <Example title="Meter" size="collection">
        <SpecimenGrid>
          <Specimen title="A quantity in a range">
            <Meter label="Seats assigned" value={2} max={5} valueText="2 of 5" />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}

export function ProgressPreview() {
  return (
    <Preview>
      <Example title="Progress" size="collection">
        <SpecimenGrid>
          <Specimen title="Known amount">
            <Progress label="Uploading" value={40} valueText="40%" />
          </Specimen>
          <Specimen title="Indeterminate">
            <Progress label="Preparing export" value={null} />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </Preview>
  );
}
