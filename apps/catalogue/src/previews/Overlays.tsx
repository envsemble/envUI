import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Button,
  ContextMenu,
  IconButton,
  Meter,
  Menu,
  MenuHeader,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  OrganizationMenu,
  Progress,
  Stack,
  Surface,
  Text,
  Tooltip,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { OpenInNew } from '@envsemble/envui/icons/OpenInNew';
import { Search } from '@envsemble/envui/icons/Search';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const sampleOrganizations = [
  { id: 'northwind', name: 'Northwind Labs', detail: 'Admin' },
  { id: 'contoso', name: 'Contoso', detail: 'Member' },
  { id: 'fabrikam', name: 'Fabrikam Research and Development', detail: 'Member' },
];

export function MenuPreview() {
  const [lastAction, setLastAction] = useState('');
  const [organizationId, setOrganizationId] = useState('northwind');
  return (
    <Preview>
      <Example
        title="Organization menu"
        size="collection"
        caption="Shared by every product in the shell's context area. Choosing an organization calls onSelect; the application switches and reports progress."
      >
        <SpecimenGrid>
          <Specimen title="Active organization">
            <div className="docs-organization-slot">
              <OrganizationMenu
                organizations={sampleOrganizations}
                currentOrganizationId={organizationId}
                onSelect={(id) => {
                  setOrganizationId(id);
                  setLastAction(
                    `Switched to ${sampleOrganizations.find((item) => item.id === id)?.name}`,
                  );
                }}
                onCreate={() => setLastAction('Create organization opened')}
              />
            </div>
          </Specimen>
          <Specimen title="No organization yet">
            <div className="docs-organization-slot">
              <OrganizationMenu
                organizations={[]}
                currentOrganizationId={null}
                onSelect={() => undefined}
                onCreate={() => setLastAction('Create organization opened')}
              />
            </div>
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Account menu" size="collection">
        <SpecimenGrid>
          <Specimen title="Header, destinations and actions">
            <Menu
              aria-label="Account"
              trigger={
                <AvatarButton
                  name="Alex Morgan"
                  detail="alex@example.com"
                  aria-label="Open account menu"
                />
              }
              align="start"
            >
              <MenuHeader>
                <Stack gap={1} align="center">
                  <Avatar name="Alex Morgan" size="large" />
                  <Text>Alex Morgan</Text>
                  <Text variant="supporting">alex@example.com</Text>
                </Stack>
              </MenuHeader>
              <MenuItem href="#/account" icon={<ManageAccounts />}>
                Account settings
              </MenuItem>
              <MenuItem icon={<Settings />} onClick={() => setLastAction('Preferences opened')}>
                Preferences
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Logout />} onClick={() => setLastAction('Signed out')}>
                Sign out
              </MenuItem>
            </Menu>
          </Specimen>
          <Specimen title="Button trigger">
            <Menu
              aria-label="Project actions"
              trigger={<Button variant="secondary">Actions</Button>}
              align="start"
            >
              <MenuItem onClick={() => setLastAction('Renamed')}>Rename</MenuItem>
              <MenuItem onClick={() => setLastAction('Duplicated')}>Duplicate</MenuItem>
              <MenuItem disabled>Archive</MenuItem>
            </Menu>
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastAction}
        </Text>
      </Example>
      <MenuChoicesExample onAction={setLastAction} />
      <CompactMenuExample onAction={setLastAction} />
      <ContextMenuExample />
    </Preview>
  );
}

function MenuChoicesExample({ onAction }: { onAction: (action: string) => void }) {
  const [sort, setSort] = useState('name');
  const [hidden, setHidden] = useState(false);
  return (
    <Example
      title="Groups, choices and shortcuts"
      size="collection"
      caption="Radio items check one choice, checkbox items toggle and keep the menu open. Shortcut hints only describe keys the application already handles."
    >
      <Menu
        aria-label="View options"
        trigger={<Button variant="secondary">View options</Button>}
        align="start"
      >
        <MenuRadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="date" description="Most recently changed first">
            Date changed
          </MenuRadioItem>
        </MenuRadioGroup>
        <MenuGroup label="Display">
          <MenuCheckboxItem checked={hidden} onCheckedChange={setHidden}>
            Show archived plans
          </MenuCheckboxItem>
          <MenuItem
            icon={<Search />}
            shortcut="Ctrl+P"
            onClick={() => onAction('Quick open started')}
          >
            Quick open
          </MenuItem>
        </MenuGroup>
      </Menu>
    </Example>
  );
}

function CompactMenuExample({ onAction }: { onAction: (action: string) => void }) {
  return (
    <Example
      title="Compact menus"
      size="collection"
      caption="Dense desktop surfaces, such as a file tree, use 2 rem rows on one pane with hairline separators. A compact Tree opens a compact context menu."
    >
      <Menu
        aria-label="File actions"
        density="compact"
        align="start"
        trigger={<Button variant="secondary">File actions</Button>}
      >
        <MenuItem icon={<OpenInNew />} onClick={() => onAction('Opened')}>
          Open
        </MenuItem>
        <MenuItem icon={<Edit />} shortcut="F2" onClick={() => onAction('Rename started')}>
          Rename
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Delete />} onClick={() => onAction('Deleted')}>
          Delete
        </MenuItem>
      </Menu>
    </Example>
  );
}

const contextDocuments = ['Roadmap.md', 'Decisions.md', 'Retrospective.md'];

function ContextMenuExample() {
  const [lastAction, setLastAction] = useState('');
  return (
    <Example
      title="Context menu"
      size="collection"
      caption="Right-click a document or the empty area, or focus a document and press Shift+F10 or the context-menu key. Offer the same actions through visible controls too."
    >
      <ContextMenu
        aria-label="Document actions"
        content={(target) => {
          const name = target?.closest<HTMLElement>('[data-document]')?.dataset.document;
          return name ? (
            <>
              <MenuItem
                icon={<Edit />}
                shortcut="F2"
                onClick={() => setLastAction(`Rename ${name}`)}
              >
                Rename
              </MenuItem>
              <MenuItem
                icon={<OpenInNew />}
                description="Beside the current document"
                onClick={() => setLastAction(`${name} opened to the side`)}
              >
                Open to the side
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<Delete />} onClick={() => setLastAction(`${name} deleted`)}>
                Delete
              </MenuItem>
            </>
          ) : (
            <MenuItem icon={<Add />} onClick={() => setLastAction('New document started')}>
              New document
            </MenuItem>
          );
        }}
      >
        <Surface tone="row" padding={4} className="docs-context-area">
          {contextDocuments.map((name) => (
            <Button key={name} variant="text" data-document={name}>
              {name}
            </Button>
          ))}
        </Surface>
      </ContextMenu>
      <Text variant="caption" className="docs-caption" aria-live="polite">
        {lastAction}
      </Text>
    </Example>
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
    </Preview>
  );
}

export function MetersPreview() {
  return (
    <Preview>
      <Example title="Meters & progress" size="collection">
        <SpecimenGrid>
          <Specimen title="Meter">
            <Meter label="Seats assigned" value={2} max={5} valueText="2 of 5" />
          </Specimen>
          <Specimen title="Progress">
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
