import { useState } from 'react';
import { NavigationBar, type Destination } from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconPerson } from '@envsemble/envui/icons/Person';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';

const places = [
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox /> },
  { label: 'Saved', icon: <IconStar /> },
  { label: 'Profile', icon: <IconPerson /> },
  { label: 'Settings', icon: <IconSettings /> },
];

// Pass the outlined icons: the bar fills the icon of the place that is selected.
export default function OutlinedAndFilled() {
  const [current, setCurrent] = useState('Home');
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: current === place.label,
    onClick: () => setCurrent(place.label),
  }));
  return <NavigationBar aria-label="Main" destinations={destinations} />;
}
