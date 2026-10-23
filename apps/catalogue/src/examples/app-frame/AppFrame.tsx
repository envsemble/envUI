import { useMemo, useState, type CSSProperties } from 'react';
import {
  Avatar,
  AvatarButton,
  Bar,
  Column,
  CommandPalette,
  Drawer,
  Menu,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  SearchTrigger,
  Text,
  ThemeRadioGroup,
  TopBar,
  type CommandPaletteItem,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Logout } from '@envsemble/envui/icons/Logout';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '28rem' };

/**
 * An application's frame: a Scaffold with a top bar of the name, search and the account menu, the
 * same destinations as a bar on a phone, a rail on a tablet and a drawer from expanded, and the
 * page in the body. Render it once, at the application's root, around the router's outlet.
 */
export default function AppFrame() {
  // The router knows the current page; here a choice stands in for it.
  const [current, setCurrent] = useState('/');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  // One array of destinations, which every navigation form takes.
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: place.href === current,
    onSelect: () => setCurrent(place.href),
  }));
  const page = places.find((place) => place.href === current) ?? places[0];

  // Search goes to a destination; the application filters and ranks the items.
  const items = useMemo<CommandPaletteItem[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return places
      .filter((place) => words.every((word) => place.label.toLowerCase().includes(word)))
      .map((place) => ({ id: place.href, label: place.label, icon: place.icon, group: 'Go to' }));
  }, [query]);

  // The account menu pattern: the avatar opens a Menu whose header says who is signed in.
  const account = (
    <Menu.Root
      aria-label="Account"
      align="end"
      trigger={<AvatarButton name={user.name} description={user.email} />}
    >
      <Menu.Header>
        <Column align="center" gap={1} padding={2} style={{ textAlign: 'center' }}>
          <Avatar name={user.name} size="lg" />
          <Text>{user.name}</Text>
          <Text variant="body-sm" emphasis="muted">
            {user.email}
          </Text>
        </Column>
      </Menu.Header>
      <Menu.Item href="/account" icon={<ManageAccounts />}>
        Account settings
      </Menu.Item>
      <Menu.Submenu label="Theme" icon={<Palette />}>
        <ThemeRadioGroup />
      </Menu.Submenu>
      <Menu.Separator />
      <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
    </Menu.Root>
  );

  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
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
        bar: <Bar destinations={destinations} />,
        rail: <Rail destinations={destinations} />,
        drawer: <Drawer destinations={destinations} headingLevel={3} />,
      }}
    >
      <Page width="lg" header={<PageHeader title={page.label} headingLevel={3} />}>
        <Column gap={4} padding={5}>
          <Text render={<span />} emphasis="muted">
            <Description width="1.5rem" height="1.5rem" />
          </Text>
          <Column gap={2}>
            <Text render={<h4 />} variant="title">
              Nothing here yet
            </Text>
            <Text variant="body-sm">The router renders the page in the Scaffold's body.</Text>
          </Column>
        </Column>
      </Page>
      <CommandPalette
        open={searching}
        onOpenChange={(open) => {
          setSearching(open);
          if (!open) setQuery('');
        }}
        aria-label="Search"
        placeholder="Search pages"
        inputValue={query}
        onInputValueChange={setQuery}
        items={items}
        onAction={(item) => setCurrent(item.id)}
        emptyLabel="No matching pages"
      />
    </Scaffold>
  );
}

const user = { name: 'Alex Morgan', email: 'alex.morgan@example.com' };

const places = [
  { label: 'Home', href: '/', icon: <Home /> },
  { label: 'Projects', href: '/projects', icon: <Category /> },
  { label: 'Documents', href: '/documents', icon: <Description /> },
  { label: 'Team', href: '/team', icon: <Group /> },
  { label: 'Settings', href: '/settings', icon: <Settings />, group: 'Workspace' },
];
