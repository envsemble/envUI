import { useState, type CSSProperties } from 'react';
import {
  NavigationBar,
  NavigationDrawer,
  IconButton,
  List,
  Page,
  PageHeader,
  NavigationRail,
  Scaffold,
  TopBar,
  type Destination,
} from '@envsemble/envui';
import { IconCategory } from '@envsemble/envui/icons/Category';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconLeftPanelClose } from '@envsemble/envui/icons/LeftPanelClose';
import { IconLeftPanelOpen } from '@envsemble/envui/icons/LeftPanelOpen';
import { IconSettings } from '@envsemble/envui/icons/Settings';

const previewWindow: CSSProperties = { blockSize: '22rem' };
const storageKey = 'navigation-narrow';
const projects = ['Launch brief', 'Budget 2026', 'Hiring plan'];

const destinations: Destination[] = [
  { label: 'Projects', icon: <IconCategory />, href: '#projects', current: true },
  { label: 'Members', icon: <IconGroup />, href: '#members' },
  { label: 'Settings', icon: <IconSettings />, href: '#settings' },
];

export default function NarrowNavigation() {
  const [narrow, setNarrow] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(storageKey) === 'true',
  );
  const toggle = () => {
    localStorage.setItem(storageKey, String(!narrow));
    setNarrow(!narrow);
  };
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={previewWindow}
      navigationForms={narrow ? { expanded: 'rail', large: 'rail' } : undefined}
      topBar={
        <TopBar
          start={
            <IconButton
              icon={narrow ? <IconLeftPanelOpen /> : <IconLeftPanelClose />}
              aria-label={narrow ? 'Show full navigation' : 'Narrow navigation'}
              onClick={toggle}
            />
          }
          title="Northwind"
        />
      }
      navigation={{
        bar: <NavigationBar aria-label="Main, narrowable" destinations={destinations} />,
        rail: <NavigationRail aria-label="Main, narrowable" destinations={destinations} />,
        drawer: <NavigationDrawer aria-label="Main, narrowable" destinations={destinations} />,
      }}
    >
      <Page header={<PageHeader title="Projects" headingLevel={3} />}>
        <List.Root aria-label="Projects">
          {projects.map((project) => (
            <List.Item key={project} label={project} />
          ))}
        </List.Root>
      </Page>
    </Scaffold>
  );
}
