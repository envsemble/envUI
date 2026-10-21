import { useState } from 'react';
import { CounterBadge, IconButton, NavList, Column } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Drafts } from '@envsemble/envui/icons/Drafts';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Menu } from '@envsemble/envui/icons/Menu';
import { MenuOpen } from '@envsemble/envui/icons/MenuOpen';
import { Send } from '@envsemble/envui/icons/Send';

const folders = [
  { href: '/inbox', label: 'Inbox', icon: Inbox, unread: 12 },
  { href: '/drafts', label: 'Drafts', icon: Drafts, unread: 0 },
  { href: '/sent', label: 'Sent', icon: Send, unread: 0 },
  { href: '/archive', label: 'Archive', icon: Archive, unread: 0 },
];

export default function CollapsedSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [current, setCurrent] = useState('/inbox');
  return (
    <Column gap={2} align="start">
      <IconButton
        variant="ghost"
        icon={collapsed ? <Menu /> : <MenuOpen />}
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        onClick={() => setCollapsed((value) => !value)}
      />
      <nav aria-label="Mail folders">
        <NavList.Root>
          {folders.map((folder) => (
            <NavList.Item
              key={folder.href}
              href={folder.href}
              selected={current === folder.href}
              onClick={() => setCurrent(folder.href)}
              iconOnly={collapsed}
              icon={<folder.icon />}
              // The item adds the count to its name, such as Inbox, 3 new.
              aria-label={folder.label}
              end={folder.unread ? <CounterBadge value={folder.unread} /> : undefined}
            >
              {folder.label}
            </NavList.Item>
          ))}
        </NavList.Root>
      </nav>
    </Column>
  );
}
