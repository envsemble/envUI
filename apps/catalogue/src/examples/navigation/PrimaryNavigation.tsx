import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Bar,
  Drawer,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Description } from '@envsemble/envui/icons/Description';
import { Group } from '@envsemble/envui/icons/Group';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Settings } from '@envsemble/envui/icons/Settings';

/**
 * Stands in for the window. An application renders its Scaffold at its root, as tall as the window;
 * this preview is a box 26 rem tall and adds no landmarks to the page around it.
 */
const preview = {
  blockSize: '26rem',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function PrimaryNavigation() {
  const [current, setCurrent] = useState('projects');
  const main = useRef<HTMLElement>(null);
  const page = [...destinations, ...workspace].find(({ id }) => id === current) ?? destinations[0];

  const go = (id: string) => {
    setCurrent(id);
    // After a change of page, focus moves to the body, so the keyboard and the screen reader go on
    // from the new page. An application also sets document.title to the page's name.
    main.current?.focus();
  };

  // One array of destinations, which every navigation form takes; the router renders the page,
  // and the example keeps it in state.
  const items: Destination[] = [...destinations, ...workspace].map(
    ({ id, label, href, icon, unread }, index) => ({
      label,
      href,
      icon,
      count: unread,
      group: index < destinations.length ? undefined : 'Workspace',
      current: id === current,
      onSelect: () => go(id),
    }),
  );

  return (
    <Scaffold
      landmarks={false}
      style={preview}
      bodyRef={main}
      topBar={<TopBar title="Northwind" />}
      // The one primary navigation, named Main, its current page marked, in each form.
      navigation={{
        bar: <Bar destinations={items} />,
        rail: <Rail destinations={items} />,
        drawer: <Drawer destinations={items} />,
      }}
    >
      <Page width="md" header={<PageHeader title={page.label} headingLevel={3} />}>
        <Text emphasis="muted">{page.description}</Text>
      </Page>
    </Scaffold>
  );
}

interface Place {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  description: string;
  unread?: number;
}

const destinations: Place[] = [
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

const workspace: Place[] = [
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
