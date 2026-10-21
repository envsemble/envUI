import type { CSSProperties } from 'react';
import { Drawer, Page, PageHeader, Scaffold, Text, TopBar } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Home } from '@envsemble/envui/icons/Home';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

export default function WithNavigation() {
  return (
    // The title bar runs across the window, above the navigation, as the window controls need.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      topBarSpan="full"
      topBar={<TopBar titleBar title="Northwind" />}
      navigation={{
        drawer: (
          <Drawer
            destinations={[
              { label: 'Home', icon: <Home />, href: '#home', current: true },
              { label: 'Documents', icon: <Description />, href: '#documents' },
            ]}
          />
        ),
      }}
    >
      <Page header={<PageHeader title="Home" headingLevel={2} />}>
        <Text emphasis="muted">What changed since you last looked.</Text>
      </Page>
    </Scaffold>
  );
}
