import type { CSSProperties } from 'react';
import { Menu, Menubar, Page, PageHeader, Scaffold, Text, TopBar } from '@envsemble/envui';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

export default function WithMenubar() {
  return (
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBarSpan="full"
      topBar={
        <TopBar
          titleBar
          title="Roadmap.md"
          start={
            <Menubar.Root aria-label="Application menu">
              <Menubar.Menu label="File">
                <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="View">
                <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          }
        />
      }
    >
      <Page width="md" header={<PageHeader title="Roadmap" headingLevel={2} sticky />}>
        <Text>The page header sticks at the top of the body as it scrolls.</Text>
        <div style={{ blockSize: '30rem' }} />
      </Page>
    </Scaffold>
  );
}
