import { useState } from 'react';
import {
  Button,
  ContextMenu,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  Theme,
  type ThemeValue,
} from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Add } from '@envsemble/envui/icons/Add';
import { History } from '@envsemble/envui/icons/History';

const documents = ['Alpha', 'Beta', 'Gamma'];

export function MenusFixture({ theme }: { theme: ThemeValue }) {
  const [log, setLog] = useState('');
  const [sort, setSort] = useState('name');
  const [hidden, setHidden] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [appearance, setAppearance] = useState('system');
  const [recentLoads, setRecentLoads] = useState(0);
  const [programmatic, setProgrammatic] = useState<{ x: number; y: number } | null>(null);
  return (
    <Theme theme={theme} data-testid={`menus-${theme}`} className="fixture-section">
      <ContextMenu
        aria-label="Document actions"
        content={(target) => {
          const name = target?.closest<HTMLElement>('[data-document]')?.dataset.document;
          return name ? (
            <>
              <MenuItem icon={<Edit />} shortcut="F2" onClick={() => setLog(`Rename ${name}`)}>
                Rename {name}
              </MenuItem>
              <MenuItem
                description="Opens beside the current document"
                onClick={() => setLog(`Open ${name} to the side`)}
              >
                Open to the side
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Delete />} onClick={() => setLog(`Delete ${name}`)}>
                Delete
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={() => setLog('New document')}>New document</MenuItem>
          );
        }}
      >
        <div className="fixture-context-area" data-testid={`context-area-${theme}`}>
          {documents.map((name) => (
            <button key={name} type="button" data-document={name}>
              <span>{name}</span>
            </button>
          ))}
          <p>Empty space</p>
        </div>
      </ContextMenu>
      <Menu aria-label="View options" trigger={<Button variant="secondary">View options</Button>}>
        <MenuRadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date" description="Most recently changed first">
            Date
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuGroup label="Display">
          <MenuCheckboxItem checked={hidden} onCheckedChange={setHidden}>
            Show hidden files
          </MenuCheckboxItem>
          <MenuItem shortcut="Ctrl+Shift+P" onClick={() => setLog('Command palette')}>
            Command palette
          </MenuItem>
          <MenuItem shortcut="Ctrl + +" onClick={() => setLog('Zoom in')}>
            Zoom in
          </MenuItem>
          <MenuItem shortcut="Ctrl+K Ctrl+S" onClick={() => setLog('Keyboard shortcuts')}>
            Keyboard shortcuts
          </MenuItem>
          <MenuItem shortcut="Ctrl+Shift++ Ctrl+K" onClick={() => setLog('Zoom sequence')}>
            Zoom sequence
          </MenuItem>
        </MenuGroup>
        <MenuSubmenu label="More views">
          <MenuItem onClick={() => setLog('Split right')}>Split right</MenuItem>
        </MenuSubmenu>
      </Menu>
      <Menu
        aria-label="Compact options"
        density="compact"
        align="start"
        trigger={<Button variant="secondary">Compact options</Button>}
      >
        <MenuGroup label="Document">
          <MenuItem icon={<Add />} shortcut="Ctrl+Shift+N" onClick={() => setLog('New window')}>
            New window
          </MenuItem>
          <MenuItem shortcut="Ctrl+S" onClick={() => setLog('Save')}>
            Save
          </MenuItem>
        </MenuGroup>
        <MenuSubmenu
          label="Open recent"
          icon={<History />}
          onOpenChange={(open) => {
            if (open) setRecentLoads((count) => count + 1);
          }}
        >
          <MenuItem onClick={() => setLog('Open Quarterly report')}>Quarterly report</MenuItem>
          <MenuItem onClick={() => setLog('Open Meeting notes')}>Meeting notes</MenuItem>
          <MenuSubmenu label="More documents">
            <MenuItem onClick={() => setLog('Open Budget')}>Budget</MenuItem>
            <MenuItem onClick={() => setLog('Open Roadmap')}>Roadmap</MenuItem>
          </MenuSubmenu>
          <MenuSeparator />
          <MenuItem onClick={() => setLog('Clear recent')}>Clear recent</MenuItem>
        </MenuSubmenu>
        <MenuSubmenu label="Unavailable documents" disabled>
          <MenuItem onClick={() => setLog('Unavailable')}>Nothing here</MenuItem>
        </MenuSubmenu>
        <MenuSeparator />
        <MenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
          Word wrap
        </MenuCheckboxItem>
        <MenuSubmenu label="Appearance">
          <MenuRadioGroup value={appearance} onValueChange={setAppearance}>
            <MenuRadioItem value="light">Light</MenuRadioItem>
            <MenuRadioItem value="dark">Dark</MenuRadioItem>
            <MenuRadioItem value="system">System</MenuRadioItem>
          </MenuRadioGroup>
        </MenuSubmenu>
        <MenuItem
          description="Opens beside the current document"
          onClick={() => setLog('Open to the side')}
        >
          Open to the side
        </MenuItem>
      </Menu>
      <ContextMenu
        aria-label="Programmatic actions"
        open={programmatic !== null}
        onOpenChange={(open) => {
          if (!open) setProgrammatic(null);
        }}
        anchorPoint={programmatic ?? undefined}
        density="compact"
        content={
          <>
            <MenuItem onClick={() => setLog('Programmatic action')}>Programmatic action</MenuItem>
            <MenuSubmenu label="Share">
              <MenuItem onClick={() => setLog('Copy link')}>Copy link</MenuItem>
            </MenuSubmenu>
          </>
        }
      >
        <div className="fixture-context-area">
          <Button
            variant="secondary"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setProgrammatic({ x: rect.left, y: rect.bottom + 4 });
            }}
          >
            Open at the button
          </Button>
        </div>
      </ContextMenu>
      <output data-testid={`menu-log-${theme}`}>{log}</output>
      <output data-testid={`menu-state-${theme}`}>
        {sort} {hidden ? 'hidden shown' : 'hidden concealed'}
      </output>
      <output data-testid={`submenu-state-${theme}`}>
        {appearance} {recentLoads}
      </output>
    </Theme>
  );
}
