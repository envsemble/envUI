import { useState } from 'react';
import { Graphic, NavigationDrawer, type Destination } from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';

/** An icon of the application's own, as an SVG component with a viewBox. */
function IconPipeline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm14 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-7 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM8 5h8v2H8Zm3 2h2v8h-2Z" />
    </svg>
  );
}

export default function OwnIcons() {
  // The router knows the current page; here a press stands in for it.
  const [current, setCurrent] = useState('/pipelines');
  const destination = (href: string) => ({
    href,
    current: current === href,
    onClick: () => setCurrent(href),
  });
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...destination('/home') },
    {
      label: 'Pipelines',
      icon: (
        <Graphic alt="" tint="text">
          <IconPipeline />
        </Graphic>
      ),
      ...destination('/pipelines'),
    },
    { label: 'Starred', icon: <IconStar />, ...destination('/starred') },
    { label: 'Settings', icon: <IconSettings />, ...destination('/settings') },
  ];
  return <NavigationDrawer destinations={destinations} />;
}
