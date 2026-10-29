import { useState, type ComponentPropsWithRef } from 'react';
import {
  Bar,
  Button,
  Icon,
  LinkProvider,
  Drawer,
  Rail,
  Surface,
  Theme,
  TopBar,
  type Destination,
  type ColorScheme,
} from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Drafts } from '@envsemble/envui/icons/Drafts';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Label } from '@envsemble/envui/icons/Label';
import { Send } from '@envsemble/envui/icons/Send';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';

/** A router's link: it marks the anchors it renders, so a test sees that destinations use it. */
function RouterLink(props: ComponentPropsWithRef<'a'> & { href: string }) {
  return <a {...props} data-router-link="" />;
}

/** Destinations whose current one follows a press, as an application's router would set it. */
function useDestinations(start: string) {
  const [current, setCurrent] = useState(start);
  const select = (label: string) => ({
    current: current === label,
    onClick: () => setCurrent(label),
  });
  return { current, select };
}

/**
 * Bar, Rail and Drawer over the same destinations, in both themes, mounted with
 * ?fixture=navigation: icon fill, counts, groups, the Bar's More menu, landmark names and routing.
 */
export function NavigationFixture({ theme }: { theme: ColorScheme }) {
  const icons = useDestinations('Home');
  const mail = useDestinations('Inbox');
  const many = useDestinations('Labels');
  const iconDestinations: Destination[] = [
    { label: 'Home', icon: <Home />, ...icons.select('Home') },
    {
      label: 'Settings',
      // A Material Symbol inside the application's own wrapper fills too.
      icon: (
        <span>
          <Settings />
        </span>
      ),
      ...icons.select('Settings'),
    },
    {
      label: 'Custom',
      icon: (
        <Icon viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
        </Icon>
      ),
      ...icons.select('Custom'),
    },
  ];
  const mailDestinations: Destination[] = [
    { label: 'Inbox', icon: <Inbox />, count: 3, ...mail.select('Inbox') },
    { label: 'Drafts', icon: <Drafts />, count: 0, ...mail.select('Drafts') },
    { label: 'Sent', icon: <Send />, count: 1200, ...mail.select('Sent') },
    { label: 'Starred', icon: <Star />, group: 'Folders', ...mail.select('Starred') },
    { label: 'Archive', icon: <Archive />, group: 'Folders', ...mail.select('Archive') },
    { label: 'Settings', icon: <Settings />, group: 'Account', ...mail.select('Settings') },
  ];
  const manyDestinations: Destination[] = [
    { label: 'Home', icon: <Home />, href: '#home' },
    { label: 'Inbox', icon: <Inbox />, href: '#inbox', count: 2 },
    { label: 'Drafts', icon: <Drafts />, href: '#drafts' },
    { label: 'Sent', icon: <Send />, href: '#sent' },
    { label: 'Labels', icon: <Label />, count: 4, ...many.select('Labels') },
    { label: 'Archive', icon: <Archive />, href: '#archive', count: 1 },
    { label: 'Trash', icon: <Delete />, href: '#trash' },
  ];
  const linked: Destination[] = [
    { label: 'Home', icon: <Home />, href: '#home', current: true },
    { label: 'Inbox', icon: <Inbox />, href: '#inbox' },
  ];
  return (
    <Theme theme={theme} data-testid={`navigation-${theme}`} className="fixture-section">
      <div data-testid="icons">
        <Drawer aria-label="Icon fill" destinations={iconDestinations} />
      </div>
      <div className="fixture-navigation-forms" data-testid="forms">
        <Drawer
          aria-label="Mail drawer"
          destinations={mailDestinations}
          header={<Button size="sm">Compose</Button>}
          footer={<span>Footer</span>}
        />
        <Rail aria-label="Mail rail" destinations={mailDestinations} />
        <div className="fixture-navigation-bars">
          <Bar aria-label="Mail bar" destinations={mailDestinations.slice(0, 4)} />
          <Bar aria-label="Five bar" destinations={mailDestinations.slice(0, 5)} />
          <Bar aria-label="Many bar" destinations={manyDestinations} />
          <Bar destinations={linked} />
        </div>
      </div>
      {/* The backgrounds: each form and the top bar on the navigation's background by default,
          the page's on its own, and on a surface the surface's color. */}
      <div className="fixture-navigation-backgrounds" data-testid="backgrounds">
        <TopBar title="Filled" data-testid="top-bar-default" />
        <TopBar title="On the page" background="page" data-testid="top-bar-none" />
        <Drawer aria-label="Filled drawer" destinations={linked} />
        <Drawer aria-label="Plain drawer" background="page" destinations={linked} />
        <Rail aria-label="Filled rail" destinations={linked} />
        <Rail aria-label="Plain rail" background="page" destinations={linked} />
        <Bar aria-label="Filled bar" destinations={linked} />
        <Bar aria-label="Plain bar" background="page" destinations={linked} />
        <Surface background="muted" padding={0} radius="none" data-testid="surface">
          <Drawer aria-label="Drawer on a surface" destinations={linked} />
        </Surface>
      </div>
      <p data-testid="current">{`${mail.current}, ${many.current}`}</p>
      <LinkProvider component={RouterLink}>
        <h2 id={`routed-heading-${theme}`}>Routed</h2>
        <Rail aria-labelledby={`routed-heading-${theme}`} destinations={linked} />
      </LinkProvider>
    </Theme>
  );
}
