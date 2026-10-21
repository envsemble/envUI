import { IconButton, Rail, type Destination } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '/home' },
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', current: true },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
];

export default function ActionAtTheTop() {
  return (
    // As tall as a short window; in an app, Scaffold gives the rail the window's height.
    <div style={{ blockSize: '22rem' }}>
      <Rail
        destinations={destinations}
        header={<IconButton variant="primary" icon={<Edit />} aria-label="New message" />}
      />
    </div>
  );
}
