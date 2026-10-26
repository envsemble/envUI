import { useRef, useState, type CSSProperties } from 'react';
import {
  Drawer,
  IconButton,
  Page,
  PageHeader,
  Scaffold,
  Sheet,
  Text,
  TopBar,
  useContainerSize,
  windowClasses,
  type DrawerDestination,
} from '@envsemble/envui';
import { Menu } from '@envsemble/envui/icons/Menu';

/** Stands in for the window: a Scaffold fills its container, the window's height by default. */
const preview: CSSProperties = { blockSize: '20rem' };

const chapters = ['Introduction', 'Installing', 'First project', 'Sharing'];

const summaries: Record<string, string> = {
  Introduction: 'What the guide covers, and who it is for.',
  Installing: 'Download the app and sign in with your work account.',
  'First project': 'Create a project and invite your team to it.',
  Sharing: 'Share a project with people outside your team.',
};

/** A width in rem, such as a window class's, in CSS pixels at the document's font size. */
const remToPixels = (width: string) =>
  Number.parseFloat(width) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

export default function MenuOnPhones() {
  const [current, setCurrent] = useState(chapters[0]);
  const [menu, setMenu] = useState(false);
  // The menu button shows only where the Scaffold shows no navigation: in a compact width.
  const frame = useRef<HTMLDivElement>(null);
  const size = useContainerSize(frame);
  const compact = size !== undefined && size.inlineSize < remToPixels(windowClasses.medium);
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
      ref={frame}
      scroll="body"
      landmarks={false}
      style={preview}
      forms={{ compact: 'none', medium: 'drawer' }}
      topBar={
        <TopBar
          start={
            compact && (
              <IconButton
                icon={<Menu />}
                aria-label="Open the chapters"
                variant="ghost"
                onClick={() => setMenu(true)}
              />
            )
          }
          title="Guide"
        />
      }
      navigation={{ drawer: <Drawer aria-label="Chapters" destinations={destinations(false)} /> }}
    >
      <Page width="md" header={<PageHeader title={current} headingLevel={3} />}>
        <Text emphasis="muted">{summaries[current]}</Text>
      </Page>
      <Sheet side="start" aria-label="Chapters" width="md" open={menu} onOpenChange={setMenu}>
        <Drawer aria-label="Chapters" destinations={destinations(true)} />
      </Sheet>
    </Scaffold>
  );
}
