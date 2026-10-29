import { useState } from 'react';
import { NavigationBar, type Destination } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Person } from '@envsemble/envui/icons/Person';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';

const places = [
  { label: 'Home', icon: <Home /> },
  { label: 'Inbox', icon: <Inbox /> },
  { label: 'Saved', icon: <Star /> },
  { label: 'Profile', icon: <Person /> },
  { label: 'Settings', icon: <Settings /> },
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
