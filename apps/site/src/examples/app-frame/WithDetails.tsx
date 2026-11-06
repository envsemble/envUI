import { useState, type CSSProperties } from 'react';
import {
  NavigationBar,
  Column,
  NavigationDrawer,
  Panes,
  NavigationRail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconHome } from '@envsemble/envui/icons/Home';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '20rem' };

export default function WithDetails() {
  const [details, setDetails] = useState(false);
  const destinations: Destination[] = [
    { label: 'Home', icon: <IconHome />, href: '/' },
    { label: 'Documents', icon: <IconDescription />, href: '/documents', current: true },
  ];
  return (
    // Side content that is not navigation goes in a supporting pane in the body: Panes fill the
    // Scaffold's body, and each pane scrolls on its own.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBar={<TopBar title="Documents" />}
      navigation={{
        bar: <NavigationBar aria-label="Main, with details" destinations={destinations} />,
        rail: <NavigationRail aria-label="Main, with details" destinations={destinations} />,
        drawer: <NavigationDrawer aria-label="Main, with details" destinations={destinations} />,
      }}
    >
      <Panes.Root behavior="supporting" open={details} onOpenChange={setDetails}>
        <Panes.Main label="Quarterly report">
          <Column gap={3} padding={4} align="start">
            <Text>Revenue grew in every region.</Text>
            <Panes.Trigger variant="secondary">Details</Panes.Trigger>
          </Column>
        </Panes.Main>
        <Panes.Supporting label="Details">
          <Column gap={2} padding={4}>
            <Text variant="title" render={<h3 />}>
              Quarterly report
            </Text>
            <Text emphasis="muted">Owner: Sam Lee</Text>
          </Column>
        </Panes.Supporting>
      </Panes.Root>
    </Scaffold>
  );
}
