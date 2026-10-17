import { useState } from 'react';
import { Button, Dialog, SearchTrigger, Stack, TextField } from '@envsemble/envui';
// Internal: the rail context a sidebar showing icons only provides.
import { SidebarRailContext } from '../../packages/ui/src/navigation/internal/SidebarCompact.js';

/**
 * Search triggers, mounted with ?fixture=search-triggers: a labelled one that listens for Mod+K, an
 * icon-only one with its own shortcut, one that doesn't listen, a second Mod+K trigger mounted on
 * demand, a hidden one that leaves its key to a visible one, a disabled one, an editor that handles
 * Mod+K itself, a dialog whose field the triggers behind it leave alone, and one in a sidebar rail.
 * Each press is logged in order.
 */
export function SearchTriggersFixture() {
  const [log, setLog] = useState<string[]>([]);
  const [second, setSecond] = useState(false);
  const record = (name: string) => () => setLog((entries) => [...entries, name]);
  return (
    <Stack gap={4} className="fixture-section" style={{ inlineSize: '20rem' }}>
      <SearchTrigger fullWidth onClick={record('labelled')} />
      <SearchTrigger
        iconOnly
        label="Find in page"
        shortcut="mod+shift+f"
        onClick={record('icon')}
      />
      <SearchTrigger label="Search without a shortcut" shortcut={false} onClick={record('none')} />
      <SearchTrigger label="Quiet search" listen={false} onClick={record('quiet')} />
      <SearchTrigger label="Jump" shortcut="mod+j" onClick={record('jump')} />
      <div hidden>
        <SearchTrigger label="Hidden jump" shortcut="mod+j" onClick={record('hidden jump')} />
      </div>
      <Button variant="secondary" onClick={() => setSecond((shown) => !shown)}>
        Toggle second search
      </Button>
      {second && <SearchTrigger label="Second search" onClick={record('second')} />}
      <SearchTrigger label="Disabled search" shortcut="mod+shift+k" disabled />
      <TextField label="Note" />
      <Dialog title="Rename file" trigger={<Button variant="secondary">Rename file</Button>}>
        <TextField label="File name" />
      </Dialog>
      <textarea
        aria-label="Editor"
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            setLog((entries) => [...entries, 'editor']);
          }
        }}
      />
      <SidebarRailContext value>
        <div data-testid="rail">
          <SearchTrigger label="Rail search" listen={false} onClick={record('rail')} />
        </div>
      </SidebarRailContext>
      <output data-testid="search-log">{log.join(',')}</output>
    </Stack>
  );
}
