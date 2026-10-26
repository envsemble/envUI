import { useState, type CSSProperties } from 'react';
import {
  Bar,
  Drawer,
  IconButton,
  Page,
  PageHeader,
  Rail,
  Scaffold,
  Text,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Group } from '@envsemble/envui/icons/Group';
import { LeftPanelClose } from '@envsemble/envui/icons/LeftPanelClose';
import { LeftPanelOpen } from '@envsemble/envui/icons/LeftPanelOpen';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '22rem' };
const storageKey = 'navigation-narrow';

const destinations: Destination[] = [
  { label: 'Projects', icon: <Category />, href: '#projects', current: true },
  { label: 'Members', icon: <Group />, href: '#members' },
  { label: 'Settings', icon: <Settings />, href: '#settings' },
];

export default function NarrowNavigation() {
  // The choice is remembered between visits.
  const [narrow, setNarrow] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(storageKey) === 'true',
  );
  const toggle = () => {
    localStorage.setItem(storageKey, String(!narrow));
    setNarrow(!narrow);
  };
  return (
    // The button doesn't hide or restyle the navigation: it asks the Scaffold for the rail in
    // place of the drawer through forms, and a compact width keeps the bar.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      forms={narrow ? { expanded: 'rail', large: 'rail' } : undefined}
      topBar={
        <TopBar
          start={
            <IconButton
              icon={narrow ? <LeftPanelOpen /> : <LeftPanelClose />}
              aria-label={narrow ? 'Show full navigation' : 'Narrow navigation'}
              onClick={toggle}
            />
          }
          title="Northwind"
        />
      }
      navigation={{
        bar: <Bar aria-label="Main, narrowable" destinations={destinations} />,
        rail: <Rail aria-label="Main, narrowable" destinations={destinations} />,
        drawer: <Drawer aria-label="Main, narrowable" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title="Projects" headingLevel={3} />}>
        <Text emphasis="muted">Website refresh, Quarterly report and four more.</Text>
      </Page>
    </Scaffold>
  );
}
