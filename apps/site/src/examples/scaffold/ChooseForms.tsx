import { useRef, useState, type CSSProperties } from 'react';
import {
  IconButton,
  NavigationDrawer,
  Page,
  PageHeader,
  Scaffold,
  Sheet,
  Text,
  TopBar,
  useContainerSize,
  windowClassOf,
  type NavigationDrawerDestination,
} from '@envsemble/envui';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconMenu } from '@envsemble/envui/icons/Menu';
import { IconSettings } from '@envsemble/envui/icons/Settings';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '18rem' };

const destinations: NavigationDrawerDestination[] = [
  { label: 'General', icon: <IconHome />, href: '#general', current: true },
  { label: 'Advanced', icon: <IconSettings />, href: '#advanced' },
];

export default function ChooseForms() {
  const [menu, setMenu] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const size = useContainerSize(frame);
  const compact = size !== undefined && windowClassOf(size.inlineSize) === 'compact';
  return (
    // An application with a drawer only: it shows from medium, and a compact width shows none,
    // where a menu button in the top bar opens the same drawer in a sheet.
    <Scaffold
      ref={frame}
      scroll="body"
      landmarks={false}
      style={preview}
      navigationForms={{ compact: 'none' }}
      topBar={
        <TopBar
          start={
            compact && (
              <IconButton
                icon={<IconMenu />}
                aria-label="Open the navigation"
                variant="ghost"
                onClick={() => setMenu(true)}
              />
            )
          }
          title="Settings"
        />
      }
      navigation={{
        drawer: <NavigationDrawer aria-label="Settings" destinations={destinations} />,
      }}
    >
      <Page width="sm" header={<PageHeader title="General" headingLevel={3} />}>
        <Text emphasis="muted">The workspace name, language and time zone for Northwind.</Text>
      </Page>
      <Sheet
        side="start"
        aria-label="Settings"
        width="md"
        open={menu && compact}
        onOpenChange={setMenu}
      >
        <NavigationDrawer aria-label="Settings" destinations={destinations} />
      </Sheet>
    </Scaffold>
  );
}
