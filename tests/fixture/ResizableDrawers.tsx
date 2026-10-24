import { useState, type ReactNode } from 'react';
import { Drawer, type DrawerDestination } from '@envsemble/envui';

const destinations: DrawerDestination[] = [
  { label: 'Inbox', href: '#inbox', current: true },
  { label: 'Drafts', href: '#drafts' },
  { label: 'Archive', href: '#archive' },
];

/** A drawer beside some content in a container of a given width, as in a Scaffold. */
function Frame({ width, dir, children }: { width: string; dir?: 'rtl'; children: ReactNode }) {
  return (
    <div
      dir={dir}
      style={{
        containerType: 'inline-size',
        display: 'flex',
        inlineSize: width,
        blockSize: '12rem',
        outline: '1px dashed',
      }}
    >
      {children}
      <div style={{ flex: 1 }}>Content</div>
    </div>
  );
}

/**
 * Resizable drawers, mounted with ?fixture=resizable-drawers: one that keeps its own width, one
 * the application controls in a narrower container, which halves its room, one in right-to-left
 * text, and one that isn't resizable.
 */
export function ResizableDrawersFixture() {
  const [width, setWidth] = useState(20);
  const [committed, setCommitted] = useState<number>();
  return (
    <div className="fixture-section" style={{ display: 'grid', gap: '1rem' }}>
      <Frame width="64rem">
        <Drawer aria-label="Own width" destinations={destinations} resizable />
      </Frame>
      <Frame width="48rem">
        <Drawer
          aria-label="Controlled"
          destinations={destinations}
          resizable
          width={width}
          onWidthChange={(next, details) => {
            setWidth(next);
            if (details.committed) setCommitted(next);
          }}
          resizeLabel="Resize mail"
        />
      </Frame>
      <output data-testid="width">{width}</output>
      <output data-testid="committed">{committed ?? ''}</output>
      <Frame width="64rem" dir="rtl">
        <Drawer aria-label="Right to left" destinations={destinations} resizable />
      </Frame>
      <Frame width="64rem">
        <Drawer aria-label="Fixed" destinations={destinations} />
      </Frame>
    </div>
  );
}
