import { useRef, useState } from 'react';
import { Menu, Menubar, Column, Text, Textarea } from '@envsemble/envui';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { IconHistory } from '@envsemble/envui/icons/History';
import { IconNoteAdd } from '@envsemble/envui/icons/NoteAdd';
import { IconSave } from '@envsemble/envui/icons/Save';

const recent = ['Roadmap', 'Interview notes', 'Launch checklist'];

export default function NotesMenubar() {
  const note = useRef<HTMLTextAreaElement>(null);
  const editTarget = useRef<Element | null>(null);
  const [lastCommand, setLastCommand] = useState('');
  const [wordWrap, setWordWrap] = useState(true);

  const field = () =>
    editTarget.current instanceof HTMLTextAreaElement ? editTarget.current : note.current;

  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <Column gap={3}>
        <Menubar.Root aria-label="Notes menu" accessKeys>
          <Menubar.Menu label="File" accessKey="F">
            <Menu.Item
              start={<IconNoteAdd />}
              shortcut="Ctrl+N"
              onClick={() => setLastCommand('New note')}
            >
              New note
            </Menu.Item>
            <Menu.Submenu label="Open recent" start={<IconHistory />}>
              {recent.map((name) => (
                <Menu.Item key={name} onClick={() => setLastCommand(`Opened ${name}`)}>
                  {name}
                </Menu.Item>
              ))}
            </Menu.Submenu>
            <Menu.Separator />
            <Menu.Item
              start={<IconSave />}
              shortcut="Ctrl+S"
              onClick={() => setLastCommand('Saved')}
            >
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
              start={<IconContentCopy />}
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
          defaultValue="Ship the pricing page on Friday. Ask Sam Lee to review the copy."
        />
      </Column>
      <Text variant="caption" emphasis="muted" role="status">
        {lastCommand}
      </Text>
    </Column>
  );
}
