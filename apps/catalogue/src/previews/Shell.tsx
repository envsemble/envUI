import { useState } from 'react';
import {
  AppShell,
  AppShellSkeleton,
  AvatarButton,
  Button,
  Menu,
  MenuItem,
  NavigationItem,
  OrganizationMenu,
  Skeleton,
  Stack,
  Text,
  Tree,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Example } from './Example';
import { Preview } from './Preview';
import { useSampleTree } from './Workspace';

const organizations = [
  { id: 'northwind', name: 'Northwind Labs', detail: 'Admin' },
  { id: 'contoso', name: 'Contoso', detail: 'Member' },
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
                  <AvatarButton
                    name="Alex Morgan"
                    detail="alex@example.com"
                    aria-label="Open account menu"
                  />
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
      <ResizableShellExample />
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

/** A resizable sidebar with its own scrolling content below the navigation. */
function ResizableShellExample() {
  const [page, setPage] = useState<(typeof pages)[number]['id']>('home');
  const sample = useSampleTree();
  return (
    <Example
      title="Resizable sidebar with content"
      size="wide"
      caption="Drag the sidebar edge or focus it and use the arrow keys. The file tree fills the sidebar below the navigation and scrolls on its own; the page header sticks below the topbar."
    >
      <div className="docs-shell-frame">
        <AppShell
          brand={<Apps />}
          title="Plans"
          navigationLabel="Resizable sample navigation"
          navigation={pages.slice(0, 2).map((candidate) => (
            <NavigationItem
              key={candidate.id}
              icon={candidate.icon}
              selected={candidate.id === page}
              onClick={() => setPage(candidate.id)}
            >
              {candidate.label}
            </NavigationItem>
          ))}
          sidebarContent={
            <Tree
              aria-label="Planning documents"
              items={sample.items}
              selectedId={sample.selectedId}
              onOpen={sample.onOpen}
              onExpandedChange={sample.onExpandedChange}
            />
          }
          resizable
          storageKey="envui-catalogue-resizable-shell"
        >
          <div className="docs-shell-sticky">
            <Text variant="section-heading">Sticky document header</Text>
          </div>
          <Stack gap={3} className="docs-shell-page">
            {Array.from({ length: 12 }, (_, index) => (
              <Text key={index} tone="muted">
                Page content scrolls under the sticky header.
              </Text>
            ))}
          </Stack>
        </AppShell>
      </div>
    </Example>
  );
}
