import { useState } from 'react';
import {
  NavigationBar,
  Button,
  NavigationDrawer,
  Page,
  PageHeader,
  Panes,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Folder } from '@envsemble/envui/icons/Folder';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Settings } from '@envsemble/envui/icons/Settings';

const destinations: Destination[] = [
  { label: 'Home', icon: <Home />, href: '#home' },
  { label: 'Inbox', icon: <Inbox />, href: '#inbox', current: true },
  { label: 'Projects', icon: <Folder />, href: '#projects' },
  { label: 'Settings', icon: <Settings />, href: '#settings' },
];

/**
 * The default arrangement of an application, mounted with ?fixture=scaffold-panes: a Scaffold whose
 * document scrolls, with a TopBar and the real NavigationBar, NavigationRail and NavigationDrawer, around a Page with a sticky
 * header whose content is supporting Panes. The main pane is a long list of messages, each a
 * button, and the supporting pane, a sheet below expanded, holds a message's details.
 */
export function ScaffoldPanesFixture() {
  const [open, setOpen] = useState(false);
  return (
    <Scaffold
      topBar={<TopBar title="Mail" />}
      navigation={{
        bar: <NavigationBar destinations={destinations} />,
        rail: <NavigationRail destinations={destinations} />,
        drawer: <NavigationDrawer destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title="Inbox" sticky data-testid="page-header" />}>
        <Panes.Root behavior="supporting" open={open} onOpenChange={setOpen}>
          <Panes.Main label="Messages">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Show details
            </Button>
            <ul aria-label="Messages" data-testid="messages">
              {Array.from({ length: 60 }, (_, index) => (
                <li key={index}>
                  <button type="button">Message {index + 1}</button>
                </li>
              ))}
            </ul>
          </Panes.Main>
          <Panes.Supporting label="Details">
            <Text>From: Ada</Text>
            {Array.from({ length: 40 }, (_, index) => (
              <Text key={index}>Detail line {index + 1}</Text>
            ))}
            <Button variant="secondary">Reply</Button>
          </Panes.Supporting>
        </Panes.Root>
      </Page>
    </Scaffold>
  );
}
