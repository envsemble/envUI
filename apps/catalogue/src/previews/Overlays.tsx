import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Button,
  ContextMenu,
  IconButton,
  Kbd,
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
        caption="Sits in the shell's context area. Choosing an organization calls onSelect; the application switches and reports progress."
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
      <Example
        title="Account menu"
        size="collection"
        caption="Opens from the avatar at the end of the topbar: who is signed in, account destinations and signing out. Compact density suits dense desktop applications."
      >
        <SpecimenGrid>
          <Specimen title="Standard">
            <AccountMenu label="Account" onAction={setLastAction} />
          </Specimen>
          <Specimen title="Compact">
            <AccountMenu label="Compact account" density="compact" onAction={setLastAction} />
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {lastAction}
        </Text>
      </Example>
      <MenuPartsExample />
    </Preview>
  );
}

function AccountMenu({
  label,
  density,
  onAction,
}: {
  label: string;
  density?: 'compact';
  onAction: (action: string) => void;
}) {
  return (
    <Menu
      aria-label={label}
      density={density}
      trigger={
        <AvatarButton
          name="Alex Morgan"
          detail="alex@example.com"
          aria-label={`Open ${label.toLowerCase()} menu`}
        />
      }
      align="start"
    >
      <MenuHeader>
        <Stack gap={1} align="center">
          <Avatar name="Alex Morgan" size={density ? 'standard' : 'large'} />
          <Text>Alex Morgan</Text>
          <Text variant="supporting">alex@example.com</Text>
        </Stack>
      </MenuHeader>
      <MenuItem href="#/account" icon={<ManageAccounts />}>
        Account settings
      </MenuItem>
      <MenuItem icon={<Settings />} onClick={() => onAction('Preferences opened')}>
        Preferences
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={<Logout />} onClick={() => onAction('Signed out')}>
        Sign out
      </MenuItem>
    </Menu>
  );
}

const sampleItems = ['Quarterly report', 'Meeting notes', 'Budget'];

/** Other menus are the application's: the parts, from a button or at the pointer. */
function MenuPartsExample() {
  const [lastAction, setLastAction] = useState('');
  const [sort, setSort] = useState('name');
  const [hidden, setHidden] = useState(false);
  return (
    <Example
      title="Building blocks"
      size="collection"
      caption={
        <>
          Every other menu is the application&rsquo;s own, built from these parts in either density.
          Radio items check one choice; checkbox items toggle and keep the menu open. Shortcuts show
          as keys the application already handles. Right-click an item, or focus it and press{' '}
          <Kbd keys={['Shift', 'F10']} />, to open a menu at the pointer.
        </>
      }
    >
      <SpecimenGrid>
        <Specimen title="Groups and choices, from a button">
          <Menu
            aria-label="Sample options"
            trigger={<Button variant="secondary">Options</Button>}
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
                Show hidden items
              </MenuCheckboxItem>
              <MenuItem icon={<Refresh />} shortcut="F5" onClick={() => setLastAction('Refreshed')}>
                Refresh
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Specimen>
        <Specimen title="Compact, at the pointer">
          <ContextMenu
            aria-label="Sample item actions"
            density="compact"
            content={(target) => {
              const name = target?.closest<HTMLElement>('[data-item]')?.dataset.item;
              return name ? (
                <>
                  <MenuItem icon={<OpenInNew />} onClick={() => setLastAction(`Opened ${name}`)}>
                    Open
                  </MenuItem>
                  <MenuItem
                    icon={<Edit />}
                    shortcut="F2"
                    onClick={() => setLastAction(`Rename ${name}`)}
                  >
                    Rename
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem icon={<Delete />} onClick={() => setLastAction(`Deleted ${name}`)}>
                    Delete
                  </MenuItem>
                </>
              ) : (
                <MenuItem icon={<Add />} onClick={() => setLastAction('New item started')}>
                  New item
                </MenuItem>
              );
            }}
          >
            <Surface tone="row" padding={4} className="docs-context-area">
              {sampleItems.map((name) => (
                <Button key={name} variant="text" data-item={name}>
                  {name}
                </Button>
              ))}
            </Surface>
          </ContextMenu>
        </Specimen>
      </SpecimenGrid>
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
