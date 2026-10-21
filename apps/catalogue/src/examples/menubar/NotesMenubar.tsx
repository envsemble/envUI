import { useRef, useState } from 'react';
import { Menu, Menubar, Column, Surface, Text, Textarea } from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { History } from '@envsemble/envui/icons/History';
import { NoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { Save } from '@envsemble/envui/icons/Save';

const recent = ['Roadmap', 'Interview notes', 'Launch checklist'];

export default function NotesMenubar() {
  const note = useRef<HTMLTextAreaElement>(null);
  // The field that had focus before the menubar took it, which Edit commands act on.
  const editTarget = useRef<Element | null>(null);
  const [lastCommand, setLastCommand] = useState('');
  const [wordWrap, setWordWrap] = useState(true);

  const field = () =>
    editTarget.current instanceof HTMLTextAreaElement ? editTarget.current : note.current;

  return (
    <Column gap={3}>
      {/* Stands in for the application's window. */}
      <Surface background="default" padding={3}>
        <Column gap={3}>
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
                {recent.map((name) => (
                  <Menu.Item key={name} onClick={() => setLastCommand(`Opened ${name}`)}>
                    {name}
                  </Menu.Item>
                ))}
              </Menu.Submenu>
              <Menu.Separator />
              <Menu.Item icon={<Save />} shortcut="Ctrl+S" onClick={() => setLastCommand('Saved')}>
                Save
              </Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu
              label="Edit"
              accessKey="E"
              onOpenChange={(open, { previousFocus }) => {
                if (open) editTarget.current = previousFocus;
              }}
            >
              <Menu.Item
                icon={<ContentCopy />}
                shortcut="Ctrl+C"
                onClick={() => {
                  const target = field();
                  if (!target) return;
                  const text = target.value.slice(target.selectionStart, target.selectionEnd);
                  void navigator.clipboard?.writeText(text).catch(() => undefined);
                  setLastCommand(text ? `Copied ${text.length} characters` : 'Nothing selected');
                }}
              >
                Copy
              </Menu.Item>
              <Menu.Item
                shortcut="Ctrl+A"
                onClick={() => {
                  field()?.select();
                  setLastCommand('Selected all');
                }}
              >
                Select all
              </Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu label="View" accessKey="V">
              <Menu.CheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
                Word wrap
              </Menu.CheckboxItem>
            </Menubar.Menu>
            <Menubar.Menu label="Help" accessKey="H">
              <Menu.Item onClick={() => setLastCommand('Keyboard shortcuts')}>
                Keyboard shortcuts
              </Menu.Item>
            </Menubar.Menu>
          </Menubar.Root>
          <Textarea
            ref={note}
            label="Note"
            rows={4}
            wrap={wordWrap ? 'soft' : 'off'}
            defaultValue="Ship the pricing page on Friday. Ask Sam Lee to review the copy and Priya Shah to check the numbers."
          />
        </Column>
      </Surface>
      <Text variant="caption" emphasis="muted" role="status">
        {lastCommand}
      </Text>
    </Column>
  );
}
