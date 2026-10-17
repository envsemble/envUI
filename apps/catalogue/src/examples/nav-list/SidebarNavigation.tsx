import { useState } from 'react';
import { CounterBadge, NavList } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function SidebarNavigation() {
  // The router knows the current page; here a click stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    selected: current === href,
    onClick: () => setCurrent(href),
  });
  return (
    <nav aria-label="Workspace">
      <NavList.Root>
        <NavList.Item {...destination('/home')} icon={<Home />}>
          Home
        </NavList.Item>
        <NavList.Item
          {...destination('/inbox')}
          icon={<Inbox />}
          end={<CounterBadge value={4} aria-label="4 unread" />}
        >
          Inbox
        </NavList.Item>
        <NavList.Item {...destination('/projects')} icon={<Folder />}>
          Projects
        </NavList.Item>
        <NavList.Item {...destination('/settings')} icon={<Settings />}>
          Settings
        </NavList.Item>
      </NavList.Root>
    </nav>
  );
}
