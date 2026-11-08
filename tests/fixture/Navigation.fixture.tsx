import { useState, type ComponentPropsWithRef } from 'react';
import {
  Badge,
  NavigationBar,
  Button,
  Icon,
  LinkProvider,
  NavigationDrawer,
  NavigationRail,
  Surface,
  Theme,
  TopBar,
  type Destination,
  type ColorScheme,
} from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDrafts } from '@envsemble/envui/icons/Drafts';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconLabel } from '@envsemble/envui/icons/Label';
import { IconSend } from '@envsemble/envui/icons/Send';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';

export const themes = true;

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
 * NavigationBar, NavigationRail and NavigationDrawer over the same destinations, in both themes, mounted with
 * ?fixture=navigation: icon fill, counts, groups, the NavigationBar's More menu, landmark names and routing.
 */
export default function NavigationFixture({ theme }: { theme: ColorScheme }) {
  const icons = useDestinations('Home');
  const mail = useDestinations('Inbox');
  const many = useDestinations('Labels');
  const iconDestinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, ...icons.select('Home') },
    {
      label: 'Settings',
      // A Material Symbol inside the application's own wrapper fills too.
      icon: (
        <span>
          <IconSettings />
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
    { label: 'Inbox', icon: <IconInbox />, count: 3, ...mail.select('Inbox') },
    { label: 'Drafts', icon: <IconDrafts />, count: 0, ...mail.select('Drafts') },
    { label: 'Sent', icon: <IconSend />, count: 1200, ...mail.select('Sent') },
    { label: 'Starred', icon: <IconStar />, group: 'Folders', ...mail.select('Starred') },
    { label: 'Archive', icon: <IconArchive />, group: 'Folders', ...mail.select('Archive') },
    { label: 'Settings', icon: <IconSettings />, group: 'Account', ...mail.select('Settings') },
  ];
  const manyDestinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, href: '#home' },
    { label: 'Inbox', icon: <IconInbox />, href: '#inbox', count: 2 },
    { label: 'Drafts', icon: <IconDrafts />, href: '#drafts' },
    { label: 'Sent', icon: <IconSend />, href: '#sent' },
    { label: 'Labels', icon: <IconLabel />, count: 4, ...many.select('Labels') },
    { label: 'Archive', icon: <IconArchive />, href: '#archive', count: 1 },
    { label: 'Trash', icon: <IconDelete />, href: '#trash' },
  ];
  const linked: Destination[] = [
    { label: 'Home', icon: <IconHome />, href: '#home', current: true },
    { label: 'Inbox', icon: <IconInbox />, href: '#inbox' },
  ];
  return (
    <Theme theme={theme} data-testid={`navigation-${theme}`} className="fixture-section">
      <div data-testid="icons">
        <NavigationDrawer aria-label="Icon fill" destinations={iconDestinations} />
      </div>
      <div className="fixture-navigation-forms" data-testid="forms">
        <NavigationDrawer
          aria-label="Mail drawer"
          destinations={mailDestinations}
          header={<Button size="sm">Compose</Button>}
          footer={<span>Footer</span>}
        />
        <NavigationRail aria-label="Mail rail" destinations={mailDestinations} />
        <div className="fixture-navigation-bars">
          <NavigationBar aria-label="Mail bar" destinations={mailDestinations.slice(0, 4)} />
          <NavigationBar aria-label="Five bar" destinations={mailDestinations.slice(0, 5)} />
          <NavigationBar aria-label="Many bar" destinations={manyDestinations} />
          <NavigationBar destinations={linked} />
        </div>
      </div>
      {/* The backgrounds: each form and the top bar on the navigation's background by default,
          the page's on its own, and on a surface the surface's color. */}
      <div className="fixture-navigation-backgrounds" data-testid="backgrounds">
        <TopBar title="Filled" data-testid="top-bar-default" />
        <TopBar title="On the page" background="page" data-testid="top-bar-none" />
        <NavigationDrawer aria-label="Filled drawer" destinations={linked} />
        <NavigationDrawer aria-label="Plain drawer" background="page" destinations={linked} />
        <NavigationRail aria-label="Filled rail" destinations={linked} />
        <NavigationRail aria-label="Plain rail" background="page" destinations={linked} />
        <NavigationBar aria-label="Filled bar" destinations={linked} />
        <NavigationBar aria-label="Plain bar" background="page" destinations={linked} />
        <Surface background="muted" padding={0} radius="none" data-testid="surface">
          <NavigationDrawer aria-label="Drawer on a surface" destinations={linked} />
        </Surface>
      </div>
      <p data-testid="current">{`${mail.current}, ${many.current}`}</p>
      <NavigationDrawer
        aria-label="Badged drawer"
        destinations={[
          { label: 'Reports', href: '#reports', badge: <Badge tone="success">New</Badge> },
          { label: 'Archive', href: '#archive', count: 2, badge: <Badge>Beta</Badge> },
        ]}
      />
      <LinkProvider component={RouterLink}>
        <h2 id={`routed-heading-${theme}`}>Routed</h2>
        <NavigationRail aria-labelledby={`routed-heading-${theme}`} destinations={linked} />
      </LinkProvider>
    </Theme>
  );
}
