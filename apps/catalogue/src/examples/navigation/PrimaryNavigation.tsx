import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AppShell,
  CounterBadge,
  NavList,
  Page,
  PageHeader,
  Sidebar,
  SidebarTrigger,
  Text,
} from '@envsemble/envui';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Settings } from '@envsemble/envui/icons/Settings';

/**
 * Stands in for the window. An application renders AppShell.Root at its root, where the document
 * scrolls under the header; this preview scrolls Main in a box and adds no landmarks to the page
 * around it.
 */
const preview = {
  '--env-app-shell-block-size': '26rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function PrimaryNavigation() {
  const [current, setCurrent] = useState('projects');
  const main = useRef<HTMLElement>(null);
  const page = [...destinations, ...workspace].find(({ id }) => id === current) ?? destinations[0];

  const go = (id: string) => {
    setCurrent(id);
    // After a change of page, focus moves to Main, so the keyboard and the screen reader go on
    // from the new page. An application also sets document.title to the page's name.
    main.current?.focus();
  };

  // One item per destination; the router renders the page, and the example keeps it in state.
  const item = ({ id, label, href, icon, unread }: Destination) => (
    <NavList.Item
      key={id}
      href={href}
      icon={icon}
      selected={id === current}
      end={unread ? <CounterBadge value={unread} aria-label={`${unread} unread`} /> : undefined}
      onClick={() => go(id)}
    >
      {label}
    </NavList.Item>
  );

  return (
    <AppShell.Root landmarks={false} scroll="main" style={preview}>
      <AppShell.SkipLinks />
      {/* The one primary navigation: a sidebar named Primary, its current page selected. */}
      <Sidebar.Root label="Primary">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
          <Text variant="title">Northwind</Text>
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>{destinations.map(item)}</NavList.Root>
          <Sidebar.Group label="Workspace">
            <NavList.Root>{workspace.map(item)}</NavList.Root>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
      {/* Below the frame's breakpoint the sidebar is a drawer, which this trigger opens. */}
      <AppShell.Header mobileOnly start={<SidebarTrigger />}>
        Northwind
      </AppShell.Header>
      <AppShell.Main ref={main}>
        <Page width="md" header={<PageHeader title={page.label} headingLevel={3} />}>
          <Text emphasis="muted">{page.description}</Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}

interface Destination {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  description: string;
  unread?: number;
}

const destinations: Destination[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <Home />,
    description: 'What changed in your projects since you last looked.',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    href: '/inbox',
    icon: <Inbox />,
    description: 'Comments and requests that wait for you.',
    unread: 3,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: <Category />,
    description: 'Website refresh, Quarterly report and four more projects.',
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/documents',
    icon: <Description />,
    description: 'Every document in the workspace, newest first.',
  },
];

const workspace: Destination[] = [
  {
    id: 'team',
    label: 'Team',
    href: '/team',
    icon: <Group />,
    description: 'Alex Morgan, Sam Lee, Priya Shah and the rest of Northwind.',
  },
  {
    id: 'members',
    label: 'Members',
    href: '/settings/members',
    icon: <ManageAccounts />,
    description: 'Who can sign in to Northwind, and what each person can do.',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings />,
    description: 'The workspace’s name, its notifications and its appearance.',
  },
];
