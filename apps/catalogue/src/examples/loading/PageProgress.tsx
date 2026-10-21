import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
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

/**
 * Stands in for the window. An application renders its Scaffold at its root, as tall as the window;
 * this preview is a box 22 rem tall and adds no landmarks to the page around it.
 */
const preview = {
  blockSize: '22rem',
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
  // The router changes the page; the example keeps it in state. The page on screen stays current
  // until the next one arrives.
  const destinations: Destination[] = pages.map(({ id, label, href, icon }) => ({
    label,
    href,
    icon,
    current: id === shown,
    onSelect: () => open(id),
  }));
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBar={
        <TopBar
          title="Northwind"
          loading={next !== null}
          // The bar names the page it loads.
          loadingLabel={`Loading ${pages.find(({ id }) => id === next)?.label ?? 'page'}`}
        />
      }
      bodyRef={main}
      navigation={{
        rail: <Rail destinations={destinations} />,
        drawer: <Drawer destinations={destinations} />,
      }}
    >
      <Page width="md" header={<PageHeader title={page.label} headingLevel={3} />}>
        <Text emphasis="muted">{page.description}</Text>
      </Page>
    </Scaffold>
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
