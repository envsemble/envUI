import { useState } from 'react';
import { Button, Drawer, type Destination } from '@envsemble/envui';
import { AlternateEmail } from '@envsemble/envui/icons/AlternateEmail';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';

export default function UnreadCount() {
  const [unread, setUnread] = useState({ inbox: 12, assigned: 3, mentions: 0 });
  // A count of 0 shows nothing; any other is said with the label, such as Inbox, 12 new.
  const destinations: Destination[] = [
    { label: 'Inbox', icon: <Inbox />, href: '/inbox', count: unread.inbox, current: true },
    { label: 'Assigned to me', icon: <TaskAlt />, href: '/tasks/assigned', count: unread.assigned },
    { label: 'Mentions', icon: <AlternateEmail />, href: '/mentions', count: unread.mentions },
  ];
  return (
    <Drawer
      aria-label="Workspace"
      destinations={destinations}
      footer={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setUnread({ inbox: 0, assigned: 0, mentions: 0 })}
        >
          Mark all as read
        </Button>
      }
    />
  );
}
