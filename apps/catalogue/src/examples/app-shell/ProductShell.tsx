import { useState } from 'react';
import {
  AppShell,
  AvatarButton,
  Menu,
  NavList,
  OrganizationSwitcher,
  Stack,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';

const organizations = [
  { id: 'northwind', name: 'Northwind', description: 'Admin' },
  { id: 'example', name: 'Example Labs', description: 'Member' },
];
const pages = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'projects', label: 'Projects', icon: <Category /> },
  { id: 'members', label: 'Members', icon: <ManageAccounts /> },
];

/**
 * Stands in for the window: the shell fills the viewport, so a transformed frame contains it here.
 * An application renders AppShell at its root, without a frame.
 */
const frame = {
  position: 'relative',
  blockSize: '26rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
  transform: 'translateZ(0)',
} as const;

export default function ProductShell() {
  const [page, setPage] = useState('home');
  const [organization, setOrganization] = useState('northwind');
  const current = pages.find(({ id }) => id === page) ?? pages[0];
  return (
    <div style={frame}>
      <AppShell
        brand={<Apps />}
        context={
          <OrganizationSwitcher
            items={organizations}
            value={organization}
            onValueChange={setOrganization}
          />
        }
        title={current.label}
        actions={
          <Menu.Root
            aria-label="Account"
            trigger={
              <AvatarButton
                name="Alex Morgan"
                detail="alex@example.com"
                aria-label="Open account menu"
              />
            }
          >
            <Menu.Item icon={<ManageAccounts />}>Account settings</Menu.Item>
            <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
          </Menu.Root>
        }
        navigationLabel="Main navigation"
        navigation={pages.map(({ id, label, icon }) => (
          <NavList.Item key={id} icon={icon} selected={id === page} onClick={() => setPage(id)}>
            {label}
          </NavList.Item>
        ))}
        resizable
      >
        <Stack gap={3} style={{ padding: '2rem' }}>
          <Text render={<h3 />} variant="headline">
            {current.label}
          </Text>
          <Text emphasis="muted">
            Collapse the sidebar with the mark, or drag its edge to resize it.
          </Text>
        </Stack>
      </AppShell>
    </div>
  );
}
