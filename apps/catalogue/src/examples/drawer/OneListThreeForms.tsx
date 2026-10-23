import { Bar, Column, Drawer, Rail, Row, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

// One array, passed to each form; Scaffold shows the one that suits the window's width.
const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 4, current: true },
  { label: 'Projects', icon: <Folder />, href: '/projects', group: 'Work' },
  { label: 'Settings', icon: <Settings />, href: '/settings', group: 'Account' },
];

export default function OneListThreeForms() {
  return (
    <Column gap={5}>
      <Row gap={5} align="start" wrap>
        <Drawer aria-label="Drawer" destinations={destinations} />
        <Rail aria-label="Rail" destinations={destinations} />
      </Row>
      {/* As wide as a phone. */}
      <div style={{ inlineSize: 'min(100%, 24rem)' }}>
        <Bar aria-label="Bar" destinations={destinations} />
      </div>
    </Column>
  );
}
