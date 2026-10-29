import { Avatar, IconButton, NavigationRail, type Destination } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconInbox } from '@envsemble/envui/icons/Inbox';

const destinations: Destination[] = [
  { label: 'Inbox', icon: <IconInbox />, href: '/inbox', count: 4, current: true },
  { label: 'Projects', icon: <IconFolder />, href: '/projects' },
];

export default function RailAnatomy() {
  return (
    <div style={{ blockSize: '20rem' }}>
      <NavigationRail
        destinations={destinations}
        header={<IconButton variant="primary" icon={<IconEdit />} aria-label="New message" />}
        footer={<Avatar name="Alex Morgan" size="sm" />}
      />
    </div>
  );
}
