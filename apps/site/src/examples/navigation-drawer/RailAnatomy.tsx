import { Avatar, IconButton, NavigationRail, type Destination } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Inbox } from '@envsemble/envui/icons/Inbox';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: 4, current: true },
  { label: 'Projects', icon: <Folder />, href: '/projects' },
];

export default function RailAnatomy() {
  return (
    <div style={{ blockSize: '20rem' }}>
      <NavigationRail
        destinations={destinations}
        header={<IconButton variant="primary" icon={<Edit />} aria-label="New message" />}
        footer={<Avatar name="Alex Morgan" size="sm" />}
      />
    </div>
  );
}
