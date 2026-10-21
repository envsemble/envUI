import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Button,
  Column,
  IconButton,
  NavList,
  Page,
  PageHeader,
  Row,
  Scaffold,
  Text,
  TopBar,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Search } from '@envsemble/envui/icons/Search';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '22rem' };

interface Destination {
  label: string;
  icon: ReactNode;
}

const destinations: Destination[] = [
  { label: 'Home', icon: <Home /> },
  { label: 'Inbox', icon: <Inbox /> },
  { label: 'Projects', icon: <Category /> },
];

export default function NavigationForms() {
  const [current, setCurrent] = useState('Home');
  return (
    // The same destinations in each form; the Scaffold shows the one for its own width: the bar
    // in a compact width, the rail in a medium one and the drawer from expanded.
    <Scaffold
      landmarks={false}
      style={preview}
      topBar={
        <TopBar title="Northwind" actions={<IconButton icon={<Search />} aria-label="Search" />} />
      }
      navigation={{
        bar: (
          <Row render={<nav aria-label="Primary" />} justify="between" padding={2}>
            {destinations.map(({ label, icon }) => (
              <Button
                key={label}
                variant="ghost"
                startIcon={icon}
                aria-current={label === current ? 'page' : undefined}
                onClick={() => setCurrent(label)}
              >
                {label}
              </Button>
            ))}
          </Row>
        ),
        rail: (
          <Column render={<nav aria-label="Primary" />} gap={2} padding={2}>
            {destinations.map(({ label, icon }) => (
              <IconButton
                key={label}
                icon={icon}
                aria-label={label}
                aria-current={label === current ? 'page' : undefined}
                onClick={() => setCurrent(label)}
              />
            ))}
          </Column>
        ),
        drawer: (
          <Column render={<nav aria-label="Primary" />} padding={3} style={{ inlineSize: '14rem' }}>
            <NavList.Root>
              {destinations.map(({ label, icon }) => (
                <NavList.Item
                  key={label}
                  icon={icon}
                  selected={label === current}
                  onClick={() => setCurrent(label)}
                >
                  {label}
                </NavList.Item>
              ))}
            </NavList.Root>
          </Column>
        ),
      }}
    >
      <Page header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">The body scrolls under the top bar.</Text>
      </Page>
    </Scaffold>
  );
}
