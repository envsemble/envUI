import { useRef, useState } from 'react';
import {
  Button,
  IconButton,
  Kbd,
  Meter,
  Menu,
  Menubar,
  Progress,
  Surface,
  Text,
  Textarea,
  Tooltip,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
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
