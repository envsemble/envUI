import { useState } from 'react';
import {
  Avatar,
  Button,
  IconButton,
  Meter,
  Menu,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  OrganizationMenu,
  Progress,
  Stack,
  Text,
  Tooltip,
} from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

const sampleOrganizations = [
  { id: 'northwind', name: 'Northwind Labs' },
  { id: 'contoso', name: 'Contoso' },
  { id: 'fabrikam', name: 'Fabrikam Research and Development' },
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
                <button
                  type="button"
                  className="docs-avatar-trigger"
                  aria-label="Open account menu"
                >
                  <Avatar name="Alex Morgan" />
                </button>
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
    </Preview>
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
