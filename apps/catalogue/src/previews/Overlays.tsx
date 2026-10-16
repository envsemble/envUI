import { useRef, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  IconButton,
  Kbd,
  Menu,
  Menubar,
  Stack,
  Surface,
  Text,
  Textarea,
} from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';
import { History } from '@envsemble/envui/icons/History';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Save } from '@envsemble/envui/icons/Save';
import { ContentCut } from '@envsemble/envui/icons/ContentCut';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { ContentPaste } from '@envsemble/envui/icons/ContentPaste';
import { Undo } from '@envsemble/envui/icons/Undo';
import { Redo } from '@envsemble/envui/icons/Redo';
import { ZoomIn } from '@envsemble/envui/icons/ZoomIn';
import { ZoomOut } from '@envsemble/envui/icons/ZoomOut';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const recentDocuments = ['Quarterly report', 'Meeting notes', 'Budget'];

/** Compact menus for dense desktop surfaces, with shortcuts, choices and submenus. */
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
