import type { CSSProperties } from 'react';
import { Drawer, Page, PageHeader, Scaffold, Text, TopBar } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

export default function ChooseForms() {
  return (
    // An application with a drawer only: it shows from medium, and a compact width shows none,
    // where the application opens its navigation from the top bar instead.
    <Scaffold
      scroll="body"
      landmarks={false}
      style={preview}
      forms={{ compact: 'none' }}
      topBar={<TopBar title="Settings" />}
      navigation={{
        drawer: (
          <Drawer
            aria-label="Settings"
            destinations={[
              { label: 'General', icon: <Home />, href: '#general', current: true },
              { label: 'Advanced', icon: <Settings />, href: '#advanced' },
            ]}
          />
        ),
      }}
    >
      <Page width="sm" header={<PageHeader title="General" headingLevel={3} />}>
        <Text emphasis="muted">Your name, language and time zone.</Text>
      </Page>
    </Scaffold>
  );
}
