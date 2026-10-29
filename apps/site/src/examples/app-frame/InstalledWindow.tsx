import type { CSSProperties } from 'react';
import {
  NavigationDrawer,
  Menu,
  Menubar,
  Page,
  PageHeader,
  Scaffold,
  Text,
  TopBar,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Home } from '@envsemble/envui/icons/Home';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

export default function InstalledWindow() {
  return (
    // The title bar runs across the window, above the navigation, as the window controls need,
    // and only the body scrolls below it.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBarSpan="full"
      topBar={
        <TopBar
          titleBar
          title="Northwind"
          start={
            <Menubar.Root aria-label="Application menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="View">
                <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          }
        />
      }
      navigation={{
        drawer: (
          <NavigationDrawer
            destinations={[
              { label: 'Home', icon: <Home />, href: '#home', current: true },
              { label: 'Documents', icon: <Description />, href: '#documents' },
            ]}
          />
        ),
      }}
    >
      <Page header={<PageHeader title="Home" headingLevel={3} />}>
        <Text emphasis="muted">What changed since you last looked.</Text>
      </Page>
    </Scaffold>
  );
}
