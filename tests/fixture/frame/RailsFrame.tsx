import { useEffect, useRef, useState } from 'react';
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
  Page,
  PageHeader,
  PanelDock,
  SearchField,
  SearchTrigger,
  SegmentedControl,
  Sidebar,
  SidebarTrigger,
  Text,
  useSidebar,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Category } from '@envsemble/envui/icons/Category';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';
import './Frame.css';

const everyone = [
  'Alex Morgan',
  'Sam Lee',
  'Priya Shah',
  'Jordan Kim',
  'Maria Garcia',
  'Chen Wei',
  'Robin Diaz',
  'Noor Haddad',
];

/**
 * The directory at the end: who to show, a search field with a sort menu beside it and a list of
 * people, with more loading as its end comes into view; in its rail only their avatars.
 */
function Directory() {
  const { isRail, dismiss } = useSidebar('end');
  const [scope, setScope] = useState('team');
  const [shown, setShown] = useState(5);
  const [chosen, setChosen] = useState('');
  const [sort, setSort] = useState('name');
  const sentinel = useRef<HTMLDivElement>(null);
  const people = everyone.slice(0, shown);
  useEffect(() => {
    const end = sentinel.current;
    if (!end || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setShown((count) => Math.min(everyone.length, count + 3));
    });
    observer.observe(end);
    return () => observer.disconnect();
  }, [isRail]);
  if (isRail)
    return (
      <div className="fixture-frame-avatars" data-testid="directory-avatars">
        {people.map((name) => (
          <Avatar key={name} name={name} size="sm" />
        ))}
        <output data-testid="chosen">{chosen}</output>
      </div>
    );
  return (
    <>
      <SegmentedControl
        fullWidth
        size="sm"
        aria-label="Show"
        value={scope}
        onValueChange={setScope}
        items={[
          { value: 'team', label: 'Team' },
          { value: 'everyone', label: 'Everyone' },
        ]}
      />
      <div className="fixture-frame-strip">
        <div className="fixture-frame-strip-field">
          <SearchField label="Find people" defaultValue="" />
        </div>
        <Menu.Root
          aria-label="Sort people"
          trigger={<IconButton icon={<FilterList />} aria-label="Sort people" variant="ghost" />}
        >
          <Menu.RadioGroup value={sort} onValueChange={(value) => setSort(String(value))}>
            <Menu.RadioItem value="name">By name</Menu.RadioItem>
            <Menu.RadioItem value="recent">Recently active</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Root>
      </div>
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
      <div ref={sentinel} className="fixture-frame-load-more" data-testid="load-more" />
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

const firstPanels: PanelDockPanel[] = [
  { id: 'notes', title: 'Meeting notes', mode: 'open', active: true, height: 240 },
];

/**
 * A workspace frame with a navigation rail at the start and a directory rail at the end, mounted
 * with ?fixture=frame-rails. Main scrolls under a header that shows only below md, a phone's top
 * bar; the rails dock from xl up and open over the content on hover below it. Main holds a page
 * with a PanelDock over it. ?dir=rtl mirrors it, ?persist=cookie keeps the state in a cookie, and
 * ?peek=hover-focus opens a rail on keyboard focus too.
 */
export function RailsFrameFixture() {
  const query = new URLSearchParams(location.search);
  const peek = (query.get('peek') ?? 'hover') as 'hover' | 'hover-focus';
  const persist =
    query.get('persist') === 'cookie'
      ? { key: 'frame-rails', storage: 'cookie' as const }
      : 'frame-rails';
  const [created, setCreated] = useState('');
  const [panels, setPanels] = useState(firstPanels);
  const account = (
    <AccountMenu.Root name="Priya Shah" description="priya@example.com" aria-label="Account">
      <Menu.Item icon={<Settings />}>Account settings</Menu.Item>
    </AccountMenu.Root>
  );
  const frame = (
    <AppShell.Root scroll="main" headerSpan="main" persist={persist} className="fixture-frame">
      <AppShell.SkipLinks />
      <AppShell.Header
        mobileOnly
        start={
          <>
            <SidebarTrigger data-testid="phone-navigation" />
            <span>Workspace</span>
          </>
        }
        end={
          <>
            <SearchTrigger iconOnly listen={false} />
            <SidebarTrigger side="end" data-testid="phone-directory" />
            {account}
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
          <AccountMenu.Root
            name="Priya Shah"
            description="priya@example.com"
            trigger="auto"
            aria-label="Account"
          >
            <Menu.Item icon={<Settings />}>Account settings</Menu.Item>
          </AccountMenu.Root>
        </Sidebar.Footer>
      </Sidebar.Root>
      <AppShell.Main>
        <Page
          width="md"
          header={
            <PageHeader title="Projects" actions={<Button variant="primary">New project</Button>} />
          }
        >
          <Text>Every project the team works on.</Text>
          <output data-testid="created">{created}</output>
          <button type="button">Page action</button>
        </Page>
        <PanelDock.Root
          panels={panels}
          onModeChange={(id, mode: PanelDockMode) =>
            setPanels((current) =>
              current.map((panel) => (panel.id === id ? { ...panel, mode } : panel)),
            )
          }
          onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        >
          {(panel) => (
            <>
              <PanelDock.Header title={panel.title} />
              <Text>Notes for the next release.</Text>
            </>
          )}
        </PanelDock.Root>
      </AppShell.Main>
      <Sidebar.Root side="end" label="Directory" collapsible="rail" dockAt="xl" peek={peek}>
        <Sidebar.Header>
          <SidebarTrigger side="end" />
          <span>Directory</span>
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
