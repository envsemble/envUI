import { useState } from 'react';
import { Button, CounterBadge, NavList, Column } from '@envsemble/envui';
import { AlternateEmail } from '@envsemble/envui/icons/AlternateEmail';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';

export default function UnreadCount() {
  const [unread, setUnread] = useState({ inbox: 12, assigned: 3, mentions: 0 });
  /** A count only where there is something new; its label says what the number counts. */
  const count = (value: number, noun: string) =>
    value > 0 ? <CounterBadge value={value} tone="accent" aria-label={`${value} ${noun}`} /> : null;
  return (
    // envUI has no sidebar here, outside an app frame: the navigation keeps to a sidebar's width.
    <Column gap={4} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <nav aria-label="Workspace">
        <NavList.Root>
          <NavList.Item href="/inbox" icon={<Inbox />} selected end={count(unread.inbox, 'unread')}>
            Inbox
          </NavList.Item>
          <NavList.Item
            href="/tasks/assigned"
            icon={<TaskAlt />}
            end={count(unread.assigned, 'new')}
          >
            Assigned to me
          </NavList.Item>
          <NavList.Item
            href="/mentions"
            icon={<AlternateEmail />}
            end={count(unread.mentions, 'new')}
          >
            Mentions
          </NavList.Item>
        </NavList.Root>
      </nav>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setUnread({ inbox: 0, assigned: 0, mentions: 0 })}
      >
        Mark all as read
      </Button>
    </Column>
  );
}
