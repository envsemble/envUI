import { useMemo, useState, type ReactNode } from 'react';
import {
  Avatar,
  AvatarButton,
  Button,
  Column,
  CommandPalette,
  EmptyState,
  Menu,
  NavList,
  Page,
  PageHeader,
  Row,
  Scaffold,
  SearchTrigger,
  Text,
  ThemeRadioGroup,
  TopBar,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Hub } from '@envsemble/envui/icons/Hub';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Settings } from '@envsemble/envui/icons/Settings';

interface Destination {
  label: string;
  href: string;
  icon: ReactNode;
  /** The routes that belong to the destination, so it stays selected on the pages under it. */
  routes: readonly string[];
}

/**
 * The application's frame: a Scaffold with a top bar that holds the application's name, search and
 * the account menu, the navigation at the bottom of a phone and at the start of a wider window, and
 * the page in the body. Render it once, at the application's root, with the current page as its
 * children; `current` is the current route, which marks its destination in the navigation. Without
 * children it shows a sample page.
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

  // The account menu: the avatar opens a Menu whose header says who is signed in, then the
  // person's own things. It is a pattern, not a component, so it is arranged here.
  const account = (
    <Menu.Root
      aria-label="Account"
      align="end"
      trigger={<AvatarButton name={user.name} description={user.email} />}
    >
      <Menu.Header>
        <Row align="center" gap={3}>
          <Avatar name={user.name} size="lg" />
          <Column>
            <Text>{user.name}</Text>
            <Text variant="body-sm" emphasis="muted">
              {user.email}
            </Text>
          </Column>
        </Row>
      </Menu.Header>
      <Menu.Item href="/account" icon={<ManageAccounts />}>
        Account settings
      </Menu.Item>
      <Menu.Submenu label="Theme" icon={<Palette />}>
        <ThemeRadioGroup />
      </Menu.Submenu>
      <Menu.Separator />
      {/* End the session with your authentication service, then go to the sign-in page. */}
      <Menu.Item icon={<Logout />} onClick={() => navigate('/sign-in')}>
        Sign out
      </Menu.Item>
    </Menu.Root>
  );

  const destinations = [...primary, ...workspace];
  return (
    // The body scrolls under the top bar; the Scaffold shows the navigation that fits its width.
    <Scaffold
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <>
              <SearchTrigger iconOnly onClick={() => setSearching(true)} />
              {account}
            </>
          }
        />
      }
      navigation={{
        // At the bottom of a phone: the destinations side by side.
        bar: (
          <Row render={<nav aria-label="Primary" />} justify="between" padding={2}>
            {destinations.map((destination) => (
              <Button
                key={destination.href}
                href={destination.href}
                variant="ghost"
                startIcon={destination.icon}
                aria-current={isCurrent(destination) ? 'page' : undefined}
              >
                {destination.label}
              </Button>
            ))}
          </Row>
        ),
        // At the start of a wider window: the destinations, then the workspace's.
        drawer: (
          <Column gap={4} render={<nav aria-label="Primary" />} padding={3}>
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
            <NavList.Group label="Workspace">
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
            </NavList.Group>
          </Column>
        ),
      }}
    >
      {children ?? <SamplePage />}
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
    </Scaffold>
  );
}

/** The page the body shows without children: a Page with its header, where the application's go. */
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
