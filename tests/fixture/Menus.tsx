import { useState } from 'react';
import { Button, ContextMenu, Menu, Theme, type ThemeValue } from '@envsemble/envui';
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
              <Menu.Item icon={<Edit />} shortcut="F2" onClick={() => setLog(`Rename ${name}`)}>
                Rename {name}
              </Menu.Item>
              <Menu.Item
                description="Opens beside the current document"
                onClick={() => setLog(`Open ${name} to the side`)}
              >
                Open to the side
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item icon={<Delete />} onClick={() => setLog(`Delete ${name}`)}>
                Delete
              </Menu.Item>
            </>
          ) : (
            <Menu.Item onClick={() => setLog('New document')}>New document</Menu.Item>
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
      <Menu.Root
        aria-label="View options"
        trigger={<Button variant="secondary">View options</Button>}
      >
        <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="name">Name</Menu.RadioItem>
          <Menu.RadioItem value="date" description="Most recently changed first">
            Date
          </Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Group label="Display">
          <Menu.CheckboxItem checked={hidden} onCheckedChange={setHidden}>
            Show hidden files
          </Menu.CheckboxItem>
          <Menu.Item shortcut="Ctrl+Shift+P" onClick={() => setLog('Command palette')}>
            Command palette
          </Menu.Item>
          <Menu.Item shortcut="Ctrl + +" onClick={() => setLog('Zoom in')}>
            Zoom in
          </Menu.Item>
          <Menu.Item shortcut="Alt+←" onClick={() => setLog('Back')}>
            Back
          </Menu.Item>
          <Menu.Item shortcut="Ctrl+K Ctrl+S" onClick={() => setLog('Keyboard shortcuts')}>
            Keyboard shortcuts
          </Menu.Item>
          <Menu.Item shortcut="Ctrl+Shift++ Ctrl+K" onClick={() => setLog('Zoom sequence')}>
            Zoom sequence
          </Menu.Item>
        </Menu.Group>
        <Menu.Submenu label="More views">
          <Menu.Item onClick={() => setLog('Split right')}>Split right</Menu.Item>
        </Menu.Submenu>
      </Menu.Root>
      <Menu.Root
        aria-label="Compact options"
        align="start"
        trigger={<Button variant="secondary">Compact options</Button>}
      >
        <Menu.Group label="Document">
          <Menu.Item icon={<Add />} shortcut="Ctrl+Shift+N" onClick={() => setLog('New window')}>
            New window
          </Menu.Item>
          <Menu.Item shortcut="Ctrl+S" onClick={() => setLog('Save')}>
            Save
          </Menu.Item>
        </Menu.Group>
        <Menu.Submenu
          label="Open recent"
          icon={<History />}
          onOpenChange={(open) => {
            if (open) setRecentLoads((count) => count + 1);
          }}
        >
          <Menu.Item onClick={() => setLog('Open Quarterly report')}>Quarterly report</Menu.Item>
          <Menu.Item onClick={() => setLog('Open Meeting notes')}>Meeting notes</Menu.Item>
          <Menu.Submenu label="More documents">
            <Menu.Item onClick={() => setLog('Open Budget')}>Budget</Menu.Item>
            <Menu.Item onClick={() => setLog('Open Roadmap')}>Roadmap</Menu.Item>
          </Menu.Submenu>
          <Menu.Separator />
          <Menu.Item onClick={() => setLog('Clear recent')}>Clear recent</Menu.Item>
        </Menu.Submenu>
        <Menu.Submenu label="Unavailable documents" disabled>
          <Menu.Item onClick={() => setLog('Unavailable')}>Nothing here</Menu.Item>
        </Menu.Submenu>
        <Menu.Separator />
        <Menu.CheckboxItem checked={wrap} onCheckedChange={setWrap}>
          Word wrap
        </Menu.CheckboxItem>
        <Menu.Submenu label="Appearance">
          <Menu.RadioGroup value={appearance} onValueChange={setAppearance}>
            <Menu.RadioItem value="light">Light</Menu.RadioItem>
            <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
            <Menu.RadioItem value="system">System</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Submenu>
        <Menu.Item
          description="Opens beside the current document"
          onClick={() => setLog('Open to the side')}
        >
          Open to the side
        </Menu.Item>
      </Menu.Root>
      {/* A compact region: its context menu and submenus open at the compact scale. */}
      <Theme theme={theme} scale="compact" data-testid={`compact-region-${theme}`}>
        <ContextMenu
          aria-label="Programmatic actions"
          open={programmatic !== null}
          onOpenChange={(open) => {
            if (!open) setProgrammatic(null);
          }}
          anchorPoint={programmatic ?? undefined}
          content={
            <>
              <Menu.Item onClick={() => setLog('Programmatic action')}>
                Programmatic action
              </Menu.Item>
              <Menu.Submenu label="Share">
                <Menu.Item onClick={() => setLog('Copy link')}>Copy link</Menu.Item>
              </Menu.Submenu>
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
      </Theme>
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
