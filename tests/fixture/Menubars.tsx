import { useRef, useState } from 'react';
import {
  MenuCheckboxItem,
  MenuItem,
  MenuSeparator,
  MenuSubmenu,
  Menubar,
  MenubarMenu,
} from '@envsemble/envui';

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
      <Menubar aria-label="Application menu" accessKeys>
        <MenubarMenu label="File" accessKey="F">
          <MenuItem shortcut="Ctrl+N" onClick={() => record('New note')}>
            New note
          </MenuItem>
          <MenuSubmenu label="Open recent">
            <MenuItem onClick={() => record('Open Quarterly report')}>Quarterly report</MenuItem>
            <MenuItem onClick={() => record('Open Meeting notes')}>Meeting notes</MenuItem>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem shortcut="Ctrl+Q" onClick={() => record('Exit')}>
            Exit
          </MenuItem>
        </MenubarMenu>
        <MenubarMenu
          label="Edit"
          accessKey="E"
          onOpenChange={(open, { previousFocus }) => {
            if (open) editTarget.current = previousFocus;
            record(`Edit ${open ? 'opened' : 'closed'} after ${describe(previousFocus)}`);
          }}
        >
          <MenuItem
            shortcut="Ctrl+A"
            onClick={() => {
              const field = editTarget.current;
              if (field instanceof HTMLTextAreaElement) field.select();
              record('Select all');
            }}
          >
            Select all
          </MenuItem>
          <MenuItem shortcut="Ctrl+C" onClick={() => record('Copy')}>
            Copy
          </MenuItem>
        </MenubarMenu>
        <MenubarMenu label="View" accessKey="V" open={viewOpen} onOpenChange={setViewOpen}>
          <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
            Word wrap
          </MenuCheckboxItem>
        </MenubarMenu>
        <MenubarMenu label="Help" accessKey="H" disabled>
          <MenuItem onClick={() => record('About')}>About</MenuItem>
        </MenubarMenu>
      </Menubar>
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
