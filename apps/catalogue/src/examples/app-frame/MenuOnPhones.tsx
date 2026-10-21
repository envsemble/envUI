import { useState, type CSSProperties } from 'react';
import {
  Drawer,
  IconButton,
  Page,
  PageHeader,
  Scaffold,
  Sheet,
  Text,
  TopBar,
  type DrawerDestination,
} from '@envsemble/envui';
import { Menu } from '@envsemble/envui/icons/Menu';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '20rem' };

const chapters = ['Introduction', 'Installing', 'First project', 'Sharing'];

export default function MenuOnPhones() {
  const [current, setCurrent] = useState(chapters[0]);
  const [menu, setMenu] = useState(false);
  const destinations = (inSheet: boolean): DrawerDestination[] =>
    chapters.map((chapter) => ({
      label: chapter,
      href: `#${chapter.toLowerCase().replace(/\s+/g, '-')}`,
      current: chapter === current,
      onSelect: () => {
        setCurrent(chapter);
        if (inSheet) setMenu(false);
      },
    }));
  return (
    // Many destinations without icons: a drawer from medium, and on a phone none in the Scaffold,
    // but a menu button in the top bar that opens the same drawer in a sheet.
    <Scaffold
      landmarks={false}
      style={preview}
      forms={{ compact: 'none', medium: 'drawer' }}
      topBar={
        <TopBar
          start={
            <IconButton
              icon={<Menu />}
              aria-label="Open the chapters"
              variant="ghost"
              onClick={() => setMenu(true)}
            />
          }
          title="Guide"
        />
      }
      navigation={{ drawer: <Drawer aria-label="Chapters" destinations={destinations(false)} /> }}
    >
      <Page width="md" header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">On a phone, the menu button opens the chapters in a sheet.</Text>
      </Page>
      <Sheet side="start" aria-label="Chapters" width="md" open={menu} onOpenChange={setMenu}>
        <Drawer aria-label="Chapters" destinations={destinations(true)} />
      </Sheet>
    </Scaffold>
  );
}
