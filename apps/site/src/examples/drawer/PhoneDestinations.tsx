import { useState } from 'react';
import { Bar, type Destination } from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function PhoneDestinations() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/inbox');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <Home />, ...destination('/home') },
    { label: 'Inbox', icon: <Inbox />, count: 4, ...destination('/inbox') },
    { label: 'Projects', icon: <Folder />, ...destination('/projects') },
    { label: 'Settings', icon: <Settings />, ...destination('/settings') },
  ];
  return (
    // As wide as a phone; in an app, Scaffold places the bar at the bottom of the window.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Bar destinations={destinations} />
    </div>
  );
}
