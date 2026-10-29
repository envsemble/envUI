import { useState, type CSSProperties } from 'react';
import {
  Bar,
  Drawer,
  IconButton,
  List,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '22rem' };

/** What each destination shows: a list longer than the window, which scrolls under the bars. */
const contents: Record<string, { label: string; description: string }[]> = {
  Home: [
    { label: 'Website refresh', description: 'Updated today by Priya Shah' },
    { label: 'Quarterly report', description: 'Updated yesterday by Sam Lee' },
    { label: 'Onboarding guide', description: 'Updated on 4 March by Alex Morgan' },
    { label: 'Mobile release', description: 'Updated on 2 March by Jordan Kim' },
    { label: 'Data migration', description: 'Updated on 27 February by Chen Wei' },
    { label: 'Annual review', description: 'Updated on 20 February by Maria Garcia' },
  ],
  Inbox: [
    { label: 'Priya Shah', description: 'Shared the launch plan with you' },
    { label: 'Sam Lee', description: 'Commented on the quarterly report' },
    { label: 'Jordan Kim', description: 'Invited you to Mobile release' },
  ],
  Projects: [
    { label: 'Website refresh', description: 'Due on 14 March' },
    { label: 'Quarterly report', description: 'Due on 31 March' },
    { label: 'Onboarding guide', description: 'Due on 6 April' },
    { label: 'Mobile release', description: 'Due on 20 April' },
    { label: 'Data migration', description: 'Due on 4 May' },
    { label: 'Annual review', description: 'Due on 29 May' },
  ],
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
    onClick: () => setCurrent(destination.label),
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
        <List.Root aria-label={current}>
          {contents[current]?.map((item) => (
            <List.Item key={item.label} label={item.label} description={item.description} />
          ))}
        </List.Root>
      </Page>
    </Scaffold>
  );
}
