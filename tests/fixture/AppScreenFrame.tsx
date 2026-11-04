import { useId, useState, type ReactNode } from 'react';
import {
  Avatar,
  AvatarButton,
  Badge,
  Button,
  Column,
  IconButton,
  Menu,
  NavigationBar,
  NavigationDrawer,
  NavigationRail,
  Scaffold,
  Text,
  ThemeMenuRadioGroup,
  Tooltip,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconGroups3 } from '@envsemble/envui/icons/Groups3';
import { IconHelp } from '@envsemble/envui/icons/Help';
import { IconLogout } from '@envsemble/envui/icons/Logout';
import { IconManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { IconNotifications } from '@envsemble/envui/icons/Notifications';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import { IconSearch } from '@envsemble/envui/icons/Search';
import { IconUnfoldMore } from '@envsemble/envui/icons/UnfoldMore';

export const user = { name: 'Alex Morgan', email: 'alex.morgan@northwind.example' };

export const organizations = [
  { id: 'northwind', label: 'Northwind Labs', role: 'Admin' },
  { id: 'contoso', label: 'Contoso', role: 'Member' },
  { id: 'fabrikam', label: 'Fabrikam Research', role: 'Viewer' },
];

/** The switcher at the top of the drawer: a button that names the active organization. */
function OrganizationSwitcher({
  current,
  onChange,
}: {
  current: string;
  onChange: (id: string) => void;
}) {
  const headingId = useId();
  const active = organizations.find(({ id }) => id === current);
  return (
    <Menu.Root
      aria-label="Organizations"
      align="start"
      trigger={
        <Button variant="secondary" fullWidth endIcon={<IconUnfoldMore />}>
          {active?.label}
        </Button>
      }
    >
      <Menu.Header>
        <Column align="center" gap={2} padding={3}>
          <IconGroups3 width="2rem" height="2rem" />
          <Text variant="headline" id={headingId}>
            Organizations
          </Text>
        </Column>
      </Menu.Header>
      <Menu.RadioGroup aria-labelledby={headingId} value={current} onValueChange={onChange}>
        {organizations.map(({ id, label, role }) => (
          <Menu.RadioItem key={id} value={id} description={role}>
            {label}
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
      <Menu.Separator />
      <Menu.Item icon={<IconAdd />}>Create organization</Menu.Item>
    </Menu.Root>
  );
}

/** The account menu, with the organizations as a submenu for the forms that have no drawer. */
function AccountMenu({ current, onChange }: { current: string; onChange: (id: string) => void }) {
  return (
    <Menu.Root
      aria-label="Account"
      align="end"
      trigger={<AvatarButton name={user.name} description={user.email} />}
    >
      <Menu.Header>
        {/* Layout glue: Column has no text alignment, so the centred header sets its own. */}
        <Column align="center" gap={1} padding={2} style={{ textAlign: 'center' }}>
          <Avatar name={user.name} size="lg" />
          <Text>{user.name}</Text>
          <Text variant="body-sm" emphasis="muted">
            {user.email}
          </Text>
        </Column>
      </Menu.Header>
      <Menu.Item href="#account" icon={<IconManageAccounts />}>
        Account settings
      </Menu.Item>
      <Menu.Submenu
        label="Organization"
        icon={<IconGroups3 />}
        description={organizations.find(({ id }) => id === current)?.label}
      >
        <Menu.RadioGroup value={current} onValueChange={onChange}>
          {organizations.map(({ id, label }) => (
            <Menu.RadioItem key={id} value={id}>
              {label}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      </Menu.Submenu>
      <Menu.Submenu label="Theme" icon={<IconPalette />}>
        <ThemeMenuRadioGroup />
      </Menu.Submenu>
      <Menu.Separator />
      <Menu.Item icon={<IconLogout />}>Sign out</Menu.Item>
    </Menu.Root>
  );
}

/**
 * The application's frame: a top bar with the name, search, help, notifications and the account
 * menu, and the same destinations as a bar, a rail or a drawer by the frame's width.
 */
export function AppFrame({
  destinations,
  onSearch,
  children,
}: {
  destinations: Destination[];
  onSearch: () => void;
  children: ReactNode;
}) {
  const [organization, setOrganization] = useState('northwind');
  return (
    <Scaffold
      scroll="body"
      topBar={
        <TopBar
          title="Northwind"
          actions={
            <>
              <Tooltip content="Search" side="bottom">
                <IconButton
                  variant="ghost"
                  icon={<IconSearch />}
                  aria-label="Search"
                  onClick={onSearch}
                />
              </Tooltip>
              <Tooltip content="Help" side="bottom">
                <IconButton variant="ghost" icon={<IconHelp />} aria-label="Help" />
              </Tooltip>
              <Tooltip content="Notifications, 3 new" side="bottom">
                {/* Finding: IconButton takes no count, so the unread count can't sit on the bell
                    the way a destination's count sits on its icon. */}
                <IconButton
                  variant="ghost"
                  icon={<IconNotifications />}
                  aria-label="Notifications, 3 new"
                />
              </Tooltip>
              <AccountMenu current={organization} onChange={setOrganization} />
            </>
          }
        />
      }
      navigation={{
        bar: <NavigationBar destinations={destinations} />,
        rail: <NavigationRail destinations={destinations} />,
        drawer: (
          <NavigationDrawer
            destinations={destinations}
            header={<OrganizationSwitcher current={organization} onChange={setOrganization} />}
            footer={
              <Column gap={2} padding={2}>
                <Text variant="caption" emphasis="muted">
                  Team plan · 14 of 20 seats
                </Text>
                <Badge tone="primary">Trial ends in 9 days</Badge>
              </Column>
            }
          />
        ),
      }}
    >
      {children}
    </Scaffold>
  );
}

/** A time some minutes before now, as an ISO date, so the sample reads as recent. */
export const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();
