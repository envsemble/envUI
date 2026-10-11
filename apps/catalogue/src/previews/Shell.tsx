import { useState } from 'react';
import {
  AppShell,
  AppShellSkeleton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  NavigationItem,
  OrganizationMenu,
  Skeleton,
  Stack,
  Text,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Example } from './Example';
import { Preview } from './Preview';

const organizations = [
  { id: 'northwind', name: 'Northwind Labs' },
  { id: 'contoso', name: 'Contoso' },
];

const pages = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'products', label: 'Products', icon: <Category /> },
  { id: 'members', label: 'Members', icon: <ManageAccounts /> },
] as const;

/** The shell is fixed to the viewport, so the specimen frame contains it with a transform. */
export function AppShellPreview() {
  const [page, setPage] = useState<(typeof pages)[number]['id']>('home');
  const [dividers, setDividers] = useState(true);
  const [organizationId, setOrganizationId] = useState('northwind');
  const current = pages.find((candidate) => candidate.id === page) ?? pages[0];
  return (
    <Preview>
      <Example
        title="Application shell"
        size="wide"
        caption="Hover the sidebar or the area above it, collapse it with the logo, and narrow the window to see the overlay sidebar."
        actions={
          <Button variant="secondary" onClick={() => setDividers((value) => !value)}>
            {dividers ? 'Hide dividers' : 'Show dividers'}
          </Button>
        }
      >
        <div className="docs-shell-frame">
          <AppShell
            brand={<Apps />}
            context={
              <OrganizationMenu
                organizations={organizations}
                currentOrganizationId={organizationId}
                onSelect={setOrganizationId}
                onCreate={() => undefined}
              />
            }
            title={current.label}
            actions={
              <Menu
                aria-label="Account"
                trigger={
                  <button
                    type="button"
                    className="docs-avatar-trigger"
                    aria-label="Open account menu"
                  >
                    <Avatar name="Alex Morgan" size="small" />
                  </button>
                }
              >
                <MenuItem icon={<ManageAccounts />}>Account settings</MenuItem>
                <MenuItem icon={<Logout />}>Sign out</MenuItem>
              </Menu>
            }
            navigationLabel="Sample navigation"
            navigation={pages.map((candidate) => (
              <NavigationItem
                key={candidate.id}
                icon={candidate.icon}
                selected={candidate.id === page}
                onClick={() => setPage(candidate.id)}
              >
                {candidate.label}
              </NavigationItem>
            ))}
            dividers={dividers}
            storageKey="envui-catalogue-shell-collapsed"
          >
            <Stack gap={3} className="docs-shell-page">
              <Text as="h2" variant="display">
                {current.label}
              </Text>
              <Text tone="muted">Page content scrolls inside the shell.</Text>
            </Stack>
          </AppShell>
        </div>
      </Example>
      <Example title="Loading frame" size="wide">
        <div className="docs-shell-frame">
          <AppShellSkeleton brand={<Apps />} label="Loading sample">
            <Stack gap={3} className="docs-shell-page">
              <Skeleton width="12rem" height="2rem" />
              <Skeleton width="100%" height="5rem" />
            </Stack>
          </AppShellSkeleton>
        </div>
      </Example>
    </Preview>
  );
}
