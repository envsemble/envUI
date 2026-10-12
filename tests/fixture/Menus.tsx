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
  Theme,
  type ThemeValue,
} from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Delete } from '@envsemble/envui/icons/Delete';

const documents = ['Alpha', 'Beta', 'Gamma'];

export function MenusFixture({ theme }: { theme: ThemeValue }) {
  const [log, setLog] = useState('');
  const [sort, setSort] = useState('name');
  const [hidden, setHidden] = useState(false);
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
        </MenuGroup>
      </Menu>
      <ContextMenu
        aria-label="Programmatic actions"
        open={programmatic !== null}
        onOpenChange={(open) => {
          if (!open) setProgrammatic(null);
        }}
        anchorPoint={programmatic ?? undefined}
        content={
          <MenuItem onClick={() => setLog('Programmatic action')}>Programmatic action</MenuItem>
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
    </Theme>
  );
}
