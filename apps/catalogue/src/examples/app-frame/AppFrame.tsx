import { useMemo, useState, type ReactNode } from 'react';
import {
  AccountMenu,
  AppShell,
  CommandPalette,
  EmptyState,
  Menu,
  NavList,
  Page,
  PageHeader,
  SearchTrigger,
  Sidebar,
  SidebarTrigger,
  Text,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Hub } from '@envsemble/envui/icons/Hub';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Settings } from '@envsemble/envui/icons/Settings';

interface Destination {
  label: string;
  href: string;
  icon: ReactNode;
  /** The routes that belong to the destination, so it stays selected on the pages under it. */
  routes: readonly string[];
}

/**
 * The application's frame: a sidebar at the start that collapses to a rail of icons and becomes a
 * drawer on a phone, a phone's top bar, search and the account menu, around the page in Main.
 * Render it once, at the application's root, with the current page as its children; `current` is
 * the current route, which marks its destination in the navigation. Without children it shows a
 * sample page.
 */
export default function AppFrame({
  children,
  current,
}: {
  children?: ReactNode;
  current?: string;
}) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const isCurrent = (destination: Destination) =>
    current ? destination.routes.includes(current) : destination === primary[0];

  // Search goes to a destination or a project. The application filters and ranks the items; here,
  // every word of the query must match.
  const items = useMemo<CommandPaletteItem[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (text: string) => words.every((word) => text.toLowerCase().includes(word));
    return [
      ...[...primary, ...workspace]
        .filter((destination) => matches(destination.label))
        .map((destination) => ({
          id: destination.href,
          label: destination.label,
          icon: destination.icon,
          group: 'Go to',
        })),
      ...projects
        .filter((project) => matches(project.name))
        .map((project) => ({
          id: project.href,
          label: project.name,
          description: project.team,
          icon: <Category />,
          group: 'Projects',
        })),
    ];
  }, [query]);

  // One account menu, in the sidebar's footer, and in the phone's top bar where the sidebar is a
  // drawer.
  const account = (
    <AccountMenu.Root name={user.name} description={user.email} aria-label="Account">
      <Menu.Item href="/account" icon={<ManageAccounts />}>
        Account settings
      </Menu.Item>
      <AccountMenu.ThemeSubmenu />
      <Menu.Separator />
      {/* End the session with your authentication service, then go to the sign-in page. */}
      <Menu.Item icon={<Logout />} onClick={() => navigate('/sign-in')}>
        Sign out
      </Menu.Item>
    </AccountMenu.Root>
  );

  return (
    // The document scrolls under the header; the sidebar's docked or rail state is remembered.
    // Add shortcut="mod+b" to toggle it from the keyboard, unless the application has an editor,
    // where Mod+B is Bold.
    <AppShell.Root breakpoint="md" persist="app.frame">
      <AppShell.SkipLinks />
      <Sidebar.Root label="Primary" collapsible="rail">
        <Sidebar.Header>
          {/* A generic mark, never a logo: it toggles the sidebar and shows in the rail. */}
          <SidebarTrigger mark={<Hub />} />
          <Text variant="title" render={<span />}>
            Northwind
          </Text>
        </Sidebar.Header>
        <Sidebar.Content>
          <SearchTrigger fullWidth onClick={() => setSearching(true)} />
          <NavList.Root>
            {primary.map((destination) => (
              <NavList.Item
                key={destination.href}
                href={destination.href}
                icon={destination.icon}
                selected={isCurrent(destination)}
              >
                {destination.label}
              </NavList.Item>
            ))}
          </NavList.Root>
          <Sidebar.Group label="Workspace">
            <NavList.Root>
              {workspace.map((destination) => (
                <NavList.Item
                  key={destination.href}
                  href={destination.href}
                  icon={destination.icon}
                  selected={isCurrent(destination)}
                >
                  {destination.label}
                </NavList.Item>
              ))}
            </NavList.Root>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>{account}</Sidebar.Footer>
      </Sidebar.Root>
      {/* A phone's top bar: below the breakpoint the sidebar is a drawer its trigger opens. */}
      <AppShell.Header
        mobileOnly
        start={
          <>
            <SidebarTrigger />
            <Text variant="title" render={<span />}>
              Northwind
            </Text>
          </>
        }
        end={
          <>
            <SearchTrigger iconOnly onClick={() => setSearching(true)} />
            {account}
          </>
        }
      />
      <AppShell.Main>{children ?? <SamplePage />}</AppShell.Main>
      <CommandPalette
        open={searching}
        onOpenChange={(open) => {
          setSearching(open);
          if (!open) setQuery('');
        }}
        aria-label="Search"
        placeholder="Search pages and projects"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => navigate(item.id)}
        emptyLabel="No matching pages or projects"
      />
    </AppShell.Root>
  );
}

/** The page Main shows without children: a Page with its header, where the application's go. */
function SamplePage() {
  return (
    <Page width="lg" header={<PageHeader title="Home" description="What changed in Northwind." />}>
      <EmptyState
        icon={<Description />}
        title="No recent activity"
        description="Projects and documents you open or change show here."
        headingLevel={2}
      />
    </Page>
  );
}

/**
 * Stands in for the router's navigate, such as React Router's useNavigate(): it opens the page at
 * the path. Links in the frame need nothing: they go through the application's LinkProvider.
 */
function navigate(path: string) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const user = { name: 'Alex Morgan', email: 'alex.morgan@example.com' };

const primary: readonly Destination[] = [
  { label: 'Home', href: '/', icon: <Home />, routes: ['home', 'dashboard-page'] },
  {
    label: 'Projects',
    href: '/projects',
    icon: <Category />,
    routes: ['projects', 'index-page', 'details-page'],
  },
  { label: 'Documents', href: '/documents', icon: <Description />, routes: ['documents'] },
  { label: 'Team', href: '/team', icon: <Group />, routes: ['team'] },
];

const workspace: readonly Destination[] = [
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings />,
    routes: ['settings', 'settings-page'],
  },
];

const projects = [
  { name: 'Website refresh', team: 'Design', href: '/projects/website-refresh' },
  { name: 'Quarterly report', team: 'Finance', href: '/projects/quarterly-report' },
  { name: 'Onboarding guide', team: 'People', href: '/projects/onboarding-guide' },
  { name: 'Mobile release', team: 'Engineering', href: '/projects/mobile-release' },
  { name: 'Data migration', team: 'Engineering', href: '/projects/data-migration' },
  { name: 'Annual review', team: 'Operations', href: '/projects/annual-review' },
];
