import { useState } from 'react';
import {
  AccountMenu,
  AppShell,
  Avatar,
  Button,
  EnvUIProvider,
  IconButton,
  List,
  Menu,
  NavList,
  SearchField,
  SearchTrigger,
  Sidebar,
  SidebarTrigger,
  useSidebar,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Kim', 'Robin Diaz'];

/** The directory: a search field and rows of people, or their avatars alone in a rail. */
function Directory() {
  const { isRail, dismiss } = useSidebar('end');
  const [chosen, setChosen] = useState('');
  if (isRail)
    return (
      <div className="fixture-avatar-rail" data-testid="directory-avatars">
        {people.map((name) => (
          <Avatar key={name} name={name} size="sm" />
        ))}
        <output data-testid="chosen">{chosen}</output>
      </div>
    );
  return (
    <>
      <SearchField label="Find people" />
      <List.Root aria-label="People">
        {people.map((name) => (
          <List.Item
            key={name}
            interactive
            selected={chosen === name}
            start={<Avatar name={name} size="sm" />}
            label={
              <button
                type="button"
                data-row-target=""
                onClick={() => {
                  setChosen(name);
                  dismiss();
                }}
              >
                {name}
              </button>
            }
          />
        ))}
      </List.Root>
      <output data-testid="chosen">{chosen}</output>
    </>
  );
}

/** The Create menu: a labelled button, or an icon in a rail. */
function CreateMenu({ onCreate }: { onCreate: (kind: string) => void }) {
  const { isRail } = useSidebar();
  return (
    <Menu.Root
      aria-label="Create"
      trigger={
        isRail ? (
          <IconButton icon={<Add />} aria-label="Create" variant="ghost" />
        ) : (
          <Button variant="secondary" startIcon={<Add />}>
            Create
          </Button>
        )
      }
    >
      <Menu.Item onClick={() => onCreate('document')}>Document</Menu.Item>
      <Menu.Item onClick={() => onCreate('folder')}>Folder</Menu.Item>
    </Menu.Root>
  );
}

/**
 * A settings page's sub-navigation: a Sidebar.Root in AppShell.Main, which keeps its own state,
 * and a button that removes it.
 */
function SubNavigation() {
  const [shown, setShown] = useState(true);
  return (
    <div className="fixture-sidebar-row">
      {shown && (
        <Sidebar.Root label="Settings sections" collapsible="offcanvas">
          <Sidebar.Content>
            <NavList.Root>
              <NavList.Item href="#/settings/profile" icon={<Home />}>
                Profile
              </NavList.Item>
            </NavList.Root>
          </Sidebar.Content>
        </Sidebar.Root>
      )}
      <button type="button" onClick={() => setShown(false)}>
        Remove settings sections
      </button>
    </div>
  );
}

/**
 * A frame with a rail at each side that opens over the content on hover, mounted with
 * ?fixture=sidebar-rails. The start "Primary" docks from xl up: a trigger and the app's name, a
 * SearchTrigger, a Create menu, navigation, an Administration group and an AccountMenu. The end
 * "Directory" holds a search field and a list of people. Below md a phone's top bar holds the
 * triggers. ?dir=rtl mirrors it; ?peek=hover-focus opens on keyboard focus too; ?subnav adds a
 * settings page's sub-navigation in Main.
 */
export function SidebarRailsFixture() {
  const query = new URLSearchParams(location.search);
  const peek = (query.get('peek') ?? 'hover') as 'hover' | 'hover-focus';
  const subNavigation = query.has('subnav');
  const [created, setCreated] = useState('');
  const frame = (
    <AppShell.Root scroll="main" persist="fixture-rails" className="fixture-app-shell">
      <AppShell.SkipLinks />
      <AppShell.Header
        mobileOnly
        start={
          <>
            <SidebarTrigger />
            <span>Workspace</span>
          </>
        }
        end={
          <>
            <SearchTrigger iconOnly listen={false} />
            <SidebarTrigger side="end" />
          </>
        }
      />
      <Sidebar.Root label="Primary" collapsible="rail" dockAt="xl" peek={peek}>
        <Sidebar.Header>
          <SidebarTrigger />
          <span data-testid="app-name">Workspace</span>
        </Sidebar.Header>
        <Sidebar.Content>
          <SearchTrigger listen={false} fullWidth />
          <CreateMenu onCreate={setCreated} />
          <NavList.Root>
            <NavList.Item href="#/" icon={<Home />} selected>
              Home
            </NavList.Item>
            <NavList.Item href="#/projects" icon={<Category />}>
              Projects
            </NavList.Item>
          </NavList.Root>
          <Sidebar.Group label="Administration">
            <NavList.Root>
              <NavList.Item href="#/settings" icon={<Settings />}>
                Settings
              </NavList.Item>
            </NavList.Root>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>
          <AccountMenu.Root name="Priya Shah" aria-label="Account">
            <Menu.Item>Profile</Menu.Item>
          </AccountMenu.Root>
        </Sidebar.Footer>
      </Sidebar.Root>
      <AppShell.Main>
        <p data-testid="main-content">Main content</p>
        {subNavigation && <SubNavigation />}
        <output data-testid="created">{created}</output>
        <button type="button">Page action</button>
      </AppShell.Main>
      <Sidebar.Root side="end" label="Directory" collapsible="rail" dockAt="xl" peek={peek}>
        <Sidebar.Header>
          <SidebarTrigger side="end" />
        </Sidebar.Header>
        <Sidebar.Content align="stretch">
          <Directory />
        </Sidebar.Content>
      </Sidebar.Root>
    </AppShell.Root>
  );
  if (query.get('dir') !== 'rtl') return frame;
  return (
    <EnvUIProvider dir="rtl">
      <div dir="rtl">{frame}</div>
    </EnvUIProvider>
  );
}

/**
 * Sidebars without AppShell, mounted with ?fixture=sidebars: a settings page's resizable
 * sub-navigation in a Sidebar.Provider whose trigger sits in the page's own header, with groups at
 * heading levels and an action, the Mod+B shortcut and a remembered width; and an off-canvas
 * sidebar with a handle that only collapses it. ?duplicate adds a second sidebar on the filters'
 * side, and a button that removes it.
 */
export function SidebarsFixture() {
  const [widths, setWidths] = useState<string[]>([]);
  const [duplicate, setDuplicate] = useState(() =>
    new URLSearchParams(location.search).has('duplicate'),
  );
  return (
    <div className="fixture-sidebars">
      <Sidebar.Provider
        persist="fixture-settings"
        shortcut="mod+b"
        onSidebarWidthChange={(width, { committed }) =>
          committed && setWidths((current) => [...current, String(width)])
        }
      >
        <div className="fixture-actions">
          <SidebarTrigger data-testid="settings-trigger" />
          <span>Settings</span>
        </div>
        <div className="fixture-sidebar-row" data-testid="settings-row">
          <Sidebar.Root label="Settings" resizable className="fixture-settings-sidebar">
            <Sidebar.Content>
              <Sidebar.Group
                label="Account"
                headingLevel={2}
                action={<IconButton icon={<Add />} aria-label="Add account" variant="ghost" />}
              >
                <NavList.Root>
                  <NavList.Item href="#profile" icon={<Home />} selected>
                    Profile
                  </NavList.Item>
                  <NavList.Item href="#security" icon={<Settings />}>
                    Security and sign-in
                  </NavList.Item>
                </NavList.Root>
              </Sidebar.Group>
              <Sidebar.Group label="Workspace">
                <NavList.Root>
                  <NavList.Item href="#members" icon={<Category />}>
                    Members
                  </NavList.Item>
                </NavList.Root>
              </Sidebar.Group>
            </Sidebar.Content>
            <Sidebar.Handle />
          </Sidebar.Root>
          <div className="fixture-sidebar-page">
            <textarea aria-label="Bio" />
            <output data-testid="width-changes">{widths.join(',')}</output>
          </div>
        </div>
      </Sidebar.Provider>
      <Sidebar.Provider>
        <SidebarTrigger data-testid="filters-trigger" />
        <div className="fixture-sidebar-row" data-testid="offcanvas-row">
          <Sidebar.Root
            id="filters"
            label="Filters"
            collapsible="offcanvas"
            className="fixture-filters-sidebar"
          >
            <Sidebar.Content>
              <Button variant="secondary">Only mine</Button>
            </Sidebar.Content>
            <Sidebar.Handle />
          </Sidebar.Root>
          {duplicate && (
            <Sidebar.Root id="extra-filters" label="Extra filters" collapsible="offcanvas">
              <Sidebar.Content>
                <button type="button" onClick={() => setDuplicate(false)}>
                  Remove extra filters
                </button>
              </Sidebar.Content>
            </Sidebar.Root>
          )}
          <div className="fixture-sidebar-page">
            <button type="button">Results</button>
          </div>
        </div>
      </Sidebar.Provider>
    </div>
  );
}
