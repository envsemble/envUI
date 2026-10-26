import { useState, type CSSProperties } from 'react';
import {
  Bar,
  Drawer,
  IconButton,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '22rem' };

const summaries: Record<string, string> = {
  Home: 'Welcome back, Alex Morgan.',
  Inbox: 'Three messages since yesterday.',
  Projects: 'Website refresh, Quarterly report and four more.',
};

export default function NavigationForms() {
  const [current, setCurrent] = useState('Home');
  // One array of destinations, which each navigation form takes.
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home /> },
    { label: 'Inbox', icon: <Inbox />, count: 3 },
    { label: 'Projects', icon: <Category /> },
  ].map((destination) => ({
    ...destination,
    current: destination.label === current,
    onSelect: () => setCurrent(destination.label),
  }));
  return (
    // The Scaffold shows the form for its own width: the bar in a compact width, the rail in a
    // medium one and the drawer from expanded.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBar={
        <TopBar title="Northwind" actions={<IconButton icon={<Search />} aria-label="Search" />} />
      }
      navigation={{
        bar: <Bar destinations={destinations} />,
        rail: <Rail destinations={destinations} />,
        drawer: <Drawer destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">{summaries[current]}</Text>
      </Page>
    </Scaffold>
  );
}
