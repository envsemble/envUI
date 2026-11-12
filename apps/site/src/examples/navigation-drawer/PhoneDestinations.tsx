import { useState } from 'react';
import { NavigationBar, type Destination } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconSettings } from '@envsemble/envui/icons/Settings';

export default function PhoneDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...destination('/home') },
    { label: 'Inbox', icon: <IconInbox />, count: 4, ...destination('/inbox') },
    { label: 'Projects', icon: <IconFolder />, ...destination('/projects') },
    { label: 'Settings', icon: <IconSettings />, ...destination('/settings') },
  ];
  return (
    // As wide as a phone; in an app, Scaffold places the bar at the bottom of the window.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <NavigationBar destinations={destinations} />
    </div>
  );
}
