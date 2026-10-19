import { useRef, useState } from 'react';
import { Menu, Menubar } from '@envsemble/envui';

/** A short description of an element for the log: its accessible name or tag. */
function describe(element: Element | null) {
  return element?.getAttribute('aria-label') ?? element?.tagName.toLowerCase() ?? 'nothing';
}

/** A notes window's menubar with access keys, mounted with ?fixture=menubar. */
export function MenubarFixture() {
  const [log, setLog] = useState<string[]>([]);
  const [wrap, setWrap] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [keys, setKeys] = useState('');
  const editTarget = useRef<Element | null>(null);
  const record = (entry: string) => setLog((current) => [...current, entry]);
  return (
    <section className="fixture-section" data-testid="menubar-fixture">
      <Menubar.Root aria-label="Application menu" accessKeys>
        <Menubar.Menu label="File" accessKey="F">
          <Menu.Item shortcut="Ctrl+N" onClick={() => record('New note')}>
            New note
          </Menu.Item>
          <Menu.Submenu label="Open recent">
            <Menu.Item onClick={() => record('Open Quarterly report')}>Quarterly report</Menu.Item>
            <Menu.Item onClick={() => record('Open Meeting notes')}>Meeting notes</Menu.Item>
          </Menu.Submenu>
          <Menu.Separator />
          <Menu.Item shortcut="Ctrl+Q" onClick={() => record('Exit')}>
            Exit
          </Menu.Item>
        </Menubar.Menu>
        <Menubar.Menu
          label="Edit"
          accessKey="E"
          onOpenChange={(open, { previousFocus }) => {
            if (open) editTarget.current = previousFocus;
            record(`Edit ${open ? 'opened' : 'closed'} after ${describe(previousFocus)}`);
          }}
        >
          <Menu.Item
            shortcut="Ctrl+A"
            onClick={() => {
              const field = editTarget.current;
              if (field instanceof HTMLTextAreaElement) field.select();
              record('Select all');
            }}
          >
            Select all
          </Menu.Item>
          <Menu.Item shortcut="Ctrl+C" onClick={() => record('Copy')}>
            Copy
          </Menu.Item>
        </Menubar.Menu>
        <Menubar.Menu label="View" accessKey="V" open={viewOpen} onOpenChange={setViewOpen}>
          <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>
            Word wrap
          </Menu.CheckboxItem>
        </Menubar.Menu>
        <Menubar.Menu label="Help" accessKey="H" disabled>
          <Menu.Item onClick={() => record('About')}>About</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <textarea
        aria-label="Note"
        defaultValue="Quarterly report draft"
        onKeyDown={(event) => {
          if (event.altKey) setKeys(`${event.code} ${event.defaultPrevented ? 'taken' : 'free'}`);
        }}
      />
      <output data-testid="menubar-log">{log.join('\n')}</output>
      <output data-testid="menubar-keys">{keys}</output>
      <output data-testid="menubar-state">
        {wrap ? 'wrap' : 'no wrap'} {viewOpen ? 'view open' : 'view closed'}
      </output>
      <div className="fixture-tall-page" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index}>Line {index + 1}</p>
        ))}
      </div>
    </section>
  );
}
