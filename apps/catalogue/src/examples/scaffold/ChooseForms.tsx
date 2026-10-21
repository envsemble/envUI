import type { CSSProperties } from 'react';
import { Column, NavList, Page, PageHeader, Scaffold, Text, TopBar } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

export default function ChooseForms() {
  return (
    // An application with a drawer only: it shows from medium, and a compact width shows none,
    // where the application opens its navigation from the top bar instead.
    <Scaffold
      landmarks={false}
      style={preview}
      forms={{ compact: 'none' }}
      topBar={<TopBar title="Settings" />}
      navigation={{
        drawer: (
          <Column
            render={<nav aria-label="Settings" />}
            padding={3}
            style={{ inlineSize: '12rem' }}
          >
            <NavList.Root>
              <NavList.Item icon={<Home />} selected>
                General
              </NavList.Item>
              <NavList.Item icon={<Settings />}>Advanced</NavList.Item>
            </NavList.Root>
          </Column>
        ),
      }}
    >
      <Page width="sm" header={<PageHeader title="General" headingLevel={3} />}>
        <Text emphasis="muted">Medium and wider show the drawer; compact shows none.</Text>
      </Page>
    </Scaffold>
  );
}
