import { useState } from 'react';
import {
  AppShell,
  Button,
  LoadingState,
  NavList,
  OrganizationSwitcher,
  Page,
  PageHeader,
  Sidebar,
  SidebarTrigger,
  Skeleton,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';
import './Frame.css';

const organizations = [
  { id: 'northwind', label: 'Northwind', description: 'Admin' },
  { id: 'example', label: 'Example Labs', description: 'Member' },
];

/** The frame while the first page loads: the same parts, with NavList.Skeleton for the items. */
function Skeletons() {
  return (
    <LoadingState label="Loading workspace">
      <AppShell.Root persist="frame-split" className="fixture-frame">
        <Sidebar.Root label="Main navigation" width={16}>
          <Sidebar.Header>
            <SidebarTrigger mark={<Apps />} />
            <Skeleton width="8rem" />
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Skeleton items={3} />
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header>
          <Skeleton width="6rem" />
        </AppShell.Header>
        <AppShell.Main>
          <Page width="md">
            <Skeleton width="40%" height="1.5rem" />
          </Page>
        </AppShell.Main>
      </AppShell.Root>
    </LoadingState>
  );
}

/**
 * A split header, mounted with ?fixture=frame-split: the sidebar runs the full height with the
 * trigger, a mark and an OrganizationSwitcher in its header, and the header beside it holds the
 * page's title and the loading bar. ?skeleton renders the skeleton recipe instead, the same parts
 * with NavList.Skeleton, whose boxes match the frame's.
 */
export function SplitHeaderFrameFixture() {
  const [organization, setOrganization] = useState('northwind');
  const [loading, setLoading] = useState(false);
  if (new URLSearchParams(location.search).has('skeleton')) return <Skeletons />;
  return (
    <AppShell.Root persist="frame-split" loading={loading} className="fixture-frame">
      <AppShell.SkipLinks />
      <Sidebar.Root label="Main navigation" width={16}>
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
          <OrganizationSwitcher
            items={organizations}
            value={organization}
            onValueChange={setOrganization}
          />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item href="#/" icon={<Home />} selected>
              Home
            </NavList.Item>
            <NavList.Item href="#/projects" icon={<Category />}>
              Projects
            </NavList.Item>
            <NavList.Item href="#/settings" icon={<Settings />}>
              Settings
            </NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header>Home</AppShell.Header>
      <AppShell.Main>
        <Page width="md" header={<PageHeader title="Home" />}>
          <Button variant="secondary" onClick={() => setLoading((current) => !current)}>
            {loading ? 'Stop loading' : 'Load the next page'}
          </Button>
          <Text>Welcome back.</Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}
