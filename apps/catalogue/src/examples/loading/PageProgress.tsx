import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  AppShell,
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

/**
 * Stands in for the window. An application renders AppShell.Root at its root, where the document
 * scrolls under the header; this preview scrolls Main in a box and adds no landmarks to the page
 * around it.
 */
const preview = {
  '--env-app-shell-block-size': '22rem',
  overflow: 'hidden',
  borderRadius: '1.75rem',
} as CSSProperties;

export default function PageProgress() {
  // The page on screen, and the page people chose, while it loads.
  const [shown, setShown] = useState('home');
  const [next, setNext] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const open = (id: string) => {
    if (id === (next ?? shown)) return;
    window.clearTimeout(timer.current);
    // The page on screen stays, selected, until the next one arrives; the bar says it is on its way.
    setNext(id === shown ? null : id);
    if (id === shown) return;
    // Where focus was when people chose the page: the item they pressed, or the body.
    const origin = document.activeElement;
    // The page's data loads from a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => {
      setShown(id);
      setNext(null);
      // People asked for the page, so focus moves to it once it has arrived, unless they have
      // moved focus elsewhere in the meantime.
      const current = document.activeElement;
      if (current === origin || current === document.body) main.current?.focus();
    }, 1500);
  };

  const page = pages.find(({ id }) => id === shown) ?? pages[0];
  return (
    <AppShell.Root
      loading={next !== null}
      // The bar names the page it loads.
      loadingLabel={`Loading ${pages.find(({ id }) => id === next)?.label ?? 'page'}`}
      landmarks={false}
      scroll="main"
      style={preview}
    >
      <Sidebar.Root label="Primary">
        <Sidebar.Header>
          <SidebarTrigger mark={<Apps />} />
        </Sidebar.Header>
        <Sidebar.Content>
          <NavList.Root>
            {pages.map(({ id, label, href, icon }) => (
              // The router changes the page; the example keeps it in state.
              <NavList.Item
                key={id}
                href={href}
                icon={icon}
                selected={id === shown}
                onClick={() => open(id)}
              >
                {label}
              </NavList.Item>
            ))}
          </NavList.Root>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header>Northwind</AppShell.Header>
      <AppShell.Main ref={main}>
        <Page width="md" header={<PageHeader title={page.label} headingLevel={3} />}>
          <Text emphasis="muted">{page.description}</Text>
        </Page>
      </AppShell.Main>
    </AppShell.Root>
  );
}

const pages = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <Home />,
    description: 'What changed in your projects since you last looked.',
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
  {
    id: 'team',
    label: 'Team',
    href: '/team',
    icon: <Group />,
    description: 'Alex Morgan, Sam Lee, Priya Shah and the rest of Northwind.',
  },
];
